import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, setAuthToken } from "../api/client";
import RunwayMark from "../components/RunwayMark";
import { inputClass } from "../components/ui";
import { Stagger, Item, Notice } from "../components/motion";

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
    <div className="min-h-screen w-full bg-bg px-4 text-fg">
      <Stagger gap={0.07} className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center py-10">
        <Item>
          <Link
            to="/"
            className="mb-8 inline-flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-[0.08em] text-mute hover:text-fg"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </Item>

        <Item>
          <Link to="/" className="mb-1 inline-flex items-center gap-2">
            <RunwayMark size={24} />
            <span className="font-display text-2xl">Runway</span>
          </Link>
        </Item>
        <Item className="mb-8 font-mono text-xs text-mute">Sign in to manage your money.</Item>

        {error && <Notice className="mb-5">{error}</Notice>}

        <Item as="form" onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-mute">Email</label>
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
            <label className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-mute">Password</label>
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
            className="w-full rounded border border-navy-hi/60 bg-navy py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-fg transition active:scale-[0.98] hover:border-navy-hi hover:bg-navy-hi disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </Item>

        <Item as="p" className="mt-6 font-mono text-xs text-mute">
          No account?{" "}
          <Link className="text-fg underline hover:no-underline" to="/register">
            Register
          </Link>
        </Item>
      </Stagger>
    </div>
  );
}
