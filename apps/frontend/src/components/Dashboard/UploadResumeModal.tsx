import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { api } from "../../lib/api";
import { Button } from "../ui/Button-web";
import toast from "react-hot-toast";

export function UploadResumeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadResume(file);
      toast.success("Resume uploaded!");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Upload Resume
        </h3>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-[var(--radius-md)] file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:brightness-110 file:cursor-pointer cursor-pointer"
        />
        <p
          style={{
            fontSize: "12px",
            color: "var(--color-text-muted)",
            marginTop: "8px",
          }}
        >
          Supports PDF, DOCX, TXT
        </p>
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-text-muted)",
            marginTop: "6px",
            opacity: 0.7,
          }}
        >
          Your resume will be parsed by AI. Remove any sensitive personal data
          before uploading.
        </p>
        <div className="flex gap-2 mt-4 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} loading={uploading}>
            Upload
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
