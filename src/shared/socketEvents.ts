import type {
  TAckErr,
  TAckJoinOk,
  TAckOkCreateGame,
  TAckVoidOk,
  TGameCategoryCompletedEvent,
  TGameFinishedEvent,
  TGameNextCategoryEvent,
  TGamePausedEvent,
  TGameStartedEvent,
  TGameTurnSkippedEvent,
  TGuessResultEvent,
  TPublicGame,
  TPublicPlayer,
} from "@/shared/apiTypes"

import type { TCreateGamePayload, TGuessEmitPayload, TJoinPayload } from "@/shared/schemas"

export const SOCKET_EVENTS = {
  HOST_CREATE_GAME: "host:create_game",
  HOST_START: "host:start_game",
  HOST_RECONNECT: "host:reconnect",
  HOST_END_GAME: "host:end_game",
  PLAYER_JOIN: "player:join",
  PLAYER_GUESS: "player:guess",
  PLAYER_LEAVE: "player:leave",
  GAME_STATE: "game:state",
  GAME_PLAYER_JOINED: "game:player_joined",
  GAME_PLAYER_LEFT: "game:player_left",
  GAME_STARTED: "game:started",
  GAME_GUESS_RESULT: "game:guess_result",
  GAME_TURN_CHANGED: "game:turn_changed",
  GAME_TURN_SKIPPED: "game:turn_skipped",
  GAME_CATEGORY_COMPLETED: "game:category_completed",
  GAME_NEXT_CATEGORY: "game:next_category",
  GAME_FINISHED: "game:finished",
  GAME_PAUSED: "game:paused",
  GAME_RESUMED: "game:resumed",
} as const

export type TSocketAckCreateGame = TAckOkCreateGame | TAckErr
export type TSocketAckJoin = TAckJoinOk | TAckErr
export type TSocketAckVoid = TAckVoidOk | TAckErr

/** Payload for `game:turn_changed` — fires after every guess (hit or miss). Authoritative for whose turn it is. */
export interface ITurnChangedPayload {
  currentPlayerId: string
  turnDeadline: number
}

export interface IPlayerJoinedPayload {
  player: TPublicPlayer
}

export interface IPlayerLeftPayload {
  playerId: string
}

export interface IServerToClientEvents {
  [SOCKET_EVENTS.GAME_STATE]: (payload: TPublicGame) => void
  [SOCKET_EVENTS.GAME_PLAYER_JOINED]: (payload: IPlayerJoinedPayload) => void
  [SOCKET_EVENTS.GAME_PLAYER_LEFT]: (payload: IPlayerLeftPayload) => void
  [SOCKET_EVENTS.GAME_STARTED]: (payload: TGameStartedEvent) => void
  [SOCKET_EVENTS.GAME_GUESS_RESULT]: (payload: TGuessResultEvent) => void
  [SOCKET_EVENTS.GAME_TURN_CHANGED]: (payload: ITurnChangedPayload) => void
  [SOCKET_EVENTS.GAME_TURN_SKIPPED]: (payload: TGameTurnSkippedEvent) => void
  [SOCKET_EVENTS.GAME_CATEGORY_COMPLETED]: (
    payload: TGameCategoryCompletedEvent
  ) => void
  [SOCKET_EVENTS.GAME_NEXT_CATEGORY]: (payload: TGameNextCategoryEvent) => void
  [SOCKET_EVENTS.GAME_FINISHED]: (payload: TGameFinishedEvent) => void
  [SOCKET_EVENTS.GAME_PAUSED]: (payload: TGamePausedEvent) => void
  [SOCKET_EVENTS.GAME_RESUMED]: (payload: Record<string, never>) => void
}

export interface IClientToServerEvents {
  [SOCKET_EVENTS.HOST_CREATE_GAME]: (
    payload: TCreateGamePayload,
    ack: (res: TSocketAckCreateGame) => void
  ) => void
  [SOCKET_EVENTS.HOST_START]: (
    payload: { gameId: string },
    ack: (res: TSocketAckVoid) => void
  ) => void
  [SOCKET_EVENTS.HOST_RECONNECT]: (
    payload: { gameId: string },
    ack: (res: TSocketAckVoid) => void
  ) => void
  [SOCKET_EVENTS.HOST_END_GAME]: (
    payload: { gameId: string },
    ack: (res: TSocketAckVoid) => void
  ) => void
  [SOCKET_EVENTS.PLAYER_JOIN]: (
    payload: TJoinPayload,
    ack: (res: TSocketAckJoin) => void
  ) => void
  [SOCKET_EVENTS.PLAYER_GUESS]: (
    payload: TGuessEmitPayload,
    ack: (res: TSocketAckVoid) => void
  ) => void
  [SOCKET_EVENTS.PLAYER_LEAVE]: (payload: { gameId: string }) => void
}
