import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, setAuthToken } from "../api/client";
import RunwayMark from "../components/RunwayMark";
import { inputClass } from "../components/ui";

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
        <div className="mb-8 font-mono text-xs text-sub">Sign in to manage your money.</div>

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
              placeholder="········"
              type="password"
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <button
            disabled={loading}
            className="w-full border border-ink bg-ink py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-paper transition hover:bg-transparent hover:text-ink disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 font-mono text-xs text-sub">
          No account?{" "}
          <Link className="text-ink underline hover:no-underline" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
