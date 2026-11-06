import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { AlertTriangle, Calendar } from "lucide-react";
import { api } from "../api/client";
import { formatCurrency, formatDate } from "../lib/format";
import { motion } from "motion/react";
import { StatRow, StatCard, EmptyState, LedgerRow } from "../components/ui";
import { PageHeader, Stagger, Reveal, Notice } from "../components/motion";

const RANGES = [30, 60, 90];

export default function Forecast() {
  const [days, setDays] = useState(60);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/forecast/daily?days=${days}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.detail || "Failed to load forecast."))
      .finally(() => setLoading(false));
  }, [days]);

  const chartData = data?.days.map((d) => ({ ...d, label: formatDate(d.date) })) || [];
  const eventDays = data?.days.filter((d) => d.events.length > 0) || [];
  const goesNegative = !!data?.first_negative_date;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cash flow forecast"
        subtitle="Your projected balance, based on upcoming bills, debt payments, and detected income."
      >
        <div className="flex gap-5 font-mono text-xs">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`relative pb-1 transition-colors ${days === r ? "text-fg" : "text-mute hover:text-fg"}`}
            >
              {r}D
              {days === r && (
                <motion.span
                  layoutId="range-underline"
                  className="absolute inset-x-0 bottom-0 h-px bg-accent"
                  transition={{ type: "spring", stiffness: 520, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>
      </PageHeader>

      {error && <Notice>{error}</Notice>}

      {!data && loading ? (
        <div className="font-mono text-xs text-mute">Loading...</div>
      ) : (
        data && (
          <>
            {goesNegative && (
              <div className="flex items-start gap-3 border border-neg/40 p-4 font-mono text-xs text-neg">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <div>
                  Your balance is projected to go negative around{" "}
                  <strong>{formatDate(data.first_negative_date)}</strong>. Worth moving money over or trimming something
                  before then.
                </div>
              </div>
            )}

            <StatRow>
              <StatCard label="Today's balance" amount={data.starting_balance} fmt={formatCurrency} />
              <StatCard
                label={`Projected in ${days} days`}
                amount={data.ending_balance}
                fmt={formatCurrency}
                tone={data.ending_balance >= data.starting_balance ? "up" : "down"}
              />
              <StatCard
                label="Lowest point"
                amount={data.lowest_point.balance}
                fmt={formatCurrency}
                sub={formatDate(data.lowest_point.date)}
                tone={data.lowest_point.balance < 0 ? "down" : "default"}
              />
            </StatRow>

            <Reveal className="h-72 rounded-md border border-line bg-surface p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f0a561" stopOpacity={0.26} />
                      <stop offset="100%" stopColor="#f0a561" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1b1d22" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#5a5f69", fontSize: 10, fontFamily: "Geist Mono" }}
                    interval={Math.floor(days / 6)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#5a5f69", fontSize: 10, fontFamily: "Geist Mono" }}
                    tickFormatter={(v) => formatCurrency(v)}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#111215",
                      border: "1px solid #383c45",
                      borderRadius: 4,
                      fontFamily: "Geist Mono",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#8c919a" }}
                    formatter={(value) => [formatCurrency(value), "Balance"]}
                  />
                  <ReferenceLine y={0} stroke="#ee7b70" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#f0a561"
                    strokeWidth={1.75}
                    fill="url(#balanceFill)"
                    animationDuration={1300}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Reveal>

            <div>
              <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-mute">Upcoming activity</div>
              {eventDays.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="Nothing scheduled yet"
                  subtitle="Add debts or scan your transactions on the Subscriptions page to populate this forecast."
                />
              ) : (
                <Stagger key={days} count={eventDays.length} delay={0.1}>
                  {eventDays.map((d) =>
                    d.events.map((e, i) => (
                      <LedgerRow
                        key={`${d.date}-${i}`}
                        name={e.name}
                        meta={formatDate(d.date)}
                        amount={`${e.kind === "income" ? "+" : "-"}${formatCurrency(e.amount)}`}
                        tone={e.kind === "income" ? "up" : "down"}
                      />
                    )),
                  )}
                </Stagger>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}
