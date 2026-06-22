import { Link, useLocation } from "react-router-dom";
import {
  IconCompass,
  IconBriefcase,
  IconPlus,
  IconChartBar,
} from "@tabler/icons-react";

export function Sidebar({ completedCount }: { completedCount: number }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="db-sidebar">
      <nav className="db-sidebar-menu">
        <Link
          to="/dashboard"
          className={`db-sidebar-item ${currentPath === "/dashboard" && location.hash !== "#history" ? "active" : ""}`}
        >
          <IconCompass size={16} />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/dashboard#history"
          className={`db-sidebar-item ${currentPath === "/dashboard" && location.hash === "#history" ? "active" : ""}`}
          onClick={(e) => {
            if (currentPath === "/dashboard") {
              e.preventDefault();
              document
                .getElementById("history")
                ?.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <IconBriefcase size={16} />
          <span>Mock Sessions</span>
          {completedCount > 0 && (
            <span className="db-sidebar-item-badge">{completedCount}</span>
          )}
        </Link>
        <Link
          to="/interview/new"
          className={`db-sidebar-item ${currentPath === "/interview/new" ? "active" : ""}`}
        >
          <IconPlus size={16} />
          <span>Practice Area</span>
        </Link>
        <Link
          to="/analysis"
          className={`db-sidebar-item ${currentPath === "/analysis" ? "active" : ""}`}
        >
          <IconChartBar size={16} />
          <span>Analysis</span>
          {completedCount > 0 && (
            <span className="db-sidebar-item-dot" title="Analysis available" />
          )}
        </Link>
      </nav>

      <div className="db-sidebar-divider" />

      <Link to="/pricing" className="db-sidebar-upgrade">
        <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-accent)] mb-2">
          Upgrade
        </p>
        <h4 className="text-[12px] font-semibold text-[var(--color-text)] mb-1">
          More Interviews
        </h4>
        <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
          Get more mock interviews, extended session time, and priority access.
        </p>
      </Link>
    </aside>
  );
}
