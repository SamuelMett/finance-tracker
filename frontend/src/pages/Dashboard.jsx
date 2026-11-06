import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarClock } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../api/client";
import { formatCurrency, formatDate } from "../lib/format";
import { Card, EmptyState, StatCard, StatRow } from "../components/ui";
import { Item, Notice, PageHeader, Reveal, Stagger } from "../components/motion";
import { EASE } from "../components/motionTokens";

const MONO = { fill: "#5a5f69", fontSize: 10, fontFamily: "Geist Mono" };

function Label({ children }) {
  return <div className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-mute">{children}</div>;
}

function daysUntil(iso) {
  const d = new Date(iso + "T00:00:00");
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.round((d - t) / 86400000);
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/dashboard/summary"), api.get("/forecast/daily?days=60")])
      .then(([s, f]) => {
        setData(s.data);
        setForecast(f.data);
      })
      .catch((err) => setError(err?.response?.data?.detail || "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const chart = useMemo(() => forecast?.days.map((d) => ({ ...d, label: formatDate(d.date) })) || [], [forecast]);
  const trend = useMemo(() => forecast?.days.map((d) => d.balance), [forecast]);
  const totalSpend = data?.spend_by_category.reduce((s, c) => s + c.total, 0) || 0;
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" subtitle={today} />

      {error && <Notice>{error}</Notice>}

      {loading ? (
        <div className="font-mono text-xs text-faint">Loading...</div>
      ) : (
        data && (
          <>
            <StatRow>
              <StatCard label="Net worth" amount={data.net_worth} fmt={formatCurrency} trend={trend} />
              <StatCard label="Income / mo" amount={data.month_income} fmt={formatCurrency} tone="up" />
              <StatCard label="Expenses / mo" amount={data.month_expense} fmt={formatCurrency} tone="down" />
              <StatCard
                label="Total debt"
                amount={data.total_debt}
                fmt={formatCurrency}
                tone={data.total_debt > 0 ? "down" : "default"}
              />
              <StatCard
                label="Recurring"
                amount={data.monthly_recurring_total}
                fmt={(v) => `${formatCurrency(v)}/mo`}
              />
            </StatRow>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Reveal className="lg:col-span-2">
                <Card className="h-full">
                  <div className="mb-1 flex items-start justify-between gap-4">
                    <Label>Balance outlook, 60 days</Label>
                    {forecast && (
                      <div className="flex gap-4 font-mono text-[10.5px]">
                        <span className="text-faint">
                          low <span className="text-fg">{formatCurrency(forecast.lowest_point.balance)}</span>
                        </span>
                        <span className="text-faint">
                          end{" "}
                          <span
                            className={forecast.ending_balance >= forecast.starting_balance ? "text-pos" : "text-neg"}
                          >
                            {formatCurrency(forecast.ending_balance)}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chart} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="outlook" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f0a561" stopOpacity={0.28} />
                            <stop offset="100%" stopColor="#f0a561" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1b1d22" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={MONO}
                          interval={Math.floor(chart.length / 5)}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={MONO}
                          tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                          axisLine={false}
                          tickLine={false}
                          width={44}
                        />
                        <Tooltip
                          cursor={{ stroke: "#383c45" }}
                          contentStyle={{
                            background: "#111215",
                            border: "1px solid #383c45",
                            borderRadius: 4,
                            fontFamily: "Geist Mono",
                            fontSize: 12,
                          }}
                          labelStyle={{ color: "#8c919a" }}
                          formatter={(v) => [formatCurrency(v), "Balance"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="balance"
                          stroke="#f0a561"
                          strokeWidth={1.8}
                          fill="url(#outlook)"
                          animationDuration={1500}
                          animationEasing="ease-out"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Reveal>

              <Reveal delay={0.08}>
                <Card className="h-full">
                  <Label>Activity</Label>
                  {data.recent_transactions.length === 0 ? (
                    <EmptyState title="No transactions yet" />
                  ) : (
                    <Stagger count={data.recent_transactions.length} delay={0.2} className="relative">
                      <span aria-hidden className="absolute bottom-2 left-[3px] top-2 w-px bg-line" />
                      {data.recent_transactions.slice(0, 7).map((t) => (
                        <Item key={t.id} className="relative flex items-start justify-between gap-3 py-2 pl-5">
                          <span
                            className={`absolute left-0 top-[14px] h-[7px] w-[7px] rounded-full ${
                              t.kind === "income" ? "bg-pos" : "bg-neg"
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="truncate text-[13px]">{t.description || "Untitled"}</div>
                            <div className="font-mono text-[10px] text-faint">{formatDate(t.date)}</div>
                          </div>
                          <div
                            className={`shrink-0 font-mono text-[12.5px] tabular-nums ${t.kind === "income" ? "text-pos" : "text-neg"}`}
                          >
                            {t.kind === "income" ? "+" : "-"}
                            {formatCurrency(t.amount)}
                          </div>
                        </Item>
                      ))}
                    </Stagger>
                  )}
                </Card>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Reveal>
                <Card className="h-full">
                  <Label>Where it goes, this month</Label>
                  {data.spend_by_category.length === 0 ? (
                    <EmptyState title="No expenses yet" subtitle="Nothing recorded this month." />
                  ) : (
                    <Stagger count={data.spend_by_category.length} className="space-y-4">
                      {data.spend_by_category.map((c, i) => (
                        <Item key={c.category_id}>
                          <div className="mb-1.5 flex items-center justify-between text-[13px]">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-[2px]" style={{ background: c.color }} />
                              {c.name}
                            </span>
                            <span className="font-mono text-[12px] tabular-nums text-mute">
                              {formatCurrency(c.total)}
                            </span>
                          </div>
                          <div className="h-1 overflow-hidden rounded-full bg-raised">
                            <motion.div
                              className="h-full origin-left rounded-full"
                              style={{ background: c.color, width: `${Math.max(3, (c.total / totalSpend) * 100)}%` }}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.1 }}
                            />
                          </div>
                        </Item>
                      ))}
                    </Stagger>
                  )}
                </Card>
              </Reveal>

              <Reveal delay={0.08}>
                <Card className="h-full">
                  <Label>Coming up, 14 days</Label>
                  {data.upcoming_bills.length === 0 ? (
                    <EmptyState
                      icon={CalendarClock}
                      title="Nothing due soon"
                      subtitle="Detected bills show up here as they approach."
                    />
                  ) : (
                    <Stagger count={data.upcoming_bills.length}>
                      {data.upcoming_bills.map((b) => {
                        const d = daysUntil(b.next_due_date);
                        return (
                          <Item
                            key={b.id}
                            className="flex items-center justify-between border-b border-line py-2.5 last:border-b-0"
                          >
                            <div>
                              <div className="text-[13px]">{b.name}</div>
                              <div className="font-mono text-[10px] text-faint">{formatDate(b.next_due_date)}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${d <= 3 ? "border-accent/50 text-accent" : "border-line-hi text-mute"}`}
                              >
                                {d <= 0 ? "today" : `in ${d}d`}
                              </span>
                              <span className="font-mono text-[12.5px] tabular-nums">{formatCurrency(b.amount)}</span>
                            </div>
                          </Item>
                        );
                      })}
                    </Stagger>
                  )}
                </Card>
              </Reveal>
            </div>
          </>
        )
      )}
    </div>
  );
}
