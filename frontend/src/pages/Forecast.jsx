import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { formatCurrency, formatDate } from "../lib/format";
import { Card, StatCard, EmptyState } from "../components/ui";

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
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Cash Flow Forecast</h1>
            <p className="mt-1 text-sm text-slate-400">
              Your projected balance, based on upcoming bills, debt payments, and detected income.
            </p>
          </div>
          <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900/40 p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  days === r ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>
        )}

        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          data && (
            <>
              {goesNegative && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    Your balance is projected to go negative around{" "}
                    <strong>{formatDate(data.first_negative_date)}</strong>. Worth moving money over or trimming
                    something before then.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Today's balance" value={formatCurrency(data.starting_balance)} icon={Calendar} />
                <StatCard
                  label={`Projected in ${days} days`}
                  value={formatCurrency(data.ending_balance)}
                  tone={data.ending_balance >= data.starting_balance ? "up" : "down"}
                  icon={TrendingUp}
                />
                <StatCard
                  label="Lowest point"
                  value={formatCurrency(data.lowest_point.balance)}
                  sub={formatDate(data.lowest_point.date)}
                  tone={data.lowest_point.balance < 0 ? "down" : "default"}
                />
              </div>

              <Card>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        interval={Math.floor(days / 6)}
                        axisLine={{ stroke: "#1e293b" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        tickFormatter={(v) => formatCurrency(v)}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                        labelStyle={{ color: "#e2e8f0" }}
                        formatter={(value) => [formatCurrency(value), "Balance"]}
                      />
                      <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="4 4" />
                      <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fill="url(#balanceFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h2 className="font-semibold">Upcoming activity</h2>
                {eventDays.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="Nothing scheduled yet"
                    subtitle="Add debts or scan your transactions on the Subscriptions page to populate this forecast."
                  />
                ) : (
                  <ul className="mt-3 divide-y divide-slate-800">
                    {eventDays.map((d) =>
                      d.events.map((e, i) => (
                        <li key={`${d.date}-${i}`} className="flex items-center justify-between py-3 text-sm">
                          <div>
                            <div className="font-medium">{e.name}</div>
                            <div className="text-xs text-slate-500">{formatDate(d.date)}</div>
                          </div>
                          <div className={e.kind === "income" ? "text-emerald-400" : "text-rose-400"}>
                            {e.kind === "income" ? "+" : "-"}
                            {formatCurrency(e.amount)}
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </Card>
            </>
          )
        )}
      </div>
    </Layout>
  );
}
