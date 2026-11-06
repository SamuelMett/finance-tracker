import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { api } from "../api/client";
import { Button, inputClass } from "../components/ui";
import { PageHeader, Notice } from "../components/motion";

export default function Settings() {
  const [me, setMe] = useState(null);
  const [setup, setSetup] = useState(null); // { otp_uri, qr_png_base64 }
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [password, setPassword] = useState("");
  const [offCode, setOffCode] = useState("");

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

  async function disable2fa(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.post("/auth/2fa/disable", { password, code: offCode });
      setMessage("Two-factor authentication disabled.");
      setDisabling(false);
      setPassword("");
      setOffCode("");
      loadMe();
    } catch (err) {
      const d = err?.response?.data?.detail;
      setError(typeof d === "string" ? d : "Could not disable 2FA. Check your password and code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageHeader
        title="Settings"
        subtitle={
          <>
            Signed in as <span className="text-fg">{me?.email}</span>
          </>
        }
      />

      <div>
        <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="font-display text-lg">Two-factor authentication</div>
            <div className="mt-1 font-mono text-xs text-mute">
              {me?.twofa_enabled
                ? "Enabled: a code from your authenticator app is required at login."
                : "Disabled: turn it on to add an extra layer of security to your account."}
            </div>
          </div>

          {me?.twofa_enabled ? (
            <Button variant="danger" onClick={() => setDisabling((v) => !v)} disabled={loading}>
              {disabling ? "Cancel" : "Disable"}
            </Button>
          ) : (
            !setup && (
              <Button onClick={startSetup} disabled={loading}>
                Enable
              </Button>
            )
          )}
        </div>

        {error && <Notice className="mt-4">{error}</Notice>}
        {message && (
          <Notice tone="pos" className="mt-4">
            {message}
          </Notice>
        )}

        {disabling && (
          <form onSubmit={disable2fa} className="mt-5 space-y-3 rounded-md border border-line bg-surface p-4">
            <p className="font-mono text-xs text-mute">
              To switch 2FA off, confirm it is you: enter your password and a current code from your authenticator.
            </p>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} w-full`}
              required
            />
            <input
              inputMode="numeric"
              placeholder="000000"
              value={offCode}
              onChange={(e) => setOffCode(e.target.value.replace(/D/g, "").slice(0, 6))}
              className={`${inputClass} w-full text-center tracking-[0.4em]`}
              required
            />
            <Button variant="danger" disabled={loading || offCode.length !== 6 || !password}>
              Turn off 2FA
            </Button>
          </form>
        )}

        {setup && (
          <div className="mt-5 space-y-4 pt-1">
            <p className="font-mono text-xs text-mute">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.), then enter
              the 6-digit code it generates.
            </p>
            <motion.img
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              src={`data:image/png;base64,${setup.qr_png_base64}`}
              alt="2FA QR code"
              className="mx-auto h-44 w-44 rounded border border-line-hi bg-white p-2"
            />
            <form onSubmit={confirmSetup} className="flex gap-3">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="000000"
                className={`${inputClass} flex-1 text-center text-lg tracking-[0.4em]`}
              />
              <Button disabled={loading || code.length !== 6}>Confirm</Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
