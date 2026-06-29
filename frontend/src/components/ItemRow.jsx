import { useState } from 'react';
import { Plus, Minus, Trash2, AlertTriangle } from 'lucide-react';
import { incrementItem, decrementItem, deleteItem } from '../lib/api.js';
import { useStore } from '../store/useStore.js';

export default function ItemRow({ item, onRemoved }) {
  const addToast = useStore((s) => s.addToast);
  const [quantity, setQuantity] = useState(item.quantity);
  const [needsRestock, setNeedsRestock] = useState(item.needsRestock);
  const [busy, setBusy] = useState(false);

  // Optimistic increment: bump UI first, revert on failure.
  async function handleIncrement() {
    const prevQty = quantity;
    const prevRestock = needsRestock;
    setQuantity((q) => q + 1);
    setNeedsRestock(false);
    try {
      await incrementItem(item._id);
    } catch {
      setQuantity(prevQty);
      setNeedsRestock(prevRestock);
      addToast('Could not update quantity', 'error');
    }
  }

  // Optimistic decrement: floor at 0, flag restock when it hits 0.
  async function handleDecrement() {
    if (quantity === 0) return;
    const prevQty = quantity;
    const prevRestock = needsRestock;
    const next = quantity - 1;
    setQuantity(next);
    if (next === 0) setNeedsRestock(true);
    try {
      await decrementItem(item._id);
    } catch {
      setQuantity(prevQty);
      setNeedsRestock(prevRestock);
      addToast('Could not update quantity', 'error');
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setBusy(true);
    try {
      await deleteItem(item._id);
      onRemoved?.(item._id);
    } catch {
      addToast('Could not delete item', 'error');
      setBusy(false);
    }
  }

  return (
    <li className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 px-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{item.name}</span>
          {needsRestock && <AlertTriangle size={14} className="shrink-0 text-amber-400" />}
        </div>
        {item.tags?.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <span key={t} className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={quantity === 0}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700 text-slate-100 transition active:scale-95 disabled:opacity-40"
          aria-label="Decrease"
        >
          <Minus size={18} />
        </button>
        <span className="w-8 text-center text-lg font-semibold tabular-nums">{quantity}</span>
        <button
          onClick={handleIncrement}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white transition active:scale-95"
          aria-label="Increase"
        >
          <Plus size={18} />
        </button>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:text-red-400 disabled:opacity-40"
          aria-label="Delete item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </li>
  );
}
