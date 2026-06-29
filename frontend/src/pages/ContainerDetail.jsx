import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { getContainer, getItems, createItem } from '../lib/api.js';
import { useStore } from '../store/useStore.js';
import ItemRow from '../components/ItemRow.jsx';
import ContainerImage from '../components/ContainerImage.jsx';

export default function ContainerDetail() {
  const { id } = useParams();
  const addToast = useStore((s) => s.addToast);

  const [container, setContainer] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [tags, setTags] = useState('');

  useEffect(() => {
    Promise.all([getContainer(id), getItems(id)])
      .then(([cont, its]) => {
        setContainer(cont);
        setItems(its);
      })
      .catch(() => addToast('Could not load container', 'error'))
      .finally(() => setLoading(false));
  }, [id, addToast]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const item = await createItem({
        containerId: id,
        name: name.trim(),
        quantity: Number(quantity) || 1,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setItems((i) => [...i, item].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setQuantity(1);
      setTags('');
      setAdding(false);
    } catch {
      addToast('Could not create item', 'error');
    }
  }

  function handleRemoved(itemId) {
    setItems((i) => i.filter((x) => x._id !== itemId));
  }

  if (loading) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-4">
      {container && (
        <Link
          to={`/locations/${container.locationId}`}
          className="flex items-center gap-1 text-sm text-slate-400"
        >
          <ArrowLeft size={16} /> Back
        </Link>
      )}

      {container?.imageKey && (
        <ContainerImage
          imageKey={container.imageKey}
          className="h-40 w-full"
        />
      )}

      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{container?.name}</h2>
          {container?.description && (
            <p className="truncate text-sm text-slate-400">{container.description}</p>
          )}
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
        >
          <Plus size={16} /> Item
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="space-y-2 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Qty"
              className="w-24 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:border-emerald-500"
            />
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tags, comma, separated"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:border-emerald-500"
            />
          </div>
          <button className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white">
            Save item
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No items in this container yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <ItemRow key={item._id} item={item} onRemoved={handleRemoved} />
          ))}
        </ul>
      )}
    </div>
  );
}
