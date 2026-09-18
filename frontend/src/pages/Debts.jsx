import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { formatCurrency } from "../lib/format";
import { StatRow, StatCard, EmptyState, Button, LedgerRow, inputClass, selectClass } from "../components/ui";

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
  const [dueDay, setDueDay] = useState("1");

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
        due_day: parseInt(dueDay || "1", 10),
      });
      setName("");
      setType("credit_card");
      setBalance("");
      setRate("");
      setMinPayment("");
      setDueDay("1");
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
      <div className="space-y-8">
        <div className="border-b border-ink pb-3">
          <h1 className="font-serif text-2xl">Debts</h1>
          <p className="mt-1 font-mono text-xs text-sub">Track balances and plan your payoff strategy.</p>
        </div>

        {error && <div className="border border-neg/40 px-3 py-2 font-mono text-xs text-neg">{error}</div>}

        {debts.length > 0 && (
          <StatRow>
            <StatCard label="Total debt" value={formatCurrency(totalBalance)} tone="down" />
            <StatCard label="Monthly minimums" value={formatCurrency(totalMinPayment)} />
            <StatCard label="Avg. interest rate" value={`${weightedRate.toFixed(2)}%`} />
          </StatRow>
        )}

        <form onSubmit={onSubmit} className="border border-rule p-4">
          <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-sub">Add a debt</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <input
              className={`${inputClass} sm:col-span-2`}
              placeholder="Name (e.g. Visa Card)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select className={selectClass} value={type} onChange={(e) => setType(e.target.value)}>
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
              className={inputClass}
              placeholder="Min. payment"
              type="number"
              step="0.01"
              value={minPayment}
              onChange={(e) => setMinPayment(e.target.value)}
            />
            <input
              className={`${inputClass} sm:col-span-2`}
              placeholder="Due day (1-28)"
              type="number"
              min="1"
              max="28"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
            />
          </div>
          <button className="mt-4 border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-paper transition hover:bg-transparent hover:text-ink">
            Add debt
          </button>
        </form>

        {loading ? (
          <div className="font-mono text-xs text-sub">Loading...</div>
        ) : debts.length === 0 ? (
          <EmptyState title="No debts tracked yet" subtitle="Add a credit card or loan above to start planning your payoff." />
        ) : (
          <>
            <div>
              {debts.map((d) => (
                <LedgerRow
                  key={d.id}
                  name={d.name}
                  meta={`${TYPES.find((t) => t.value === d.type)?.label || d.type} · ${d.interest_rate}% APR · due ${d.due_day}`}
                  amount={formatCurrency(d.balance)}
                  tone="down"
                  onDelete={() => remove(d.id)}
                />
              ))}
            </div>

            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-ink pb-3">
                <h2 className="font-serif text-xl">Payoff plan</h2>
                <div className="flex flex-wrap items-center gap-5">
                  <select
                    className={selectClass}
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
                    className={`${inputClass} w-28`}
                    type="number"
                    step="10"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                    placeholder="Extra $/mo"
                  />
                  <Button variant="secondary" onClick={() => loadPlan()} disabled={planLoading}>
                    {planLoading ? "Calculating" : "Recalculate"}
                  </Button>
                </div>
              </div>

              {plan && (
                <>
                  <StatRow className="mb-6">
                    <StatCard
                      label="Debt-free in"
                      value={
                        plan.months_to_debt_free < 0
                          ? "50+ yrs"
                          : `${plan.months_to_debt_free} mo`
                      }
                      sub={plan.months_to_debt_free >= 0 ? `${(plan.months_to_debt_free / 12).toFixed(1)} years` : undefined}
                    />
                    <StatCard label="Total interest paid" value={formatCurrency(plan.total_interest_paid)} tone="down" />
                    <StatCard label="Total paid" value={formatCurrency(plan.total_paid)} />
                  </StatRow>

                  <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-sub">Payoff order</div>
                  <div>
                    {plan.payoff_order.map((p, i) => (
                      <div key={p.debt_id} className="flex items-baseline gap-3 border-b border-rule py-2.5 last:border-b-0">
                        <span className="font-mono text-[11px] text-sub">{String(i + 1).padStart(2, "0")}</span>
                        <span className="font-serif text-[15px]">{p.name}</span>
                        <span className="relative top-[-4px] flex-1 border-b border-dotted border-rule" />
                        <span className="whitespace-nowrap font-mono text-xs text-sub">
                          month {p.payoff_month} &middot; {formatCurrency(p.interest_paid)} interest
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
