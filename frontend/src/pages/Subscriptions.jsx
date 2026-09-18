import { useEffect, useState } from "react";
import { Repeat, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import { api } from "../api/client";
import { formatCurrency, formatDate } from "../lib/format";
import { StatCard, Badge, EmptyState, Button, LedgerRow, inputClass, selectClass } from "../components/ui";

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
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink pb-3">
          <div>
            <h1 className="font-serif text-2xl">Subscriptions &amp; bills</h1>
            <p className="mt-1 font-mono text-xs text-sub">Recurring charges, detected automatically from your transactions.</p>
          </div>
          <Button onClick={scan} disabled={scanning}>
            <Sparkles size={14} />
            {scanning ? "Scanning" : "Scan transactions"}
          </Button>
        </div>

        {error && <div className="border border-neg/40 px-3 py-2 font-mono text-xs text-neg">{error}</div>}
        {scanResult && (
          <div className="border border-pos/40 px-3 py-2 font-mono text-xs text-pos">
            Scan complete. Found {scanResult.created} new recurring charge{scanResult.created === 1 ? "" : "s"}, updated{" "}
            {scanResult.updated}.
          </div>
        )}

        {active.length > 0 && (
          <StatCard
            label="Recurring spend"
            value={`${formatCurrency(monthlyTotal)} / mo`}
            sub={`${active.length} active subscription${active.length === 1 ? "" : "s"}`}
            tone="down"
          />
        )}

        <form onSubmit={onSubmit} className="border border-rule p-4">
          <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-sub">Add manually</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
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
            <select className={selectClass} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <input className={inputClass} type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
          </div>
          <button className="mt-4 border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-paper transition hover:bg-transparent hover:text-ink">
            Add subscription
          </button>
        </form>

        {loading ? (
          <div className="font-mono text-xs text-sub">Loading...</div>
        ) : active.length === 0 && cancelled.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No subscriptions found yet"
            subtitle="Log a few months of transactions, then hit Scan to auto-detect recurring charges."
          />
        ) : (
          <div>
            {active.map((item) => (
              <LedgerRow
                key={item.id}
                name={
                  <span className="inline-flex items-center gap-2">
                    {item.name}
                    {item.source === "detected" && <Badge tone="violet">detected</Badge>}
                  </span>
                }
                meta={`${FREQUENCIES.find((f) => f.value === item.frequency)?.label || item.frequency}${
                  item.next_due_date ? ` · due ${formatDate(item.next_due_date)}` : ""
                }`}
                amount={`${formatCurrency(item.amount)} (${formatCurrency(monthlyEquivalent(item))}/mo)`}
                tone="down"
                right={
                  <div className="flex gap-3 font-mono text-[10px] text-sub">
                    <button onClick={() => setStatus(item.id, "cancelled")} className="hover:text-ink">
                      cancel
                    </button>
                    <button onClick={() => remove(item.id)} className="hover:text-neg">
                      del
                    </button>
                  </div>
                }
              />
            ))}

            {cancelled.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-sub">Cancelled</div>
                {cancelled.map((item) => (
                  <LedgerRow
                    key={item.id}
                    name={<span className="text-sub line-through">{item.name}</span>}
                    amount={formatCurrency(item.amount)}
                    right={
                      <div className="flex gap-3 font-mono text-[10px] text-sub">
                        <button onClick={() => setStatus(item.id, "active")} className="hover:text-ink">
                          reactivate
                        </button>
                        <button onClick={() => remove(item.id)} className="hover:text-neg">
                          del
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
