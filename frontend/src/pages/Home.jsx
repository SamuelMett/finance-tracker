import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, ScanLine } from "lucide-react";
import DotSphere from "../components/DotSphere";
import { Spotlight, Button, Badge } from "../components/ui";
import { Stagger, Item, Reveal, AnimatedNumber } from "../components/motion";
import { EASE, INK_EASE } from "../components/motionTokens";
import { formatCurrency } from "../lib/format";

const TICKER = [
  ["NET WORTH", "$12,480.00", "pos"],
  ["INCOME / MO", "$4,200.00", "pos"],
  ["EXPENSES / MO", "$2,915.00", "neg"],
  ["RECURRING", "$186.00", "neg"],
  ["VISA PAYOFF", "16 MO", "mute"],
  ["LOWEST POINT", "$8,190.54", "mute"],
  ["NEXT PAYCHECK", "9 DAYS", "pos"],
  ["RUNWAY", "61 DAYS", "accent"],
];

function Ticker() {
  const row = [...TICKER, ...TICKER];
  return (
    <div className="relative overflow-hidden border-y border-line bg-surface/60" aria-hidden>
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap py-3 font-mono text-[11px] hover:[animation-play-state:paused]">
        {row.map(([k, v, tone], i) => (
          <span key={i} className="flex gap-2.5">
            <span className="text-faint">{k}</span>
            <span className={{ pos: "text-pos", neg: "text-neg", accent: "text-accent", mute: "text-fg" }[tone]}>
              {v}
            </span>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg to-transparent" />
    </div>
  );
}

function HeadlineLine({ children, delay }) {
  return (
    <span className="block overflow-hidden pb-1.5">
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

function FloatChip({ className, delay, children }) {
  return (
    <motion.div
      className={`absolute hidden rounded border border-line-hi bg-surface/90 px-3 py-1.5 font-mono text-[11px] backdrop-blur md:block ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="animate-floaty" style={{ animationDelay: `${delay}s` }}>
        {children}
      </div>
    </motion.div>
  );
}

function Typed({ words }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  useEffect(() => {
    const word = words[i % words.length];
    let n = 0;
    let dir = 1;
    let timer;
    function tick() {
      n += dir;
      setText(word.slice(0, n));
      if (dir === 1 && n === word.length) {
        dir = -1;
        timer = setTimeout(tick, 1700);
      } else if (dir === -1 && n === 0) {
        setI((v) => v + 1);
        return;
      } else {
        timer = setTimeout(tick, dir === 1 ? 70 : 32);
      }
    }
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [i, words]);
  return (
    <span className="text-accent">
      {text}
      <span className="animate-blink">_</span>
    </span>
  );
}

/* ---------- bento visuals ---------- */

const FORECAST =
  "M0,70 L40,70 L40,52 L95,52 L95,30 L150,30 L150,36 L210,36 L210,14 L270,14 L270,20 L330,20 L330,4 L380,4";

function ForecastVisual() {
  return (
    <div className="relative mt-5 h-40">
      <svg
        viewBox="0 0 380 80"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        fill="none"
        aria-hidden
      >
        {[20, 40, 60].map((y) => (
          <line key={y} x1="0" x2="380" y1={y} y2={y} stroke="#24272d" strokeDasharray="2 4" />
        ))}
        <motion.path
          d={`${FORECAST} L380,80 L0,80 Z`}
          fill="#f0a561"
          fillOpacity="0.07"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.1, duration: 0.8 }}
        />
        <motion.path
          d={FORECAST}
          stroke="#f0a561"
          strokeWidth="1.8"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: INK_EASE }}
        />
      </svg>
      <motion.div
        className="absolute left-[22%] top-[58%] rounded border border-neg/50 bg-bg px-2 py-1 font-mono text-[10px] text-neg"
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.4 }}
      >
        tight week: Oct 12
      </motion.div>
    </div>
  );
}

function SubscriptionsVisual() {
  const rows = [
    ["Netflix", "$15.99", "monthly"],
    ["Spotify", "$11.99", "monthly"],
    ["Gym", "$39.00", "monthly"],
    ["iCloud", "$2.99", "monthly"],
  ];
  return (
    <Stagger inView gap={0.18} className="mt-5 space-y-px overflow-hidden rounded border border-line bg-line">
      {rows.map(([n, a, f], i) => (
        <Item key={n} className="flex items-center justify-between bg-bg px-3 py-2 font-mono text-[11px]">
          <span className="text-fg">{n}</span>
          <span className="flex items-center gap-3">
            <span className="text-faint">{f}</span>
            <span className={i === 2 ? "text-accent" : "text-mute"}>{a}</span>
            <motion.span
              className="text-[9px] uppercase tracking-wider text-pos"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 + i * 0.18 }}
            >
              [found]
            </motion.span>
          </span>
        </Item>
      ))}
    </Stagger>
  );
}

function PayoffVisual() {
  const bars = [
    ["Avalanche", 0.78, "text-accent", "bg-accent"],
    ["Snowball", 0.62, "text-mute", "bg-mute"],
  ];
  return (
    <div className="mt-5 space-y-4">
      {bars.map(([label, w, tc, bc], i) => (
        <div key={label}>
          <div className="mb-1.5 flex justify-between font-mono text-[10.5px]">
            <span className={tc}>{label}</span>
            <span className="text-faint">{i === 0 ? "33 mo" : "37 mo"}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-sm bg-raised">
            <motion.div
              className={`h-full origin-left ${bc}`}
              style={{ width: `${w * 100}%` }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.2 + i * 0.25 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function KpiVisual() {
  const kpis = [
    ["NET WORTH", 12480, "text-fg"],
    ["INCOME", 4200, "text-pos"],
    ["EXPENSES", 2915, "text-neg"],
  ];
  return (
    <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded border border-line bg-line">
      {kpis.map(([k, v, c]) => (
        <div key={k} className="bg-bg px-3 py-3">
          <div className="font-mono text-[9.5px] tracking-widest text-faint">{k}</div>
          <div className={`mt-1.5 font-mono text-sm tabular-nums ${c}`}>
            <AnimatedNumber value={v} format={formatCurrency} duration={1.6} />
          </div>
        </div>
      ))}
    </div>
  );
}

function OtpVisual() {
  const digits = "481927".split("");
  return (
    <div className="mt-5">
      <div className="flex gap-1.5">
        {digits.map((d, i) => (
          <motion.span
            key={i}
            className="flex h-10 w-8 items-center justify-center rounded border border-line-hi bg-bg font-mono text-base text-fg"
            initial={{ opacity: 0, y: 8, rotateX: -60 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 * i + 0.2, duration: 0.45, ease: EASE }}
          >
            {d}
          </motion.span>
        ))}
      </div>
      <div className="mt-3 font-mono text-[10.5px] text-faint">single-use codes, 5 tries then locked</div>
    </div>
  );
}

function ScanVisual() {
  return (
    <div className="relative mt-5 h-[104px] overflow-hidden rounded border border-line bg-bg px-3 py-3">
      {[70, 52, 84, 40, 62].map((w, i) => (
        <div key={i} className="mb-2 h-1.5 rounded-sm bg-raised" style={{ width: `${w}%` }} />
      ))}
      <motion.div
        className="absolute inset-x-0 h-px bg-accent shadow-[0_0_12px_2px_rgba(240,165,97,0.5)]"
        animate={{ top: ["8%", "92%", "8%"] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function BentoCard({ className = "", title, text, badge, children }) {
  return (
    <Item className={className}>
      <Spotlight className="h-full rounded-md border border-line bg-surface p-6 transition-colors duration-200 hover:border-line-hi">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-medium tracking-tight">{title}</h3>
          {badge && <Badge tone="amber">{badge}</Badge>}
        </div>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-mute">{text}</p>
        {children}
      </Spotlight>
    </Item>
  );
}

function SecurityStat({ n, suffix = "", label, text }) {
  return (
    <Item className="bg-surface p-6">
      <div className="font-mono text-4xl tabular-nums tracking-tight text-fg">
        <AnimatedNumber value={n} format={(v) => Math.round(v).toString()} duration={1.2} />
        <span className="text-accent">{suffix}</span>
      </div>
      <div className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-mute">{label}</div>
      <p className="mt-1.5 text-sm leading-relaxed text-faint">{text}</p>
    </Item>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-4 px-4 pb-10 pt-14 sm:px-6 lg:min-h-[640px] lg:grid-cols-[1.05fr_1fr] lg:pt-8">
          <div>
            <Stagger gap={0.1} delay={0.05}>
              <Item className="inline-flex items-center gap-2 rounded border border-line-hi bg-surface px-2.5 py-1 font-mono text-[10.5px] text-mute">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                forecasting for people who track every dollar
              </Item>
            </Stagger>
            <h1 className="mt-6 text-[40px] font-medium leading-[1.04] tracking-[-0.035em] sm:text-6xl">
              <HeadlineLine delay={0.15}>Know where your</HeadlineLine>
              <HeadlineLine delay={0.28}>money is going</HeadlineLine>
              <HeadlineLine delay={0.41}>
                <span className="text-mute">before it </span>
                <Typed words={["goes.", "leaves.", "vanishes."]} />
              </HeadlineLine>
            </h1>
            <Stagger gap={0.12} delay={0.8}>
              <Item as="p" className="mt-4 max-w-md text-[15px] leading-relaxed text-mute">
                Runway projects your balance day by day from your real bills, debts and paychecks, so a tight week never
                surprises you.
              </Item>
              <Item className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/register">
                  <Button className="!px-5 !py-3">
                    Start free <ArrowRight size={15} />
                  </Button>
                </Link>
                <a href="#inside">
                  <Button variant="secondary" className="!px-5 !py-3">
                    See what's inside
                  </Button>
                </a>
              </Item>
              <Item as="p" className="mt-4 font-mono text-[11px] text-faint">
                no card, no bank login, your data stays yours
              </Item>
            </Stagger>
          </div>

          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.2 }}
          >
            <DotSphere className="h-[380px] sm:h-[500px] lg:h-[580px]" />
            <FloatChip className="left-[2%] top-[16%]" delay={1.2}>
              <span className="text-pos">+$1,850.00</span> <span className="text-faint">payroll</span>
            </FloatChip>
            <FloatChip className="right-[0%] top-[42%]" delay={1.6}>
              <span className="text-neg">-$15.99</span> <span className="text-faint">netflix</span>
            </FloatChip>
            <FloatChip className="bottom-[12%] left-[10%]" delay={2.0}>
              <span className="text-accent">61 days</span> <span className="text-faint">of runway</span>
            </FloatChip>
            <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-[10px] text-faint">
              drag to spin, click to ripple
            </div>
          </motion.div>
        </div>
      </section>

      <Ticker />

      {/* Bento */}
      <section id="inside" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
        <Reveal className="mb-12 max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">what's inside</div>
          <h2 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.03em] sm:text-4xl">
            One ledger that looks forward, not just back.
          </h2>
        </Reveal>

        <Stagger inView gap={0.09} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <BentoCard
            className="md:col-span-2"
            title="Cash flow forecast"
            text="Your paychecks, bills and debt payments projected day by day, with the exact date a tight stretch would hit."
          >
            <ForecastVisual />
          </BentoCard>
          <BentoCard
            title="Subscription radar"
            text="Recurring charges found from your own history, so a forgotten one can't hide."
          >
            <SubscriptionsVisual />
          </BentoCard>
          <BentoCard
            title="Debt payoff lab"
            text="Avalanche against snowball, month by month, with the interest you'd save."
          >
            <PayoffVisual />
          </BentoCard>
          <BentoCard
            className="md:col-span-2"
            title="A dashboard that reads like a terminal"
            text="Net worth, income, expenses, recurring spend and what's due next, in one dense, quiet view."
          >
            <KpiVisual />
          </BentoCard>
          <BentoCard
            title="Locked down"
            text="Two-factor sign-in with single-use codes, and lockouts that stop guessing."
          >
            <OtpVisual />
          </BentoCard>
          <BentoCard
            className="md:col-span-3"
            title="Receipts and statements"
            badge="coming soon"
            text="Snap a receipt or drop a bank statement and review the transactions it finds before anything is saved."
          >
            <ScanVisual />
          </BentoCard>
        </Stagger>
      </section>

      {/* Security */}
      <section className="border-y border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="mb-10 max-w-xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">security</div>
            <h2 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.03em]">
              Built like it holds your money, because it holds your numbers.
            </h2>
          </Reveal>
          <Stagger
            inView
            gap={0.1}
            className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line lg:grid-cols-4"
          >
            <SecurityStat
              n={5}
              suffix="x"
              label="then locked out"
              text="Repeated failed sign-ins lock the account for 15 minutes."
            />
            <SecurityStat
              n={30}
              suffix="m"
              label="session lifetime"
              text="Signed tokens expire fast and can't be forged or reused."
            />
            <SecurityStat
              n={1}
              suffix="x"
              label="use per 2FA code"
              text="A code you've already used is refused, even inside its window."
            />
            <SecurityStat n={0} label="bank logins asked" text="You never hand over bank credentials. Ever." />
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_80%_at_50%_50%,black,transparent)]" />
        <Reveal className="relative mx-auto max-w-3xl px-4 py-28 text-center sm:px-6">
          <h2 className="text-4xl font-medium leading-tight tracking-[-0.035em] sm:text-5xl">
            See your next 60 days <span className="text-accent">today.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-mute">
            Add an account, log a few transactions, and watch the forecast fill in.
          </p>
          <Link to="/register" className="mt-9 inline-block">
            <Button className="!px-7 !py-3.5">
              Create your free account <ScanLine size={15} />
            </Button>
          </Link>
        </Reveal>
      </section>
    </>
  );
}
