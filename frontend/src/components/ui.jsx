export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm shadow-black/20 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, tone = "default", icon: Icon }) {
  const toneClass =
    tone === "up"
      ? "text-emerald-400"
      : tone === "down"
      ? "text-rose-400"
      : tone === "warn"
      ? "text-amber-400"
      : "text-slate-50";

  return (
    <Card className="flex items-start justify-between">
      <div>
        <div className="text-sm text-slate-400">{label}</div>
        <div className={`mt-2 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</div>
        {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
      </div>
      {Icon && (
        <div className="rounded-xl bg-slate-800/80 p-2.5 text-slate-400">
          <Icon size={18} strokeWidth={2} />
        </div>
      )}
    </Card>
  );
}

export function Badge({ children, tone = "default" }) {
  const toneClass =
    {
      default: "bg-slate-800 text-slate-300",
      emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      rose: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      violet: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    }[tone] || "bg-slate-800 text-slate-300";

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}>{children}</span>;
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-14 text-center">
      {Icon && <Icon size={28} className="mb-3 text-slate-600" strokeWidth={1.5} />}
      <div className="text-sm font-medium text-slate-300">{title}</div>
      {subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50";
  const variants = {
    primary: "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
    secondary: "border border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800",
    danger: "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
    ghost: "text-slate-400 hover:text-slate-100",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export const inputClass =
  "rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 placeholder:text-slate-600";
