/** Shapes from the Letterbox server (see API integration guide). */

export type TApiGameStatus =
  | "lobby"
  | "in_progress"
  | "paused"
  | "finished"

export type TPublicPlayer = {
  id: string
  name: string
  score: number
  connected: boolean
  joinedAt: number
}

export type TPublicCategory = {
  id: string
  name: string
  revealed: Array<boolean>
  guessedLetters: Array<string>
  word?: string
  maskedWord?: string
}

export type TPublicGame = {
  id: string
  inviteCode: string
  status: TApiGameStatus
  pointsPerLetter: number
  categories: Array<TPublicCategory>
  currentCategoryIndex: number
  players: Array<TPublicPlayer>
  /** Guessing rotation; advance after each guess (hit or miss), not only on miss */
  turnOrder: Array<string>
  currentTurnIndex: number
  turnDeadline: number | null
  createdAt: number
  /** Authoritative host player id on every `game:state` */
  hostId?: string
  /** Host display name from server (may differ from the player row if ever out of sync) */
  hostName?: string
  /** @deprecated Prefer `hostId`. */
  hostPlayerId?: string
}

export type TAckOkCreateGame = {
  ok: true
  gameId: string
  inviteCode: string
}

export type TAckErr = { ok: false; code: string; message: string }

export type TAckJoinOk = {
  ok: true
  gameId: string
  playerId: string
  you: TPublicPlayer
}

export type TAckVoidOk = { ok: true }

/** Letter outcome for UI only; turn rotation comes from `game:turn_changed`, not from hits/miss here. */
export type TGuessResultEvent = {
  playerId: string
  letter: string
  hits: number
  pointsAwarded: number
}

export type TGameStartedEvent = {
  turnOrder: Array<string>
  currentCategoryName: string
  currentPlayerId: string
  turnDeadline: number
}

export type TGameTurnSkippedEvent = {
  playerId: string
  reason: "timeout" | "disconnected"
}

export type TGameCategoryCompletedEvent = {
  categoryId: string
  word: string
}

export type TGameNextCategoryEvent = {
  category: TPublicCategory
}

export type TGameFinishedEvent = {
  finalScores: Array<TPublicPlayer>
  tied: boolean
}

export type TGamePausedEvent = {
  reason: "host_disconnected"
}
