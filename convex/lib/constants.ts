export const TURN_TIMEOUT_MS = 30_000;
export const PLAYER_DISCONNECT_GRACE_MS = 15_000;
export const HOST_DISCONNECT_GRACE_MS = 60_000;
export const PRESENCE_HEARTBEAT_MS = 5_000;
export const PRESENCE_STALE_AFTER_MS = 12_000;

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;

export const INVITE_CODE_LENGTH = 6;
export const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const MIN_CATEGORIES = 1;
export const MAX_CATEGORIES = 10;

export const MIN_WORD_LENGTH = 2;
export const MAX_WORD_LENGTH = 30;

export const MAX_NAME_LENGTH = 20;
export const MAX_CATEGORY_NAME_LENGTH = 30;

export const MIN_POINTS_PER_LETTER = 1;
export const MAX_POINTS_PER_LETTER = 50;
export const DEFAULT_POINTS_PER_LETTER = 5;

export const DEFAULT_CATEGORIES = [
  "Name",
  "Animal",
  "School",
  "Thing",
  "Place",
  "Food",
];

export const GUESS_MIN_INTERVAL_MS = 500;

export const STALE_GAME_TTL_MS = 2 * 60 * 60 * 1000;
