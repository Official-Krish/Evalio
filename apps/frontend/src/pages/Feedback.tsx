import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/lib/api";
import { usePageTitle } from "@/lib/usePageTitle";
import toast from "react-hot-toast";

/* ── Data ─────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    value: "General",
    label: "General",
    icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
    description: "Overall impressions",
  },
  {
    value: "Bug",
    label: "Bug report",
    icon: "M12 9v4m0 4h.01M20.24 12.66a10 10 0 0 1-8.24 5.34c-3.5 0-6.56-1.78-8.24-5.34a1 1 0 0 1 0-1.32A10 10 0 0 1 12 6c3.5 0 6.56 1.78 8.24 5.34a1 1 0 0 1 0 1.32z",
    description: "Something broke",
  },
  {
    value: "Feature",
    label: "Feature idea",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    description: "Something to build",
  },
  {
    value: "UX",
    label: "Feels off",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    description: "UX friction",
  },
  {
    value: "Interview",
    label: "Interview",
    icon: "M19 11a7 7 0 0 1-7 7m0 0a7 7 0 0 1-7-7m7 7v4M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-7 7m0 0a7 7 0 0 1-7-7V9a7 7 0 0 1 7-7z",
    description: "The session itself",
  },
  {
    value: "Performance",
    label: "Performance",
    icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    description: "Speed or reliability",
  },
  {
    value: "Other",
    label: "Other",
    icon: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z",
    description: "Something else",
  },
];

const RATING_LABELS = ["", "Poor", "Fair", "Decent", "Good", "Excellent"];

const STEPS = [
  {
    id: "category",
    question: "What's on your mind?",
    hint: "Pick the closest category — you can elaborate in a moment.",
  },
  {
    id: "rating",
    question: "How was your experience?",
    hint: "Give us an honest signal.",
  },
  {
    id: "message",
    question: "Tell us more.",
    hint: "Be specific — what broke, what felt off, or what delighted you?",
  },
];

/* ── Sub-components ────────────────────────────────────────────── */

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === step ? 20 : 6,
            opacity: i <= step ? 1 : 0.25,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="h-1 rounded-full"
          style={{ background: "var(--landing-accent)" }}
        />
      ))}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */

