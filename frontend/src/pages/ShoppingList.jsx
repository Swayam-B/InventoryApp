import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, MapPin } from 'lucide-react';
import { getRestockItems, incrementItem } from '../lib/api.js';
import { useStore } from '../store/useStore.js';

export default function ShoppingList() {
  const addToast = useStore((s) => s.addToast);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    getRestockItems()
      .then(setItems)
      .catch(() => addToast('Could not load shopping list', 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  // "Restocked": fire increment (which clears needsRestock) and drop from list.
  async function handleRestocked(id) {
    setBusyId(id);
    const prev = items;
    setItems((list) => list.filter((x) => x._id !== id));
    try {
      await incrementItem(id);
    } catch {
      setItems(prev);
      addToast('Could not mark as restocked', 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-4">
      <Link to="/" className="flex items-center gap-1 text-sm text-slate-400">
        <ArrowLeft size={16} /> Home
      </Link>

      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <ShoppingCart size={20} className="text-emerald-400" /> Shopping List
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400">Nothing to restock. You're all stocked up! 🎉</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item._id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-3"
            >
              <div className="min-w-0">
                <span className="block truncate font-medium">{item.name}</span>
                <span className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={12} /> {item.path}
                </span>
              </div>
              <button
                onClick={() => handleRestocked(item._id)}
                disabled={busyId === item._id}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition active:scale-95 disabled:opacity-50"
              >
                <Check size={16} /> Restocked
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
