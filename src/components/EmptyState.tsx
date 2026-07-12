import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass relative flex flex-col items-center overflow-hidden rounded-2xl p-8 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-20 h-40 opacity-30 blur-3xl"
        style={{ background: "var(--gradient-ascend)" }}
      />
      {icon && (
        <div className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60 ring-1 ring-border">
          {icon}
        </div>
      )}
      <div className="relative text-sm font-semibold">{title}</div>
      {description && (
        <p className="relative mt-1.5 max-w-xs text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="relative mt-4">{action}</div>}
    </div>
  );
}
