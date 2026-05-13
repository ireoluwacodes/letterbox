import type {
  TCreateGamePayload,
  TGameState,
  TGuessPayload,
  TGuessResult,
  TJoinPayload,
} from "@/shared/schemas"

export const SOCKET_EVENTS = {
  HOST_CREATE_GAME: "host:create_game",
  PLAYER_JOIN: "player:join",
  HOST_START: "host:start_game",
  PLAYER_GUESS: "player:guess",
  HOST_END_GAME: "host:end_game",
  GAME_STATE: "game:state",
  GAME_GUESS_RESULT: "game:guess_result",
  GAME_TURN_CHANGED: "game:turn_changed",
  GAME_TURN_SKIPPED: "game:turn_skipped",
  GAME_CATEGORY_COMPLETED: "game:category_completed",
  GAME_NEXT_CATEGORY: "game:next_category",
  GAME_FINISHED: "game:finished",
  GAME_PAUSED: "game:paused",
  GAME_RESUMED: "game:resumed",
  GAME_ERROR: "game:error",
} as const

export interface ITurnChangedPayload {
  currentPlayerId: string | null
  turnDeadline: number | null
}

export interface ITurnSkippedPayload {
  playerId: string
  playerName: string
  letter?: string
}

export interface ICategoryCompletedPayload {
  word: string
}

export interface IGameFinishedPayload {
  gameId: string
}

export interface IGamePausedPayload {
  hostDisconnected: boolean
  resumeDeadline?: number | null
}

export interface IGameErrorPayload {
  message: string
  fatal?: boolean
}

export interface IServerToClientEvents {
  [SOCKET_EVENTS.GAME_STATE]: (payload: TGameState) => void
  [SOCKET_EVENTS.GAME_GUESS_RESULT]: (payload: TGuessResult) => void
  [SOCKET_EVENTS.GAME_TURN_CHANGED]: (payload: ITurnChangedPayload) => void
  [SOCKET_EVENTS.GAME_TURN_SKIPPED]: (payload: ITurnSkippedPayload) => void
  [SOCKET_EVENTS.GAME_CATEGORY_COMPLETED]: (
    payload: ICategoryCompletedPayload
  ) => void
  [SOCKET_EVENTS.GAME_NEXT_CATEGORY]: () => void
  [SOCKET_EVENTS.GAME_FINISHED]: (payload: IGameFinishedPayload) => void
  [SOCKET_EVENTS.GAME_PAUSED]: (payload: IGamePausedPayload) => void
  [SOCKET_EVENTS.GAME_RESUMED]: () => void
  [SOCKET_EVENTS.GAME_ERROR]: (payload: IGameErrorPayload) => void
}

export interface IClientToServerEvents {
  [SOCKET_EVENTS.HOST_CREATE_GAME]: (
    payload: TCreateGamePayload,
    ack: (err: Error | null, res?: { gameId: string }) => void
  ) => void
  [SOCKET_EVENTS.PLAYER_JOIN]: (
    payload: TJoinPayload,
    ack: (err: Error | null, res?: { gameId: string }) => void
  ) => void
  [SOCKET_EVENTS.HOST_START]: (ack: (err: Error | null) => void) => void
  [SOCKET_EVENTS.PLAYER_GUESS]: (
    payload: TGuessPayload,
    ack: (err: Error | null) => void
  ) => void
  [SOCKET_EVENTS.HOST_END_GAME]: (ack: (err: Error | null) => void) => void
}
