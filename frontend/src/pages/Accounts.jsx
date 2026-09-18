import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { formatCurrency } from "../lib/format";
import { EmptyState, LedgerRow, inputClass, selectClass } from "../components/ui";

const TYPES = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit_card", label: "Credit card" },
  { value: "cash", label: "Cash" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" },
];

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState("checking");
  const [startingBalance, setStartingBalance] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/accounts");
      setAccounts(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;
    try {
      await api.post("/accounts", {
        name: name.trim(),
        type,
        starting_balance: parseFloat(startingBalance || "0"),
      });
      setName("");
      setType("checking");
      setStartingBalance("");
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to create account.");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this account? Its transactions will be deleted too.")) return;
    try {
      await api.delete(`/accounts/${id}`);
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to delete account.");
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="border-b border-ink pb-3">
          <h1 className="font-serif text-2xl">Accounts</h1>
          <p className="mt-1 font-mono text-xs text-sub">Track balances across your bank, cash, and card accounts.</p>
        </div>

        {error && <div className="border border-neg/40 px-3 py-2 font-mono text-xs text-neg">{error}</div>}

        <form onSubmit={onSubmit} className="border border-rule p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <input
              className={`${inputClass} sm:col-span-2`}
              placeholder="Account name (e.g. Chase Checking)"
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
              placeholder="Starting balance"
              type="number"
              step="0.01"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
            />
          </div>
          <button className="mt-4 border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-paper transition hover:bg-transparent hover:text-ink">
            Add account
          </button>
        </form>

        {loading ? (
          <div className="font-mono text-xs text-sub">Loading...</div>
        ) : accounts.length === 0 ? (
          <EmptyState title="No accounts yet" subtitle="Add one above." />
        ) : (
          <div>
            {accounts.map((a) => (
              <LedgerRow
                key={a.id}
                name={a.name}
                meta={TYPES.find((t) => t.value === a.type)?.label || a.type}
                amount={formatCurrency(a.balance)}
                tone={a.balance < 0 ? "down" : "default"}
                onDelete={() => remove(a.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
