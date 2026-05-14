/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as games from "../games.js";
import type * as guesses from "../guesses.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_rng from "../lib/rng.js";
import type * as lib_sanitize from "../lib/sanitize.js";
import type * as lib_turn from "../lib/turn.js";
import type * as lib_validation from "../lib/validation.js";
import type * as lib_word from "../lib/word.js";
import type * as players from "../players.js";
import type * as presence from "../presence.js";
import type * as scheduled from "../scheduled.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  games: typeof games;
  guesses: typeof guesses;
  "lib/constants": typeof lib_constants;
  "lib/errors": typeof lib_errors;
  "lib/rng": typeof lib_rng;
  "lib/sanitize": typeof lib_sanitize;
  "lib/turn": typeof lib_turn;
  "lib/validation": typeof lib_validation;
  "lib/word": typeof lib_word;
  players: typeof players;
  presence: typeof presence;
  scheduled: typeof scheduled;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
