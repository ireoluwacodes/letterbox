import { create } from "zustand"

import type { TSocketStore } from "./@types"

import type { TAppSocket } from "@/lib/socket"
import { createSocket } from "@/lib/socket"
import { trySessionReconnect } from "@/lib/socketSessionReconnect"
import { SOCKET_EVENTS } from "@/shared/socketEvents"
import { useGameStore } from "@/stores/gameStore"
import { useToastStore } from "@/stores/toastStore"

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
  connectionError: null,

  connect: () => {
    if (typeof window === "undefined") return

    let socket = get().socket
    if (!socket) {
      socket = createSocket()
      if (!socket) return
      set({ socket })

      /** Includes `hostId` / `hostName`; may repeat with `status: finished` right after `game:finished`. */
      socket.on(SOCKET_EVENTS.GAME_STATE, (payload) => {
        useGameStore.getState().setGameStateFromServer(payload)
      })

      socket.on("connect", () => {
        clearLostTimer()
        set({
          connected: true,
          hadConnected: true,
          reconnecting: false,
          longDisconnect: false,
          connectionError: null,
        })
        const live = get().socket
        if (live) trySessionReconnect(live)
      })

      socket.on("connect_error", (err: unknown) => {
        const message =
          err instanceof Error ? err.message : String(err ?? "connect error")
        set({
          connected: false,
          connectionError: message,
        })
      })

      socket.on(SOCKET_EVENTS.GAME_PLAYER_JOINED, (payload) => {
        useToastStore
          .getState()
          .push(`${payload.player.name.toLowerCase()} joined`, 1500)
      })

      socket.on(SOCKET_EVENTS.GAME_STARTED, () => {
        useToastStore.getState().push("game started", 1200)
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
          connectionError: null,
        })
      })
    }

    const s = get().socket
    if (s && !s.connected) {
      s.connect()
    }
  },

  waitForSocketConnected: (timeoutMs = 20000) =>
    new Promise<void>((resolve, reject) => {
      const ws = get().socket
      if (!ws) {
        reject(new Error("no socket"))
        return
      }

      if (get().connected) {
        resolve()
        return
      }

      if (ws.connected) {
        set({
          connected: true,
          hadConnected: true,
          reconnecting: false,
          longDisconnect: false,
          connectionError: null,
        })
        resolve()
        return
      }

      let settled = false
      let lastConnectErr: unknown = null
      let errorDebounceTimer: ReturnType<typeof setTimeout> | null = null

      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        cleanup()
        reject(new Error("connection timed out"))
      }, timeoutMs)

      function cleanup() {
        clearTimeout(timer)
        if (errorDebounceTimer) {
          clearTimeout(errorDebounceTimer)
          errorDebounceTimer = null
        }
        const s = get().socket
        if (!s) return
        s.off("connect", onConnect)
        s.off("connect_error", onConnectError)
      }

      function settleSuccess() {
        if (settled) return
        settled = true
        cleanup()
        if (!get().connected) {
          set({
            connected: true,
            hadConnected: true,
            reconnecting: false,
            longDisconnect: false,
            connectionError: null,
          })
        }
        resolve()
      }

      function onConnect() {
        settleSuccess()
      }

      /** Engine may emit `connect_error` on one transport then recover (e.g. ws → polling). */
      function onConnectError(err: unknown) {
        if (settled) return
        lastConnectErr = err
        if (errorDebounceTimer) clearTimeout(errorDebounceTimer)
        errorDebounceTimer = setTimeout(() => {
          errorDebounceTimer = null
          if (settled) return
          const live = get().socket
          if (get().connected || live?.connected) {
            settleSuccess()
            return
          }
          settled = true
          cleanup()
          const e =
            lastConnectErr instanceof Error
              ? lastConnectErr
              : new Error(String(lastConnectErr ?? "connect error"))
          reject(e)
        }, 400)
      }

      ws.once("connect", onConnect)
      ws.once("connect_error", onConnectError)

      queueMicrotask(() => {
        if (settled) return
        if (get().connected || ws.connected) {
          settleSuccess()
        }
      })
    }),

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
      connectionError: null,
    })
  },

  emit: (event: string, ...args: Array<unknown>) => {
    if (typeof window === "undefined") return

    get().connect()
    const s: TAppSocket | null = get().socket
    if (!s) {
      console.warn("emit called without socket")
      return
    }
    ;(s.emit as (ev: string, ...a: Array<unknown>) => void)(event, ...args)
  },
}))
