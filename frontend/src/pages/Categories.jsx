import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { EmptyState, inputClass, selectClass } from "../components/ui";

const COLORS = ["#8a5a20", "#3c5e3f", "#8a3324", "#2c4a6e", "#6b5730", "#5c4a6e", "#4a5a3c", "#7a3a4a"];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [kind, setKind] = useState("expense");
  const [color, setColor] = useState(COLORS[0]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load categories.");
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
      await api.post("/categories", { name: name.trim(), kind, color });
      setName("");
      setKind("expense");
      setColor(COLORS[0]);
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to create category.");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to delete category.");
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="border-b border-ink pb-3">
          <h1 className="font-serif text-2xl">Categories</h1>
          <p className="mt-1 font-mono text-xs text-sub">Group your income and expenses for reporting.</p>
        </div>

        {error && <div className="border border-neg/40 px-3 py-2 font-mono text-xs text-neg">{error}</div>}

        <form onSubmit={onSubmit} className="border border-rule p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <input
              className={`${inputClass} sm:col-span-2`}
              placeholder="Category name (e.g. Groceries)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select className={selectClass} value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <div className="flex items-center gap-2 py-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-5 w-5 border ${color === c ? "border-ink" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <button className="mt-4 border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-paper transition hover:bg-transparent hover:text-ink">
            Add category
          </button>
        </form>

        {loading ? (
          <div className="font-mono text-xs text-sub">Loading...</div>
        ) : categories.length === 0 ? (
          <EmptyState title="No categories yet" subtitle="Add one above." />
        ) : (
          <div>
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b border-rule py-2.5 last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="font-serif text-[15px]">{c.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-sub">{c.kind}</span>
                </div>
                <button onClick={() => remove(c.id)} className="font-mono text-[10px] text-sub hover:text-neg">
                  del
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
