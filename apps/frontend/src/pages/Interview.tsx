import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "../lib/auth";
import { useMicrophone } from "../hooks/useMicrophone";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { InterviewSocket } from "../lib/ws";
import { api } from "../lib/api";
import { DsaPanel } from "../components/interview/DsaPanel";
import { Ambient } from "@/components/landing/Ambient";
import { PresenceOrb } from "@/components/interview/PresenceOrb";
import { SessionControls } from "@/components/interview/SessionControls";
import { SessionHeader } from "@/components/interview/SessionHeader";
import { LiveCaption } from "@/components/interview/LiveCaption";
import { InterviewConnecting } from "@/components/interview/InterviewConnecting";
import { InterviewClosing } from "@/components/interview/InterviewClosing";
import { InterviewQueue } from "@/components/interview/InterviewQueue";
import { ConfirmDialog } from "@/components/interview/ConfirmDialog";
import toast from "react-hot-toast";

type Phase =
  | "connecting"
  | "queued"
  | "ready"
  | "ai_speaking"
  | "user_speaking"
  | "ended";

export function InterviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const user = session?.user;

  const { data: interviewData } = useQuery({
    queryKey: ["interview-meta", id],
    queryFn: () => api.getInterview(id!),
    enabled: !!id,
  });
  const interviewMeta = interviewData?.interview;
  const position = interviewMeta?.position ?? null;
  const companyName = interviewMeta?.companyName ?? null;
  const interviewStyle = interviewMeta?.interviewStyle ?? null;
  const interviewDepth = interviewMeta?.interviewDepth ?? null;

  const {
    start: startMic,
    stop: stopMic,
    isRecording: micActive,
    analyserRef: userAnalyserRef,
  } = useMicrophone();
  const {
    playPcm,
    stop: stopAudio,
    isPlaying: aiPlaying,
    analyserRef: aiAnalyserRef,
  } = useAudioPlayer();
  const socketRef = useRef<InterviewSocket | null>(null);
  const endedRef = useRef(false);

  const [isConnecting, setIsConnecting] = useState(true);
  const [closing, setClosing] = useState(false);
  const [feedbackReady, setFeedbackReady] = useState(false);
  const [aiTurnActive, setAiTurnActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string; id: string }>
  >([]);
  const [queuedPosition, setQueuedPosition] = useState<number | null>(null);

  // DSA state
  const [dsaCode, setDsaCode] = useState("");
  const [dsaSessionData, setDsaSessionData] = useState<{
    questions: Array<{
      dbId: string;
      leetcodeId: number;
      title: string;
      slug: string;
      difficulty: string;
      description?: string;
      testCases?: { input: string; output: string; explanation?: string }[];
    }>;
    attempts: Array<{
      id: string;
      index: number;
      currentPhase: string;
      phasesCompleted: string[];
      code: string | null;
      score: number | null;
      feedback: string | null;
    }>;
    currentIndex: number;
    language: string;
  } | null>(null);
  const isDsa = interviewMeta?.mode === "DSA";

  const dsaPanelVisible = useMemo(() => {
    return isDsa && !!dsaSessionData;
  }, [isDsa, dsaSessionData]);

  // Load DSA session on mount if DSA mode
  useEffect(() => {
    if (!isDsa || !id) return;
    const loadDsa = async () => {
      try {
        const startRes = await fetch(`/api/dsa/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ interviewId: id }),
        });
        const data = await startRes.json();
        if (data.session) {
          setDsaSessionData({
            questions: data.session.questions,
            attempts: data.session.attempts,
            currentIndex: data.session.currentIndex ?? 0,
            language: data.session.language ?? "python",
          });
          if (data.session.attempts?.[0]) {
            setDsaCode(data.session.attempts[0].code ?? "");
          }
        }
      } catch {
        // Silently fail — session will show without panel
      }
    };
    loadDsa();
  }, [isDsa, id]);

  // Debounced DSA code snapshot sync
  const codeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isDsa || !dsaCode || !socketRef.current || !dsaSessionData) return;
    if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
    codeTimerRef.current = setTimeout(() => {
      socketRef.current?.sendCodeSnapshot(
        dsaCode,
        dsaSessionData.language,
        dsaSessionData.currentIndex,
        dsaSessionData.attempts[dsaSessionData.currentIndex]?.currentPhase ??
          "implementation",
      );
    }, 2000);
    return () => {
      if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
    };
  }, [dsaCode, isDsa, dsaSessionData]);

  const phase = useMemo((): Phase => {
    if (feedbackReady) return "ended";
    if (isConnecting && queuedPosition !== null) return "queued";
    if (isConnecting) return "connecting";
    if (aiPlaying || aiTurnActive) return "ai_speaking";
    if (micActive) return "user_speaking";
    return "ready";
  }, [
    feedbackReady,
    isConnecting,
    queuedPosition,
    aiPlaying,
    aiTurnActive,
    micActive,
  ]);

  const remainingMs = useMemo(() => {
    if (!timeLimit) return null;
    return Math.max(0, timeLimit - duration * 1000);
  }, [timeLimit, duration]);

  const aiSpeakingRef = useRef(false);
  const phaseRef = useRef(phase);
  const autoEndPendingRef = useRef(false);
  const turnCompletedRef = useRef(false);
  const isUserSpeakingRef = useRef(false);
  const closingRef = useRef(false);
  const feedbackReadyRef = useRef(false);
  const micActiveRef = useRef(micActive);
  const mountedRef = useRef(true);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    micActiveRef.current = micActive;
  }, [micActive]);
  useEffect(() => {
    const wasSpeaking = aiSpeakingRef.current;
    aiSpeakingRef.current = aiPlaying;
    if (!aiPlaying && wasSpeaking && !endedRef.current && !micActive) {
      setAiTurnActive(false);
    }
  }, [aiPlaying, micActive]);

  useEffect(() => {
    closingRef.current = closing;
  }, [closing]);
  useEffect(() => {
    feedbackReadyRef.current = feedbackReady;
  }, [feedbackReady]);

  useEffect(() => {
    document.documentElement.classList.add("landing-active");
    return () => document.documentElement.classList.remove("landing-active");
  }, []);

  const teardown = useCallback(() => {
    endedRef.current = true;
    setAiTurnActive(false);
    stopMic();
    stopAudio();
    socketRef.current?.forceClose();
    socketRef.current = null;
  }, [stopMic, stopAudio]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      teardown();
    };
  }, [teardown]);

  const connectSocket = useCallback(async () => {
    if (!user || !id || endedRef.current) return;

    let wsToken: string;
    try {
      const res = await api.getWsToken();
      wsToken = res.token;
    } catch {
      toast.error("Authentication failed");
      return;
    }

    const socket = new InterviewSocket(wsToken);
    socketRef.current = socket;

    socket.on("ready", () => {
      if (endedRef.current) return;
      setQueuedPosition(null);
      setIsConnecting(false);
      setAiTurnActive(true);
    });

    socket.on("queued", (data: unknown) => {
      if (endedRef.current) return;
      const msg = data as Record<string, unknown>;
      if (typeof msg.position === "number") {
        setQueuedPosition(msg.position);
      }
    });

    socket.on("position_update", (data: unknown) => {
      if (endedRef.current) return;
      const msg = data as Record<string, unknown>;
      if (typeof msg.position === "number") {
        setQueuedPosition(msg.position);
      }
    });

    socket.on("transcript:assistant", () => {
      if (endedRef.current) return;
      if (!turnCompletedRef.current) {
        turnCompletedRef.current = false;
        setAiTurnActive(true);
      }
    });

    socket.on("transcript:user", () => {
      if (endedRef.current) return;
      setAiTurnActive(false);
    });

    socket.on("message", (raw: unknown) => {
      if (endedRef.current) return;

      const data = raw as Record<string, unknown>;
      const sc = data?.serverContent as Record<string, unknown> | undefined;
      if (!sc) return;

      const inputText = (
        sc.inputTranscription as Record<string, unknown> | undefined
      )?.text as string | undefined;
      const outputText = (
        sc.outputTranscription as Record<string, unknown> | undefined
      )?.text as string | undefined;
      const turnComplete = sc.turnComplete === true;
      const modelTurn = sc.modelTurn as Record<string, unknown> | undefined;
      const parts =
        (modelTurn?.parts as Array<Record<string, unknown>> | undefined) ?? [];

      let audioBase64: string | null = null;
      for (const part of parts) {
        const inlineData = part.inlineData as
          | Record<string, unknown>
          | undefined;
        if (inlineData && (inlineData.mimeType as string)?.includes("audio")) {
          audioBase64 = inlineData.data as string;
        }
      }

      // AI interrupting — stop mic immediately if user is speaking
      if (audioBase64 && isUserSpeakingRef.current && !endedRef.current) {
        isUserSpeakingRef.current = false;
        stopMic();
        socketRef.current?.sendInterruptedStreamEnd();
      }

      if (audioBase64 && !endedRef.current) {
        aiSpeakingRef.current = true;
        playPcm(audioBase64);
        setAiTurnActive(true);
      }

      if (turnComplete && outputText) {
        turnCompletedRef.current = true;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: outputText, id: `ai-${Date.now()}` },
        ]);

        // Detect AI signaling end-of-interview — auto-trigger closing
        if (outputText.includes("Thank you for interviewing with Evalio")) {
          autoEndPendingRef.current = true;
          setTimeout(() => {
            if (autoEndPendingRef.current && !endedRef.current) {
              autoEndPendingRef.current = false;
              socketRef.current?.sendEndInterview();
            }
          }, 800);
        } else if (!audioBase64) {
          setAiTurnActive(false);
        }
      }

      if (turnComplete && inputText) {
        setMessages((prev) => [
          ...prev,
          { role: "user", text: inputText, id: `user-${Date.now()}` },
        ]);
        setAiTurnActive(true);
      }
    });

    socket.on("error", (err: unknown) => {
      if (!mountedRef.current || endedRef.current) return;
      const msg = (err as Record<string, unknown>)?.error as string | undefined;
      setError(msg || "Connection failed");
      toast.error(msg || "Connection failed");
    });

    socket.on("close", () => {
      if (!endedRef.current && phaseRef.current !== "ended") {
        teardown();
      }
    });

    // Graceful end-flow events
    socket.on("closing_started", () => {
      setClosing(true);
      stopMic();
    });

    socket.on("feedback_ready", () => {
      setFeedbackReady(true);
      stopAudio();
      endedRef.current = true;
      socketRef.current?.forceClose();
      socketRef.current = null;
      navigate(`/results/${id}`, { replace: true });
    });

    socket.on("dsa_ready_next", () => {
      setDsaSessionData((prev) => {
        if (!prev) return prev;
        const nextIdx = prev.currentIndex + 1;
        if (nextIdx >= prev.questions.length) return prev;
        return {
          ...prev,
          currentIndex: nextIdx,
          attempts: prev.attempts.map((a, i) =>
            i === nextIdx ? { ...a, currentPhase: "understanding" } : a,
          ),
        };
      });
      setDsaCode("");
    });

    socket.on("dsa_all_done", () => {
      if (!closingRef.current && !endedRef.current) {
        setClosing(true);
        stopMic();
        socketRef.current?.sendEndInterview();
      }
    });

    // Time cap events
    socket.on("time_limit", (data: unknown) => {
      const msg = data as Record<string, unknown>;
      if (typeof msg.limitMs === "number") {
        setTimeLimit(msg.limitMs);
      }
    });

    socket.on("time_warning", () => {
      toast("One minute remaining", {
        icon: "\u23F0",
        duration: 5000,
      });
    });

    socket.on("time_limit_reached", () => {
      if (!closingRef.current && !endedRef.current) {
        setClosing(true);
        stopMic();
        socketRef.current?.sendEndInterview();
      }
    });

    await socket.connect(id);
  }, [user, id, playPcm, stopAudio, teardown, navigate, stopMic]);

  useEffect(() => {
    connectSocket().catch((err: Error) => {
      if (mountedRef.current && !endedRef.current) {
        setError(err.message);
        toast.error(err.message);
      }
    });
  }, [connectSocket]);

  useEffect(() => {
    if (phase === "ended" || phase === "connecting" || phase === "queued")
      return;
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Safety timeout: if closing takes >30s, force-navigate to results
  useEffect(() => {
    if (!closing || feedbackReady) return;
    const timer = setTimeout(() => {
      if (!feedbackReady) {
        toast.error("Closing timed out — redirecting to results");
        teardown();
        navigate(`/results/${id}`, { replace: true });
      }
    }, 30_000);
    return () => clearTimeout(timer);
  }, [closing, feedbackReady, id, navigate, teardown]);

  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const handleEnd = useCallback(() => {
    if (endedRef.current || closing || feedbackReady) return;
    setShowEndConfirm(true);
  }, [closing, feedbackReady]);

  const confirmEnd = useCallback(() => {
    setShowEndConfirm(false);
    setClosing(true);
    stopMic();
    socketRef.current?.sendEndInterview();
  }, [stopMic]);

  const handleMicToggle = async () => {
    if (endedRef.current || closing || feedbackReady) return;

    if (micActive) {
      isUserSpeakingRef.current = false;
      stopMic();
      socketRef.current?.sendAudioStreamEnd();
      return;
    }

    if (aiPlaying || aiTurnActive) {
      toast.error("Wait for the interviewer to finish");
      return;
    }

    try {
      isUserSpeakingRef.current = true;
      await startMic((base64) => {
        if (!endedRef.current) {
          socketRef.current?.sendAudio(base64);
        }
      });
    } catch {
      isUserSpeakingRef.current = false;
      toast.error("Microphone access denied");
    }
  };

  const activeSide = phase === "ai_speaking" ? "ai" : "user";
  const activeAnalyser = activeSide === "ai" ? aiAnalyserRef : userAnalyserRef;

  const handleLeaveQueue = useCallback(() => {
    teardown();
    navigate("/dashboard");
  }, [teardown, navigate]);

  if (error) {
    return (
      <div className="interview-room flex flex-col items-center justify-center min-h-[100dvh] gap-6 px-6">
        <p className="text-[14px] text-[var(--landing-fg-muted)] text-center max-w-sm">
          {error}
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="landing-cta-primary landing-cta-sharp text-[13px]"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  if (phase === "connecting") {
    return <InterviewConnecting />;
  }

  if (phase === "queued") {
    return (
      <InterviewQueue
        position={queuedPosition ?? 1}
        onLeave={handleLeaveQueue}
      />
    );
  }

  if (closing && !feedbackReady) {
    return <InterviewClosing />;
  }

  return (
    <div className="interview-room landing-page min-h-[100dvh] flex flex-col relative overflow-hidden">
      <Ambient />

      <div
        className="relative z-10 flex flex-col min-h-[100dvh]"
        style={
          isDsa && dsaPanelVisible
            ? { marginRight: "min(520px, 45vw)" }
            : undefined
        }
      >
        <div className="landing-container pt-6">
          <SessionHeader
            position={position}
            duration={duration}
            phase={phase}
            timeLimit={timeLimit}
            remainingMs={remainingMs}
            companyName={companyName}
            interviewStyle={interviewStyle}
            interviewDepth={interviewDepth}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
          <div className="interview-orb-stage">
            <PresenceOrb
              analyserRef={activeAnalyser}
              phase={phase}
              side={activeSide}
            />
          </div>
        </div>

        <div className="landing-container pb-4">
          <LiveCaption messages={messages} phase={phase} />
        </div>

        <div className="landing-container pb-10 pt-2">
          <SessionControls
            micActive={micActive}
            phase={phase}
            onMicToggle={handleMicToggle}
            onEnd={handleEnd}
            ending={closing}
            userAnalyserRef={userAnalyserRef}
          />
        </div>
      </div>

      {isDsa && dsaSessionData && (
        <DsaPanel
          questions={dsaSessionData.questions}
          attempts={dsaSessionData.attempts}
          currentIndex={dsaSessionData.currentIndex}
          language={dsaSessionData.language}
          code={dsaCode}
          onCodeChange={setDsaCode}
          visible={dsaPanelVisible}
          onRequestHint={() =>
            socketRef.current?.sendRequestHint(dsaSessionData.currentIndex)
          }
        />
      )}

      <ConfirmDialog
        open={showEndConfirm}
        title="End interview?"
        message="You'll receive a closing summary and feedback."
        confirmLabel="End interview"
        cancelLabel="Cancel"
        onConfirm={confirmEnd}
        onCancel={() => setShowEndConfirm(false)}
      />
    </div>
  );
}
