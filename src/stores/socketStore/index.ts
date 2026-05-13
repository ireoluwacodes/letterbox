import { create } from "zustand"

import type { TSocketStore } from "./@types"

import type { TAppSocket } from "@/lib/socket"
import { createSocket } from "@/lib/socket"

let lostTimer: ReturnType<typeof setTimeout> | null = null

function clearLostTimer() {
  if (lostTimer) {
    clearTimeout(lostTimer)
    lostTimer = null
  }
}

export const useSocketStore = create<TSocketStore>((set, get) => ({
  socket: null,
  connected: false,
  hadConnected: false,
  reconnecting: false,
  longDisconnect: false,

  connect: () => {
    if (typeof window === "undefined") return

    let socket = get().socket
    if (!socket) {
      socket = createSocket()
      if (!socket) return
      set({ socket })

      socket.on("connect", () => {
        clearLostTimer()
        set({
          connected: true,
          hadConnected: true,
          reconnecting: false,
          longDisconnect: false,
        })
      })

      socket.on("disconnect", () => {
        set({ connected: false, reconnecting: true })
        clearLostTimer()
        lostTimer = setTimeout(() => {
          if (!get().connected) {
            set({ longDisconnect: true, reconnecting: false })
          }
        }, 30_000)
      })

      socket.io.on("reconnect", () => {
        clearLostTimer()
        set({
          connected: true,
          reconnecting: false,
          longDisconnect: false,
        })
      })
    }

    const s = get().socket
    if (s && !s.connected) {
      s.connect()
    }
  },

  disconnect: () => {
    const s = get().socket
    s?.removeAllListeners()
    s?.disconnect()
    clearLostTimer()
    set({
      socket: null,
      connected: false,
      hadConnected: false,
      reconnecting: false,
      longDisconnect: false,
    })
  },

  emit: (event: string, ...args: Array<unknown>) => {
    const s: TAppSocket | null = get().socket
    if (!s) {
      console.warn("emit called without socket")
      return
    }
    ;(s.emit as (ev: string, ...a: Array<unknown>) => void)(event, ...args)
  },
}))
