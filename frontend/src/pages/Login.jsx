import { useState } from 'react';
import { Lock } from 'lucide-react';
import { login } from '../lib/api.js';
import { useStore } from '../store/useStore.js';

export default function Login() {
  const setAuthenticated = useStore((s) => s.setAuthenticated);
  const addToast = useStore((s) => s.addToast);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pin) return;
    setBusy(true);
    try {
      await login(pin);
      setAuthenticated(true);
    } catch (err) {
      addToast(err.message || 'Invalid PIN', 'error');
      setPin('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-2xl bg-emerald-600/20 p-4">
            <Lock size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-xl font-semibold">Home Inventory</h1>
          <p className="text-sm text-slate-400">Enter your PIN to continue</p>
        </div>

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-emerald-500"
        />

        <button
          type="submit"
          disabled={busy || !pin}
          className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition active:scale-95 disabled:opacity-50"
        >
          {busy ? 'Unlocking…' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
