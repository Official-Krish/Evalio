import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { usePageTitle } from "@/lib/usePageTitle";

const ratingEmoji = (r: number) =>
  r <= 1 ? "😞" : r <= 2 ? "😐" : r <= 3 ? "🙂" : r <= 4 ? "😊" : "🤩";

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminFeedbackPage() {
  usePageTitle("Admin — Feedback");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "feedbacks"],
    queryFn: api.listFeedbacks,
  });

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-bg, #0a0a0f)", padding: "48px 24px" }}
      >
        <p
          style={{ color: "var(--color-text-secondary)", textAlign: "center" }}
        >
          Loading feedback...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-bg, #0a0a0f)", padding: "48px 24px" }}
      >
        <p
          style={{ color: "var(--color-danger, #ef4444)", textAlign: "center" }}
        >
          Failed to load feedback.
        </p>
      </div>
    );
  }

  const feedbacks = data?.feedbacks ?? [];

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg, #0a0a0f)" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p
            className="text-[11px] tracking-[0.18em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            Admin
          </p>
          <h1
            className="text-2xl font-semibold mt-2"
            style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}
          >
            All Feedback
          </h1>
          <p
            className="text-sm mb-10"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {feedbacks.length} submission{feedbacks.length !== 1 ? "s" : ""}
          </p>

          <div className="space-y-3">
            {feedbacks.length === 0 && (
              <p
                style={{
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                  padding: "48px 0",
                }}
              >
                No feedback submissions yet.
              </p>
            )}
            {feedbacks.map(
              (fb: {
                id: string;
                subject: string;
                rating: number;
                category: string;
                message: string;
                createdAt: string;
                user: { name: string | null; email: string };
              }) => (
                <div
                  key={fb.id}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg-elevated)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--color-text)",
                        }}
                      >
                        {fb.subject}
                      </span>
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: "rgba(184,168,138,0.12)",
                          color: "var(--landing-accent, #b8a88a)",
                        }}
                      >
                        {fb.category}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: "18px" }}>
                        {ratingEmoji(fb.rating)}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--color-text-muted)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(fb.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "var(--color-text-secondary)",
                      margin: "0 0 8px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {fb.message}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                      margin: 0,
                    }}
                  >
                    From: {fb.user.name ?? fb.user.email} &lt;{fb.user.email}
                    &gt;
                  </p>
                </div>
              ),
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
