import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { formatCurrency, formatDate } from "../lib/format";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [kind, setKind] = useState("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());

  const [filterAccount, setFilterAccount] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterKind, setFilterKind] = useState("");

  async function loadAll() {
    setLoading(true);
    try {
      const [txRes, accRes, catRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/accounts"),
        api.get("/categories"),
      ]);
      setTransactions(txRes.data);
      setAccounts(accRes.data);
      setCategories(catRes.data);
      if (accRes.data.length && !accountId) setAccountId(String(accRes.data[0].id));
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCategories = useMemo(() => categories.filter((c) => c.kind === kind), [categories, kind]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!accountId || !amount) return;
    try {
      await api.post("/transactions", {
        account_id: parseInt(accountId, 10),
        category_id: categoryId ? parseInt(categoryId, 10) : null,
        kind,
        amount: parseFloat(amount),
        description: description.trim() || null,
        date,
      });
      setAmount("");
      setDescription("");
      setCategoryId("");
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to add transaction.");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to delete transaction.");
    }
  }

  const visible = transactions.filter((t) => {
    if (filterAccount && String(t.account_id) !== filterAccount) return false;
    if (filterCategory && String(t.category_id) !== filterCategory) return false;
    if (filterKind && t.kind !== filterKind) return false;
    return true;
  });

  const accountName = (id) => accounts.find((a) => a.id === id)?.name || "—";
  const category = (id) => categories.find((c) => c.id === id);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="mt-1 text-sm text-slate-400">Log income and expenses against your accounts.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>
        )}

        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
            Create an account first before logging transactions.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <select
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value);
                  setCategoryId("");
                }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

              <input
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                placeholder="Amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <select
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              <select
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">No category</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <input
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button className="mt-3 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-400">
              Add transaction
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
            value={filterKind}
            onChange={(e) => setFilterKind(e.target.value)}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
          >
            <option value="">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
            No transactions match.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/60 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {visible.map((t) => {
                  const cat = category(t.category_id);
                  return (
                    <tr key={t.id} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 text-slate-400">{formatDate(t.date)}</td>
                      <td className="px-4 py-3">{t.description || "—"}</td>
                      <td className="px-4 py-3 text-slate-400">{accountName(t.account_id)}</td>
                      <td className="px-4 py-3">
                        {cat ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          t.kind === "income" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {t.kind === "income" ? "+" : "-"}
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => remove(t.id)} className="text-xs text-slate-500 hover:text-rose-400">
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
