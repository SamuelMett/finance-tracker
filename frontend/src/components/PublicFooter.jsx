import { Link } from "react-router-dom";
import { Landmark } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-800/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <Landmark size={16} className="text-slate-600" />
          <span>Finance Tracker &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/" className="hover:text-slate-300">
            Home
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
