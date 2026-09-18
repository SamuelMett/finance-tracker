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
    <div className="min-h-screen w-full bg-slate-950 px-4 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center py-10">
        <Link
          to="/login"
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-100"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow">
          <h1 className="text-xl font-semibold">Two-Factor Code</h1>
          <p className="mt-1 text-sm text-slate-400">Enter the 6-digit code from your authenticator app.</p>
          <p className="mt-3 text-xs text-slate-500">Account: {email}</p>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="123456"
              autoFocus
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-center text-lg tracking-[0.5em] outline-none focus:border-emerald-500"
            />

            <button
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg bg-emerald-500 py-2 font-medium hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
