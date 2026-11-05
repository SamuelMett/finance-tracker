import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { setAuthToken } from "../api/client";
import RunwayMark from "./RunwayMark";
import { EASE } from "./motionTokens";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/forecast", label: "Forecast" },
  { to: "/transactions", label: "Transactions" },
  { to: "/accounts", label: "Accounts" },
  { to: "/debts", label: "Debts" },
  { to: "/subscriptions", label: "Subscriptions" },
  { to: "/categories", label: "Categories" },
  { to: "/settings", label: "Settings" },
];

const spring = { type: "spring", stiffness: 520, damping: 40 };

function SideNav() {
  return (
    <nav className="flex flex-1 flex-col">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `relative py-2 pl-3 font-mono text-[11px] uppercase tracking-[0.08em] transition-all duration-200 ${
              isActive ? "text-ink" : "text-sub hover:translate-x-0.5 hover:text-ink"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="side-indicator"
                  className="absolute inset-y-0 left-0 w-0.5 bg-ink"
                  transition={spring}
                />
              )}
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
    <div className="flex gap-5 overflow-x-auto border-b border-rule bg-paper px-4 py-2.5 md:hidden">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `relative shrink-0 pb-1 font-mono text-[10.5px] uppercase tracking-[0.06em] ${isActive ? "text-ink" : "text-sub"}`
          }
        >
          {({ isActive }) => (
            <>
              {l.label}
              {isActive && (
                <motion.span
                  layoutId="top-indicator"
                  className="absolute inset-x-0 bottom-0 h-px bg-ink"
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

export default function AppShell() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const email = localStorage.getItem("email");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setAuthToken(null);
    nav("/login");
  }

  return (
    <div className="min-h-screen w-full bg-paper text-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-rule px-5 py-6 md:flex">
        <motion.div
          className="mb-8 flex items-center gap-2.5"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <RunwayMark size={22} />
          <span className="font-serif text-lg">Runway</span>
        </motion.div>

        <SideNav />

        <div className="mt-auto space-y-3 border-t border-rule pt-4">
          {email && <div className="truncate font-mono text-[10px] text-sub">{email}</div>}
          <button
            onClick={logout}
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-sub transition-colors hover:text-ink"
          >
            Logout &rarr;
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-rule bg-paper px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <RunwayMark size={18} />
          <span className="font-serif text-base">Runway</span>
        </div>
        <button onClick={logout} className="font-mono text-[10px] uppercase tracking-[0.08em] text-sub">
          Logout
        </button>
      </header>
      <TopNav />

      <main className="px-4 py-6 sm:px-6 sm:py-8 md:ml-60 md:px-10">
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
    </div>
  );
}
