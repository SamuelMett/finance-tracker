import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeftRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Repeat,
  Search,
  Settings as SettingsIcon,
  Tags,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { setAuthToken } from "../api/client";
import RunwayMark from "./RunwayMark";
import CommandPalette from "./CommandPalette";
import { EASE } from "./motionTokens";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, hint: "overview" },
  { to: "/forecast", label: "Forecast", icon: TrendingUp, hint: "next 60 days" },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight, hint: "ledger" },
  { to: "/accounts", label: "Accounts", icon: Wallet, hint: "balances" },
  { to: "/debts", label: "Debts", icon: CreditCard, hint: "payoff plan" },
  { to: "/subscriptions", label: "Subscriptions", icon: Repeat, hint: "recurring" },
  { to: "/categories", label: "Categories", icon: Tags, hint: "tags" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, hint: "2FA, account" },
];

const spring = { type: "spring", stiffness: 520, damping: 40 };

function SideNav() {
  return (
    <nav className="flex flex-1 flex-col gap-0.5">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `relative flex items-center gap-3 rounded px-3 py-2 text-[13px] transition-colors duration-200 ${
              isActive ? "bg-raised text-fg" : "text-mute hover:bg-raised/60 hover:text-fg"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="side-indicator"
                  className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent"
                  transition={spring}
                />
              )}
              <l.icon size={15} strokeWidth={1.75} className={isActive ? "text-accent" : ""} />
              {l.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function TopNav() {
  return (
    <div className="flex gap-5 overflow-x-auto border-b border-line bg-bg px-4 py-2.5 md:hidden">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `relative shrink-0 pb-1 font-mono text-[10.5px] uppercase tracking-[0.06em] ${isActive ? "text-fg" : "text-mute"}`
          }
        >
          {({ isActive }) => (
            <>
              {l.label}
              {isActive && (
                <motion.span
                  layoutId="top-indicator"
                  className="absolute inset-x-0 bottom-0 h-px bg-accent"
                  transition={spring}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

/** A faint warm glow that follows the cursor behind the app. */
function CursorGlow() {
  const el = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return undefined;
    let raf = 0;
    function move(e) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (el.current)
          el.current.style.background = `radial-gradient(520px circle at ${e.clientX}px ${e.clientY}px, rgba(240,165,97,0.055), transparent 65%)`;
      });
    }
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={el} aria-hidden className="pointer-events-none fixed inset-0 z-0" />;
}

export default function AppShell() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const email = localStorage.getItem("email");
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setAuthToken(null);
    nav("/login");
  }

  const paletteItems = [...links, { label: "Log out", icon: LogOut, hint: "end session", action: logout }];

  return (
    <div className="min-h-screen w-full bg-bg text-fg">
      <CursorGlow />

      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r border-line bg-bg/80 px-4 py-5 backdrop-blur md:flex">
        <motion.div
          className="mb-6 flex items-center gap-2.5 px-2"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <RunwayMark size={24} />
          <span className="text-[17px] font-medium tracking-tight">Runway</span>
        </motion.div>

        <button
          onClick={() => setPaletteOpen(true)}
          className="mb-4 flex items-center justify-between rounded border border-line bg-surface px-3 py-2 text-[12px] text-faint transition-colors hover:border-line-hi hover:text-mute"
        >
          <span className="flex items-center gap-2">
            <Search size={13} /> Search
          </span>
          <kbd className="font-mono text-[10px]">Ctrl K</kbd>
        </button>

        <SideNav />

        <div className="mt-auto space-y-3 border-t border-line pt-4">
          {email && <div className="truncate px-2 font-mono text-[10px] text-faint">{email}</div>}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-2 font-mono text-[11px] uppercase tracking-[0.08em] text-mute transition-colors hover:text-fg"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <RunwayMark size={20} />
          <span className="font-medium tracking-tight">Runway</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setPaletteOpen(true)} aria-label="Search" className="text-mute">
            <Search size={16} />
          </button>
          <button onClick={logout} className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
            Logout
          </button>
        </div>
      </header>
      <TopNav />

      <main className="relative z-[1] px-4 py-6 sm:px-6 sm:py-8 md:ml-60 md:px-10">
        <motion.div
          key={pathname}
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <CommandPalette items={paletteItems} open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
