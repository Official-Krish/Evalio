import { motion } from "motion/react";
import { CompanyGrid } from "./CompanyGrid";

const stepVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const btnNext = (enabled: boolean): React.CSSProperties => ({
  padding: "10px 24px",
  borderRadius: "8px",
  border: "none",
  background: enabled ? "var(--landing-fg, #eceae6)" : "var(--color-border)",
  color: enabled ? "var(--landing-bg, #080808)" : "var(--color-text-muted)",
  fontSize: "13px",
  fontWeight: 500,
  cursor: enabled ? "pointer" : "default",
  letterSpacing: "-0.01em",
  opacity: enabled ? 1 : 0.55,
});

interface StepCompanyProps {
  selectedCompanyId: string | null;
  customCompanyName: string;
  onSelectCompany: (id: string | null) => void;
  onCustomCompanyChange: (name: string) => void;
  onNext: () => void;
}

export function StepCompany({
  selectedCompanyId,
  customCompanyName,
  onSelectCompany,
  onCustomCompanyChange,
  onNext,
}: StepCompanyProps) {
  return (
    <motion.div
      key="step-0"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.15 }}
    >
      <div style={{ marginBottom: "28px" }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            margin: "0 0 6px",
          }}
        >
          Step 1 of 5
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
            fontWeight: 500,
            letterSpacing: "-0.025em",
            color: "var(--color-text)",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          Select a company
        </motion.h1>
      </div>
      <CompanyGrid
        selectedCompanyId={selectedCompanyId}
        onSelect={(id) => {
          onSelectCompany(id);
          if (id && id !== "__custom__") {
            setTimeout(() => onNext(), 0);
          }
        }}
      />
      {selectedCompanyId === "__custom__" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ marginTop: "16px" }}
        >
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              margin: "0 0 0.4rem",
            }}
          >
            Company name
          </p>
          <motion.input
            value={customCompanyName}
            onChange={(e) => onCustomCompanyChange(e.target.value)}
            placeholder="e.g. Tesla, Coinbase, Spotify..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && customCompanyName.trim()) {
                onNext();
              }
            }}
            whileFocus={{ borderColor: "rgba(184, 168, 138, 0.35)" }}
            transition={{ borderColor: { duration: 0.15 } }}
            style={{
              width: "100%",
              padding: "0.7rem 0.9rem",
              fontSize: "13px",
              borderRadius: "2px",
              border: "1px solid var(--color-border)",
              background: "transparent",
              color: "var(--color-text)",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </motion.div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "24px",
        }}
      >
        <motion.button
          onClick={onNext}
          whileHover={{ opacity: 0.88 }}
          whileTap={{ scale: 0.97 }}
          style={btnNext(
            selectedCompanyId !== "__custom__" || !!customCompanyName.trim(),
          )}
        >
          {selectedCompanyId
            ? selectedCompanyId === "__custom__" && !customCompanyName.trim()
              ? "Enter a company name"
              : "Continue"
            : "Skip"}{" "}
          →
        </motion.button>
      </div>
    </motion.div>
  );
}
