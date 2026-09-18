import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { formatCurrency, formatDate } from "../lib/format";
import { EmptyState, inputClass, selectClass } from "../components/ui";

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

  const accountName = (id) => accounts.find((a) => a.id === id)?.name || "-";
  const category = (id) => categories.find((c) => c.id === id);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="border-b border-ink pb-3">
          <h1 className="font-serif text-2xl">Transactions</h1>
          <p className="mt-1 font-mono text-xs text-sub">Log income and expenses against your accounts.</p>
        </div>

        {error && <div className="border border-neg/40 px-3 py-2 font-mono text-xs text-neg">{error}</div>}

        {accounts.length === 0 ? (
          <EmptyState title="No accounts yet" subtitle="Create an account first before logging transactions." />
        ) : (
          <form onSubmit={onSubmit} className="border border-rule p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <select
                className={selectClass}
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
                className={inputClass}
                placeholder="Amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <select className={selectClass} value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              <select className={selectClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">No category</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

              <input
                className={inputClass}
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button className="mt-4 border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-paper transition hover:bg-transparent hover:text-ink">
              Add transaction
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-6 border-b border-rule pb-4">
          <select className={selectClass} value={filterKind} onChange={(e) => setFilterKind(e.target.value)}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className={selectClass} value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
            <option value="">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select className={selectClass} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="font-mono text-xs text-sub">Loading...</div>
        ) : visible.length === 0 ? (
          <EmptyState title="No transactions match" />
        ) : (
          <table className="w-full border-t border-ink font-mono text-[13px]">
            <thead>
              <tr className="border-b border-rule text-left text-[10px] uppercase tracking-[0.08em] text-sub">
                <th className="py-2.5 pr-4 font-normal">Date</th>
                <th className="py-2.5 pr-4 font-normal">Description</th>
                <th className="py-2.5 pr-4 font-normal">Account</th>
                <th className="py-2.5 pr-4 font-normal">Category</th>
                <th className="py-2.5 pr-4 text-right font-normal">Amount</th>
                <th className="py-2.5 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => {
                const cat = category(t.category_id);
                return (
                  <tr key={t.id} className="border-b border-rule">
                    <td className="py-2.5 pr-4 text-sub">{formatDate(t.date)}</td>
                    <td className="py-2.5 pr-4 font-serif text-[15px] text-ink">{t.description || "-"}</td>
                    <td className="py-2.5 pr-4 text-sub">{accountName(t.account_id)}</td>
                    <td className="py-2.5 pr-4">
                      {cat ? (
                        <span className="inline-flex items-center gap-1.5 text-sub">
                          <span className="h-1.5 w-1.5" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </span>
                      ) : (
                        <span className="text-sub">-</span>
                      )}
                    </td>
                    <td className={`py-2.5 pr-4 text-right tabular-nums ${t.kind === "income" ? "text-pos" : "text-neg"}`}>
                      {t.kind === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => remove(t.id)} className="text-[10px] text-sub hover:text-neg">
                        del
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
