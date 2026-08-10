import type { ReactNode } from "react";

export function PageHead({
  eyebrow,
  title,
  lede,
  action,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
      <div className="max-w-2xl">
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h1 className="mt-4 text-[clamp(1.9rem,3.4vw,2.75rem)] text-ink">{title}</h1>
        {lede && <p className="mt-4 leading-relaxed text-muted-foreground">{lede}</p>}
      </div>
      {action}
    </div>
  );
}

export const btnPrimary =
  "inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-background transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-50";
export const btnGhost =
  "inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-50";
export const btnDanger =
  "inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10";
export const inputCls =
  "w-full rounded-md border border-border bg-card px-4 py-3 text-ink outline-none transition-colors focus:border-accent";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-2 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "published" || status === "sent" || status === "subscribed"
      ? "bg-accent/15 text-accent-foreground border-accent/40"
      : "bg-secondary text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${tone}`}
    >
      {status}
    </span>
  );
}
