import { Link } from "react-router-dom";
import RunwayMark from "./RunwayMark";

export default function PublicFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 font-mono text-[11px] text-sub sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <RunwayMark size={16} />
          <span>Runway &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 uppercase tracking-[0.06em]">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          <Link to="/features" className="hover:text-ink">
            Features
          </Link>
          <Link to="/security" className="hover:text-ink">
            Security
          </Link>
          <Link to="/about" className="hover:text-ink">
            About
          </Link>
          <Link to="/login" className="hover:text-ink">
            Log in
          </Link>
          <Link to="/register" className="hover:text-ink">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}
