import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { useInViewOnce } from "./hooks";

// ── Code type-in sequence ────────────────────────────────────────────────────
const CODE_LINES = [
  {
    text: "def two_sum(nums: list[int], target: int):",
    indent: 0,
    type: "def",
  },
  { text: "    seen = {}", indent: 1, type: "code" },
  { text: "    for i, n in enumerate(nums):", indent: 1, type: "code" },
  { text: "        complement = target - n", indent: 2, type: "code" },
  { text: "        if complement in seen:", indent: 2, type: "code" },
  {
    text: "            return [seen[complement], i]",
    indent: 3,
    type: "return",
  },
  { text: "        seen[n] = i", indent: 2, type: "code" },
];

// Token coloriser (minimal, no deps)
function tokenise(line: string, type: string) {
  if (type === "def") {
    const m = line.match(/^(def )(\w+)(\(.*\))(:)$/);
    if (m)
      return (
        <>
          <span className="dsa-kw">{m[1]}</span>
          <span className="dsa-fn">{m[2]}</span>
          <span className="dsa-param">{m[3]}</span>
          <span className="dsa-punct">{m[4]}</span>
        </>
      );
  }
  if (type === "return") {
    return (
      <>
        <span className="dsa-kw">{"            return "}</span>
        <span className="dsa-bracket">{"["}</span>
        <span className="dsa-name">{"seen[complement]"}</span>
        <span className="dsa-punct">{", "}</span>
        <span className="dsa-name">{"i"}</span>
        <span className="dsa-bracket">{"]"}</span>
      </>
    );
  }
  // Generic: highlight strings/keywords
  return <span className="dsa-plain">{line}</span>;
}

// Animated typing for a single line
function TypeLine({
  text,
  delay,
  onDone,
}: {
  text: string;
  delay: number;
  onDone?: () => void;
}) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setRevealed(i);
        if (i >= text.length) {
          clearInterval(iv);
          onDone?.();
        }
      }, 28);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(id);
  }, [delay, text, onDone]);

  return <>{text.slice(0, revealed)}</>;
}

