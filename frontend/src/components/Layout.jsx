import { NavLink, useNavigate } from "react-router-dom";
import { setAuthToken } from "../api/client";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/transactions", label: "Transactions" },
  { to: "/accounts", label: "Accounts" },
  { to: "/categories", label: "Categories" },
  { to: "/settings", label: "Settings" },
];

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
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold text-indigo-400">Finance Tracker</span>
            <nav className="flex flex-wrap gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm text-zinc-400">
            {email && <span className="hidden sm:inline">{email}</span>}
            <button
              onClick={logout}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
