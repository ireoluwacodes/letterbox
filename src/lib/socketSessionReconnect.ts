import type { TAppSocket } from "@/lib/socket"
import type { TSocketAckJoin, TSocketAckVoid } from "@/shared/socketEvents"
import {
  clearSocketSession,
  loadSocketSession,
  type TSocketSession,
} from "@/lib/socketSession"
import { SOCKET_EVENTS } from "@/shared/socketEvents"
import { useGameStore } from "@/stores/gameStore"

/** `gameId` from `/lobby/:id`, `/play/:id`, or `/over/:id` when on those routes */
export function gameIdFromGameRoutePathname(pathname: string): string | null {
  const m = pathname.match(/^\/(?:lobby|play|over)\/([^/]+)\/?$/)
  return m?.[1] ?? null
}

function emitSessionRecover(
  socket: TAppSocket,
  gameId: string,
  session: TSocketSession
): void {
  if (session.role === "host") {
    useGameStore.getState().setIdentity(null, true)
    socket.emit(
      SOCKET_EVENTS.HOST_RECONNECT,
      { gameId },
      (res: TSocketAckVoid) => {
        if (!res.ok) clearSocketSession()
      }
    )
    return
  }

  socket.emit(
    SOCKET_EVENTS.PLAYER_JOIN,
    {
      inviteCode: session.inviteCode,
      name: session.name,
    },
    (res: TSocketAckJoin) => {
      if (!res.ok) {
        clearSocketSession()
        return
      }
      useGameStore.getState().setIdentity(res.playerId, false)
    }
  )
}

/**
 * Re-run host/player recover for a known route `gameId` (e.g. after refresh if
 * `game:state` is still missing).
 */
export function recoverSocketSessionForRoute(
  socket: TAppSocket,
  routeGameId: string
): void {
  const session = loadSocketSession()
  if (!session || session.gameId !== routeGameId) return
  emitSessionRecover(socket, routeGameId, session)
}

/**
 * On `/join`, the user is explicitly joining (possibly a new game). Auto-reconnect
 * runs on the same `connect` event as `waitForSocketConnected`; emitting
 * `PLAYER_JOIN` from a stale session here races the form submit join.
 */
export function trySessionReconnect(socket: TAppSocket): void {
  if (typeof window === "undefined") return
  if (window.location.pathname === "/join") return

  const session = loadSocketSession()
  if (!session) return

  const pathGameId = gameIdFromGameRoutePathname(window.location.pathname)
  if (pathGameId != null && session.gameId !== pathGameId) return

  const gameId = pathGameId ?? session.gameId
  emitSessionRecover(socket, gameId, session)
}
