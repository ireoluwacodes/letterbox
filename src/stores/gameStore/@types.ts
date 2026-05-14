import type { TGameFinishedEvent, TPublicGame } from "@/shared/apiTypes"
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
  /** Last `game:finished` payload (for over screen ordering / tie) */
  finishedEvent: TGameFinishedEvent | null
}

export interface IGameStoreActions {
  setGameStateFromServer: (game: TPublicGame) => void
  setIdentity: (playerId: string | null, isHost: boolean) => void
  reset: () => void
  /** From `game:guess_result` — letter UI only; never advances `currentPlayerId` (use `game:turn_changed`). */
  applyGuessResult: (result: TGuessResult, categoryName: string) => void
  pushLastGuess: (guess: TLastGuess) => void
  setFlashingIndices: (indices: Array<number>) => void
  clearFlash: (index: number) => void
  setPaused: (paused: boolean, resumeDeadline?: number | null) => void
  setCategoryCompleteHold: (until: number | null) => void
  clearGuessedLetters: () => void
  setFinishedEvent: (payload: TGameFinishedEvent | null) => void
  /** Host lobby before first `game:state` (server sends state on first player join). */
  setHostLobbyFromCreateAck: (input: {
    gameId: string
    inviteCode: string
    pointsPerLetter: number
    categoryNames: Array<string>
  }) => void
}

export type TGameStore = IGameStoreState & IGameStoreActions
