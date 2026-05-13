import type { IConnectionOverlayProps } from "./@types"
import { BrutalButton } from "@/components/BrutalButton"

export function ConnectionOverlay({
  showPaused,
  showReconnect,
  showLost,
  pauseMessage = "host disconnected — waiting…",
  onRetry,
}: IConnectionOverlayProps) {
  if (showPaused) {
    return (
      <div className="fixed inset-0 z-70 flex items-center justify-center bg-background px-6">
        <div className="max-w-lg border-[3px] border-foreground bg-background px-8 py-10 text-center shadow-[8px_8px_0_var(--foreground)]">
          <p className="font-mono text-lg font-bold">
            {pauseMessage}
          </p>
        </div>
      </div>
    )
  }

  if (showLost) {
    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-6 border-[3px] border-foreground bg-background px-10 py-12 shadow-[8px_8px_0_var(--foreground)]">
          <p className="font-mono text-lg font-bold">
            connection lost.
          </p>
          {onRetry ? (
            <BrutalButton type="button" onClick={onRetry}>
              retry
            </BrutalButton>
          ) : null}
        </div>
      </div>
    )
  }

  if (!showReconnect) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-6 border-[3px] border-foreground bg-background px-10 py-12 shadow-[8px_8px_0_var(--foreground)]">
        <div
          className="size-10 animate-spin border-[3px] border-foreground bg-foreground shadow-[4px_4px_0_var(--foreground)]"
          aria-hidden
        />
        <p className="font-mono text-lg font-bold">reconnecting…</p>
      </div>
    </div>
  )
}
