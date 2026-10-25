import { Link } from "react-router-dom";
import RunwayMark from "./RunwayMark";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-800/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <RunwayMark size={16} />
          <span>Runway &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link to="/" className="hover:text-slate-300">
            Home
          </Link>
          <Link to="/features" className="hover:text-slate-300">
            Features
          </Link>
          <Link to="/security" className="hover:text-slate-300">
            Security
          </Link>
          <Link to="/about" className="hover:text-slate-300">
            About
          </Link>
          <Link to="/login" className="hover:text-slate-300">
            Log in
          </Link>
          <Link to="/register" className="hover:text-slate-300">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}