export function FeedbackPage() {
  usePageTitle("Share Feedback");

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("General");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: api.submitFeedback,
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit feedback");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rating || !subject.trim() || !message.trim()) {
      toast.error("Please complete all fields before submitting");
      return;
    }
    mutation.mutate({
      subject: subject.trim(),
      rating,
      category,
      message: message.trim(),
    });
  }

  function canAdvance() {
    if (step === 0) return true; // category always has default
    if (step === 1) return rating > 0;
    return false;
  }

  const displayRating = hoverRating || rating;

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-start gap-6"
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 20% 40%, rgba(184,168,138,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "rgba(184,168,138,0.12)",
              border: "1px solid rgba(184,168,138,0.25)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10l4 4 8-8"
                stroke="var(--landing-accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-[11px] tracking-[0.14em] uppercase mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            Received
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            Thank you.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            style={{
              fontSize: 14,
              color: "var(--color-text-secondary)",
              marginTop: 10,
              lineHeight: 1.7,
              maxWidth: 340,
            }}
          >
            Your feedback shapes what we build next. We read every single one.
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            onClick={() => {
              setSubmitted(false);
              setStep(0);
              setCategory("General");
              setRating(0);
              setSubject("");
              setMessage("");
            }}
            className="mt-8 text-[12px] tracking-[0.04em] transition-colors duration-200"
            style={{
              color: "var(--color-text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              paddingBottom: "1px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            Share more feedback
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* ── Header ── */}
      <div className="mb-8">
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            margin: 0,
          }}
        >
          Evalio · Feedback
        </p>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "var(--color-text)",
            margin: "8px 0 0",
          }}
        >
          Help us improve.
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            margin: "6px 0 0",
            lineHeight: 1.6,
          }}
        >
          Your feedback is read by the people building Evalio.
        </p>
      </div>

      {/* ── Step indicator ── */}
      <div className="mb-8">
        <StepIndicator step={step} total={STEPS.length} />
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Steps ── */}
        <AnimatePresence mode="wait">
          {/* STEP 0 — Category */}
          {step === 0 && (
            <motion.div
              key="step-category"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6">
                <p
                  className="text-[14px] font-medium mb-1"
                  style={{ color: "var(--color-text)" }}
                >
                  {STEPS[0]!.question}
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {STEPS[0]!.hint}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
                {CATEGORIES.map((c) => {
                  const selected = category === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className="group relative text-left transition-all duration-200"
                      style={{
                        padding: "14px 16px",
                        borderRadius: 8,
                        border: `1px solid ${
                          selected
                            ? "rgba(184,168,138,0.5)"
                            : "var(--color-border)"
                        }`,
                        background: selected
                          ? "rgba(184,168,138,0.06)"
                          : "var(--color-bg-elevated)",
                        cursor: "pointer",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mb-2"
                        style={{
                          color: selected
                            ? "var(--color-accent, #b8a88a)"
                            : "var(--color-text-muted)",
                          opacity: selected ? 1 : 0.5,
                        }}
                      >
                        <path d={c.icon} />
                      </svg>
                      <p
                        className="text-[12px] font-medium leading-tight"
                        style={{
                          color: selected
                            ? "var(--color-text)"
                            : "var(--color-text-secondary)",
                        }}
                      >
                        {c.label}
                      </p>
                      <p
                        className="text-[11px] mt-0.5 leading-tight"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {c.description}
                      </p>
                      {/* Selection dot */}
                      {selected && (
                        <motion.span
                          layoutId="category-dot"
                          className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--color-accent, #b8a88a)" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 1 — Rating */}
          {step === 1 && (
            <motion.div
              key="step-rating"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-8">
                <p
                  className="text-[14px] font-medium mb-1"
                  style={{ color: "var(--color-text)" }}
                >
                  {STEPS[1]!.question}
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {STEPS[1]!.hint}
                </p>
              </div>

              {/* Large rating blocks */}
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    onMouseEnter={() => setHoverRating(val)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="flex-1 group relative"
                    style={{
                      padding: 0,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    <motion.div
                      animate={{
                        height:
                          val <= displayRating
                            ? val === displayRating
                              ? 48
                              : 40
                            : 32,
                        background:
                          val <= displayRating
                            ? "var(--color-accent, #b8a88a)"
                            : "var(--color-border)",
                        opacity: val <= displayRating ? 1 : 0.25,
                      }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="w-full rounded-sm"
                    />
                    <span
                      className="block text-center text-[10px] mt-1.5 transition-colors duration-200"
                      style={{
                        color:
                          val <= displayRating
                            ? "var(--color-accent, #b8a88a)"
                            : "var(--color-text-muted)",
                        opacity: val <= displayRating ? 1 : 0.4,
                      }}
                    >
                      {val}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-1 mb-8">
                <span
                  className="text-[11px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Not good
                </span>
                <AnimatePresence mode="wait">
                  {displayRating > 0 && (
                    <motion.span
                      key={displayRating}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[11px] font-medium"
                      style={{ color: "var(--color-accent, #b8a88a)" }}
                    >
                      {RATING_LABELS[displayRating]}
                    </motion.span>
                  )}
                </AnimatePresence>
                <span
                  className="text-[11px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Excellent
                </span>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Message */}
          {step === 2 && (
            <motion.div
              key="step-message"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6">
                <p
                  className="text-[14px] font-medium mb-1"
                  style={{ color: "var(--color-text)" }}
                >
                  {STEPS[2]!.question}
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {STEPS[2]!.hint}
                </p>
              </div>

              {/* Subject line */}
              <div className="mb-4 relative">
                <label
                  htmlFor="feedback-subject"
                  className="block text-[11px] tracking-[0.06em] uppercase mb-1.5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Subject
                </label>
                <input
                  id="feedback-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    if (e.target.value.length <= 100)
                      setSubject(e.target.value);
                  }}
                  placeholder="e.g. Voice detection felt inconsistent during my session"
                  className="static-input"
                  required
                />
                <span
                  className="absolute right-3 bottom-2.5 text-[10px]"
                  style={{ color: "var(--color-text-muted)", opacity: 0.5 }}
                >
                  {subject.length}/100
                </span>
              </div>

              {/* Message */}
              <div className="mb-8">
                <label
                  htmlFor="feedback-message"
                  className="block text-[11px] tracking-[0.06em] uppercase mb-1.5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Details
                </label>
                <textarea
                  id="feedback-message"
                  rows={7}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Walk us through exactly what happened — or what you wish existed."
                  className="static-input"
                  style={{
                    minHeight: 160,
                    lineHeight: 1.7,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                  required
                />
              </div>

              {/* Summary pill */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg mb-8"
                style={{
                  background: "rgba(184,168,138,0.05)",
                  border: "1px solid rgba(184,168,138,0.15)",
                }}
              >
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span
                    className="text-[10px] tracking-[0.08em] uppercase"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Your feedback
                  </span>
                  <span
                    className="text-[12px] truncate"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {category} · {RATING_LABELS[rating]} ({rating}/5)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-[11px] transition-colors duration-200 flex-shrink-0"
                  style={{
                    color: "var(--color-text-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between gap-4">
          {/* Back */}
          <AnimatePresence>
            {step > 0 && (
              <motion.button
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onClick={() => setStep((s) => s - 1)}
                className="text-[13px] transition-colors duration-200 flex items-center gap-1.5"
                style={{
                  color: "var(--color-text-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 7H3M6 4L3 7l3 3" />
                </svg>
                Back
              </motion.button>
            )}
          </AnimatePresence>

          {step < 0 && <div />}

          {/* Next / Submit */}
          {step < STEPS.length - 1 ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className="ml-auto flex items-center gap-2 text-[13px] font-medium px-5 py-2.5 rounded-md transition-all duration-200"
              style={{
                background: canAdvance()
                  ? "var(--color-text)"
                  : "var(--color-border)",
                color: canAdvance()
                  ? "var(--color-bg)"
                  : "var(--color-text-muted)",
                border: "none",
                cursor: canAdvance() ? "pointer" : "default",
                opacity: canAdvance() ? 1 : 0.5,
              }}
            >
              Continue
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7h8M8 4l3 3-3 3" />
              </svg>
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={
                mutation.isPending || !subject.trim() || !message.trim()
              }
              className="ml-auto flex items-center gap-2 text-[13px] font-medium px-5 py-2.5 rounded-md transition-all duration-200"
              style={{
                background:
                  mutation.isPending || !subject.trim() || !message.trim()
                    ? "var(--color-border)"
                    : "var(--color-text)",
                color:
                  mutation.isPending || !subject.trim() || !message.trim()
                    ? "var(--color-text-muted)"
                    : "var(--color-bg)",
                border: "none",
                cursor:
                  mutation.isPending || !subject.trim() || !message.trim()
                    ? "default"
                    : "pointer",
                opacity:
                  mutation.isPending || !subject.trim() || !message.trim()
                    ? 0.55
                    : 1,
              }}
            >
              {mutation.isPending ? "Sending…" : "Send feedback"}
              {!mutation.isPending && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7h8M8 4l3 3-3 3" />
                </svg>
              )}
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
