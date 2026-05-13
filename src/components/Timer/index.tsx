import type { ITimerProps } from "./@types"
import { cn } from "@/lib/utils"

function formatTimer(ms: number): string {
  const sec = Math.floor(Math.max(0, ms) / 1000)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function Timer({ remainingMs }: ITimerProps) {
  const urgent = remainingMs <= 5000
  return (
    <div
      className={cn(
        "inline-flex min-w-[5ch] items-center justify-center border-[3px] border-foreground px-3 py-2 font-mono text-2xl font-bold tabular-nums transition-[background-color,color] duration-[80ms] ease-linear",
        urgent
          ? "bg-foreground text-background"
          : "bg-background text-foreground shadow-[6px_6px_0_var(--foreground)]"
      )}
    >
      {formatTimer(remainingMs)}
    </div>
  )
}
