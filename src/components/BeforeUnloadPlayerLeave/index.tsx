import { useMutation } from "convex/react"
import { useEffect } from "react"

import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { loadSocketSession } from "@/lib/socketSession"
import { getSessionId } from "@/lib/session"

/**
 * Best-effort player leave on tab close (host uses Convex host lifecycle; no leave).
 */
export function BeforeUnloadPlayerLeave(): null {
  const leave = useMutation(api.players.leave)

  useEffect(() => {
    function onBeforeUnload() {
      const session = loadSocketSession()
      if (session?.role !== "player") return
      const gameId = session.gameId
      if (!gameId) return
      void leave({
        gameId: gameId as Id<"games">,
        sessionId: getSessionId(),
      }).catch(() => {
        /* tab is closing */
      })
    }

    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [leave])

  return null
}
