import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore.js';
import { checkSession } from './lib/api.js';

import Navbar from './components/Navbar.jsx';
import SearchOverlay from './components/SearchOverlay.jsx';
import Toasts from './components/Toasts.jsx';

import Login from './pages/Login.jsx';
import Locations from './pages/Locations.jsx';
import LocationDetail from './pages/LocationDetail.jsx';
import ContainerDetail from './pages/ContainerDetail.jsx';
import ShoppingList from './pages/ShoppingList.jsx';

export default function App() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const setAuthenticated = useStore((s) => s.setAuthenticated);
  const [checking, setChecking] = useState(true);

  // Validate the existing session cookie on boot.
  useEffect(() => {
    checkSession()
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setChecking(false));
  }, [setAuthenticated]);

  if (checking) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">Loading…</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <Toasts />
      </>
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-4">
        <Routes>
          <Route path="/" element={<Locations />} />
          <Route path="/locations/:id" element={<LocationDetail />} />
          <Route path="/containers/:id" element={<ContainerDetail />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SearchOverlay />
      <Toasts />
    </div>
  );
}
