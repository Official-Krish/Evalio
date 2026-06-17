import { fileNameFromUrl } from "./helpers";
import type { Resume } from "@evalio/shared";

interface SessionCardProps {
  position: string;
  customPosition: string;
  selectedResumeId: string | undefined;
  resumes: Resume[];
  isPending: boolean;
  onCreate: () => void;
}

export function SessionCard({
  position,
  customPosition,
  selectedResumeId,
  resumes,
  isPending,
  onCreate,
}: SessionCardProps) {
  const selectedResume = selectedResumeId
    ? (resumes.find((r) => r.id === selectedResumeId) ?? null)
    : null;
  const resumeLabel = selectedResume
    ? (fileNameFromUrl(selectedResume.objectKey) ?? "Resume")
    : null;
  const roleLabel = position || customPosition || "Position";
  const ready = !!position && !!selectedResumeId;

  if (!ready) return null;

  return (
    <div
      style={{
        position: "sticky",
        bottom: "24px",
        zIndex: 20,
        borderRadius: "14px",
        border: "1px solid var(--color-border-light)",
        background: "var(--color-bg-elevated)",
        backdropFilter: "blur(16px)",
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--color-text)",
              lineHeight: 1.2,
            }}
          >
            {roleLabel}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "var(--color-text-muted)",
              lineHeight: 1.2,
            }}
          >
            {resumeLabel}
          </span>
        </div>
      </div>

      <button
        onClick={onCreate}
        disabled={isPending}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",
          border: "none",
          background: "var(--color-accent)",
          fontSize: "16px",
          fontWeight: 800,
          cursor: isPending ? "not-allowed" : "pointer",
          opacity: isPending ? 0.5 : 1,
          position: "relative",
          overflow: "hidden",
        }}
        className="hover:brightness-110 transition-all text-white"
      >
        {isPending ? "Starting..." : `Start Interview \u2192`}
      </button>
    </div>
  );
}
