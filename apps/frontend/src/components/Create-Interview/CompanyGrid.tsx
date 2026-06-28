import { useState } from "react";
import { motion } from "motion/react";
import { COMPANIES } from "@evalio/shared";
import type { IconType } from "react-icons";
import {
  FaStripe,
  FaAmazon,
  FaGoogle,
  FaMicrosoft,
  FaApple,
  FaUber,
  FaAirbnb,
  FaBolt,
} from "react-icons/fa";
import {
  SiMeta,
  SiNetflix,
  SiDatadog,
  SiGoldmansachs,
  SiPalantir,
  SiFigma,
  SiNotion,
  SiOpenai,
  SiNvidia,
  SiSalesforce,
  SiSnowflake,
  SiCloudflare,
  SiSpotify,
  SiShopify,
  SiAccenture,
  SiWalmart,
  SiFord,
  SiTesla,
  SiSiemens,
  SiTcs,
} from "react-icons/si";
import { BiLogoAdobe } from "react-icons/bi";

interface CompanyGridProps {
  selectedCompanyId: string | null;
  onSelect: (companyId: string | null) => void;
  category?: string | null;
}

const ITEMS_PER_PAGE = 12;

function DeloitteLogo({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 182 34"
      width={size}
      height={(size * 34) / 182}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M171.8,29c0-2.7,2.2-4.8,4.8-4.8c2.7,0,4.8,2.2,4.8,4.8s-2.2,4.8-4.8,4.8S171.8,31.7,171.8,29"
        fill="#86BC25"
      />
      <path
        d="M27.6,16.1c0,5.6-1.4,9.8-4.4,12.8s-7.2,4.5-12.6,4.5H0V0.1h11.2c5.3,0,9.3,1.3,12.1,4.1 C26.2,6.9,27.6,10.9,27.6,16.1 M18.4,16.4c0-3.1-0.6-5.3-1.8-6.8c-1.1-1.4-3-2.2-5.4-2.2H8.8v18.6h2c2.7,0,4.6-0.8,5.9-2.4 C17.8,22,18.4,19.6,18.4,16.4"
        fill="currentColor"
      />
      <rect x="56.7" y="0.1" width="8.3" height="33.4" fill="currentColor" />
      <path
        d="M92.4,20.9c0,4-1,7.2-3.2,9.5s-5.2,3.4-9,3.4c-3.7,0-6.6-1.1-8.8-3.5c-2.2-2.4-3.3-5.5-3.3-9.4 c0-4,1-7.2,3.2-9.4c2.2-2.3,5.2-3.4,9-3.4c2.4,0,4.5,0.5,6.3,1.5c1.9,1,3.2,2.5,4.2,4.4C92,16.1,92.4,18.3,92.4,20.9 M76.7,20.9 c0,2.2,0.3,3.7,0.8,4.8c0.5,1.1,1.4,1.6,2.8,1.6s2.2-0.5,2.8-1.6c0.5-1.1,0.8-2.8,0.8-4.8c0-2.2-0.3-3.7-0.8-4.8 c-0.5-1-1.4-1.6-2.8-1.6c-1.2,0-2.2,0.5-2.8,1.6C77,17.2,76.7,18.7,76.7,20.9"
        fill="currentColor"
      />
      <rect x="95.8" y="8.5" width="8.3" height="24.8" fill="currentColor" />
      <rect x="95.8" width="8.3" height="5.6" fill="currentColor" />
      <path
        d="M121,27c1.1,0,2.5-0.3,4-0.8v6.3c-1.1,0.5-2.2,0.8-3.2,1c-1,0.2-2.2,0.3-3.6,0.3c-2.8,0-4.8-0.7-6.1-2.2 c-1.2-1.4-1.9-3.6-1.9-6.5V14.9h-2.9V8.5h2.9V2.3l8.4-1.4v7.8h5.4V15h-5.4v9.6C118.8,26.3,119.5,27,121,27"
        fill="currentColor"
      />
      <path
        d="M140.4,27c1.1,0,2.5-0.3,4-0.8v6.3c-1.1,0.5-2.2,0.8-3.2,1c-1,0.2-2.2,0.3-3.6,0.3c-2.8,0-4.8-0.7-6.1-2.2 c-1.2-1.4-1.9-3.6-1.9-6.5V14.9h-2.9V8.5h2.9V2.2l8.4-1.3v7.8h5.4V15h-5.4v9.6C138.1,26.3,138.9,27,140.4,27"
        fill="currentColor"
      />
      <path
        d="M166.8,11c-2-2-4.8-2.9-8.4-2.9c-3.8,0-6.8,1.1-8.9,3.4c-2.1,2.3-3.1,5.5-3.1,9.7c0,4,1.1,7.2,3.3,9.4 c2.3,2.2,5.4,3.3,9.4,3.3c2,0,3.6-0.1,5-0.4c1.3-0.3,2.8-0.7,4-1.4l-1.2-5.6c-0.9,0.4-1.9,0.7-2.7,0.9c-1.2,0.3-2.6,0.4-4,0.4 c-1.6,0-2.9-0.4-3.8-1.1c-0.9-0.8-1.4-1.9-1.4-3.3h14.9v-3.9C169.8,15.8,168.7,13,166.8,11 M155,17.9c0.1-1.3,0.5-2.4,1.1-3 c0.6-0.6,1.4-0.9,2.5-0.9c1,0,2,0.3,2.6,1c0.6,0.7,0.9,1.6,1,2.9H155z"
        fill="currentColor"
      />
      <path
        d="M50.5,11c-2.1-2-4.8-2.9-8.4-2.9c-3.8,0-6.8,1.1-8.9,3.4s-3.1,5.5-3.1,9.7c0,4,1.1,7.2,3.3,9.4 c2.3,2.2,5.4,3.3,9.4,3.3c2,0,3.6-0.1,5-0.4c1.3-0.3,2.8-0.7,4-1.4l-1.2-5.7c-0.9,0.4-1.9,0.7-2.7,0.9c-1.2,0.3-2.6,0.4-4,0.4 c-1.6,0-2.9-0.4-3.8-1.1c-0.9-0.8-1.4-1.9-1.4-3.3h14.9v-3.8C53.5,15.8,52.4,13,50.5,11 M38.6,17.9c0.1-1.3,0.5-2.4,1.1-3 s1.4-0.9,2.5-0.9s2,0.3,2.6,1c0.6,0.7,0.9,1.6,1,2.9H38.6z"
        fill="currentColor"
      />
    </svg>
  );
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
  "goldman-sachs": SiGoldmansachs,
  palantir: SiPalantir,
  figma: SiFigma,
  notion: SiNotion,
  startup: FaBolt,
  openai: SiOpenai,
  nvidia: SiNvidia,
  salesforce: SiSalesforce,
  snowflake: SiSnowflake,
  cloudflare: SiCloudflare,
  spotify: SiSpotify,
  shopify: SiShopify,
  accenture: SiAccenture,
  walmart: SiWalmart,
  ford: SiFord,
  tesla: SiTesla,
  siemens: SiSiemens,
  tcs: SiTcs,
  adobe: BiLogoAdobe,
};

