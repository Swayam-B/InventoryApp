import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { getLocations, createLocation, deleteLocation } from '../lib/api.js';
import { useStore } from '../store/useStore.js';

export default function Locations() {
  const addToast = useStore((s) => s.addToast);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    getLocations()
      .then(setLocations)
      .catch(() => addToast('Could not load locations', 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const loc = await createLocation(name.trim());
      setLocations((l) => [...l, loc].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setAdding(false);
    } catch {
      addToast('Could not create location', 'error');
    }
  }

  async function handleDelete(e, id) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this location and everything in it?')) return;
    try {
      await deleteLocation(id);
      setLocations((l) => l.filter((x) => x._id !== id));
    } catch {
      addToast('Could not delete location', 'error');
    }
  }

  if (loading) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Locations</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Garage"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:border-emerald-500"
          />
          <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
            Save
          </button>
        </form>
      )}

      {locations.length === 0 ? (
        <p className="text-sm text-slate-400">No locations yet. Add one to get started.</p>
      ) : (
        <ul className="space-y-2">
          {locations.map((loc) => (
            <li key={loc._id}>
              <Link
                to={`/locations/${loc._id}`}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-3 transition active:scale-[0.99]"
              >
                <span className="flex items-center gap-3">
                  <MapPin size={18} className="text-emerald-400" />
                  <span className="font-medium">{loc.name}</span>
                </span>
                <span className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDelete(e, loc._id)}
                    className="rounded p-1 text-slate-500 hover:text-red-400"
                    aria-label="Delete location"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className="text-slate-500" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
