import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronRight, Trash2, ImageIcon } from 'lucide-react';
import {
  getLocation,
  getContainers,
  createContainer,
  deleteContainer,
} from '../lib/api.js';
import { uploadImage } from '../lib/uploadImage.js';
import { useStore } from '../store/useStore.js';
import ContainerImage from '../components/ContainerImage.jsx';

export default function LocationDetail() {
  const { id } = useParams();
  const addToast = useStore((s) => s.addToast);

  const [location, setLocation] = useState(null);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getLocation(id), getContainers(id)])
      .then(([loc, conts]) => {
        setLocation(loc);
        setContainers(conts);
      })
      .catch(() => addToast('Could not load location', 'error'))
      .finally(() => setLoading(false));
  }, [id, addToast]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      let imageKey;
      if (file) imageKey = await uploadImage(file);
      const container = await createContainer({
        locationId: id,
        name: name.trim(),
        description: description.trim(),
        imageKey,
      });
      setContainers((c) => [...c, container].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setDescription('');
      setFile(null);
      setAdding(false);
    } catch {
      addToast('Could not create container', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e, cid) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this container and its items?')) return;
    try {
      await deleteContainer(cid);
      setContainers((c) => c.filter((x) => x._id !== cid));
    } catch {
      addToast('Could not delete container', 'error');
    }
  }

  if (loading) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-4">
      <Link to="/" className="flex items-center gap-1 text-sm text-slate-400">
        <ArrowLeft size={16} /> Locations
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{location?.name}</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
        >
          <Plus size={16} /> Container
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="space-y-2 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Container name"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:border-emerald-500"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:border-emerald-500"
          />
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <ImageIcon size={16} />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm file:mr-2 file:rounded file:border-0 file:bg-slate-700 file:px-3 file:py-1 file:text-slate-200"
            />
          </label>
          <button
            disabled={saving}
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save container'}
          </button>
        </form>
      )}

      {containers.length === 0 ? (
        <p className="text-sm text-slate-400">No containers here yet.</p>
      ) : (
        <ul className="space-y-2">
          {containers.map((c) => (
            <li key={c._id}>
              <Link
                to={`/containers/${c._id}`}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-3 transition active:scale-[0.99]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <ContainerImage imageKey={c.imageKey} className="h-10 w-10 shrink-0" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{c.name}</span>
                    {c.description && (
                      <span className="block truncate text-xs text-slate-400">{c.description}</span>
                    )}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDelete(e, c._id)}
                    className="rounded p-1 text-slate-500 hover:text-red-400"
                    aria-label="Delete container"
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
