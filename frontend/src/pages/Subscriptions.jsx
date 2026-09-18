import { useEffect, useState } from "react";
import { Repeat, Plus, Trash2, Sparkles, Ban, CheckCircle2 } from "lucide-react";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { formatCurrency, formatDate } from "../lib/format";
import { Card, StatCard, Badge, EmptyState, Button, inputClass } from "../components/ui";

const FREQUENCIES = [
  { value: "weekly", label: "Weekly", multiplier: 4.345 },
  { value: "biweekly", label: "Biweekly", multiplier: 2.1725 },
  { value: "monthly", label: "Monthly", multiplier: 1 },
  { value: "yearly", label: "Yearly", multiplier: 1 / 12 },
];

function monthlyEquivalent(item) {
  const f = FREQUENCIES.find((f) => f.value === item.frequency);
  return item.amount * (f ? f.multiplier : 1);
}

export default function Subscriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [nextDue, setNextDue] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/recurring?kind=expense");
      setItems(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function scan() {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await api.post("/recurring/detect");
      setItems(res.data.series.filter((s) => s.kind === "expense"));
      setScanResult({ created: res.data.created, updated: res.data.updated });
    } catch (err) {
      setError(err?.response?.data?.detail || "Scan failed.");
    } finally {
      setScanning(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !amount) return;
    try {
      await api.post("/recurring", {
        name: name.trim(),
        kind: "expense",
        amount: parseFloat(amount),
        frequency,
        next_due_date: nextDue || null,
      });
      setName("");
      setAmount("");
      setFrequency("monthly");
      setNextDue("");
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to add subscription.");
    }
  }

  async function setStatus(id, status) {
    try {
      await api.patch(`/recurring/${id}`, { status });
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to update.");
    }
  }

  async function remove(id) {
    if (!confirm("Remove this subscription?")) return;
    try {
      await api.delete(`/recurring/${id}`);
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to delete.");
    }
  }

  const active = items.filter((i) => i.status === "active");
  const cancelled = items.filter((i) => i.status === "cancelled");
  const monthlyTotal = active.reduce((sum, i) => sum + monthlyEquivalent(i), 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Subscriptions & Bills</h1>
            <p className="mt-1 text-sm text-slate-400">Recurring charges, detected automatically from your transactions.</p>
          </div>
          <Button onClick={scan} disabled={scanning}>
            <Sparkles size={16} />
            {scanning ? "Scanning..." : "Scan transactions"}
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>
        )}
        {scanResult && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            Scan complete — found {scanResult.created} new recurring charge{scanResult.created === 1 ? "" : "s"}, updated{" "}
            {scanResult.updated}.
          </div>
        )}

        {active.length > 0 && (
          <StatCard
            label="Recurring spend"
            value={`${formatCurrency(monthlyTotal)} / mo`}
            sub={`${active.length} active subscription${active.length === 1 ? "" : "s"}`}
            tone="down"
            icon={Repeat}
          />
        )}

        <Card>
          <h2 className="mb-3 font-semibold">Add manually</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <input
              className={`${inputClass} sm:col-span-2`}
              placeholder="Name (e.g. Spotify)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className={inputClass}
              placeholder="Amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <select className={inputClass} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <input className={inputClass} type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
            <Button type="submit" className="sm:col-span-5">
              <Plus size={16} /> Add subscription
            </Button>
          </form>
        </Card>

        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : active.length === 0 && cancelled.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No subscriptions found yet"
            subtitle="Log a few months of transactions, then hit Scan to auto-detect recurring charges."
          />
        ) : (
          <div className="space-y-3">
            {active.map((item) => (
              <Card key={item.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    {item.name}
                    {item.source === "detected" && <Badge tone="violet">Auto-detected</Badge>}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {FREQUENCIES.find((f) => f.value === item.frequency)?.label || item.frequency}
                    {item.next_due_date && <> &middot; next due {formatDate(item.next_due_date)}</>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(item.amount)}</div>
                    <div className="text-xs text-slate-500">{formatCurrency(monthlyEquivalent(item))}/mo</div>
                  </div>
                  <button
                    title="Mark cancelled"
                    onClick={() => setStatus(item.id, "cancelled")}
                    className="text-slate-500 hover:text-amber-400"
                  >
                    <Ban size={16} />
                  </button>
                  <button title="Delete" onClick={() => remove(item.id)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}

            {cancelled.length > 0 && (
              <div className="pt-4">
                <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">Cancelled</div>
                {cancelled.map((item) => (
                  <Card key={item.id} className="mb-2 flex items-center justify-between gap-3 opacity-60">
                    <div className="font-medium line-through">{item.name}</div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">{formatCurrency(item.amount)}</div>
                      <button
                        title="Reactivate"
                        onClick={() => setStatus(item.id, "active")}
                        className="text-slate-500 hover:text-emerald-400"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button title="Delete" onClick={() => remove(item.id)} className="text-slate-500 hover:text-rose-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
