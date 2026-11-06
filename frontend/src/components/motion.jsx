import { useEffect, useRef, useState } from "react";
import { motion, animate, useReducedMotion } from "motion/react";

import { EASE, INK_EASE, riseVariants } from "./motionTokens";

/** Parent that cascades its <Item>/LedgerRow children in. */
export function Stagger({
  children,
  className = "",
  gap = 0.05,
  delay = 0,
  count,
  inView = false,
  as = "div",
  ...rest
}) {
  const Comp = motion[as];
  const step = count ? Math.min(gap, 0.7 / count) : gap;
  const variants = {
    hidden: {},
    show: { transition: { staggerChildren: step, delayChildren: delay } },
  };
  const trigger = inView ? { whileInView: "show", viewport: { once: true, margin: "-60px" } } : { animate: "show" };
  return (
    <Comp className={className} variants={variants} initial="hidden" {...trigger} {...rest}>
      {children}
    </Comp>
  );
}

export function Item({ children, className = "", as = "div", ...rest }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={riseVariants} {...rest}>
      {children}
    </Comp>
  );
}

/** Single element that rises in when scrolled into view. */
export function Reveal({ children, className = "", delay = 0, as = "div" }) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/** Page title block whose underline rule is drawn left to right like an ink stroke. */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="relative flex flex-wrap items-end justify-between gap-4 pb-3">
      <div>
        <motion.h1
          className="font-display text-2xl font-medium tracking-[-0.02em]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="mt-1 font-mono text-xs text-mute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      {children}
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-line-hi"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: INK_EASE }}
      />
    </div>
  );
}

/** Inline notice (errors / confirmations) that slides in instead of popping. */
export function Notice({ tone = "neg", children, className = "" }) {
  const toneClass = tone === "pos" ? "border-pos/40 text-pos" : "border-neg/40 text-neg";
  return (
    <motion.div
      className={`border px-3 py-2 font-mono text-xs ${toneClass} ${className}`}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      role="status"
    >
      {children}
    </motion.div>
  );
}

/** Rolls a number up from its previous value (or zero) to the target. */
export function AnimatedNumber({ value, format = String, duration = 1.1, delay = 0 }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(() => format(reduce ? value : 0));
  const current = useRef(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      current.current = value;
      setDisplay(format(value));
      return undefined;
    }
    const controls = animate(current.current, value, {
      duration,
      delay,
      ease: EASE,
      onUpdate: (v) => {
        current.current = v;
        setDisplay(format(v));
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce]);

  return <>{display}</>;
}
