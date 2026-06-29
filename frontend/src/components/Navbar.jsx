import { Link, useLocation } from 'react-router-dom';
import { Search, Home, ShoppingCart } from 'lucide-react';
import { useStore } from '../store/useStore.js';

export default function Navbar() {
  const openSearch = useStore((s) => s.openSearch);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <Home size={20} className="text-emerald-400" />
          Inventory
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/shopping-list"
            className={`rounded-lg p-2 transition ${
              pathname === '/shopping-list'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            aria-label="Shopping list"
          >
            <ShoppingCart size={22} />
          </Link>

          <button
            onClick={openSearch}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800"
            aria-label="Search"
          >
            <Search size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
