import { useMutation } from "convex/react"
import { useEffect, useRef } from "react"

import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import { getSessionId } from "@/lib/session"

const HEARTBEAT_MS = 5000

export function usePresence(
  gameId: string | undefined,
  role: "host" | "player" | null,
): void {
  const heartbeat = useMutation(api.presence.heartbeat)
  const sessionId = getSessionId()
  const roleRef = useRef(role)
  roleRef.current = role

  useEffect(() => {
    if (gameId == null || gameId === "" || role == null) return

    let cancelled = false

    function tick() {
      if (cancelled) return
      const r = roleRef.current
      if (r == null) return
      void heartbeat({
        gameId: gameId as Id<"games">,
        sessionId,
        role: r,
      }).catch(() => {
        /* presence is best-effort */
      })
    }

    tick()
    const id = window.setInterval(tick, HEARTBEAT_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [gameId, role, heartbeat, sessionId])
}
