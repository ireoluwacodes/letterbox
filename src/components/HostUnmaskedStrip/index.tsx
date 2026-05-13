import type { IHostUnmaskedStripProps } from "./@types"
import { cn } from "@/lib/utils"

export function HostUnmaskedStrip({
  maskedSlots,
  hostPhrase,
}: IHostUnmaskedStripProps) {
  return (
    <div className="border-b-[3px] border-foreground bg-muted px-4 py-2 font-mono text-sm font-bold">
      <span className="mr-2 font-(family-name:--font-sans) text-[14px] font-bold">
        host view:
      </span>
      <span className="inline-flex flex-wrap gap-x-1">
        {maskedSlots.map((slot, i) => {
          if (slot.kind === "space") {
            return (
              <span key={`sp-${i}`} className="inline-block w-4" aria-hidden>
                {" "}
              </span>
            )
          }
          const real = hostPhrase[i] ?? " "
          const revealed = slot.char != null && slot.char !== ""
          return (
            <span
              key={`c-${i}`}
              className={cn(revealed ? "text-foreground" : "opacity-25")}
            >
              {revealed ? (
                <strong>{(slot.char ?? real).toLowerCase()}</strong>
              ) : (
                real.toLowerCase()
              )}
            </span>
          )
        })}
      </span>
    </div>
  )
}