export function CompanyGrid({
  selectedCompanyId,
  onSelect,
  category,
}: CompanyGridProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const filtered = category
    ? COMPANIES.filter((c) => c.roles.some((r) => r.category === category))
    : COMPANIES;

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages - 1);
  const sliced = filtered.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  if (filtered.length === 0) {
    return (
      <div>
        <p
          style={{
            fontSize: "13px",
            color: "var(--color-text-muted)",
            textAlign: "center",
            padding: "32px 0",
          }}
        >
          No companies found for this category.
        </p>
        <CustomCompanyButton
          selectedCompanyId={selectedCompanyId}
          onSelect={onSelect}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "10px",
        }}
      >
        {sliced.map((company, i) => {
          const active = selectedCompanyId === company.id;
          return (
            <motion.button
              key={company.id}
              onClick={() => onSelect(active ? null : company.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: i * 0.02,
                ease: [0.22, 1, 0.36, 1],
              }}
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
                  ? "1.5px solid var(--app-accent, #b8a88a)"
                  : "1px solid var(--color-border-light)",
                background: active
                  ? "var(--app-accent-bg, rgba(184,168,138,0.06))"
                  : "transparent",
                cursor: "pointer",
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor =
                    "var(--app-accent, #b8a88a)";
                  e.currentTarget.style.background =
                    "var(--app-accent-bg, rgba(184,168,138,0.04))";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor =
                    "var(--color-border-light)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {(() => {
                if (company.id === "deloitte-usi") {
                  return <DeloitteLogo size={50} />;
                }
                const IconComp = companyIcons[company.id];
                return IconComp ? (
                  <IconComp
                    size={22}
                    color={
                      active
                        ? "var(--app-accent, #b8a88a)"
                        : "var(--color-text-secondary)"
                    }
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      lineHeight: 1,
                      color: active
                        ? "var(--app-accent, #b8a88a)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    {company.name[0]}
                  </span>
                );
              })()}
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: active
                    ? "var(--color-text)"
                    : "var(--color-text-secondary)",
                  textAlign: "center",
                  lineHeight: 1.2,
                  transition: "color 0.15s",
                }}
              >
                {company.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setCurrentPage}
        />
      )}

      <CustomCompanyButton
        selectedCompanyId={selectedCompanyId}
        onSelect={onSelect}
      />
    </div>
  );
}

