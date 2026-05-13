import type { TGameState, TGuessResult } from "@/shared/schemas"

export type TLastGuess = {
  playerName: string
  letter: string
  points: number | "miss"
}

export interface IGameStoreState {
  game: TGameState | null
  lastGuesses: Array<TLastGuess>
  youArePlayerId: string | null
  youAreHost: boolean
  /** playerId -> category name -> points earned in that category */
  guessHistoryByCategory: Record<string, Record<string, number>>
  /** Indices that should flash invert after a reveal */
  flashingIndices: Set<number>
  pausedOverlay: boolean
  pauseCountdownMs: number | null
  categoryCompleteHoldUntil: number | null
}

export interface IGameStoreActions {
  setGameState: (game: TGameState) => void
  setIdentity: (playerId: string | null, isHost: boolean) => void
  reset: () => void
  applyGuessResult: (result: TGuessResult, categoryName: string) => void
  pushLastGuess: (guess: TLastGuess) => void
  setFlashingIndices: (indices: Array<number>) => void
  clearFlash: (index: number) => void
  setPaused: (paused: boolean, resumeDeadline?: number | null) => void
  setCategoryCompleteHold: (until: number | null) => void
  clearGuessedLetters: () => void
}

export type TGameStore = IGameStoreState & IGameStoreActions
