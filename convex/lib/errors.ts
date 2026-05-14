import { ConvexError } from "convex/values";

export const ERROR_CODES = Object.freeze({
  GAME_NOT_FOUND: "GAME_NOT_FOUND",
  GAME_FINISHED: "GAME_FINISHED",
  GAME_FULL: "GAME_FULL",
  GAME_ALREADY_STARTED: "GAME_ALREADY_STARTED",
  GAME_NOT_IN_PROGRESS: "GAME_NOT_IN_PROGRESS",
  NAME_TAKEN: "NAME_TAKEN",
  NOT_HOST: "NOT_HOST",
  NOT_YOUR_TURN: "NOT_YOUR_TURN",
  LETTER_ALREADY_GUESSED: "LETTER_ALREADY_GUESSED",
  NOT_ENOUGH_PLAYERS: "NOT_ENOUGH_PLAYERS",
  INVALID_PAYLOAD: "INVALID_PAYLOAD",
  RATE_LIMITED: "RATE_LIMITED",
  PLAYER_NOT_FOUND: "PLAYER_NOT_FOUND",
});

export type ErrorCode = keyof typeof ERROR_CODES;

export function throwError(code: ErrorCode, message: string): never {
  throw new ConvexError({ code, message });
}
