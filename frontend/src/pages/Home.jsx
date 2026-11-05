import { Link } from "react-router-dom";
import { motion } from "motion/react";
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
} from "lucide-react";
import { Card, Badge, Button } from "../components/ui";
import { Stagger, Item, Reveal, AnimatedNumber } from "../components/motion";
import { EASE } from "../components/motionTokens";
import { formatCurrency } from "../lib/format";

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
  {
    title: "Add accounts and log activity",
    desc: "Set up your accounts, categories, and debts, or import from a bank statement soon.",
  },
  { title: "Get the full picture", desc: "Watch your dashboard, payoff plan, and subscriptions update as you go." },
];

const BALANCE_PATH = "M0,46 L52,46 L52,30 L118,30 L118,16 L196,16 L196,22 L275,22 L275,8 L338,8";

function Dots({ delay = 0 }) {
  return (
    <motion.span
      className="relative top-[-3px] h-0 flex-1 origin-left border-b border-dotted border-rule"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    />
  );
}

function MockStatement() {
  return (
    <motion.div
      className="border border-rule bg-paper p-6"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
    >
      <div className="relative flex items-baseline justify-between pb-2">
        <span className="font-mono text-[11px] tracking-[0.1em] text-ink">RUNWAY</span>
        <span className="font-mono text-[10px] text-sub">SEP 2026</span>
        <motion.span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-ink"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1], delay: 0.7 }}
        />
      </div>

      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-sub">Net worth</div>
      <div className="mt-1 font-serif text-3xl tabular-nums">
        <AnimatedNumber value={12480} format={formatCurrency} duration={1.6} delay={0.8} />
      </div>
      <motion.div
        className="mt-1 font-mono text-[11px] text-pos"
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.9 }}
      >
        +$1,285.00 this month
      </motion.div>

      <div className="relative mt-4 h-14">
        <svg
          viewBox="0 0 338 56"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          fill="none"
          aria-hidden
        >
          <line x1="0" y1="54" x2="338" y2="54" stroke="#d9d3c4" strokeWidth="1" />
          <motion.path
            d={BALANCE_PATH}
            stroke="#181510"
            strokeWidth="1.6"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1], delay: 1.0 }}
          />
        </svg>
        <motion.span
          aria-hidden
          className="absolute right-0 top-[14.3%] h-[7px] w-[7px] bg-ink"
          style={{ x: "50%", y: "-50%" }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 2.5 }}
        />
      </div>

      <div className="mt-4 flex gap-8 border-t border-rule pt-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-sub">Income</div>
          <div className="mt-1 font-serif text-lg tabular-nums text-pos">
            <AnimatedNumber value={4200} format={formatCurrency} duration={1.4} delay={1.1} />
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-sub">Expenses</div>
          <div className="mt-1 font-serif text-lg tabular-nums text-neg">
            <AnimatedNumber value={2915} format={formatCurrency} duration={1.4} delay={1.2} />
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-rule pt-3">
        <div className="flex items-baseline gap-2 py-1.5">
          <span className="whitespace-nowrap font-serif text-sm">Recurring spend</span>
          <Dots delay={1.5} />
          <span className="whitespace-nowrap font-mono text-xs text-sub">$186/mo</span>
        </div>
        <div className="flex items-baseline gap-2 py-1.5">
          <span className="whitespace-nowrap font-serif text-sm">Visa Card payoff</span>
          <Dots delay={1.65} />
          <span className="whitespace-nowrap font-mono text-xs text-pos">16 months</span>
        </div>
      </div>
    </motion.div>
  );
}

function HeadlineLine({ children, delay }) {
  return (
    <span className="block overflow-hidden pb-2">
      <motion.span
        className="block"
        initial={{ y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
        <div>
          <Stagger gap={0.1} delay={0.05}>
            <Item>
              <Badge>Built for people who actually track their money</Badge>
            </Item>
          </Stagger>
          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
            <HeadlineLine delay={0.15}>Your money,</HeadlineLine>
            <HeadlineLine delay={0.3}>
              <em>finally organized.</em>
            </HeadlineLine>
          </h1>
          <Stagger gap={0.12} delay={0.65}>
            <Item as="p" className="mt-3 max-w-xl text-base leading-relaxed text-sub">
              Runway brings your accounts, spending, debt payoff, and subscriptions into one place, so you always know
              exactly where you stand, and where you're headed.
            </Item>
            <Item className="mt-8 flex flex-wrap gap-4">
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
            </Item>
            <Item as="p" className="mt-4 font-mono text-[11px] text-sub">
              No credit card required. Your data stays yours.
            </Item>
          </Stagger>
        </div>
        <MockStatement />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal className="relative mb-10 pb-4 text-center">
          <h2 className="font-serif text-3xl">Everything you need, nothing you don't</h2>
          <p className="mt-3 font-mono text-xs text-sub">A focused toolkit for actually understanding your finances.</p>
          <motion.span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px origin-center bg-ink"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
          />
        </Reveal>
        <Stagger inView gap={0.08} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Item key={f.title}>
              <Card className="relative h-full">
                {f.comingSoon && (
                  <span className="absolute right-5 top-5">
                    <Badge>coming soon</Badge>
                  </span>
                )}
                <f.icon size={20} strokeWidth={1.75} className="mb-3 text-ink" />
                <div className="font-serif text-lg">{f.title}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-sub">{f.desc}</p>
              </Card>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* How it works */}
      <section className="border-y border-rule bg-paper-dim">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <Reveal className="mb-10 text-center">
            <h2 className="font-serif text-3xl">How it works</h2>
          </Reveal>
          <Stagger inView gap={0.15} className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Item key={s.title} className="text-center">
                <div className="font-mono text-xl text-sub">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-2 font-serif text-lg">{s.title}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-sub">{s.desc}</p>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Roadmap teaser */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal>
          <Card className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <FileText size={22} strokeWidth={1.75} className="mt-0.5 text-ink" />
              <div>
                <div className="font-serif text-lg">Bank statement import and receipt scanning are next</div>
                <p className="mt-1 text-sm leading-relaxed text-sub">
                  Upload a statement or snap a receipt and let it turn into a reviewed transaction on its own. Both are
                  on the way.
                </p>
              </div>
            </div>
            <Badge>in progress</Badge>
          </Card>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-24 pt-4 text-center sm:px-6">
        <Reveal>
          <h2 className="font-serif text-3xl">Ready to see where your money actually goes?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-sub">
            Create a free account and add your first transaction in under two minutes.
          </p>
          <Link to="/register" className="mt-8 inline-block">
            <Button className="!px-6 !py-3 text-sm">
              Get started free <ArrowRight size={16} />
            </Button>
          </Link>
        </Reveal>
      </section>
    </>
  );
}
