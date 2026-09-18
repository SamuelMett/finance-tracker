import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui";
import RunwayMark from "./RunwayMark";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/features", label: "Features" },
  { to: "/security", label: "Security" },
  { to: "/about", label: "About" },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const loggedIn = !!localStorage.getItem("token");

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
            <RunwayMark size={20} />
          </div>
          <span className="text-lg font-semibold">Runway</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "text-emerald-400" : "text-slate-400 hover:text-slate-100"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {loggedIn ? (
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

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800/60 sm:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-800/80 px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "text-emerald-400" : "text-slate-400 hover:text-slate-100"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-800/80 pt-3">
            {loggedIn ? (
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                <Button className="w-full !py-2">Go to dashboard</Button>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-center text-sm font-medium text-slate-300 hover:text-slate-100"
                >
                  Log in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full !py-2">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
