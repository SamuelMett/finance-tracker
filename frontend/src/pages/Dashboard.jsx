import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Wallet, TrendingUp, TrendingDown, CreditCard, Repeat, CalendarClock } from "lucide-react";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { formatCurrency, formatDate } from "../lib/format";
import { Card, StatCard, EmptyState } from "../components/ui";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.detail || "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Your financial overview for this month.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>
        )}

        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          data && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Net worth" value={formatCurrency(data.net_worth)} icon={Wallet} />
                <StatCard label="Income this month" value={formatCurrency(data.month_income)} tone="up" icon={TrendingUp} />
                <StatCard label="Expenses this month" value={formatCurrency(data.month_expense)} tone="down" icon={TrendingDown} />
                <StatCard label="Total debt" value={formatCurrency(data.total_debt)} tone={data.total_debt > 0 ? "down" : "default"} icon={CreditCard} />
                <StatCard label="Recurring spend" value={`${formatCurrency(data.monthly_recurring_total)}/mo`} icon={Repeat} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <h2 className="font-semibold">Spend by category (this month)</h2>
                  {data.spend_by_category.length === 0 ? (
                    <div className="mt-6 text-center text-sm text-slate-500">No expenses recorded this month yet.</div>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.spend_by_category}
                            dataKey="total"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={2}
                          >
                            {data.spend_by_category.map((c) => (
                              <Cell key={c.category_id} fill={c.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Card>

                <Card>
                  <h2 className="font-semibold">Recent transactions</h2>
                  {data.recent_transactions.length === 0 ? (
                    <div className="mt-6 text-center text-sm text-slate-500">No transactions yet.</div>
                  ) : (
                    <ul className="mt-3 divide-y divide-slate-800">
                      {data.recent_transactions.map((t) => (
                        <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                          <div>
                            <div className="font-medium">{t.description || "—"}</div>
                            <div className="text-xs text-slate-500">{formatDate(t.date)}</div>
                          </div>
                          <div className={t.kind === "income" ? "text-emerald-400" : "text-rose-400"}>
                            {t.kind === "income" ? "+" : "-"}
                            {formatCurrency(t.amount)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>

              <Card>
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <CalendarClock size={18} className="text-slate-400" />
                  Upcoming bills (next 14 days)
                </div>
                {data.upcoming_bills.length === 0 ? (
                  <EmptyState
                    icon={CalendarClock}
                    title="Nothing due soon"
                    subtitle="Recurring bills detected on the Subscriptions page will show up here as they approach."
                  />
                ) : (
                  <ul className="mt-3 divide-y divide-slate-800">
                    {data.upcoming_bills.map((b) => (
                      <li key={b.id} className="flex items-center justify-between py-3 text-sm">
                        <div className="font-medium">{b.name}</div>
                        <div className="flex items-center gap-4 text-slate-400">
                          <span>{formatDate(b.next_due_date)}</span>
                          <span className="font-semibold text-slate-100">{formatCurrency(b.amount)}</span>
                        </div>
                      </li>
                    ))}
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
