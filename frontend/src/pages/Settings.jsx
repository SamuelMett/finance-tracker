import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { Button } from "../components/ui";

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
      <div className="mx-auto max-w-xl space-y-8">
        <div className="border-b border-ink pb-3">
          <h1 className="font-serif text-2xl">Settings</h1>
          <p className="mt-1 font-mono text-xs text-sub">
            Signed in as <span className="text-ink">{me?.email}</span>
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 border-b border-rule pb-4">
            <div>
              <div className="font-serif text-lg">Two-factor authentication</div>
              <div className="mt-1 font-mono text-xs text-sub">
                {me?.twofa_enabled
                  ? "Enabled: a code from your authenticator app is required at login."
                  : "Disabled: turn it on to add an extra layer of security to your account."}
              </div>
            </div>

            {me?.twofa_enabled ? (
              <Button variant="danger" onClick={disable2fa} disabled={loading}>
                Disable
              </Button>
            ) : (
              !setup && (
                <Button onClick={startSetup} disabled={loading}>
                  Enable
                </Button>
              )
            )}
          </div>

          {error && <div className="mt-4 border border-neg/40 px-3 py-2 font-mono text-xs text-neg">{error}</div>}
          {message && <div className="mt-4 border border-pos/40 px-3 py-2 font-mono text-xs text-pos">{message}</div>}

          {setup && (
            <div className="mt-5 space-y-4 pt-1">
              <p className="font-mono text-xs text-sub">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.), then
                enter the 6-digit code it generates.
              </p>
              <img
                src={`data:image/png;base64,${setup.qr_png_base64}`}
                alt="2FA QR code"
                className="mx-auto h-44 w-44 border border-rule bg-white p-2"
              />
              <form onSubmit={confirmSetup} className="flex gap-3">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="000000"
                  className="flex-1 border-0 border-b border-rule bg-transparent py-2 text-center font-mono text-lg tracking-[0.4em] text-ink outline-none focus:border-ink"
                />
                <Button disabled={loading || code.length !== 6}>Confirm</Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
