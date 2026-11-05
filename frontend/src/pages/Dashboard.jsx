import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CalendarClock } from "lucide-react";
import { api } from "../api/client";
import { formatCurrency, formatDate } from "../lib/format";
import { StatRow, StatCard, EmptyState, LedgerRow } from "../components/ui";
import { PageHeader, Stagger, Reveal, Notice } from "../components/motion";

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
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle="Your financial overview for this month." />

      {error && <Notice>{error}</Notice>}

      {loading ? (
        <div className="font-mono text-xs text-sub">Loading...</div>
      ) : (
        data && (
          <>
            <StatRow>
              <StatCard label="Net worth" amount={data.net_worth} fmt={formatCurrency} />
              <StatCard label="Income, this month" amount={data.month_income} fmt={formatCurrency} tone="up" />
              <StatCard label="Expenses, this month" amount={data.month_expense} fmt={formatCurrency} tone="down" />
              <StatCard
                label="Total debt"
                amount={data.total_debt}
                fmt={formatCurrency}
                tone={data.total_debt > 0 ? "down" : "default"}
              />
              <StatCard
                label="Recurring spend"
                amount={data.monthly_recurring_total}
                fmt={(v) => `${formatCurrency(v)}/mo`}
              />
            </StatRow>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <Reveal>
                <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-sub">
                  Spend by category, this month
                </div>
                {data.spend_by_category.length === 0 ? (
                  <EmptyState title="No expenses yet" subtitle="Nothing recorded this month yet." />
                ) : (
                  <div className="h-64 border border-rule p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.spend_by_category}
                          dataKey="total"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                          animationDuration={1100}
                          animationEasing="ease-out"
                        >
                          {data.spend_by_category.map((c) => (
                            <Cell key={c.category_id} fill={c.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{ background: "#fbfaf6", border: "1px solid #181510", borderRadius: 0 }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-sub">
                  Recent transactions
                </div>
                {data.recent_transactions.length === 0 ? (
                  <EmptyState title="No transactions yet" />
                ) : (
                  <Stagger count={data.recent_transactions.length} delay={0.15}>
                    {data.recent_transactions.map((t) => (
                      <LedgerRow
                        key={t.id}
                        name={t.description || "Untitled"}
                        meta={formatDate(t.date)}
                        amount={`${t.kind === "income" ? "+" : "-"}${formatCurrency(t.amount)}`}
                        tone={t.kind === "income" ? "up" : "down"}
                      />
                    ))}
                  </Stagger>
                )}
              </Reveal>
            </div>

            <Reveal>
              <div className="mb-3 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-sub">
                <CalendarClock size={14} />
                Upcoming bills, next 14 days
              </div>
              {data.upcoming_bills.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title="Nothing due soon"
                  subtitle="Recurring bills detected on the Subscriptions page will show up here as they approach."
                />
              ) : (
                <Stagger count={data.upcoming_bills.length}>
                  {data.upcoming_bills.map((b) => (
                    <LedgerRow
                      key={b.id}
                      name={b.name}
                      meta={formatDate(b.next_due_date)}
                      amount={formatCurrency(b.amount)}
                    />
                  ))}
                </Stagger>
              )}
            </Reveal>
          </>
        )
      )}
    </div>
  );
}
