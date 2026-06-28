import { useRef, useState, useCallback } from "react";

function resampleTo16kHz(
  float32: Float32Array,
  fromRate: number,
): Float32Array {
  if (fromRate === 16000) return float32;
  const ratio = 16000 / fromRate;
  const outLen = Math.round(float32.length * ratio);
  const output = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i / ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = float32[idx] ?? 0;
    const b = float32[Math.min(idx + 1, float32.length - 1)] ?? 0;
    output[i] = a + (b - a) * frac;
  }
  return output;
}

interface VadOptions {
  threshold?: number;
  timeoutMs?: number;
  onSilenceEnd?: () => void;
}

interface VadState {
  noiseFloor: number;
  speaking: boolean;
  silenceStart: number;
  lastSpeechEnd: number;
  samplesSinceSpeech: number;
}

export function useMicrophone() {
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sampleRateRef = useRef(48000);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onChunkRef = useRef<((base64: string) => void) | null>(null);
  const vadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onSilenceEndRef = useRef<(() => void) | null>(null);
  const vadStateRef = useRef<VadState>({
    noiseFloor: 0.02,
    speaking: false,
    silenceStart: 0,
    lastSpeechEnd: 0,
    samplesSinceSpeech: 0,
  });

  const ADAPT_RATE_UP = 0.01;
  const ADAPT_RATE_DOWN = 0.05;
  const THRESHOLD_MULTIPLIER = 1.8;
  const ABSOLUTE_MIN = 0.015;
  const HANGOVER_MS = 1500;

  const stopVad = useCallback(() => {
    if (vadTimerRef.current) {
      clearInterval(vadTimerRef.current);
      vadTimerRef.current = null;
    }
    const vs = vadStateRef.current;
    vs.silenceStart = 0;
    vs.speaking = false;
    vs.lastSpeechEnd = 0;
    vs.samplesSinceSpeech = 0;
  }, []);

  const start = useCallback(
    async (onChunk: (base64: string) => void, vadOptions?: VadOptions) => {
      setError(null);
      onChunkRef.current = onChunk;
      onSilenceEndRef.current = vadOptions?.onSilenceEnd ?? null;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: { ideal: 16000 },
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        streamRef.current = stream;

        const audioCtx = new AudioContext();
        sampleRateRef.current = audioCtx.sampleRate;
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;
        source.connect(analyser);

        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        source.connect(processor);
        processor.connect(audioCtx.destination);

        processor.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          const resampled = resampleTo16kHz(input, sampleRateRef.current);
          const len = resampled.length;
          const pcm16 = new Int16Array(len);
          for (let i = 0; i < len; i++) {
            const s = Math.max(-1, Math.min(1, resampled[i]!));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          const bytes = new Uint8Array(pcm16.buffer);
          const blen = bytes.length;
          let binary = "";
          for (let i = 0; i < blen; i++) {
            binary += String.fromCharCode(bytes[i]!);
          }
          onChunkRef.current?.(btoa(binary));
        };

        if (vadOptions?.onSilenceEnd) {
          const timeoutMs = vadOptions.timeoutMs ?? 30000;
          stopVad();
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const vs = vadStateRef.current;

          vadTimerRef.current = setInterval(() => {
            analyser.getByteTimeDomainData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              const val = (dataArray[i]! - 128) / 128;
              sum += val * val;
            }
            const rms = Math.sqrt(sum / dataArray.length);

            const dynamicThreshold = Math.max(
              vs.noiseFloor * THRESHOLD_MULTIPLIER,
              ABSOLUTE_MIN,
            );

            if (rms >= dynamicThreshold) {
              // Speech detected
              vs.speaking = true;
              vs.silenceStart = 0;
              vs.samplesSinceSpeech = 0;
              // Adapt noise floor down during speech (ambient noise masking)
              vs.noiseFloor = Math.max(
                ABSOLUTE_MIN * 0.5,
                vs.noiseFloor * (1 - ADAPT_RATE_DOWN),
              );
            } else {
              // Below threshold — possible silence
              vs.samplesSinceSpeech++;
              if (vs.speaking) {
                // Just ended speech — start hangover
                vs.speaking = false;
                vs.lastSpeechEnd = Date.now();
              }

              const hangoverElapsed = Date.now() - vs.lastSpeechEnd;
              if (hangoverElapsed >= HANGOVER_MS) {
                // Hangover expired — count as silence
                if (vs.silenceStart === 0) {
                  vs.silenceStart = Date.now();
                }

                // Adapt noise floor up during sustained silence
                if (vs.samplesSinceSpeech > 20) {
                  vs.noiseFloor += (rms - vs.noiseFloor) * ADAPT_RATE_UP;
                  vs.noiseFloor = Math.max(ABSOLUTE_MIN, vs.noiseFloor);
                }

                if (Date.now() - vs.silenceStart >= timeoutMs) {
                  stopVad();
                  onSilenceEndRef.current?.();
                }
              }
            }
          }, 300);
        }

        setIsRecording(true);
      } catch (err) {
        const msg =
          err instanceof DOMException
            ? "Microphone access denied."
            : "Failed to access microphone";
        setError(msg);
        throw err;
      }
    },
    [stopVad],
  );

  const stop = useCallback(() => {
    stopVad();
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    processorRef.current = null;
    sourceRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    setIsRecording(false);
  }, [stopVad]);

  return { start, stop, isRecording, error, analyserRef };
}
