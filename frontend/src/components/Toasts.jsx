import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../store/useStore.js';

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };
const COLORS = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-slate-700',
};

function Toast({ toast }) {
  const removeToast = useStore((s) => s.removeToast);
  const Icon = ICONS[toast.type] || Info;

  useEffect(() => {
    const t = setTimeout(() => removeToast(toast.id), 3000);
    return () => clearTimeout(t);
  }, [toast.id, removeToast]);

  return (
    <div
      className={`${COLORS[toast.type] || COLORS.info} flex items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg`}
    >
      <Icon size={18} />
      <span>{toast.message}</span>
    </div>
  );
}

export default function Toasts() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
}
