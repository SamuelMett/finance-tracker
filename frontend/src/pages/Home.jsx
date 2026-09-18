import { Link } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  Repeat,
  PieChart,
  ShieldCheck,
  Camera,
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import { Card, Badge, Button } from "../components/ui";

const FEATURES = [
  {
    icon: Wallet,
    title: "Accounts and transactions",
    desc: "Log income and expenses across every checking, savings, cash, and card account, with categories that actually make sense to you.",
  },
  {
    icon: CreditCard,
    title: "Debt payoff planner",
    desc: "Add your credit cards and loans, then compare Avalanche vs. Snowball strategies to see exactly when you'll be debt free.",
  },
  {
    icon: TrendingUp,
    title: "Cash flow forecast",
    desc: "See your balance projected forward day by day, based on your bills, debt payments, and paycheck pattern, so a tight week never sneaks up on you.",
    comingSoon: true,
  },
  {
    icon: Repeat,
    title: "Subscription detection",
    desc: "We scan your transaction history for recurring charges automatically, so a forgotten subscription stops quietly draining your account.",
  },
  {
    icon: PieChart,
    title: "One clear dashboard",
    desc: "Net worth, monthly spend by category, upcoming bills, and total debt, all in a single glance.",
  },
  {
    icon: ShieldCheck,
    title: "Your data, your account",
    desc: "Password plus optional two-factor authentication. Nobody sells your transaction history to advertisers here.",
  },
  {
    icon: Camera,
    title: "Receipt scanning",
    desc: "Snap a photo of a receipt and let it fill in the transaction for you.",
    comingSoon: true,
  },
];

const STEPS = [
  { title: "Create your account", desc: "Sign up in under a minute. Email and password, with 2FA if you want it." },
  { title: "Add accounts and log activity", desc: "Set up your accounts, categories, and debts, or import from a bank statement soon." },
  { title: "Get the full picture", desc: "Watch your dashboard, payoff plan, and subscriptions update as you go." },
];

function MockDashboard() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-2xl shadow-emerald-500/5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-300">Dashboard</div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-800/60 p-3">
          <div className="text-[10px] text-slate-500">Net worth</div>
          <div className="mt-1 text-sm font-semibold">$12,480</div>
        </div>
        <div className="rounded-xl bg-slate-800/60 p-3">
          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
            <TrendingUp size={10} /> Income
          </div>
          <div className="mt-1 text-sm font-semibold text-emerald-400">$4,200</div>
        </div>
        <div className="rounded-xl bg-slate-800/60 p-3">
          <div className="flex items-center gap-1 text-[10px] text-rose-400">
            <TrendingDown size={10} /> Expenses
          </div>
          <div className="mt-1 text-sm font-semibold text-rose-400">$2,915</div>
        </div>
      </div>
      <div className="mt-3 space-y-2 rounded-xl bg-slate-800/40 p-3">
        <div className="text-[10px] text-slate-500">Recurring spend</div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full w-2/3 rounded-full bg-violet-500" />
          </div>
          <span className="text-[10px] text-slate-400">$186/mo</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-800/40 p-3 text-[11px]">
        <span className="text-slate-400">Visa Card payoff</span>
        <span className="font-medium text-emerald-400">16 months</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
          <div>
            <Badge tone="emerald">Built for people who actually track their money</Badge>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              Your money, <span className="text-emerald-400">finally organized.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-400">
              Runway brings your accounts, spending, debt payoff, and subscriptions into one place, so you always
              know exactly where you stand, and where you're headed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button className="!px-6 !py-3 text-base">
                  Get started free <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary" className="!px-6 !py-3 text-base">
                  Learn more
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">No credit card required. Your data stays yours.</p>
          </div>
          <MockDashboard />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold">Everything you need, nothing you don't</h2>
          <p className="mt-3 text-slate-400">A focused toolkit for actually understanding your finances.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="relative">
              {f.comingSoon && (
                <span className="absolute right-4 top-4">
                  <Badge tone="violet">Coming soon</Badge>
                </span>
              )}
              <div className="mb-3 inline-flex rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                <f.icon size={20} strokeWidth={2} />
              </div>
              <div className="font-semibold">{f.title}</div>
              <p className="mt-1.5 text-sm text-slate-400">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-800/80 bg-slate-900/20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold">How it works</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-lg font-semibold text-emerald-400">
                  {i + 1}
                </div>
                <div className="mt-4 font-semibold">{s.title}</div>
                <p className="mt-1.5 text-sm text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap teaser */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Card className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
              <FileText size={22} strokeWidth={2} />
            </div>
            <div>
              <div className="font-semibold">Bank statement import and receipt scanning are next</div>
              <p className="mt-1 text-sm text-slate-400">
                Upload a statement or snap a receipt and let it turn into a reviewed transaction on its own. Both
                are on the way, right alongside the cash flow forecast.
              </p>
            </div>
          </div>
          <Badge tone="violet">In progress</Badge>
        </Card>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-4 text-center sm:px-6">
        <h2 className="text-3xl font-semibold">Ready to see where your money actually goes?</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Create a free account and add your first transaction in under two minutes.
        </p>
        <Link to="/register" className="mt-8 inline-block">
          <Button className="!px-6 !py-3 text-base">
            Get started free <ArrowRight size={18} />
          </Button>
        </Link>
      </section>

      <PublicFooter />
    </div>
  );
}
