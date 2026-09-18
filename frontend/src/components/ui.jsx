export function Card({ children, className = "" }) {
  return <div className={`border border-rule bg-paper p-5 ${className}`}>{children}</div>;
}

export function StatRow({ children, className = "" }) {
  return <div className={`flex flex-wrap divide-x divide-rule border-y border-rule ${className}`}>{children}</div>;
}

export function StatCard({ label, value, sub, tone = "default" }) {
  const toneClass = tone === "up" ? "text-pos" : tone === "down" ? "text-neg" : "text-ink";

  return (
    <div className="min-w-[140px] flex-1 px-5 py-4">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-sub">{label}</div>
      <div className={`mt-1.5 font-serif text-2xl tabular-nums ${toneClass}`}>{value}</div>
      {sub && <div className="mt-1 font-mono text-[10.5px] text-sub">{sub}</div>}
    </div>
  );
}

export function LedgerRow({ name, meta, amount, tone = "default", onDelete, right }) {
  const amtTone = tone === "up" ? "text-pos" : tone === "down" ? "text-neg" : "text-ink";
  return (
    <div className="flex items-baseline gap-2 border-b border-rule py-2.5 last:border-b-0">
      <span className="whitespace-nowrap font-serif text-[15px]">{name}</span>
      <span className="relative top-[-4px] flex-1 border-b border-dotted border-rule" />
      {meta && <span className="whitespace-nowrap font-mono text-[10px] text-sub">{meta}</span>}
      {amount !== undefined && (
        <span className={`whitespace-nowrap font-mono text-sm tabular-nums ${amtTone}`}>{amount}</span>
      )}
      {right}
      {onDelete && (
        <button onClick={onDelete} className="font-mono text-[10px] text-sub hover:text-neg">
          del
        </button>
      )}
    </div>
  );
}

export function Badge({ children, tone = "default" }) {
  const toneClass =
    {
      default: "text-sub",
      emerald: "text-pos",
      rose: "text-neg",
      amber: "text-neg",
      violet: "text-ink",
    }[tone] || "text-sub";

  return (
    <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${toneClass}`}>
      [{children}]
    </span>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-rule py-14 text-center">
      {Icon && <Icon size={22} className="mb-3 text-sub" strokeWidth={1.5} />}
      <div className="font-mono text-xs uppercase tracking-[0.06em] text-ink">{title}</div>
      {subtitle && <div className="mt-1.5 max-w-xs text-sm text-sub">{subtitle}</div>}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 border px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] transition disabled:opacity-50";
  const variants = {
    primary: "border-ink bg-ink text-paper hover:bg-transparent hover:text-ink",
    secondary: "border-rule text-ink hover:border-ink",
    danger: "border-neg text-neg hover:bg-neg hover:text-paper",
    ghost: "border-transparent text-sub hover:text-ink",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export const inputClass =
  "border-0 border-b border-rule bg-transparent px-0.5 py-2 font-mono text-sm text-ink outline-none transition focus:border-ink placeholder:text-sub/70";

export const selectClass =
  "border-0 border-b border-rule bg-transparent px-0.5 py-2 font-mono text-sm text-ink outline-none transition focus:border-ink";
