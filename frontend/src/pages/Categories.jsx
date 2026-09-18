import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api/client";

const COLORS = ["#6366f1", "#f97316", "#22c55e", "#ef4444", "#06b6d4", "#eab308", "#ec4899", "#8b5cf6"];

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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="mt-1 text-sm text-zinc-400">Group your income and expenses for reporting.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        )}

        <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-indigo-500 sm:col-span-2"
              placeholder="Category name (e.g. Groceries)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <button className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500">
            Add category
          </button>
        </form>

        {loading ? (
          <div className="text-sm text-zinc-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
            No categories yet. Add one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs capitalize text-zinc-500">{c.kind}</div>
                  </div>
                </div>
                <button onClick={() => remove(c.id)} className="text-xs text-zinc-500 hover:text-red-400">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
