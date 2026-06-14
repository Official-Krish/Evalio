import { motion } from "motion/react"
import { COMPANIES } from "@evalio/shared"
import type { IconType } from "react-icons"
import {
  FaStripe, FaAmazon, FaGoogle, FaMicrosoft, FaApple, FaUber, FaAirbnb,
  FaBuilding, FaBolt,
} from "react-icons/fa"
import {
  SiMeta, SiNetflix, SiDatadog, SiGoldmansachs, SiPalantir, SiFigma, SiNotion,
} from "react-icons/si"

interface CompanyGridProps {
  selectedCompanyId: string | null
  onSelect: (companyId: string | null) => void
}

const companyIcons: Record<string, IconType> = {
  stripe: FaStripe,
  amazon: FaAmazon,
  google: FaGoogle,
  meta: SiMeta,
  netflix: SiNetflix,
  microsoft: FaMicrosoft,
  apple: FaApple,
  uber: FaUber,
  airbnb: FaAirbnb,
  datadog: SiDatadog,
  "deloitte-usi": FaBuilding,
  "goldman-sachs": SiGoldmansachs,
  palantir: SiPalantir,
  figma: SiFigma,
  notion: SiNotion,
  startup: FaBolt,
}

export function CompanyGrid({ selectedCompanyId, onSelect }: CompanyGridProps) {
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "10px",
        }}
      >
        {COMPANIES.map((company) => {
          const active = selectedCompanyId === company.id
          return (
            <motion.button
              key={company.id}
              onClick={() => onSelect(active ? null : company.id)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                padding: "20px 12px",
                borderRadius: "12px",
                border: active
                  ? "1.5px solid var(--color-accent, #6366f1)"
                  : "1px solid var(--color-border-light)",
                background: active
                  ? "rgba(99,102,241,0.06)"
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "var(--color-accent)"
                  e.currentTarget.style.background = "rgba(99,102,241,0.03)"
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "var(--color-border-light)"
                  e.currentTarget.style.background = "transparent"
                }
              }}
            >
              {(() => {
                const IconComp = companyIcons[company.id]
                return IconComp ? (
                  <IconComp size={22} color={active ? "var(--color-accent)" : "var(--color-text-secondary)"} />
                ) : (
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      lineHeight: 1,
                      color: active
                        ? "var(--color-accent, #6366f1)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    {company.name[0]}
                  </span>
                )
              })()}
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: active ? "var(--color-text)" : "var(--color-text-secondary)",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {company.name}
              </span>
            </motion.button>
          )
        })}
      </div>

      <button
        onClick={() => onSelect("__custom__")}
        style={{
          marginTop: "16px",
          padding: "12px 20px",
          borderRadius: "10px",
          border: selectedCompanyId === "__custom__"
            ? "1.5px solid var(--color-accent, #6366f1)"
            : "1px dashed var(--color-border)",
          background: selectedCompanyId === "__custom__"
            ? "rgba(99,102,241,0.06)"
            : "transparent",
          color: "var(--color-text-secondary)",
          fontSize: "13px",
          cursor: "pointer",
          width: "100%",
          transition: "all 0.15s",
        }}
      >
        {selectedCompanyId === "__custom__" ? "Custom company selected" : "+ Custom company (not in list)"}
      </button>
    </div>
  )
}
