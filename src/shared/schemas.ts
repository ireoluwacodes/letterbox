import { z } from "zod"

/** Letters + spaces; accepts typing case-insensitive, normalized to for wire format */
const WORD_REGEX = /^[A-Za-z ]+$/

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
  connected: z.boolean(),
  isHost: z.boolean().optional(),
})

export const MaskedSlotSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("letter"),
    char: z.string().nullable(),
  }),
  z.object({
    kind: z.literal("space"),
  }),
])

export const CategorySchema = z.object({
  name: z.string().min(1).max(40),
  word: z
    .string()
    .regex(WORD_REGEX, "letters and single spaces only")
    .transform((w) => w.toUpperCase()),
})

export const GameStatusSchema = z.enum([
  "lobby",
  "playing",
  "paused",
  "finished",
])

export const GameStateSchema = z.object({
  gameId: z.string(),
  inviteCode: z.string(),
  status: GameStatusSchema,
  pointsPerLetter: z.number(),
  players: z.array(PlayerSchema),
  categories: z.array(
    z.object({
      name: z.string(),
    })
  ),
  currentCategoryIndex: z.number(),
  currentPlayerId: z.string().nullable(),
  turnDeadline: z.number().nullable(),
  maskedSlots: z.array(MaskedSlotSchema).optional(),
  letterGuessState: z.record(z.string(), z.enum(["hit", "miss"])).optional(),
  /** Full word for host-only strip; omit for players */
  hostWord: z.string().optional(),
  /** Socket session identity when provided by server */
  selfPlayerId: z.string().optional(),
})

export const CreateGamePayloadSchema = z.object({
  hostName: z.string().min(1).max(20),
  pointsPerLetter: z.number().min(1).max(50),
  categories: z.array(CategorySchema).min(1).max(10),
})

export const JoinPayloadSchema = z.object({
  code: z
    .string()
    .length(6)
    .regex(/^[A-Z0-9]+$/i)
    .transform((s) => s.toUpperCase()),
  name: z.string().min(1).max(20),
})

export const GuessPayloadSchema = z.object({
  letter: z
    .string()
    .length(1)
    .regex(/^[A-Z]$/i),
})

export const GuessResultSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  letter: z.string(),
  outcome: z.enum(["hit", "miss"]),
  pointsEarned: z.number().optional(),
  revealedIndices: z.array(z.number()).optional(),
})

export type TGameStatus = z.infer<typeof GameStatusSchema>
export type TPlayer = z.infer<typeof PlayerSchema>
export type TMaskedSlot = z.infer<typeof MaskedSlotSchema>
export type TGameState = z.infer<typeof GameStateSchema>
export type TCreateGamePayload = z.infer<typeof CreateGamePayloadSchema>
export type TJoinPayload = z.infer<typeof JoinPayloadSchema>
export type TGuessPayload = z.infer<typeof GuessPayloadSchema>
export type TGuessResult = z.infer<typeof GuessResultSchema>
export type TCategoryInput = z.infer<typeof CategorySchema>

export { WORD_REGEX }
