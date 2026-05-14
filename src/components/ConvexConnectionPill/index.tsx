import { useEffect, useState } from "react"

import type { IConvexConnectionPillProps } from "./@types"
import { cn } from "@/lib/utils"

/**
 * Browser network offline only. Convex `useConvexConnectionState().isWebSocketConnected`
 * can read false in some prod/SSR/proxy cases while queries still work, which caused a
 * permanent false "reconnecting" pill — so we do not tie this UI to the WebSocket flag.
 */
export function ConvexConnectionPill({ className }: IConvexConnectionPillProps) {
  const [mounted, setMounted] = useState(false)
  const [browserOnline, setBrowserOnline] = useState(true)

  useEffect(() => {
    setMounted(true)
    setBrowserOnline(navigator.onLine)

    function onOnline() {
      setBrowserOnline(true)
    }
    function onOffline() {
      setBrowserOnline(false)
    }

    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  if (!mounted || browserOnline) return null

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 border-[3px] border-foreground bg-background px-4 py-2 font-mono text-xs font-bold shadow-[6px_6px_0_var(--foreground)]",
        className,
      )}
      role="status"
    >
      offline — reconnect to play.
    </div>
  )
}
