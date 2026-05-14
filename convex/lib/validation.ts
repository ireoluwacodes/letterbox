import { z } from "zod";
import {
  MAX_NAME_LENGTH,
  MAX_CATEGORY_NAME_LENGTH,
  MIN_WORD_LENGTH,
  MAX_WORD_LENGTH,
  MIN_POINTS_PER_LETTER,
  MAX_POINTS_PER_LETTER,
  MIN_CATEGORIES,
  MAX_CATEGORIES,
  INVITE_CODE_LENGTH,
} from "./constants";
import { throwError } from "./errors";

export const SessionId = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Must be a valid UUID",
  );

export const PlayerName = z.string().min(1).max(MAX_NAME_LENGTH);

export const Word = z
  .string()
  .min(MIN_WORD_LENGTH)
  .max(MAX_WORD_LENGTH)
  .regex(
    /^[A-Za-z]+( [A-Za-z]+)*$/,
    "Word must contain only letters and single spaces (no leading/trailing spaces)",
  );

export const CategoryName = z.string().min(1).max(MAX_CATEGORY_NAME_LENGTH);

export const Letter = z
  .string()
  .regex(/^[A-Za-z]$/, "Must be a single letter A-Z");

export const PointsPerLetter = z
  .number()
  .int()
  .min(MIN_POINTS_PER_LETTER)
  .max(MAX_POINTS_PER_LETTER);

export const InviteCode = z
  .string()
  .length(INVITE_CODE_LENGTH)
  .regex(/^[A-Za-z0-9]+$/, "Must be a 6-character alphanumeric code");

export const CreateGameInput = z.object({
  sessionId: SessionId,
  hostName: PlayerName,
  pointsPerLetter: PointsPerLetter,
  categories: z
    .array(z.object({ name: CategoryName, word: Word }))
    .min(MIN_CATEGORIES)
    .max(MAX_CATEGORIES),
});

export const JoinInput = z.object({
  inviteCode: InviteCode,
  sessionId: SessionId,
  name: PlayerName,
});

export const GuessInput = z.object({
  gameId: z.string(),
  sessionId: SessionId,
  letter: Letter,
});

interface ZodLike<T> {
  safeParse(
    input: unknown,
  ):
    | { success: true; data: T }
    | {
        success: false;
        error: { issues: ReadonlyArray<{ message: string }> };
      };
}

export function parseOrFail<T>(schema: ZodLike<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join("; ");
    throwError("INVALID_PAYLOAD", message);
  }
  return result.data;
}
