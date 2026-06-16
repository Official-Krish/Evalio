import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "motion/react";
import type { InterviewSession } from "@evalio/shared";
import { IconFlame } from "@tabler/icons-react";
import { Calendar } from "@/components/ui/calendar";

interface StreakHeatmapProps {
  interviews: InterviewSession[];
}

export function StreakHeatmap({ interviews }: StreakHeatmapProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const iv of interviews) {
      const key = new Date(iv.createdAt).toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [interviews]);

  const streak = useMemo(() => {
    let count = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if ((activityMap.get(key) ?? 0) > 0) count++;
      else break;
    }
    return count;
  }, [activityMap]);

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

  function handleMouseEnter(
    date: Date,
    _modifiers: Record<string, boolean>,
    e: React.MouseEvent,
  ) {
    const key = date.toISOString().slice(0, 10);
    const count = activityMap.get(key) ?? 0;
    if (count > 0) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
      setTooltip(
        `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${count} session${count !== 1 ? "s" : ""}`,
      );
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: "16px",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-card)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p className="evalio-section-label">Interview Streak</p>
        {streak > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(251,146,60,0.08)",
              border: "1px solid rgba(251,146,60,0.2)",
              color: "#fb923c",
              borderRadius: "999px",
              padding: "3px 10px",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            <IconFlame size={11} />
            {streak} day{streak !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Calendar */}
      <div style={{ padding: "12px 16px", overflowX: "auto" }}>
        <Calendar
          numberOfMonths={1}
          modifiers={modifiers}
          modifiersClassNames={{
            level1: "!bg-[var(--app-accent-bg)] !rounded-sm",
            level2:
              "!bg-[color:var(--app-accent-muted)] !text-white rounded-sm",
            level3:
              "!bg-[color:var(--app-accent)] !text-white rounded-sm font-medium",
          }}
          onDayMouseEnter={handleMouseEnter}
          onDayMouseLeave={() => setTooltip(null)}
          showOutsideDays={false}
          classNames={{
            root: "w-full min-w-[240px]",
            months: "w-full",
            month: "w-full",
            month_caption:
              "text-xs font-semibold text-[var(--color-text)] px-2 py-2 mb-2 border-b border-dashed border-[var(--color-border-light)]",
            nav: "hidden",
            weekdays: "flex justify-between w-full mb-1",
            weekday:
              "w-8 shrink-0 text-[10px] font-medium text-[var(--color-text-muted)] pb-1 text-center",
            week: "mt-1 flex justify-between w-full",
            day: "w-8 shrink-0 aspect-square p-0 text-center text-[11px] text-[var(--color-text-muted)] flex items-center justify-center",
            day_button:
              "size-full rounded-sm hover:bg-[var(--color-bg-hover)] data-[selected=true]:!bg-transparent data-[selected=true]:!text-inherit transition-colors duration-150",
            outside: "opacity-0 pointer-events-none",
            disabled: "opacity-0 pointer-events-none",
            hidden: "hidden",
            today: "ring-1 ring-[var(--app-accent-border)] rounded-sm",
          }}
        />
      </div>

      {/* Legend */}
      <div
        style={{
          padding: "10px 20px 14px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
          Less
        </span>
        {[
          "var(--color-border)",
          "var(--app-accent-bg)",
          "rgba(184,168,138,0.35)",
          "var(--app-accent, #b8a88a)",
        ].map((bg, i) => (
          <div
            key={i}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "3px",
              background: bg,
            }}
          />
        ))}
        <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
          More
        </span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, -100%)",
            background: "var(--color-bg-card)",
            border: "1px solid var(--app-accent-border, rgba(184,168,138,0.3))",
            borderRadius: "6px",
            padding: "4px 10px",
            fontSize: "11px",
            color: "var(--color-text)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 50,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {tooltip}
        </div>
      )}
    </motion.div>
  );
}