function Pagination({
  totalPages,
  currentPage,
  onPageChange,
}: {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    marginTop: "16px",
    flexWrap: "wrap",
  };

  const btnBase: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid var(--color-border-light)",
    background: "transparent",
    color: "var(--color-text-secondary)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  };

  const pages: (number | "...")[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (totalPages <= 7) {
      pages.push(i);
    } else {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
  }

  return (
    <div style={containerStyle}>
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            style={{ ...btnBase, border: "none", cursor: "default" }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              ...btnBase,
              borderColor:
                p === currentPage
                  ? "var(--app-accent, #b8a88a)"
                  : "var(--color-border-light)",
              background:
                p === currentPage
                  ? "var(--app-accent-bg, rgba(184,168,138,0.06))"
                  : "transparent",
              color:
                p === currentPage
                  ? "var(--app-accent, #b8a88a)"
                  : "var(--color-text-secondary)",
            }}
            onMouseEnter={(e) => {
              if (p !== currentPage) {
                e.currentTarget.style.borderColor =
                  "var(--app-accent, #b8a88a)";
                e.currentTarget.style.color = "var(--app-accent, #b8a88a)";
              }
            }}
            onMouseLeave={(e) => {
              if (p !== currentPage) {
                e.currentTarget.style.borderColor = "var(--color-border-light)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }
            }}
          >
            {p + 1}
          </button>
        ),
      )}
    </div>
  );
}

function CustomCompanyButton({
  selectedCompanyId,
  onSelect,
}: {
  selectedCompanyId: string | null;
  onSelect: (companyId: string | null) => void;
}) {
  return (
    <motion.button
      onClick={() => onSelect("__custom__")}
      whileHover={{
        scale: 1.02,
        borderColor: "var(--app-accent, #b8a88a)",
        color: "var(--app-accent, #b8a88a)",
      }}
      whileTap={{ scale: 0.99 }}
      onMouseEnter={(e) => {
        if (selectedCompanyId !== "__custom__") {
          e.currentTarget.style.borderColor = "var(--app-accent, #b8a88a)";
          e.currentTarget.style.background =
            "var(--app-accent-bg, rgba(184,168,138,0.04))";
        }
      }}
      onMouseLeave={(e) => {
        if (selectedCompanyId !== "__custom__") {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.background = "transparent";
        }
      }}
      style={{
        marginTop: "16px",
        padding: "12px 20px",
        borderRadius: "10px",
        border:
          selectedCompanyId === "__custom__"
            ? "1.5px solid var(--app-accent, #b8a88a)"
            : "1px dashed var(--color-border)",
        background:
          selectedCompanyId === "__custom__"
            ? "var(--app-accent-bg, rgba(184,168,138,0.06))"
            : "transparent",
        color: "var(--color-text-secondary)",
        fontSize: "13px",
        cursor: "pointer",
        width: "100%",
        transition: "all 0.15s",
      }}
    >
      {selectedCompanyId === "__custom__"
        ? "✓ Custom company selected"
        : "+ Custom company (not in list)"}
    </motion.button>
  );
}
