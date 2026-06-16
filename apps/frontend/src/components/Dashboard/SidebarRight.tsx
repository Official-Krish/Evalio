import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { InterviewSession } from "@evalio/shared";
import { computeStreak } from "./helpers";
import { Calendar } from "@/components/ui/calendar";
import {
  IconFlame,
  IconArrowUp,
  IconArrowDown,
  IconMinus,
} from "@tabler/icons-react";

interface SidebarRightProps {
  interviews: InterviewSession[];
  completed: InterviewSession[];
  comparison: {
    clarity: { change: number; direction: "up" | "down" | "same" };
    confidence: { change: number; direction: "up" | "down" | "same" };
    structure: { change: number; direction: "up" | "down" | "same" };
  };
  milestones: {
    totalCompleted: number;
    uniquePositions: number;
    nextMilestone: { label: string; progress: number } | null;
  };
}

/* ─── Streak card ─── */

function StreakCard({ interviews }: { interviews: InterviewSession[] }) {
  const streak = computeStreak(interviews);

  const last7 = useMemo(() => {
    const now = new Date();
    const days: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      days.push(
        interviews.some((iv) => new Date(iv.createdAt).toDateString() === key),
      );
    }
    return days;
  }, [interviews]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        borderRadius: "14px",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-card)",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow for active streak */}
      {streak >= 2 && (
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "120px",
            height: "120px",
            background:
              "radial-gradient(ellipse, rgba(251,146,60,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <IconFlame
          size={16}
          color={streak >= 2 ? "#fb923c" : "var(--color-text-muted)"}
        />
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "var(--color-text)",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {streak}
          </span>
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            day{streak !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* 7-day dots */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
        {last7.map((active, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background: active
                ? "var(--app-accent, #b8a88a)"
                : "var(--color-border)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      <p className="evalio-section-label">Current Streak</p>
    </motion.div>
  );
}

/* ─── Activity heatmap ─── */

function HeatmapCard({ interviews }: { interviews: InterviewSession[] }) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const iv of interviews) {
      const key = new Date(iv.createdAt).toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [interviews]);

  const lastInterview = interviews[0];
  const lastActive = lastInterview
    ? new Date(lastInterview.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  const modifiers = useMemo(() => {
    const l1: Date[] = [];
    const l2: Date[] = [];
    const l3: Date[] = [];
    activityMap.forEach((count, dateStr) => {
      const d = new Date(dateStr + "T00:00:00");
      if (count >= 3) l3.push(d);
      else if (count >= 2) l2.push(d);
      else l1.push(d);
    });
    return { level1: l1, level2: l2, level3: l3 };
  }, [activityMap]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      style={{
        borderRadius: "14px",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-card)",
        padding: "14px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <p className="evalio-section-label">Activity</p>
        {lastActive && (
          <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
            Last: {lastActive}
          </span>
        )}
      </div>

      <Calendar
        numberOfMonths={1}
        modifiers={modifiers}
        modifiersClassNames={{
          level1: "!bg-[var(--app-accent-bg)] !rounded-sm",
          level2: "!bg-[color:var(--app-accent-muted)] !text-white rounded-sm",
          level3:
            "!bg-[color:var(--app-accent)] !text-white rounded-sm font-medium",
        }}
        onDayMouseEnter={(date, _m, e) => {
          const key = date.toISOString().slice(0, 10);
          const count = activityMap.get(key) ?? 0;
          if (count > 0) {
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setTooltip({
              text: `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${count}`,
              x: r.left + r.width / 2,
              y: r.top - 4,
            });
          }
        }}
        onDayMouseLeave={() => setTooltip(null)}
        showOutsideDays={false}
        classNames={{
          root: "w-full min-w-[210px]",
          months: "w-full",
          month: "w-full",
          month_caption: "hidden",
          nav: "hidden",
          weekdays: "flex justify-between w-full mb-0.5",
          weekday:
            "w-7 shrink-0 text-[9px] font-normal text-[var(--color-text-muted)] pb-0.5 text-center",
          week: "mt-px flex justify-between w-full",
          day: "w-7 shrink-0 aspect-square p-0 text-center text-[10px] text-[var(--color-text-muted)] flex items-center justify-center",
          day_button:
            "size-full rounded-sm hover:bg-[var(--color-bg-hover)] data-[selected=true]:!bg-transparent data-[selected=true]:!text-inherit",
          outside: "opacity-0 pointer-events-none",
          disabled: "opacity-0 pointer-events-none",
          hidden: "hidden",
          today: "",
        }}
      />

      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            background: "var(--color-bg-card)",
            border:
              "1px solid var(--app-accent-border, rgba(184,168,138,0.25))",
            borderRadius: "6px",
            padding: "3px 8px",
            fontSize: "10px",
            color: "var(--color-text)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 50,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Milestones ─── */

function MilestonesCard({
  milestones,
}: {
  milestones: SidebarRightProps["milestones"];
}) {
  const items = [
    { label: "First interview", done: milestones.totalCompleted >= 1 },
    { label: "5 interviews", done: milestones.totalCompleted >= 5 },
    { label: "10 interviews", done: milestones.totalCompleted >= 10 },
    { label: "2 tracks explored", done: milestones.uniquePositions >= 2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        borderRadius: "14px",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-card)",
        padding: "18px 20px",
      }}
    >
      <p className="evalio-section-label" style={{ marginBottom: "16px" }}>
        Milestones
      </p>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: "22px" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: "4px",
            top: "5px",
            bottom: "5px",
            width: "1px",
            background: "var(--color-border)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              {/* Dot */}
              <div
                style={{
                  position: "absolute",
                  left: "0",
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: item.done
                    ? "var(--app-accent, #b8a88a)"
                    : "var(--color-border)",
                  border: item.done
                    ? "none"
                    : "1.5px solid var(--color-border)",
                  boxShadow: item.done
                    ? "0 0 8px var(--app-accent-glow, rgba(184,168,138,0.3))"
                    : "none",
                  transition: "all 0.3s",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  color: item.done
                    ? "var(--color-text-muted)"
                    : "var(--color-text)",
                  textDecoration: item.done ? "line-through" : "none",
                  opacity: item.done ? 0.6 : 1,
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {milestones.nextMilestone && (
        <div
          style={{
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{ fontSize: "11px", color: "var(--color-text-muted)" }}
            >
              Next: {milestones.nextMilestone.label}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "var(--app-accent, #b8a88a)",
                fontWeight: 500,
              }}
            >
              {Math.round(milestones.nextMilestone.progress * 100)}%
            </span>
          </div>
          <div
            style={{
              height: "3px",
              borderRadius: "999px",
              background: "var(--color-border)",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${milestones.nextMilestone.progress * 100}%` }}
              transition={{
                duration: 1.2,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.5,
              }}
              style={{
                height: "100%",
                borderRadius: "999px",
                background: "var(--app-accent, #b8a88a)",
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Comparison ─── */

function ComparisonCard({
  comparison,
}: {
  comparison: SidebarRightProps["comparison"];
}) {
  const rows = [
    { label: "Clarity", value: comparison.clarity },
    { label: "Confidence", value: comparison.confidence },
    { label: "Structure", value: comparison.structure },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{
        borderRadius: "14px",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-card)",
        padding: "18px 20px",
      }}
    >
      <p className="evalio-section-label" style={{ marginBottom: "14px" }}>
        Last 30 Days
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {rows.map((row, i) => {
          const isPos = row.value.direction === "up";
          const isNeg = row.value.direction === "down";
          const color = isPos
            ? "#4ade80"
            : isNeg
              ? "#f87171"
              : "var(--color-text-muted)";
          const sign = isPos ? "+" : "";
          return (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom:
                  i < rows.length - 1
                    ? "1px solid var(--color-border)"
                    : "none",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color,
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {isPos && <IconArrowUp size={11} />}
                {isNeg && <IconArrowDown size={11} />}
                {!isPos && !isNeg && <IconMinus size={11} />}
                {sign}
                {row.value.change}%
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Main ─── */

export function SidebarRight({
  interviews,
  completed,
  comparison,
  milestones,
}: SidebarRightProps) {
  const hasData = completed.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <StreakCard interviews={interviews} />
      {hasData && <HeatmapCard interviews={interviews} />}
      {hasData && <MilestonesCard milestones={milestones} />}
      {hasData && <ComparisonCard comparison={comparison} />}
    </div>
  );
}
