export interface IKeyboardGridProps {
  letterGuessState: Record<string, "hit" | "miss"> | undefined
  disabled: boolean
  onLetter: (letter: string) => void
}
