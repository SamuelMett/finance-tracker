import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { formatCurrency, formatDate } from "../lib/format";

function StatCard({ label, value, tone }) {
  const toneClass = tone === "up" ? "text-emerald-400" : tone === "down" ? "text-red-400" : "text-zinc-100";
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${toneClass}`}>{formatCurrency(value)}</div>
    </div>
  );
}

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
          <p className="mt-1 text-sm text-zinc-400">Your financial overview for this month.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        )}

        {loading ? (
          <div className="text-sm text-zinc-500">Loading...</div>
        ) : (
          data && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Net worth" value={data.net_worth} />
                <StatCard label="Income this month" value={data.month_income} tone="up" />
                <StatCard label="Expenses this month" value={data.month_expense} tone="down" />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                  <h2 className="font-semibold">Spend by category (this month)</h2>
                  {data.spend_by_category.length === 0 ? (
                    <div className="mt-6 text-center text-sm text-zinc-500">No expenses recorded this month yet.</div>
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
                            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                  <h2 className="font-semibold">Recent transactions</h2>
                  {data.recent_transactions.length === 0 ? (
                    <div className="mt-6 text-center text-sm text-zinc-500">No transactions yet.</div>
                  ) : (
                    <ul className="mt-3 divide-y divide-zinc-800">
                      {data.recent_transactions.map((t) => (
                        <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                          <div>
                            <div className="font-medium">{t.description || "—"}</div>
                            <div className="text-xs text-zinc-500">{formatDate(t.date)}</div>
                          </div>
                          <div className={t.kind === "income" ? "text-emerald-400" : "text-red-400"}>
                            {t.kind === "income" ? "+" : "-"}
                            {formatCurrency(t.amount)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )
        )}
      </div>
    </Layout>
  );
}
