import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, setAuthToken } from "../api/client";
import RunwayMark from "../components/RunwayMark";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (localStorage.getItem("token")) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email: cleanEmail, password });
      const data = res.data;

      if (data.requires_2fa) {
        nav("/login/2fa", { state: { email: cleanEmail, password } });
        return;
      }

      if (!data.access_token) {
        setError(data?.detail || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("email", cleanEmail);
      setAuthToken(data.access_token);

      nav("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 px-4 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center py-10">
        <Link
          to="/"
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-100"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow">
          <div className="mb-5">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-emerald-400">
              <RunwayMark size={22} />
              Runway
            </Link>
            <div className="mt-1 text-sm text-slate-400">Sign in to manage your money.</div>
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
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-lg bg-emerald-500 py-2 font-medium hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-400">
            No account?{" "}
            <Link className="text-emerald-400 hover:text-emerald-300" to="/register">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
