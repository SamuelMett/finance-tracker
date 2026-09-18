import { Link } from "react-router-dom";
import { Wallet, CreditCard, Repeat, PieChart, ShieldCheck, ArrowRight } from "lucide-react";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import { Card, Button } from "../components/ui";

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Your data belongs to you",
    desc: "No ad targeting, no selling transaction data. Your account, your numbers.",
  },
  {
    icon: Wallet,
    title: "Built for real use, not demos",
    desc: "Every feature exists because it solves an actual daily-money problem — not to look good on a landing page.",
  },
  {
    icon: PieChart,
    title: "Clarity over clutter",
    desc: "One dashboard that tells you what's actually going on, instead of twenty charts you'll never read.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicNav />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h1 className="text-4xl font-semibold">About Finance Tracker</h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-400">
          Most budgeting apps ask you to hand over your bank login to a third party, then bury the one number you
          actually care about under a dozen upsells. Finance Tracker is the opposite: a small, focused tool for
          tracking accounts, spending, debt, and recurring bills — built to be understood in a few minutes, not a
          weekend.
        </p>
        <p className="mt-4 leading-relaxed text-slate-400">
          It started as a simple transaction log, then grew to answer the questions that actually keep people up at
          night: <em>How much debt do I have, and when will I be free of it? What subscriptions am I quietly paying
          for? Where did this month's money actually go?</em>
        </p>
      </section>

      <section className="border-y border-slate-800/80 bg-slate-900/20">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-semibold">What we care about</h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <Card key={p.title}>
                <div className="mb-3 inline-flex rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                  <p.icon size={20} strokeWidth={2} />
                </div>
                <div className="font-semibold">{p.title}</div>
                <p className="mt-1.5 text-sm text-slate-400">{p.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold">What's in the app today</h2>
        <ul className="mt-6 space-y-4">
          <li className="flex gap-3">
            <Wallet size={20} className="mt-0.5 shrink-0 text-emerald-400" />
            <span className="text-slate-400">
              <strong className="text-slate-100">Accounts &amp; transactions</strong> — log income and expenses,
              organize with categories, filter by account or category.
            </span>
          </li>
          <li className="flex gap-3">
            <CreditCard size={20} className="mt-0.5 shrink-0 text-emerald-400" />
            <span className="text-slate-400">
              <strong className="text-slate-100">Debt payoff planning</strong> — compare Avalanche and Snowball
              strategies with a real month-by-month projection.
            </span>
          </li>
          <li className="flex gap-3">
            <Repeat size={20} className="mt-0.5 shrink-0 text-emerald-400" />
            <span className="text-slate-400">
              <strong className="text-slate-100">Subscription detection</strong> — automatically flags recurring
              charges from your transaction history.
            </span>
          </li>
          <li className="flex gap-3">
            <PieChart size={20} className="mt-0.5 shrink-0 text-emerald-400" />
            <span className="text-slate-400">
              <strong className="text-slate-100">One dashboard</strong> — net worth, monthly spend by category,
              upcoming bills, and total debt at a glance.
            </span>
          </li>
        </ul>

        <div className="mt-12 text-center">
          <Link to="/register" className="inline-block">
            <Button className="!px-6 !py-3 text-base">
              Create your free account <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