// Animated editor panel
function CodeEditor({ visible }: { visible: boolean }) {
  const [doneLine, setDoneLine] = useState(-1);
  const [activeLine, setActiveLine] = useState(0);
  const [highlight, setHighlight] = useState<number | null>(null);

  // Cascade: each line completes → next starts
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => {
      setDoneLine(-1);
      setActiveLine(0);
    }, 0);
    return () => clearTimeout(id);
  }, [visible]);

  // AI annotation that appears after code is typed
  const showAnnotation = doneLine >= CODE_LINES.length - 1;

  // Pulse highlight on optimal line after done
  useEffect(() => {
    if (!showAnnotation) return;
    const iv = setInterval(
      () => setHighlight((h) => (h === 4 ? null : 4)),
      1800,
    );
    return () => clearInterval(iv);
  }, [showAnnotation]);

  const annotations = [
    { line: 3, text: "O(1) lookup — optimal", positive: true },
    { line: 5, text: "Early return ✓", positive: true },
  ];

  return (
    <div
      className="dsa-editor"
      role="img"
      aria-label="Animated code editor showing DSA interview"
    >
      {/* Editor chrome */}
      <div className="dsa-editor-chrome">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[rgba(255,100,100,0.4)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[rgba(255,200,80,0.35)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[rgba(100,200,100,0.35)]" />
        </div>
        <span className="text-[9px] tracking-[0.12em] text-[var(--landing-fg-muted)] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)] opacity-60" />
          two_sum.py
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-[var(--landing-fg-muted)] tabular-nums">
            24:58
          </span>
          <span
            className="text-[8px] tracking-[0.1em] uppercase px-1.5 py-0.5"
            style={{
              background: "rgba(184,168,138,0.1)",
              color: "var(--landing-accent)",
              borderRadius: 2,
            }}
          >
            Python
          </span>
        </div>
      </div>

      {/* Phase label */}
      <div className="dsa-phase-bar">
        {[
          "Understand",
          "Brute Force",
          "Optimize",
          "Implement",
          "Test",
          "Review",
        ].map((p, i) => (
          <span
            key={p}
            className="dsa-phase-pill"
            style={{
              opacity: i === 3 ? 1 : 0.3,
              color:
                i === 3 ? "var(--landing-accent)" : "var(--landing-fg-muted)",
            }}
          >
            {p}
          </span>
        ))}
      </div>

      {/* Code area */}
      <div className="dsa-code-area">
        {visible &&
          CODE_LINES.map((line, li) => (
            <motion.div
              key={li}
              className="dsa-line"
              initial={{ opacity: 0 }}
              animate={{ opacity: li <= doneLine + 1 ? 1 : 0.15 }}
              style={{
                background:
                  highlight === li ? "rgba(184,168,138,0.06)" : "transparent",
              }}
            >
              {/* Gutter */}
              <span className="dsa-gutter">{li + 1}</span>

              {/* Code */}
              <span className="dsa-code-text">
                {li < doneLine ? (
                  tokenise(line.text, line.type)
                ) : li === doneLine + 1 ? (
                  <>
                    {li <= activeLine ? (
                      <TypeLine
                        text={line.text}
                        delay={0}
                        onDone={() => {
                          setDoneLine(li);
                          if (li + 1 < CODE_LINES.length) setActiveLine(li + 1);
                        }}
                      />
                    ) : null}
                    <span className="landing-blink-cursor" />
                  </>
                ) : null}
              </span>

              {/* Inline annotation */}
              <AnimatePresence>
                {showAnnotation && annotations.find((a) => a.line === li) && (
                  <motion.span
                    className="dsa-annotation"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      color: annotations.find((a) => a.line === li)?.positive
                        ? "rgba(160,200,160,0.8)"
                        : "rgba(200,140,120,0.8)",
                    }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* comment marker */}
                    <span className="opacity-40 mr-1">#</span>
                    {annotations.find((a) => a.line === li)!.text}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
      </div>

      {/* Test output */}
      <AnimatePresence>
        {showAnnotation && (
          <motion.div
            className="dsa-test-output"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[9px] tracking-[0.14em] uppercase text-[var(--landing-fg-muted)] block mb-2">
              Test output
            </span>
            {[
              { case: "[2,7,11,15], 9", result: "[0,1]", pass: true },
              { case: "[3,2,4], 6", result: "[1,2]", pass: true },
              { case: "[3,3], 6", result: "[0,1]", pass: true },
            ].map(({ case: c, result, pass }) => (
              <div
                key={c}
                className="flex items-center gap-3 text-[10px] font-mono py-0.5"
              >
                <span
                  style={{
                    color: pass
                      ? "rgba(160,200,160,0.8)"
                      : "rgba(200,140,120,0.8)",
                  }}
                >
                  {pass ? "✓" : "✗"}
                </span>
                <span className="text-[var(--landing-fg-muted)]">{c}</span>
                <span className="text-[var(--landing-fg-muted)] ml-auto">
                  {result}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI feedback bar */}
      <AnimatePresence>
        {showAnnotation && (
          <motion.div
            className="dsa-ai-bar"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className="landing-pulse-dot" />
            <span className="text-[10px] text-[var(--landing-fg-muted)]">
              AI: Time complexity O(n). Space O(n). Optimal solution reached in
              phase 3.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Six phases row ────────────────────────────────────────────────────────────
const PHASES = [
  {
    label: "01 Understand",
    desc: "Clarify constraints before touching the keyboard.",
  },
  {
    label: "02 Brute Force",
    desc: "Verbalize the naive approach. Establish baseline.",
  },
  {
    label: "03 Optimize",
    desc: "Identify the bottleneck. HashMap? Two-pointer? DP?",
  },
  {
    label: "04 Implement",
    desc: "Code the optimal solution. AI watches every keystroke.",
  },
  { label: "05 Test", desc: "Walk through edge cases before asking to run." },
  {
    label: "06 Review",
    desc: "AI evaluates complexity, style, and interview presence.",
  },
];

export function DSACoding() {
  const sectionRef = useRef<HTMLElement>(null);
  const { ref, visible } = useInViewOnce<HTMLDivElement>(0.2);
  const [activePhase, setActivePhase] = useState(3);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Subtle parallax on the editor
  const editorY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  // Auto-cycle phases for demo
  useEffect(() => {
    if (!visible) return;
    const iv = setInterval(
      () => setActivePhase((p) => (p + 1) % PHASES.length),
      3200,
    );
    return () => clearInterval(iv);
  }, [visible]);

  return (
    <section
      ref={sectionRef}
      className="landing-container relative py-[16vh] border-b overflow-hidden"
    >
      {/* Deep glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 70% 50%, rgba(184,168,138,0.04) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div
        ref={ref}
        className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-14 lg:gap-16 items-start"
      >
        {/* ── Left: Copy ─────────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-28">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="landing-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.03em] text-[var(--landing-fg)] max-w-sm mb-4"
          >
            Not just talking.{" "}
            <span className="block landing-serif italic text-[var(--landing-accent)]">
              Real coding interviews.
            </span>
            <span
              className="inline-flex items-center gap-1.5 mt-3 text-[10px] tracking-[0.12em] uppercase px-2 py-1"
              style={{
                color: "rgba(160,200,160,0.9)",
                border: "1px solid rgba(160,200,160,0.25)",
                borderRadius: 3,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "rgba(160,200,160,0.9)",
                  boxShadow: "0 0 6px rgba(160,200,160,0.5)",
                }}
              />
              Live now
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-[14px] leading-[1.8] text-[var(--landing-fg-muted)] max-w-sm mb-10"
          >
            LeetCode style problems sourced from 1,900+ companies. A 6-phase
            interview structure that mirrors what happens in real on-sites.
          </motion.p>

          {/* Phase list */}
          <div className="space-y-0">
            {PHASES.map((phase, i) => (
              <motion.div
                key={phase.label}
                initial={{ opacity: 0, x: -16 }}
                animate={visible ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.15 + i * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group border-t border-[var(--landing-line)] py-3 cursor-default"
                onMouseEnter={() => setActivePhase(i)}
                style={{
                  borderColor:
                    activePhase === i ? "rgba(184,168,138,0.25)" : undefined,
                }}
              >
                <div className="flex items-start gap-4">
                  <motion.span
                    className="text-[9px] tracking-[0.12em] mt-0.5 tabular-nums"
                    animate={{
                      color:
                        activePhase === i
                          ? "var(--landing-accent)"
                          : "var(--landing-fg-muted)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {phase.label}
                  </motion.span>
                  <motion.p
                    className="text-[12px] leading-[1.6] flex-1"
                    animate={{
                      color:
                        activePhase === i
                          ? "var(--landing-fg)"
                          : "var(--landing-fg-muted)",
                      opacity: activePhase === i ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {phase.desc}
                  </motion.p>
                  {/* Active marker */}
                  <motion.span
                    className="w-1 h-1 rounded-full self-center flex-shrink-0"
                    animate={{
                      backgroundColor:
                        activePhase === i
                          ? "var(--landing-accent)"
                          : "transparent",
                      scale: activePhase === i ? 1.6 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {[
              "Monaco Editor",
              "Python · C++ · TypeScript",
              "30 min timer",
              "1,900+ companies",
            ].map((tag) => (
              <span
                key={tag}
                className="text-[10px] tracking-[0.05em] px-2.5 py-1 border border-[var(--landing-line)] text-[var(--landing-fg-muted)]"
                style={{ borderRadius: 3 }}
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── Right: Animated code editor ──────────────────────────────── */}
        <motion.div
          style={{ y: editorY }}
          initial={{ opacity: 0, x: 40 }}
          animate={visible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {visible && <CodeEditor visible={visible} />}
        </motion.div>
      </div>
    </section>
  );
}
