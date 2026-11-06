import { useEffect, useState } from "react";
import { api } from "../api/client";
import { EmptyState, inputClass, selectClass, submitClass } from "../components/ui";
import { PageHeader, Stagger, Item, Notice } from "../components/motion";

const COLORS = ["#f0a561", "#7bcf9a", "#ee7b70", "#6ea8fe", "#c792ea", "#e5c07b", "#56b6c2", "#8c919a"];

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
    <div className="space-y-8">
      <PageHeader title="Categories" subtitle="Group your income and expenses for reporting." />

      {error && <Notice>{error}</Notice>}

      <form onSubmit={onSubmit} className="border border-line p-4">
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
                className={`h-5 w-5 rounded-[3px] border ${color === c ? "border-fg ring-1 ring-fg/30" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <button className={`mt-4 ${submitClass}`}>Add category</button>
      </form>

      {loading ? (
        <div className="font-mono text-xs text-mute">Loading...</div>
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" subtitle="Add one above." />
      ) : (
        <Stagger count={categories.length}>
          {categories.map((c) => (
            <Item key={c.id} className="flex items-center justify-between border-b border-line py-2.5 last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: c.color }} />
                <span className="font-display text-[15px]">{c.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-mute">{c.kind}</span>
              </div>
              <button onClick={() => remove(c.id)} className="font-mono text-[10px] text-mute hover:text-neg">
                del
              </button>
            </Item>
          ))}
        </Stagger>
      )}
    </div>
  );
}
