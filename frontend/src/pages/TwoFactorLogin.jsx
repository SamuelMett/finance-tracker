import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, setAuthToken } from "../api/client";

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
    <div className="min-h-screen w-full bg-paper px-4 text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center py-10">
        <Link to="/login" className="mb-8 inline-flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-[0.08em] text-sub hover:text-ink">
          <ArrowLeft size={14} />
          Back to login
        </Link>

        <h1 className="font-serif text-2xl">Two-factor code</h1>
        <p className="mt-1 font-mono text-xs text-sub">Enter the 6-digit code from your authenticator app.</p>
        <p className="mt-3 font-mono text-[11px] text-sub">Account: {email}</p>

        {error && <div className="mt-5 border border-neg/40 px-3 py-2 font-mono text-xs text-neg">{error}</div>}

        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="000000"
            autoFocus
            className="w-full border-0 border-b border-rule bg-transparent py-2 text-center font-mono text-xl tracking-[0.5em] text-ink outline-none focus:border-ink"
          />

          <button
            disabled={loading || otp.length !== 6}
            className="w-full border border-ink bg-ink py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-paper transition hover:bg-transparent hover:text-ink disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify and continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
