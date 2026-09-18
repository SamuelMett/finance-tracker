import { Link } from "react-router-dom";
import { ShieldCheck, KeyRound, QrCode, Ban, ArrowRight } from "lucide-react";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import { Card, Button } from "../components/ui";

const POINTS = [
  {
    icon: KeyRound,
    title: "Your password is never stored in plain text",
    desc: "Passwords are hashed with bcrypt before they ever touch the database. Nobody, including us, can read your actual password back out.",
  },
  {
    icon: QrCode,
    title: "Optional two-factor authentication",
    desc: "Turn on 2FA in Settings and pair any standard authenticator app (Google Authenticator, Authy, 1Password) with a QR code. Logging in then requires your password plus a fresh 6-digit code.",
  },
  {
    icon: Ban,
    title: "We never ask for your bank login",
    desc: "A lot of budgeting apps require your actual bank credentials so a third party can pull your transactions automatically. Runway doesn't. You log your own transactions, or later, review an imported statement yourself before anything is saved.",
  },
  {
    icon: ShieldCheck,
    title: "Session tokens, not stored passwords",
    desc: "Once you log in, your browser holds a signed, expiring session token, not your password. Every request to your data is checked against that token.",
  },
];

export default function Security() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicNav />

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <h1 className="text-4xl font-semibold">How Runway handles your data</h1>
        <p className="mt-4 text-lg text-slate-400">
          It's your financial history. Here's exactly how it's protected, in plain language.
        </p>
      </section>

      <section className="mx-auto max-w-3xl space-y-5 px-4 pb-16 sm:px-6">
        {POINTS.map((p) => (
          <Card key={p.title} className="flex items-start gap-4">
            <div className="shrink-0 rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
              <p.icon size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="font-semibold">{p.title}</div>
              <p className="mt-1.5 text-sm text-slate-400">{p.desc}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <Card>
          <div className="font-semibold">Being upfront</div>
          <p className="mt-2 text-sm text-slate-400">
            Runway is a small, independently built project. There's no dedicated security team or paid audit behind
            it yet. What you get instead is honesty about what's actually implemented, listed above, and no data
            sold to advertisers or data brokers, ever.
          </p>
        </Card>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24 text-center sm:px-6">
        <Link to="/register" className="inline-block">
          <Button className="!px-6 !py-3 text-base">
            Create your account <ArrowRight size={18} />
          </Button>
        </Link>
      </section>

      <PublicFooter />
    </div>
  );
}
