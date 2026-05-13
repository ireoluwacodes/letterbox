import type { IRootProvidersProps } from "./@types"
import { ConnectionOverlay } from "@/components/ConnectionOverlay"
import { ToastProvider } from "@/components/ui/toast"
import { useGameStore } from "@/stores/gameStore"
import { useSocketStore } from "@/stores/socketStore"

export function RootProviders({ children }: IRootProvidersProps) {
  const paused = useGameStore((s) => s.pausedOverlay)
  const hadConnected = useSocketStore((s) => s.hadConnected)
  const connected = useSocketStore((s) => s.connected)
  const longDisconnect = useSocketStore((s) => s.longDisconnect)

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
    </ToastProvider>
  )
}
