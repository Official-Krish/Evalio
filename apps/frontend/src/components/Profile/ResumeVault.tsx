import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Resume } from "@evalio/shared";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import {
  IconFileTypePdf,
  IconPlus,
  IconChevronRight,
  IconUpload,
  IconLoader2,
} from "@tabler/icons-react";

// Simple helper to extract filename from URL
function fileNameFromUrl(url: string | null): string {
  if (!url) return "Resume";
  try {
    const parts = url.split("/");
    const last = parts[parts.length - 1] ?? "";
    return decodeURIComponent(last.split("?")[0] || "");
  } catch {
    return "Resume";
  }
}

interface ResumeVaultProps {
  resumes: Resume[];
}

const MAX_VISIBLE = 3;

export function ResumeVault({ resumes }: ResumeVaultProps) {
  const queryClient = useQueryClient();
  const [showAll, setShowAll] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: api.uploadResume,
    onSuccess: () => {
      toast.success("Resume uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setShowUploadZone(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to upload resume");
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        uploadMutation.mutate(file);
      }
    },
  });

  const visible = showAll ? resumes : resumes.slice(0, MAX_VISIBLE);

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border-light)",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            fontWeight: 600,
          }}
        >
          Resume Vault
        </span>
        <button
          onClick={() => setShowUploadZone((prev) => !prev)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--app-accent, #b8a88a)",
            padding: "4px",
            borderRadius: "6px",
            display: "flex",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "var(--app-accent-bg, rgba(184,168,138,0.1))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <IconPlus
            size={18}
            style={{
              transform: showUploadZone ? "rotate(45deg)" : "rotate(0)",
              transition: "transform 0.25s",
            }}
          />
        </button>
      </div>

      {/* Upload Zone */}
      <AnimatePresence>
        {showUploadZone && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "20px 24px 10px" }}>
              <div
                {...getRootProps()}
                style={{
                  border: isDragActive
                    ? "1px dashed var(--app-accent, #b8a88a)"
                    : "1px dashed var(--color-border)",
                  borderRadius: "12px",
                  background: isDragActive
                    ? "var(--app-accent-bg, rgba(184,168,138,0.06))"
                    : "var(--color-bg)",
                  padding: "24px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <input {...getInputProps()} />
                {uploadMutation.isPending ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <IconLoader2
                      className="animate-spin"
                      size={20}
                      color="var(--app-accent)"
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Analyzing & parsing PDF...
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <IconUpload
                      size={20}
                      color={
                        isDragActive
                          ? "var(--app-accent)"
                          : "var(--color-text-muted)"
                      }
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--color-text)",
                      }}
                    >
                      {isDragActive
                        ? "Drop PDF file here"
                        : "Drag & drop resume PDF here"}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      or click to browse from device
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resumes List */}
      <div>
        {resumes.length === 0 ? (
          <div style={{ padding: "32px 24px", textAlign: "center" }}>
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              No resumes uploaded yet. Click the plus icon to add one.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <AnimatePresence mode="popLayout">
                {visible.map((r, i) => (
                  <ResumeRow
                    key={r.id}
                    resume={r}
                    isLast={
                      i === visible.length - 1 ||
                      (!showAll &&
                        i === MAX_VISIBLE - 1 &&
                        resumes.length <= MAX_VISIBLE)
                    }
                  />
                ))}
              </AnimatePresence>
            </div>

            {resumes.length > MAX_VISIBLE && (
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "none",
                  border: "none",
                  borderTop: "1px solid var(--color-border-light)",
                  color: "var(--color-text-muted)",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--app-accent, #b8a88a)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                {showAll ? "Show less" : `View all (${resumes.length})`}
                <IconChevronRight
                  size={12}
                  style={{
                    transform: showAll ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── ResumeRow Component ─── */
function ResumeRow({ resume, isLast }: { resume: Resume; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);
  const label =
    fileNameFromUrl(resume.objectKey) || `Resume v${resume.version}`;
  const uploaded = new Date(resume.uploadedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "14px 24px",
        borderBottom: isLast ? "none" : "1px solid var(--color-border-light)",
        background: hovered ? "rgba(255, 255, 255, 0.01)" : "transparent",
        transition: "background 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(184,168,138,0.06)",
            border:
              "1px solid var(--app-accent-border, rgba(184,168,138,0.18))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconFileTypePdf size={18} color="var(--app-accent, #b8a88a)" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--color-text)",
              margin: 0,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "var(--color-text-muted)",
              margin: "2px 0 0",
              lineHeight: 1.3,
            }}
          >
            Version {resume.version} · Uploaded {uploaded}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <a
          href={resume.url ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "12px",
            color: "var(--app-accent, #b8a88a)",
            textDecoration: "none",
            fontWeight: 500,
            padding: "4px 8px",
            borderRadius: "6px",
            background: "var(--app-accent-bg, rgba(184,168,138,0.05))",
            border:
              "1px solid var(--app-accent-border, rgba(184,168,138,0.15))",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "var(--app-accent-bg, rgba(184,168,138,0.12))";
            e.currentTarget.style.borderColor = "var(--app-accent, #b8a88a)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "var(--app-accent-bg, rgba(184,168,138,0.05))";
            e.currentTarget.style.borderColor =
              "var(--app-accent-border, rgba(184,168,138,0.15))";
          }}
        >
          View
        </a>
      </div>
    </motion.div>
  );
}
