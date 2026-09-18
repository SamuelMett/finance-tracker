import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { formatCurrency } from "../lib/format";

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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Accounts</h1>
          <p className="mt-1 text-sm text-slate-400">Track balances across your bank, cash, and card accounts.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>
        )}

        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500 sm:col-span-2"
              placeholder="Account name (e.g. Chase Checking)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="Starting balance"
              type="number"
              step="0.01"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
            />
          </div>
          <button className="mt-3 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-400">
            Add account
          </button>
        </form>

        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
            No accounts yet. Add one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((a) => (
              <div key={a.id} className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{a.name}</div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      {TYPES.find((t) => t.value === a.type)?.label || a.type}
                    </div>
                  </div>
                  <button onClick={() => remove(a.id)} className="text-xs text-slate-500 hover:text-rose-400">
                    Delete
                  </button>
                </div>
                <div
                  className={`mt-4 text-2xl font-semibold ${
                    a.balance < 0 ? "text-rose-400" : "text-slate-100"
                  }`}
                >
                  {formatCurrency(a.balance)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
