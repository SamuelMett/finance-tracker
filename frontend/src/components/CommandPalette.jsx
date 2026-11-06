import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, Search } from "lucide-react";
import { EASE } from "./motionTokens";

/** ⌘K / Ctrl+K quick navigation. */
export default function CommandPalette({ items, open, onClose }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const input = useRef(null);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? items.filter((i) => i.label.toLowerCase().includes(t) || i.hint?.toLowerCase().includes(t)) : items;
  }, [q, items]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);

  function go(item) {
    if (!item) return;
    onClose();
    if (item.action) item.action();
    else nav(item.to);
  }

  function onKey(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[idx]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-bg/70 px-4 pt-[16vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            className="w-full max-w-lg overflow-hidden rounded-lg border border-line-hi bg-surface shadow-2xl shadow-black/60"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={15} className="text-faint" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setIdx(0);
                }}
                onKeyDown={onKey}
                placeholder="Jump to a page or run an action"
                className="w-full bg-transparent py-3.5 font-mono text-sm text-fg outline-none placeholder:text-faint"
              />
              <kbd className="rounded border border-line-hi px-1.5 py-0.5 font-mono text-[10px] text-faint">esc</kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto p-1.5">
              {results.length === 0 && <li className="px-3 py-6 text-center font-mono text-xs text-faint">no match</li>}
              {results.map((r, i) => (
                <li key={r.label}>
                  <button
                    onMouseEnter={() => setIdx(i)}
                    onClick={() => go(r)}
                    className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition-colors ${
                      i === idx ? "bg-raised text-fg" : "text-mute"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <r.icon size={15} className={i === idx ? "text-accent" : "text-faint"} />
                      {r.label}
                    </span>
                    {i === idx ? (
                      <CornerDownLeft size={13} className="text-faint" />
                    ) : (
                      <span className="font-mono text-[10px] text-faint">{r.hint}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
