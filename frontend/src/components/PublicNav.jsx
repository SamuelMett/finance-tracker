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
    <header className="sticky top-0 z-20 border-b border-rule bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <RunwayMark size={22} />
          <span className="font-serif text-lg">Runway</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `font-mono text-[11px] uppercase tracking-[0.08em] ${isActive ? "text-ink" : "text-sub hover:text-ink"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-5 sm:flex">
          {loggedIn ? (
            <Link to="/dashboard">
              <Button className="!px-4 !py-2">Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="font-mono text-[11px] uppercase tracking-[0.08em] text-sub hover:text-ink">
                Log in
              </Link>
              <Link to="/register">
                <Button className="!px-4 !py-2">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen((v) => !v)} className="p-1 text-ink sm:hidden" aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-rule px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-3">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `font-mono text-[11px] uppercase tracking-[0.08em] ${isActive ? "text-ink" : "text-sub"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3 border-t border-rule pt-3">
            {loggedIn ? (
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                <Button className="w-full !py-2">Go to dashboard</Button>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="font-mono text-[11px] uppercase tracking-[0.08em] text-sub"
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
