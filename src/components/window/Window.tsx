import type React from "react";

import { cn } from "@/lib/utils";

interface WindowProps {
  /** Title bar text, set in mono. */
  title: React.ReactNode;
  /** Optional right side of the title bar: a status, a count, an action. */
  meta?: React.ReactNode;
  /**
   * accent: the primary window on screen. ink: everything else, the
   * foreground inverted, so the accent keeps its meaning.
   */
  tone?: "accent" | "ink";
  as?: "article" | "div" | "section" | "li";
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/** Retro OS window chrome, ported from the arbxz design system. */
const Window = ({
  title,
  meta,
  tone = "ink",
  as: Tag = "div",
  className,
  bodyClassName,
  children,
}: WindowProps) => (
  <Tag
    className={cn(
      "flex flex-col border border-window-border bg-window text-window-fg",
      className,
    )}
  >
    <div
      className={cn(
        "flex min-h-8 items-center gap-2 px-3 py-1.5 font-mono text-xs",
        tone === "accent"
          ? "bg-window-title text-window-title-fg"
          : "bg-window-ink text-window-ink-fg",
      )}
    >
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 border border-current"
      />
      <span className="min-w-0 truncate">{title}</span>
      {meta && (
        <span className="ml-auto flex shrink-0 items-center gap-2 pl-2">
          {meta}
        </span>
      )}
    </div>
    <div className={cn("flex-1", bodyClassName)}>{children}</div>
  </Tag>
);

export default Window;
