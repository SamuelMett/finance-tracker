import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";

export default function Settings() {
  const [me, setMe] = useState(null);
  const [setup, setSetup] = useState(null); // { otp_uri, qr_png_base64 }
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadMe() {
    try {
      const res = await api.get("/auth/me");
      setMe(res.data);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function startSetup() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/2fa/setup");
      setSetup(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not start 2FA setup.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmSetup(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.post("/auth/2fa/confirm", { code });
      setSetup(null);
      setCode("");
      setMessage("Two-factor authentication is now enabled.");
      loadMe();
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  async function disable2fa() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.post("/auth/2fa/disable");
      setMessage("Two-factor authentication disabled.");
      loadMe();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not disable 2FA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">
            Signed in as <span className="font-medium text-slate-200">{me?.email}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Two-factor authentication</div>
              <div className="text-sm text-slate-400">
                {me?.twofa_enabled
                  ? "Enabled — a code from your authenticator app is required at login."
                  : "Disabled — add an extra layer of security to your account."}
              </div>
            </div>

            {me?.twofa_enabled ? (
              <button
                onClick={disable2fa}
                disabled={loading}
                className="shrink-0 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/20 disabled:opacity-60"
              >
                Disable
              </button>
            ) : (
              !setup && (
                <button
                  onClick={startSetup}
                  disabled={loading}
                  className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-400 disabled:opacity-60"
                >
                  Enable
                </button>
              )
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              {message}
            </div>
          )}

          {setup && (
            <div className="mt-5 space-y-4 border-t border-slate-800 pt-5">
              <p className="text-sm text-slate-400">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.),
                then enter the 6-digit code it generates.
              </p>
              <img
                src={`data:image/png;base64,${setup.qr_png_base64}`}
                alt="2FA QR code"
                className="mx-auto h-48 w-48 rounded-lg bg-white p-2"
              />
              <form onSubmit={confirmSetup} className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="123456"
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-center tracking-[0.4em] outline-none focus:border-emerald-500"
                />
                <button
                  disabled={loading || code.length !== 6}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-400 disabled:opacity-60"
                >
                  Confirm
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
