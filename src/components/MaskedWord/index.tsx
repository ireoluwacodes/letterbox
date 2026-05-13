import type { IMaskedWordProps } from "./@types"
import { cn } from "@/lib/utils"

export function MaskedWord({ slots, flashingIndices }: IMaskedWordProps) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-2">
      {slots.map((slot, idx) => {
        if (slot.kind === "space") {
          return (
            <span
              key={`sp-${idx}`}
              className="inline-block w-6 shrink-0"
              aria-hidden
            />
          )
        }

        const revealed = slot.char != null && slot.char !== ""
        const flash = flashingIndices.has(idx)
        const showLetter = revealed && slot.char !== " "

        return (
          <div
            key={`l-${idx}`}
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center border-[3px] border-foreground bg-background font-mono text-xl font-bold shadow-[6px_6px_0_var(--foreground)] transition-[transform,box-shadow,background-color,color] duration-80 ease-linear",
              flash && "bg-foreground text-background"
            )}
          >
            {showLetter ? (
              <span>{String(slot.char).toLowerCase()}</span>
            ) : (
              <span className="block h-1 w-6 bg-foreground" aria-hidden />
            )}
          </div>
        )
      })}
    </div>
  )
}
