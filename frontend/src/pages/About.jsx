import { Link } from "react-router-dom";
import { Wallet, CreditCard, Repeat, PieChart, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import { Card, Button } from "../components/ui";
import { Stagger, Item, Reveal } from "../components/motion";

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
    <>
      <Stagger as="section" gap={0.12} className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <Item as="h1" className="font-display text-4xl">
          About Runway
        </Item>
        <Item as="p" className="mt-5 text-base leading-relaxed text-mute">
          Most budgeting apps want your bank login so they can pull in your transactions automatically, then bury the
          one number you actually care about under a pile of upsells. Runway takes a simpler approach: you log your own
          accounts and transactions (or import a statement soon), and in return you get a tool that's easy to understand
          in a few minutes instead of a whole weekend.
        </Item>
        <Item as="p" className="mt-4 text-base leading-relaxed text-mute">
          It started as a plain transaction log, then grew to answer the questions that actually keep people up at
          night. How much debt do I really have, and when am I free of it? What subscriptions am I still quietly paying
          for? Is next week going to be tight before my paycheck lands?
        </Item>
      </Stagger>

      <section className="border-y border-line bg-surface">
        <Reveal className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="flex items-start gap-4">
            <TrendingUp size={22} strokeWidth={1.75} className="mt-1 shrink-0 text-fg" />
            <div>
              <h2 className="font-display text-2xl">What makes Runway different</h2>
              <p className="mt-3 text-sm leading-relaxed text-mute">
                Almost every budgeting app looks backward: here's what you spent last month, sorted into categories.
                That's useful, but it doesn't tell you what's about to happen. Runway's cash flow forecast combines your
                recurring bills, your debt payments, and the income pattern it detects from your paychecks, then
                projects your balance forward day by day. If a tight week is coming, you'll see it two weeks out instead
                of finding out when a payment bounces. It's the kind of forecasting small businesses pay real money for,
                built for a personal budget instead.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal as="h2" className="text-center font-display text-2xl">
          What we care about
        </Reveal>
        <Stagger inView gap={0.1} className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <Item key={p.title}>
              <Card className="h-full">
                <p.icon size={20} strokeWidth={1.75} className="mb-3 text-fg" />
                <div className="font-display text-lg">{p.title}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-mute">{p.desc}</p>
              </Card>
            </Item>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl">What's in the app today</h2>
        <div className="mt-6">
          <div className="flex gap-3 border-b border-line py-3">
            <Wallet size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-fg" />
            <span className="text-sm text-mute">
              <strong className="font-display text-base text-fg">Accounts and transactions.</strong> Log income and
              expenses, organize them with categories, and filter by account or category.
            </span>
          </div>
          <div className="flex gap-3 border-b border-line py-3">
            <CreditCard size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-fg" />
            <span className="text-sm text-mute">
              <strong className="font-display text-base text-fg">Debt payoff planning.</strong> Compare the Avalanche
              and Snowball strategies with a real month-by-month projection.
            </span>
          </div>
          <div className="flex gap-3 border-b border-line py-3">
            <Repeat size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-fg" />
            <span className="text-sm text-mute">
              <strong className="font-display text-base text-fg">Subscription detection.</strong> Automatically flags
              recurring charges hiding in your transaction history.
            </span>
          </div>
          <div className="flex gap-3 py-3">
            <PieChart size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-fg" />
            <span className="text-sm text-mute">
              <strong className="font-display text-base text-fg">One dashboard.</strong> Net worth, monthly spend by
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
    </>
  );
}
