import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, setAuthToken } from "../api/client";
import { Stagger, Item, Notice } from "../components/motion";

export default function TwoFactorLogin() {
  const nav = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const password = location.state?.password;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!email || !password) {
    nav("/login", { replace: true });
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login/2fa", { email, password, otp });
      const token = res.data?.access_token;
      if (!token) {
        setError("Login failed.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      setAuthToken(token);

      nav("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid 2FA code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-bg px-4 text-fg">
      <Stagger gap={0.07} className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center py-10">
        <Item>
          <Link
            to="/login"
            className="mb-8 inline-flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-[0.08em] text-mute hover:text-fg"
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </Item>

        <Item as="h1" className="font-display text-2xl">
          Two-factor code
        </Item>
        <Item as="p" className="mt-1 font-mono text-xs text-mute">
          Enter the 6-digit code from your authenticator app.
        </Item>
        <Item as="p" className="mt-3 font-mono text-[11px] text-mute">
          Account: {email}
        </Item>

        {error && <Notice className="mt-5">{error}</Notice>}

        <Item as="form" onSubmit={onSubmit} className="mt-6 space-y-6">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="000000"
            autoFocus
            className="w-full rounded border border-line bg-bg py-3 text-center font-mono text-2xl tracking-[0.5em] text-fg outline-none transition-colors placeholder:text-faint hover:border-line-hi focus:border-accent"
          />

          <button
            disabled={loading || otp.length !== 6}
            className="w-full rounded border border-navy-hi/60 bg-navy py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-fg transition active:scale-[0.98] hover:border-navy-hi hover:bg-navy-hi disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify and continue"}
          </button>
        </Item>
      </Stagger>
    </div>
  );
}
