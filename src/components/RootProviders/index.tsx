import { useEffect } from "react"

import { Toaster } from "sonner"
import type { IRootProvidersProps } from "./@types"
import { ConnectionOverlay } from "@/components/ConnectionOverlay"
import { ToastProvider } from "@/components/ui/toast"
import { loadSocketSession } from "@/lib/socketSession"
import { SOCKET_EVENTS } from "@/shared/socketEvents"
import { useGameStore } from "@/stores/gameStore"
import { useSocketStore } from "@/stores/socketStore"


export function RootProviders({ children }: IRootProvidersProps) {
  const paused = useGameStore((s) => s.pausedOverlay)
  const hadConnected = useSocketStore((s) => s.hadConnected)
  const connected = useSocketStore((s) => s.connected)
  const longDisconnect = useSocketStore((s) => s.longDisconnect)

  useEffect(() => {
    function onBeforeUnload() {
      const session = loadSocketSession()
      if (session?.role !== "player") return
      const sock = useSocketStore.getState().socket
      const gameId =
        useGameStore.getState().game?.gameId ?? session.gameId
      if (!sock?.connected) return
      sock.emit(SOCKET_EVENTS.PLAYER_LEAVE, { gameId })
    }

    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [])

  const showReconnect = hadConnected && !connected && !longDisconnect && !paused
  const showLost = longDisconnect && !connected && !paused

  return (
    <ToastProvider>
      <ConnectionOverlay
        showPaused={paused}
        showReconnect={showReconnect}
        showLost={showLost}
        onRetry={() => {
          useSocketStore.getState().socket?.connect()
        }}
      />
      {children}
      <Toaster
        position="bottom-right"
        theme="light"
        toastOptions={{
          classNames: {
            toast:
              "rounded-none border-[3px] border-foreground bg-background font-medium text-foreground shadow-[6px_6px_0_var(--foreground)]",
            title: "font-bold text-foreground",
            success: "border-foreground",
            error: "border-foreground",
          },
        }}
        className="z-[100]"
      />
    </ToastProvider>
  )
}
