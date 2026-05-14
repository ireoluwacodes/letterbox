import { useEffect } from "react"

import { recoverSocketSessionForRoute } from "@/lib/socketSessionReconnect"
import { useGameStore } from "@/stores/gameStore"
import { useSocketStore } from "@/stores/socketStore"

/**
 * After a full reload on `/lobby|play|over/$gameId`, `connect` may race `useGameSocket`
 * attaching listeners, or the first `host:reconnect` / `player:join` may not yield
 * `game:state` yet. Re-attempt session recovery once if the store is still empty.
 */
export function useRecoverSocketSessionForRoute(routeGameId: string): void {
  const connected = useSocketStore((s) => s.connected)

  useEffect(() => {
    if (!connected) return
    const socket = useSocketStore.getState().socket
    if (!socket) return

    const t = window.setTimeout(() => {
      const g = useGameStore.getState().game
      if (g?.gameId === routeGameId && g.inviteCode) return
      recoverSocketSessionForRoute(socket, routeGameId)
    }, 300)

    return () => window.clearTimeout(t)
  }, [connected, routeGameId])
}
