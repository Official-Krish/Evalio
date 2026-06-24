import { SD_NODE_DEFS, type SdNodeType } from "./systemDesignNodeTypes";

interface NodeToolbarProps {
  selectedType: SdNodeType | null;
  onSelectType: (type: SdNodeType | null) => void;
}

export function NodeToolbar({ selectedType, onSelectType }: NodeToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        padding: "8px 12px",
        background: "var(--db-card-bg, #1a1a2e)",
        borderBottom: "1px solid var(--color-border-light, #2a2a3e)",
        alignItems: "center",
      }}
    >
      {SD_NODE_DEFS.map((def) => {
        const isActive = selectedType === def.type;
        return (
          <button
            key={def.type}
            onClick={() => onSelectType(isActive ? null : def.type)}
            title={def.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              border: isActive
                ? `2px solid ${def.color}`
                : "1px solid var(--color-border-light, #2a2a3e)",
              borderRadius: "8px",
              background: isActive ? def.color + "20" : "transparent",
              color: isActive ? def.color : "var(--color-text-muted, #888)",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "14px" }}>{def.icon}</span>
            {def.label}
          </button>
        );
      })}
    </div>
  );
}
