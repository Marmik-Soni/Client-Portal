import React from "react";
import clsx from "clsx";

export type ProjectStatus = "draft" | "in_progress" | "review" | "completed" | "on_hold";

interface StatusBadgeProps {
  status: ProjectStatus | string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { label: string; className: string; dotClassName: string }> = {
  draft: {
    label: "Draft",
    className: "bg-neutral-900/80 text-neutral-400 border-neutral-800",
    dotClassName: "bg-neutral-500",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-950/60 text-blue-300 border-blue-900/60",
    dotClassName: "bg-blue-400 animate-pulse",
  },
  review: {
    label: "Under Review",
    className: "bg-amber-950/60 text-amber-300 border-amber-900/60",
    dotClassName: "bg-amber-400 animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-950/60 text-emerald-300 border-emerald-900/60",
    dotClassName: "bg-emerald-400",
  },
  on_hold: {
    label: "On Hold",
    className: "bg-purple-950/60 text-purple-300 border-purple-900/60",
    dotClassName: "bg-purple-400",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const config = statusConfig[status] || {
    label: status.replace(/_/g, " "),
    className: "bg-neutral-900 text-neutral-300 border-neutral-800",
    dotClassName: "bg-neutral-400",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border font-medium tracking-wider uppercase transition-colors duration-150",
        config.className,
        size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      )}
    >
      <span className={clsx("h-1.5 w-1.5 flex-shrink-0 rounded-full", config.dotClassName)} />
      <span>{config.label}</span>
    </span>
  );
};
