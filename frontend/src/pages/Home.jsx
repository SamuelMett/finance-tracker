import { Link } from "react-router-dom";
import { Wallet, CreditCard, Repeat, PieChart, ShieldCheck, Camera, FileText, ArrowRight, TrendingUp } from "lucide-react";
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

function MockStatement() {
  return (
    <div className="border border-rule bg-paper p-6">
      <div className="flex items-baseline justify-between border-b border-ink pb-2">
        <span className="font-mono text-[11px] tracking-[0.1em] text-ink">RUNWAY</span>
        <span className="font-mono text-[10px] text-sub">SEP 2026</span>
      </div>
      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-sub">Net worth</div>
      <div className="mt-1 font-serif text-3xl">$12,480.00</div>
      <div className="mt-1 font-mono text-[11px] text-pos">+$1,285.00 this month</div>

      <div className="mt-5 flex gap-8 border-t border-rule pt-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-sub">Income</div>
          <div className="mt-1 font-serif text-lg text-pos">$4,200.00</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-sub">Expenses</div>
          <div className="mt-1 font-serif text-lg text-neg">$2,915.00</div>
        </div>
      </div>

      <div className="mt-5 border-t border-rule pt-3">
        <div className="flex items-baseline gap-2 py-1.5">
          <span className="whitespace-nowrap font-serif text-sm">Recurring spend</span>
          <span className="relative top-[-3px] flex-1 border-b border-dotted border-rule" />
          <span className="whitespace-nowrap font-mono text-xs text-sub">$186/mo</span>
        </div>
        <div className="flex items-baseline gap-2 py-1.5">
          <span className="whitespace-nowrap font-serif text-sm">Visa Card payoff</span>
          <span className="relative top-[-3px] flex-1 border-b border-dotted border-rule" />
          <span className="whitespace-nowrap font-mono text-xs text-pos">16 months</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <PublicNav />

      {/* Hero */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
        <div>
          <Badge>Built for people who actually track their money</Badge>
          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
            Your money, <em>finally organized.</em>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-sub">
            Runway brings your accounts, spending, debt payoff, and subscriptions into one place, so you always know
            exactly where you stand, and where you're headed.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register">
              <Button className="!px-6 !py-3 text-sm">
                Get started free <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" className="!px-6 !py-3 text-sm">
                Learn more
              </Button>
            </Link>
          </div>
          <p className="mt-4 font-mono text-[11px] text-sub">No credit card required. Your data stays yours.</p>
        </div>
        <MockStatement />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-10 border-b border-ink pb-4 text-center">
          <h2 className="font-serif text-3xl">Everything you need, nothing you don't</h2>
          <p className="mt-3 font-mono text-xs text-sub">A focused toolkit for actually understanding your finances.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="relative">
              {f.comingSoon && (
                <span className="absolute right-5 top-5">
                  <Badge>coming soon</Badge>
                </span>
              )}
              <f.icon size={20} strokeWidth={1.75} className="mb-3 text-ink" />
              <div className="font-serif text-lg">{f.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-sub">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-rule bg-paper-dim">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-3xl">How it works</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="font-mono text-xl text-sub">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-2 font-serif text-lg">{s.title}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-sub">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap teaser */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Card className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <FileText size={22} strokeWidth={1.75} className="mt-0.5 text-ink" />
            <div>
              <div className="font-serif text-lg">Bank statement import and receipt scanning are next</div>
              <p className="mt-1 text-sm leading-relaxed text-sub">
                Upload a statement or snap a receipt and let it turn into a reviewed transaction on its own. Both
                are on the way.
              </p>
            </div>
          </div>
          <Badge>in progress</Badge>
        </Card>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-24 pt-4 text-center sm:px-6">
        <h2 className="font-serif text-3xl">Ready to see where your money actually goes?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-sub">
          Create a free account and add your first transaction in under two minutes.
        </p>
        <Link to="/register" className="mt-8 inline-block">
          <Button className="!px-6 !py-3 text-sm">
            Get started free <ArrowRight size={16} />
          </Button>
        </Link>
      </section>

      <PublicFooter />
    </div>
  );
}
