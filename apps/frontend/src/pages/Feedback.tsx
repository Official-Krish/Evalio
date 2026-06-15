import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { usePageTitle } from "@/lib/usePageTitle";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "General", label: "General feedback", emoji: "💬" },
  { value: "Bug", label: "Bug report", emoji: "🐛" },
  { value: "Feature", label: "Feature request", emoji: "💡" },
  { value: "UX", label: "User experience", emoji: "🎨" },
  { value: "Interview", label: "Interview experience", emoji: "🎙️" },
  { value: "Performance", label: "Performance", emoji: "⚡" },
  { value: "Other", label: "Other", emoji: "⋯" },
];

const ratings = [
  { value: 1, label: "Needs work" },
  { value: 2, label: "Okay" },
  { value: 3, label: "Good" },
  { value: 4, label: "Great" },
  { value: 5, label: "Amazing!" },
];

export function FeedbackPage() {
  usePageTitle("Share Feedback");

  const [category, setCategory] = useState("General");
  const [subject, setSubject] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: api.submitFeedback,
    onSuccess: () => {
      toast.success("Feedback submitted! Thank you.");
      setCategory("General");
      setSubject("");
      setRating(0);
      setMessage("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit feedback");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rating || !subject.trim() || !message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    mutation.mutate({
      subject: subject.trim(),
      rating,
      category,
      message: message.trim(),
    });
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg, #0a0a0f)" }}
    >
      <div className="max-w-2xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p
            className="text-[11px] tracking-[0.18em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            Share your thoughts
          </p>
          <h1
            className="text-2xl font-semibold mt-2 mb-1"
            style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}
          >
            Help us improve Evalio
          </h1>
          <p
            className="text-sm mb-10"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Your feedback directly shapes what we build next.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="text-sm font-medium block mb-3"
                style={{ color: "var(--color-text)" }}
              >
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${category === c.value ? "var(--landing-accent, #b8a88a)" : "var(--color-border)"}`,
                      background:
                        category === c.value
                          ? "rgba(184,168,138,0.08)"
                          : "transparent",
                      color:
                        category === c.value
                          ? "var(--color-text)"
                          : "var(--color-text-secondary)",
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "18px", marginBottom: 3 }}>
                      {c.emoji}
                    </div>
                    <div>{c.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="text-sm font-medium block mb-1.5"
                style={{ color: "var(--color-text)" }}
              >
                Subject{" "}
                <span style={{ color: "var(--color-text-muted)" }}>*</span>
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={
                  category === "Bug"
                    ? "What went wrong?"
                    : category === "Feature"
                      ? "What would you like to see?"
                      : "Summarize your feedback"
                }
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  background: "transparent",
                  color: "var(--color-text)",
                  fontSize: "14px",
                  outline: "none",
                }}
                required
              />
            </div>

            <div>
              <label
                className="text-sm font-medium block mb-3"
                style={{ color: "var(--color-text)" }}
              >
                Rating{" "}
                <span style={{ color: "var(--color-text-muted)" }}>*</span>
              </label>
              <div className="flex gap-1.5">
                {ratings.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRating(r.value)}
                    style={{
                      flex: 1,
                      padding: "10px 6px",
                      borderRadius: "8px",
                      border: `1px solid ${rating >= r.value ? "var(--landing-accent, #b8a88a)" : "var(--color-border)"}`,
                      background:
                        rating >= r.value
                          ? "rgba(184,168,138,0.08)"
                          : "transparent",
                      color:
                        rating >= r.value
                          ? "var(--color-text)"
                          : "var(--color-text-secondary)",
                      fontSize: "11px",
                      cursor: "pointer",
                      transition: "all 0.12s",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        marginBottom: 2,
                        filter: rating >= r.value ? "none" : "grayscale(1)",
                        opacity: rating >= r.value ? 1 : 0.4,
                      }}
                    >
                      {r.value <= 1
                        ? "😞"
                        : r.value <= 2
                          ? "😐"
                          : r.value <= 3
                            ? "🙂"
                            : r.value <= 4
                              ? "😊"
                              : "🤩"}
                    </div>
                    <div className="font-medium">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="text-sm font-medium block mb-1.5"
                style={{ color: "var(--color-text)" }}
              >
                Details{" "}
                <span style={{ color: "var(--color-text-muted)" }}>*</span>
              </label>
              <textarea
                id="message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What did you like? What could be better? Be specific — it helps us prioritize."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  background: "transparent",
                  color: "var(--color-text)",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={mutation.isPending}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                background: "var(--color-text, #eceae6)",
                color: "var(--color-bg, #080808)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: mutation.isPending ? "default" : "pointer",
                opacity: mutation.isPending ? 0.5 : 1,
                transition: "all 0.15s",
              }}
            >
              {mutation.isPending ? "Submitting..." : "Submit feedback"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
