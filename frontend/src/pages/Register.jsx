import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../api/client";
import RunwayMark from "../components/RunwayMark";
import { inputClass } from "../components/ui";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (localStorage.getItem("token")) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { email: email.trim().toLowerCase(), password });
      nav("/login");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-paper px-4 text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center py-10">
        <Link to="/" className="mb-8 inline-flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-[0.08em] text-sub hover:text-ink">
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <Link to="/" className="mb-1 inline-flex items-center gap-2">
          <RunwayMark size={24} />
          <span className="font-serif text-2xl">Runway</span>
        </Link>
        <div className="mb-8 font-mono text-xs text-sub">Create an account.</div>

        {error && <div className="mb-5 border border-neg/40 px-3 py-2 font-mono text-xs text-neg">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-sub">Email</label>
            <input
              className={`${inputClass} mt-1 w-full`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              type="email"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-sub">Password</label>
            <input
              className={`${inputClass} mt-1 w-full`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              type="password"
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-sub">Confirm password</label>
            <input
              className={`${inputClass} mt-1 w-full`}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="········"
              type="password"
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </div>

          <button
            disabled={loading}
            className="w-full border border-ink bg-ink py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-paper transition hover:bg-transparent hover:text-ink disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 font-mono text-xs text-sub">
          Already have an account?{" "}
          <Link className="text-ink underline hover:no-underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
