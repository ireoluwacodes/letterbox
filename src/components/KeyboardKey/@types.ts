export type TKeyboardKeyState = "idle" | "hit" | "miss" | "dimmed"

export interface IKeyboardKeyProps {
  letter: string
  state: TKeyboardKeyState
  disabled: boolean
  onPick: (letter: string) => void
}
