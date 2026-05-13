import { create } from "zustand"

import type { IToastItem, TToastKind, TToastStore } from "./@types"

let idSeq = 0

export const useToastStore = create<TToastStore>((set) => ({
  toasts: [],

  push: (message, durationMs = 1500, kind: TToastKind = "neutral") => {
    const id = `toast-${++idSeq}`
    const item: IToastItem = { id, message, durationMs, kind }
    set((s) => ({ toasts: [...s.toasts, item] }))
    if (durationMs > 0) {
      setTimeout(() => {
        set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id),
        }))
      }, durationMs)
    }
  },

  dismiss: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),

  clear: () => set({ toasts: [] }),
}))
