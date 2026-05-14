import { useConvexConnectionState } from "convex/react"

import type { IConvexConnectionPillProps } from "./@types"
import { cn } from "@/lib/utils"

export function ConvexConnectionPill({ className }: IConvexConnectionPillProps) {
  const state = useConvexConnectionState()

  const reconnecting =
    state.hasEverConnected && !state.isWebSocketConnected

  if (!reconnecting) return null

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 border-[3px] border-foreground bg-background px-4 py-2 font-mono text-xs font-bold shadow-[6px_6px_0_var(--foreground)]",
        className,
      )}
      role="status"
    >
      reconnecting…
    </div>
  )
}
