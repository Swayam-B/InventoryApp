import { create } from 'zustand';

export const useStore = create((set) => ({
  isSearchOpen: false,
  isAuthenticated: false,

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  setSearchOpen: (v) => set({ isSearchOpen: v }),

  setAuthenticated: (v) => set({ isAuthenticated: v }),

  // Lightweight toast queue.
  toasts: [],
  addToast: (message, type = 'info') =>
    set((s) => ({ toasts: [...s.toasts, { id: Date.now() + Math.random(), message, type }] })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
