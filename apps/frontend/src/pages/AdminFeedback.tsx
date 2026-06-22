import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { SEO } from "@/components/SEO";

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
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "feedbacks"],
    queryFn: api.listFeedbacks,
  });

  if (isLoading) {
    return (
      <p
        style={{
          color: "var(--color-text-secondary)",
          textAlign: "center",
          padding: "48px 0",
        }}
      >
        Loading feedback...
      </p>
    );
  }

  if (error) {
    return (
      <p
        style={{
          color: "var(--color-danger, #ef4444)",
          textAlign: "center",
          padding: "48px 0",
        }}
      >
        Failed to load feedback.
      </p>
    );
  }

  const feedbacks = data?.feedbacks ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SEO title="Admin Feedback" noindex />
      <p
        style={{
          fontSize: 12,
          letterSpacing: "0.08em",
          color: "var(--color-text-muted)",
          margin: 0,
        }}
      >
        Admin
      </p>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--color-text)",
          margin: "6px 0 0",
        }}
      >
        All Feedback
      </h1>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-secondary)",
          margin: "6px 0 0",
        }}
      >
        {feedbacks.length} submission{feedbacks.length !== 1 ? "s" : ""}
      </p>

      <div
        style={{
          marginTop: 28,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
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
                borderRadius: 10,
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
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-text)",
                    }}
                  >
                    {fb.subject}
                  </span>
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "rgba(184,168,138,0.12)",
                      color: "var(--landing-accent, #b8a88a)",
                    }}
                  >
                    {fb.category}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--landing-accent, #b8a88a)",
                    }}
                  >
                    {fb.rating}/5
                  </span>
                  <span
                    style={{
                      fontSize: 11,
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
                  fontSize: 13,
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
                  fontSize: 11,
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
  );
}
