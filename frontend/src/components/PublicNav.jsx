import { Link, NavLink } from "react-router-dom";
import { Landmark } from "lucide-react";
import { Button } from "./ui";

export default function PublicNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
            <Landmark size={20} strokeWidth={2} />
          </div>
          <span className="text-lg font-semibold">Finance Tracker</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "text-emerald-400" : "text-slate-400 hover:text-slate-100"}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "text-emerald-400" : "text-slate-400 hover:text-slate-100"}`
            }
          >
            About
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {localStorage.getItem("token") ? (
            <Link to="/dashboard">
              <Button className="!px-4 !py-2">Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:text-slate-100">
                Log in
              </Link>
              <Link to="/register">
                <Button className="!px-4 !py-2">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
