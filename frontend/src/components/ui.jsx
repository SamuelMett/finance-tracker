import { motion } from "motion/react";
import { Stagger, Item, AnimatedNumber } from "./motion";
import { riseVariants, INK_EASE } from "./motionTokens";

/** Cursor-following warm glow, shared by every surface that wants it. */
export function Spotlight({ children, className = "", ...rest }) {
  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }
  return (
    <div onMouseMove={onMove} className={`group relative overflow-hidden ${className}`} {...rest}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(240,165,97,0.11), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <Spotlight
      className={`rounded-md border border-line bg-surface p-5 transition-colors duration-200 hover:border-line-hi ${className}`}
    >
      {children}
    </Spotlight>
  );
}

/** Tiny trend line that draws itself. */
export function Sparkline({ points, className = "h-8 w-24", tone = "accent" }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${((i / (points.length - 1)) * 100).toFixed(2)},${(26 - ((p - min) / span) * 24).toFixed(2)}`,
    )
    .join(" ");
  const stroke = tone === "pos" ? "#7bcf9a" : tone === "neg" ? "#ee7b70" : "#f0a561";
  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className={`overflow-visible ${className}`}
      fill="none"
      aria-hidden
    >
      <motion.path
        d={d}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: INK_EASE, delay: 0.3 }}
      />
    </svg>
  );
}

/** KPI grid: hairline-separated cells, like a trading terminal. */
export function StatRow({ children, className = "" }) {
  return (
    <Stagger
      gap={0.07}
      className={`flex flex-wrap gap-px overflow-hidden rounded-md border border-line bg-line ${className}`}
    >
      {children}
    </Stagger>
  );
}

/** Pass `amount` + `fmt` to make the figure roll up; otherwise `value` renders as-is. */
export function StatCard({ label, value, amount, fmt, sub, tone = "default", trend }) {
  const toneClass = tone === "up" ? "text-pos" : tone === "down" ? "text-neg" : "text-fg";

  return (
    <Item className="min-w-[150px] flex-1 bg-surface px-5 py-4">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-mute">{label}</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className={`font-mono text-[22px] leading-none tabular-nums tracking-tight ${toneClass}`}>
          {amount !== undefined ? <AnimatedNumber value={amount} format={fmt} /> : value}
        </div>
        {trend && <Sparkline points={trend} tone={tone === "up" ? "pos" : tone === "down" ? "neg" : "accent"} />}
      </div>
      {sub && <div className="mt-2 font-mono text-[10.5px] text-faint">{sub}</div>}
    </Item>
  );
}

export function LedgerRow({ name, meta, amount, tone = "default", onDelete, right }) {
  const amtTone = tone === "up" ? "text-pos" : tone === "down" ? "text-neg" : "text-fg";
  return (
    <motion.div
      variants={riseVariants}
      className="flex items-baseline gap-2 border-b border-line py-2.5 transition-[padding] duration-200 last:border-b-0 hover:pl-1.5"
    >
      <span className="whitespace-nowrap text-[14.5px]">{name}</span>
      <span className="relative top-[-4px] flex-1 border-b border-dotted border-line-hi" />
      {meta && <span className="whitespace-nowrap font-mono text-[10px] text-mute">{meta}</span>}
      {amount !== undefined && (
        <span className={`whitespace-nowrap font-mono text-[13px] tabular-nums ${amtTone}`}>{amount}</span>
      )}
      {right}
      {onDelete && (
        <button onClick={onDelete} className="font-mono text-[10px] text-faint transition-colors hover:text-neg">
          del
        </button>
      )}
    </motion.div>
  );
}

export function Badge({ children, tone = "default" }) {
  const toneClass =
    { default: "text-mute", emerald: "text-pos", rose: "text-neg", amber: "text-accent", violet: "text-accent" }[
      tone
    ] || "text-mute";

  return <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${toneClass}`}>[{children}]</span>;
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center rounded-md border border-dashed border-line-hi py-14 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {Icon && <Icon size={22} className="mb-3 text-faint" strokeWidth={1.5} />}
      <div className="font-mono text-xs uppercase tracking-[0.06em] text-fg">{title}</div>
      {subtitle && <div className="mt-1.5 max-w-xs text-sm text-mute">{subtitle}</div>}
    </motion.div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded border px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] transition-colors disabled:opacity-50";
  const variants = {
    primary: "border-navy-hi/60 bg-navy text-fg hover:border-navy-hi hover:bg-navy-hi",
    secondary: "border-line-hi text-fg hover:border-mute hover:bg-raised",
    danger: "border-neg/60 text-neg hover:bg-neg hover:text-bg",
    ghost: "border-transparent text-mute hover:text-fg",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

const field =
  "rounded border border-line bg-bg px-3 py-2 font-mono text-sm text-fg outline-none transition-colors placeholder:text-faint hover:border-line-hi focus:border-accent";

export const inputClass = field;
export const selectClass = field;

export const submitClass =
  "rounded border border-navy-hi/60 bg-navy px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-fg transition active:scale-[0.97] hover:border-navy-hi hover:bg-navy-hi";
