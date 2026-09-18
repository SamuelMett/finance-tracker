import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/client";

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
    <div className="min-h-screen w-full bg-slate-950 px-4 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center">
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow">
          <div className="mb-5">
            <div className="text-2xl font-semibold text-emerald-400">Runway</div>
            <div className="mt-1 text-sm text-slate-400">Create an account.</div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
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
              <label className="text-sm text-slate-300">Password</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
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
              <label className="text-sm text-slate-300">Confirm password</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                required
                disabled={loading}
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-lg bg-emerald-500 py-2 font-medium hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-400">
            Already have an account?{" "}
            <Link className="text-emerald-400 hover:text-emerald-300" to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
