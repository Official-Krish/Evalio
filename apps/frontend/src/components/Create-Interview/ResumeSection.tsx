import { useState } from "react";
import { motion } from "motion/react";
import { api } from "../../lib/api";
import { fileNameFromUrl, detectSections } from "./helpers";
import { FileUpload } from "../ui/file-upload";
import type { Resume } from "@evalio/shared";
import toast from "react-hot-toast";
import { SiGithub } from "react-icons/si";

interface GithubProfileData {
  username: string;
  summary: string;
  languages: string[];
  projects: {
    name: string;
    description?: string | null;
    stars?: number;
    language?: string | null;
  }[];
}

interface ResumeSectionProps {
  resumes: Resume[];
  selectedResumeId: string | undefined;
  githubUrl: string;
  githubOpen: boolean;
  githubProfile?: GithubProfileData | null;
  useConnectedGithub?: boolean;
  onResumeSelect: (id: string) => void;
  onPreviewResume: (id: string) => void;
  onResumesRefetch: () => void;
  onGithubUrlChange: (url: string) => void;
  onGithubToggle: () => void;
  onUseConnectedGithub?: () => void;
}

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 18px",
  borderRadius: "10px",
  border: "1px solid var(--color-border-light)",
  background: "transparent",
  color: "var(--color-text-secondary)",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.15s",
};

export function ResumeSection({
  resumes,
  selectedResumeId,
  githubUrl,
  githubOpen,
  githubProfile,
  useConnectedGithub,
  onResumeSelect,
  onPreviewResume,
  onResumesRefetch,
  onGithubUrlChange,
  onGithubToggle,
  onUseConnectedGithub,
}: ResumeSectionProps) {
  const [isUploading, setIsUploading] = useState(false);

  const selectedResume = selectedResumeId
    ? (resumes.find((r) => r.id === selectedResumeId) ?? null)
    : null;

  const detected = selectedResume
    ? detectSections(selectedResume.extractedText)
    : null;

  const handleUploadResume = async (files: File[]) => {
    const file = files[0];
    if (!file || isUploading) return;
    setIsUploading(true);
    try {
      await api.uploadResume(file);
      toast.success("Resume uploaded!");
      onResumesRefetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: "48px" }}>
      {/* Animated drag zone via FileUpload */}
      <FileUpload onChange={handleUploadResume} disabled={isUploading} />

      {resumes.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginTop: "20px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: "8px",
            }}
          >
            Previously uploaded
          </p>
          {resumes.map((r) => {
            const active = selectedResumeId === r.id;
            const label =
              fileNameFromUrl(r.originalUrl) ?? `Resume v${r.version}`;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: active
                    ? "1.5px solid var(--app-accent, #b8a88a)"
                    : "1px solid var(--color-border-light)",
                  background: active
                    ? "var(--app-accent-bg, rgba(184,168,138,0.06))"
                    : "transparent",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
                onClick={() => onResumeSelect(r.id)}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: active
                      ? "var(--app-accent-bg, rgba(184,168,138,0.08))"
                      : "var(--color-bg-hover)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "14px",
                    color: active
                      ? "var(--color-accent)"
                      : "var(--color-text-muted)",
                  }}
                >
                  {active ? (
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    "\u{1F4C4}"
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: active
                        ? "var(--color-text)"
                        : "var(--color-text-secondary)",
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                      margin: 0,
                      lineHeight: 1.3,
                      marginTop: "1px",
                    }}
                  >
                    {new Date(r.uploadedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewResume(r.id);
                  }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: active
                      ? "1px solid var(--app-accent-border, rgba(184,168,138,0.3))"
                      : "1px solid var(--color-border-light)",
                    background: active
                      ? "var(--app-accent-bg, rgba(184,168,138,0.08))"
                      : "transparent",
                    color: active
                      ? "var(--color-accent)"
                      : "var(--color-text-muted)",
                    fontSize: "12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  View
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedResume && detected && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "var(--app-accent-bg, rgba(184,168,138,0.06))",
            border:
              "1px solid var(--app-accent-border, rgba(184,168,138,0.18))",
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          Resume loaded
        </motion.div>
      )}

      {/* GitHub section — always visible when resume selected */}
      {selectedResume && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--color-border-light)",
          }}
        >
          {/* Connected profile card */}
          {githubProfile && useConnectedGithub && !githubOpen ? (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "18px", lineHeight: 1 }}>
                  {<SiGithub />}
                </span>
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--color-text)",
                      margin: 0,
                    }}
                  >
                    GitHub Profile
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                      margin: "2px 0 0",
                    }}
                  >
                    AI will analyze your public repos for code-specific
                    questions
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--app-accent, #b8a88a)",
                  background: "var(--app-accent-bg, rgba(184,168,138,0.06))",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: "var(--app-accent-bg, rgba(184,168,138,0.08))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "14px",
                    color: "var(--color-accent)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--color-text)",
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {githubProfile.username}
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--color-text-muted)",
                        marginLeft: "8px",
                        fontWeight: 400,
                      }}
                    >
                      Connected
                    </span>
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                      margin: 0,
                      lineHeight: 1.3,
                      marginTop: "1px",
                    }}
                  >
                    {githubProfile.projects.length} public repos ·{" "}
                    {githubProfile.languages.slice(0, 3).join(", ") ||
                      "No languages detected"}
                  </p>
                </div>
              </div>

              <button
                onClick={onGithubToggle}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  marginTop: "12px",
                  borderRadius: "10px",
                  border: "1px solid var(--color-border-light)",
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-accent)";
                  e.currentTarget.style.color = "var(--color-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--color-border-light)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
              >
                {githubProfile
                  ? "Use a different profile"
                  : "Add GitHub profile"}
                <span style={{ fontSize: "11px", opacity: 0.6 }}>
                  {"\u2192"}
                </span>
              </button>
            </div>
          ) : githubOpen ? (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "18px", lineHeight: 1 }}>
                  {<SiGithub />}
                </span>
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--color-text)",
                      margin: 0,
                    }}
                  >
                    GitHub Profile
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                      margin: "2px 0 0",
                    }}
                  >
                    AI will analyze your public repos for code-specific
                    questions
                  </p>
                </div>
              </div>
              <input
                value={githubUrl}
                onChange={(e) => onGithubUrlChange(e.target.value)}
                placeholder="https://github.com/username"
                style={{
                  width: "100%",
                  fontSize: "14px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg-hover)",
                  color: "var(--color-text)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-accent)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-muted)",
                  margin: "8px 0 0",
                }}
              >
                Leave empty to skip GitHub analysis
              </p>
              {githubProfile && (
                <button
                  onClick={onUseConnectedGithub}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 14px",
                    marginTop: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border-light)",
                    background: "transparent",
                    color: "var(--color-text-muted)",
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-accent)";
                    e.currentTarget.style.color = "var(--color-accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-border-light)";
                    e.currentTarget.style.color = "var(--color-text-muted)";
                  }}
                >
                  ← Use connected profile ({githubProfile.username})
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onGithubToggle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.color = "var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border-light)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
              style={btnBase}
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>
                {<SiGithub />}
              </span>
              <span>
                {githubProfile
                  ? `Use ${githubProfile.username} for code-specific questions`
                  : "Add GitHub for code-specific questions"}
              </span>
              <span style={{ fontSize: "11px", opacity: 0.6 }}>{"\u2192"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
