import { useState } from "react";

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div
      className="rounded-lg overflow-hidden border"
      style={{ borderColor: "var(--color-border-light)", marginBottom: "16px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          background: "#0d0d0d",
          borderBottom: "1px solid var(--color-border-light)",
        }}
      >
        <div style={{ display: "flex", gap: "5px" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#ff5f56",
            }}
          />
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#ffbd2e",
            }}
          />
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#27c93f",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{ fontFamily: "monospace", fontSize: "9px", color: "#666" }}
          >
            {language ?? "python"}
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "10px",
              color: copied ? "#5DCAA5" : "#888",
              padding: "2px 4px",
              fontFamily: "inherit",
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "14px",
          overflow: "auto",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: "12px",
          lineHeight: 1.5,
          color: "#e2e8f0",
          background: "#0a0a0a",
          maxHeight: "400px",
        }}
      >
        {code}
      </pre>
    </div>
  );
}
