import { Link } from "react-router-dom";
import { Wallet, CreditCard, Repeat, PieChart, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import { Card, Button } from "../components/ui";

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Your data belongs to you",
    desc: "No ad targeting, no selling your transaction history. It's your account and your numbers, full stop.",
  },
  {
    icon: Wallet,
    title: "Built for real use, not demos",
    desc: "Every feature is here because it solves a problem someone actually has with their money, not because it looks good in a screenshot.",
  },
  {
    icon: PieChart,
    title: "Clarity over clutter",
    desc: "One dashboard that tells you what's going on, instead of twenty charts you'll never open again.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <PublicNav />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h1 className="font-serif text-4xl">About Runway</h1>
        <p className="mt-5 text-base leading-relaxed text-sub">
          Most budgeting apps want your bank login so they can pull in your transactions automatically, then bury
          the one number you actually care about under a pile of upsells. Runway takes a simpler approach: you log
          your own accounts and transactions (or import a statement soon), and in return you get a tool that's easy
          to understand in a few minutes instead of a whole weekend.
        </p>
        <p className="mt-4 text-base leading-relaxed text-sub">
          It started as a plain transaction log, then grew to answer the questions that actually keep people up at
          night. How much debt do I really have, and when am I free of it? What subscriptions am I still quietly
          paying for? Is next week going to be tight before my paycheck lands?
        </p>
      </section>

      <section className="border-y border-rule bg-paper-dim">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="flex items-start gap-4">
            <TrendingUp size={22} strokeWidth={1.75} className="mt-1 shrink-0 text-ink" />
            <div>
              <h2 className="font-serif text-2xl">What makes Runway different</h2>
              <p className="mt-3 text-sm leading-relaxed text-sub">
                Almost every budgeting app looks backward: here's what you spent last month, sorted into categories.
                That's useful, but it doesn't tell you what's about to happen. Runway's cash flow forecast combines
                your recurring bills, your debt payments, and the income pattern it detects from your paychecks,
                then projects your balance forward day by day. If a tight week is coming, you'll see it two weeks
                out instead of finding out when a payment bounces. It's the kind of forecasting small businesses pay
                real money for, built for a personal budget instead.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-serif text-2xl">What we care about</h2>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <Card key={p.title}>
              <p.icon size={20} strokeWidth={1.75} className="mb-3 text-ink" />
              <div className="font-serif text-lg">{p.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-sub">{p.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="font-serif text-2xl">What's in the app today</h2>
        <div className="mt-6">
          <div className="flex gap-3 border-b border-rule py-3">
            <Wallet size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink" />
            <span className="text-sm text-sub">
              <strong className="font-serif text-base text-ink">Accounts and transactions.</strong> Log income and
              expenses, organize them with categories, and filter by account or category.
            </span>
          </div>
          <div className="flex gap-3 border-b border-rule py-3">
            <CreditCard size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink" />
            <span className="text-sm text-sub">
              <strong className="font-serif text-base text-ink">Debt payoff planning.</strong> Compare the Avalanche
              and Snowball strategies with a real month-by-month projection.
            </span>
          </div>
          <div className="flex gap-3 border-b border-rule py-3">
            <Repeat size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink" />
            <span className="text-sm text-sub">
              <strong className="font-serif text-base text-ink">Subscription detection.</strong> Automatically flags
              recurring charges hiding in your transaction history.
            </span>
          </div>
          <div className="flex gap-3 py-3">
            <PieChart size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink" />
            <span className="text-sm text-sub">
              <strong className="font-serif text-base text-ink">One dashboard.</strong> Net worth, monthly spend by
              category, upcoming bills, and total debt, all in one place.
            </span>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/register" className="inline-block">
            <Button className="!px-6 !py-3 text-sm">
              Create your free account <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
