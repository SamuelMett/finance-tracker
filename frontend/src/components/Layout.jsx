import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  CreditCard,
  Repeat,
  TrendingUp,
  Settings as SettingsIcon,
  LogOut,
  Landmark,
} from "lucide-react";
import { setAuthToken } from "../api/client";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/forecast", label: "Forecast", icon: TrendingUp },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/debts", label: "Debts", icon: CreditCard },
  { to: "/subscriptions", label: "Subscriptions", icon: Repeat },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {links.map((l) => {
        const Icon = l.icon;
        return (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {l.label}
          </NavLink>
        );
      })}
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
    <div className="min-h-screen w-full bg-slate-950 text-slate-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-800 bg-slate-900/40 p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2 py-2">
          <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
            <Landmark size={20} strokeWidth={2} />
          </div>
          <span className="text-lg font-semibold">Runway</span>
        </div>

        <NavItems />

        <div className="mt-auto space-y-2 border-t border-slate-800 pt-4">
          {email && <div className="truncate px-2 text-xs text-slate-500">{email}</div>}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
          >
            <LogOut size={18} strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
            <Landmark size={18} strokeWidth={2} />
          </div>
          <span className="font-semibold">Runway</span>
        </div>
        <button onClick={logout} className="text-xs font-medium text-slate-400 hover:text-slate-100">
          Logout
        </button>
      </header>
      <div className="flex gap-1 overflow-x-auto border-b border-slate-800 bg-slate-950 px-3 py-2 md:hidden">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isActive ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"
                }`
              }
            >
              <Icon size={14} strokeWidth={2} />
              {l.label}
            </NavLink>
          );
        })}
      </div>

      <main className="px-4 py-6 sm:px-6 sm:py-8 md:ml-64 md:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
