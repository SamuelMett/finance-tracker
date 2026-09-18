import { Link } from "react-router-dom";
import { Wallet, CreditCard, Repeat, PieChart, TrendingUp, ArrowRight } from "lucide-react";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import { Card, Button } from "../components/ui";

const SECTIONS = [
  {
    icon: Wallet,
    title: "Accounts and transactions",
    desc: "Set up every account you actually use, checking, savings, cash, credit cards, and log income or expenses against them.",
    points: [
      "Categories you define yourself, split by income or expense",
      "Filter transactions by account, category, or type",
      "Account balances update automatically as you log activity",
    ],
  },
  {
    icon: CreditCard,
    title: "Debt payoff planner",
    desc: "Add every credit card and loan you're carrying, and Runway simulates your payoff month by month.",
    points: [
      "Compare the Avalanche method (highest interest first) against Snowball (smallest balance first)",
      "See total interest paid and exactly which month each debt disappears",
      "Adjust your extra monthly payment and recalculate instantly",
    ],
  },
  {
    icon: TrendingUp,
    title: "Cash flow forecast",
    desc: "The feature most budgeting apps skip entirely: a real look at what's coming, not just what already happened.",
    points: [
      "Projects your balance forward day by day using bills, debt payments, and detected income",
      "Flags the exact day a tight stretch might hit, before it hits",
      "Built on top of the same recurring-bill detection already tracking your subscriptions",
    ],
  },
  {
    icon: Repeat,
    title: "Subscription detection",
    desc: "Runway looks through your transaction history for charges that repeat on a regular schedule.",
    points: [
      "Catches weekly, biweekly, monthly, and yearly patterns automatically",
      "Shows your total recurring spend per month, in one number",
      "Confirm, cancel, or add subscriptions manually if you'd rather not wait for detection",
    ],
  },
  {
    icon: PieChart,
    title: "One dashboard",
    desc: "Everything above rolls up into a single page: net worth, this month's income and expenses, total debt, recurring spend, and what's due soon.",
    points: [
      "Spend-by-category chart for the current month",
      "Upcoming bills for the next 14 days",
      "Recent transactions at a glance",
    ],
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <PublicNav />

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <h1 className="font-serif text-4xl">Everything Runway does</h1>
        <p className="mt-4 font-mono text-xs text-sub">
          A focused set of tools for understanding your money, not a hundred features you'll never open.
        </p>
      </section>

      <section className="mx-auto max-w-4xl space-y-6 px-4 pb-20 sm:px-6">
        {SECTIONS.map((s, i) => (
          <Card key={s.title} className="sm:p-7">
            <div className="flex items-start gap-5">
              <span className="mt-1 font-mono text-xs text-sub">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <s.icon size={18} strokeWidth={1.75} className="text-ink" />
                  <h2 className="font-serif text-xl">{s.title}</h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-sub">{s.desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {s.points.map((point) => (
                    <li key={point} className="flex gap-2 text-sm text-sub">
                      <span className="mt-2 h-1 w-1 shrink-0 bg-ink" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24 text-center sm:px-6">
        <h2 className="font-serif text-2xl">Ready to try it?</h2>
        <p className="mt-2 font-mono text-xs text-sub">Setting up your first account takes about two minutes.</p>
        <Link to="/register" className="mt-6 inline-block">
          <Button className="!px-6 !py-3 text-sm">
            Get started free <ArrowRight size={16} />
          </Button>
        </Link>
      </section>

      <PublicFooter />
    </div>
  );
}
