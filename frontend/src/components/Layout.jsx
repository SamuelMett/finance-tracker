import { NavLink, useNavigate } from "react-router-dom";
import { setAuthToken } from "../api/client";
import RunwayMark from "./RunwayMark";

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

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `border-l-2 py-2 pl-3 font-mono text-[11px] uppercase tracking-[0.08em] transition ${
              isActive ? "border-ink text-ink" : "border-transparent text-sub hover:text-ink"
            }`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout({ children }) {
  const nav = useNavigate();
  const email = localStorage.getItem("email");

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
        <div className="mb-8 flex items-center gap-2.5">
          <RunwayMark size={22} />
          <span className="font-serif text-lg">Runway</span>
        </div>

        <NavItems />

        <div className="mt-auto space-y-3 border-t border-rule pt-4">
          {email && <div className="truncate font-mono text-[10px] text-sub">{email}</div>}
          <button
            onClick={logout}
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-sub hover:text-ink"
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
      <div className="flex gap-4 overflow-x-auto border-b border-rule bg-paper px-4 py-2.5 md:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `shrink-0 font-mono text-[10.5px] uppercase tracking-[0.06em] ${isActive ? "text-ink" : "text-sub"}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>

      <main className="px-4 py-6 sm:px-6 sm:py-8 md:ml-60 md:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
