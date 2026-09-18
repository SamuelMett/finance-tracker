import { useEffect, useState } from "react";
import { CreditCard, Plus, Trash2, TrendingDown } from "lucide-react";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { formatCurrency } from "../lib/format";
import { Card, StatCard, Badge, EmptyState, Button, inputClass } from "../components/ui";

const TYPES = [
  { value: "credit_card", label: "Credit card" },
  { value: "student_loan", label: "Student loan" },
  { value: "auto_loan", label: "Auto loan" },
  { value: "mortgage", label: "Mortgage" },
  { value: "personal_loan", label: "Personal loan" },
  { value: "other", label: "Other" },
];

export default function Debts() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState("credit_card");
  const [balance, setBalance] = useState("");
  const [rate, setRate] = useState("");
  const [minPayment, setMinPayment] = useState("");

  const [strategy, setStrategy] = useState("avalanche");
  const [extraPayment, setExtraPayment] = useState("100");
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/debts");
      setDebts(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load debts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function loadPlan(strategyValue = strategy, extraValue = extraPayment) {
    setPlanLoading(true);
    try {
      const res = await api.post("/debts/payoff-plan", {
        strategy: strategyValue,
        extra_payment: parseFloat(extraValue || "0"),
      });
      setPlan(res.data);
    } catch {
      // ignore
    } finally {
      setPlanLoading(false);
    }
  }

  useEffect(() => {
    if (debts.length > 0) loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debts.length]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !balance) return;
    try {
      await api.post("/debts", {
        name: name.trim(),
        type,
        balance: parseFloat(balance),
        interest_rate: parseFloat(rate || "0"),
        minimum_payment: parseFloat(minPayment || "0"),
      });
      setName("");
      setType("credit_card");
      setBalance("");
      setRate("");
      setMinPayment("");
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to add debt.");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this debt?")) return;
    try {
      await api.delete(`/debts/${id}`);
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to delete debt.");
    }
  }

  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimum_payment, 0);
  const weightedRate = totalBalance > 0 ? debts.reduce((sum, d) => sum + d.balance * d.interest_rate, 0) / totalBalance : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Debts</h1>
          <p className="mt-1 text-sm text-slate-400">Track balances and plan your payoff strategy.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>
        )}

        {debts.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total debt" value={formatCurrency(totalBalance)} tone="down" icon={CreditCard} />
            <StatCard label="Monthly minimums" value={formatCurrency(totalMinPayment)} icon={TrendingDown} />
            <StatCard label="Avg. interest rate" value={`${weightedRate.toFixed(2)}%`} />
          </div>
        )}

        <Card>
          <h2 className="mb-3 font-semibold">Add a debt</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <input
              className={`${inputClass} sm:col-span-2`}
              placeholder="Name (e.g. Visa Card)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              placeholder="Balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
            />
            <input
              className={inputClass}
              placeholder="APR %"
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <input
              className={`${inputClass} sm:col-span-2`}
              placeholder="Minimum monthly payment"
              type="number"
              step="0.01"
              value={minPayment}
              onChange={(e) => setMinPayment(e.target.value)}
            />
            <Button type="submit" className="sm:col-span-3">
              <Plus size={16} /> Add debt
            </Button>
          </form>
        </Card>

        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : debts.length === 0 ? (
          <EmptyState icon={CreditCard} title="No debts tracked yet" subtitle="Add a credit card or loan above to start planning your payoff." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {debts.map((d) => (
                <Card key={d.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{d.name}</div>
                      <div className="mt-1">
                        <Badge>{TYPES.find((t) => t.value === d.type)?.label || d.type}</Badge>
                      </div>
                    </div>
                    <button onClick={() => remove(d.id)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-4 text-2xl font-semibold text-rose-400">{formatCurrency(d.balance)}</div>
                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>{d.interest_rate}% APR</span>
                    <span>{formatCurrency(d.minimum_payment)}/mo min</span>
                  </div>
                </Card>
              ))}
            </div>

            <Card>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">Payoff plan</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className={inputClass}
                    value={strategy}
                    onChange={(e) => {
                      setStrategy(e.target.value);
                      loadPlan(e.target.value, extraPayment);
                    }}
                  >
                    <option value="avalanche">Avalanche (highest interest first)</option>
                    <option value="snowball">Snowball (smallest balance first)</option>
                  </select>
                  <input
                    className={`${inputClass} w-40`}
                    type="number"
                    step="10"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                    placeholder="Extra $/mo"
                  />
                  <Button variant="secondary" onClick={() => loadPlan()} disabled={planLoading}>
                    {planLoading ? "Calculating..." : "Recalculate"}
                  </Button>
                </div>
              </div>

              {plan && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <div className="text-xs text-slate-500">Debt-free in</div>
                      <div className="mt-1 text-xl font-semibold">
                        {plan.months_to_debt_free < 0
                          ? "50+ years"
                          : `${plan.months_to_debt_free} mo (${(plan.months_to_debt_free / 12).toFixed(1)} yrs)`}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Total interest paid</div>
                      <div className="mt-1 text-xl font-semibold text-rose-400">{formatCurrency(plan.total_interest_paid)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Total paid</div>
                      <div className="mt-1 text-xl font-semibold">{formatCurrency(plan.total_paid)}</div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Payoff order</div>
                    {plan.payoff_order.map((p, i) => (
                      <div key={p.debt_id} className="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-2.5 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-400">
                            {i + 1}
                          </span>
                          {p.name}
                        </div>
                        <div className="text-slate-400">
                          Paid off month {p.payoff_month} &middot; {formatCurrency(p.interest_paid)} interest
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
