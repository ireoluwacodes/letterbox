import type { TKeyboardKeyState } from "@/components/KeyboardKey/@types"

import type { IKeyboardGridProps } from "./@types"
import { KeyboardKey } from "@/components/KeyboardKey"

const ROWS: Array<Array<string>> = [
  ["a", "b", "c", "d", "e", "f", "g"],
  ["h", "i", "j", "k", "l", "m", "n"],
  ["o", "p", "q", "r", "s", "t", "u"],
  ["v", "w", "x", "y", "z", "", ""],
]

function letterState(
  letter: string,
  letterGuessState: Record<string, "hit" | "miss"> | undefined
): TKeyboardKeyState {
  if (!letter) return "idle"
  const u = letter.toUpperCase()
  const g = letterGuessState?.[u]
  if (g === "hit") return "hit"
  if (g === "miss") return "miss"
  return "idle"
}

export function KeyboardGrid({
  letterGuessState,
  disabled,
  onLetter,
}: IKeyboardGridProps) {
  return (
    <div className="grid w-full max-w-[420px] grid-cols-7 gap-2">
      {ROWS.flat().map((ch, i) => (
        <KeyboardKey
          key={`k-${i}-${ch || "x"}`}
          letter={ch}
          state={letterState(ch, letterGuessState)}
          disabled={disabled}
          onPick={onLetter}
        />
      ))}
    </div>
  )
}
