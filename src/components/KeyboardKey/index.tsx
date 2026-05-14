import { cva } from "class-variance-authority"

import type { IKeyboardKeyProps, TKeyboardKeyState } from "./@types"
import { cn } from "@/lib/utils"
import { useHapticsTap } from "@/lib/webHapticsContext"

const keyVariants = cva(
  "flex h-14 w-14 items-center justify-center rounded-none border-[3px] border-foreground font-mono text-lg font-bold transition-[transform,box-shadow] duration-[80ms] ease-linear",
  {
    variants: {
      state: {
        idle: "brutal-frame brutal-frame-hover brutal-frame-press cursor-pointer bg-background text-foreground",
        hit: "cursor-default border-foreground bg-foreground text-background shadow-none",
        miss: "cursor-default border-foreground bg-[repeating-linear-gradient(45deg,var(--foreground)_0_2px,var(--background)_2px_8px)] shadow-none",
        dimmed:
          "cursor-not-allowed border-foreground bg-muted text-foreground shadow-none",
      },
    },
    defaultVariants: {
      state: "idle",
    },
  }
)

function resolveVisualState(
  state: TKeyboardKeyState,
  notYourTurn: boolean
): TKeyboardKeyState {
  if (state !== "idle") return state
  if (notYourTurn) return "dimmed"
  return "idle"
}

export function KeyboardKey({
  letter,
  state,
  disabled,
  onPick,
}: IKeyboardKeyProps) {
  const haptics = useHapticsTap()
  if (!letter) {
    return <span className="h-14 w-14 shrink-0" aria-hidden />
  }

  const visual = resolveVisualState(state, disabled)
  const clickable = visual === "idle"

  return (
    <button
      type="button"
      disabled={!clickable}
      className={cn(keyVariants({ state: visual }))}
      onClick={() => {
        if (clickable) {
          haptics?.tap("selection")
          onPick(letter)
        }
      }}
    >
      {letter}
    </button>
  )
}
