import { useEffect, useRef, useState } from 'react';
import { X, Search as SearchIcon, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { useDebounce } from '../lib/useDebounce.js';
import { search } from '../lib/api.js';

export default function SearchOverlay() {
  const isSearchOpen = useStore((s) => s.isSearchOpen);
  const closeSearch = useStore((s) => s.closeSearch);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const debounced = useDebounce(query, 300);

  // Auto-focus the input when the overlay opens.
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setResults([]);
      // Defer so the element is mounted before focusing.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isSearchOpen]);

  // Fire the debounced search request.
  useEffect(() => {
    if (!isSearchOpen) return;
    const q = debounced.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    search(q)
      .then((data) => active && setResults(data))
      .catch(() => active && setResults([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debounced, isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
        <SearchIcon size={20} className="text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items and tags…"
          className="flex-1 bg-transparent text-lg outline-none placeholder:text-slate-500"
        />
        <button
          onClick={closeSearch}
          className="rounded-lg p-1 text-slate-300 hover:bg-slate-800"
          aria-label="Close search"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading && <p className="text-sm text-slate-400">Searching…</p>}
        {!loading && debounced.trim() && results.length === 0 && (
          <p className="text-sm text-slate-400">No matches found.</p>
        )}
        <ul className="space-y-2">
          {results.map((r) => (
            <li
              key={r._id}
              className="rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.name}</span>
                <span className="text-sm text-slate-400">×{r.quantity}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <span>{r.path}</span>
                {r.needsRestock && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <AlertTriangle size={12} /> restock
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
