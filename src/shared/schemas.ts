import { z } from "zod"

import type { TGuessResultEvent } from "@/shared/apiTypes"

/** Letters + spaces; server allows 2–30 chars */
const WORD_REGEX = /^[A-Za-z ]+$/

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
  connected: z.boolean(),
  joinedAt: z.number().optional(),
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
  name: z.string().min(1).max(30),
  word: z
    .string()
    .min(2)
    .max(30)
    .regex(WORD_REGEX, "letters and single spaces only")
    .transform((w) => w.toUpperCase()),
})

export const GameStatusSchema = z.enum([
  "lobby",
  "playing",
  "paused",
  "finished",
])

/** Normalized game shape used by UI (derived from server `PublicGame`) */
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
  /** Server guessing order; "next up" follows this, not `players` list order */
  turnOrder: z.array(z.string()),
  currentPlayerId: z.string().nullable(),
  turnDeadline: z.number().nullable(),
  maskedSlots: z.array(MaskedSlotSchema).optional(),
  letterGuessState: z.record(z.string(), z.enum(["hit", "miss"])).optional(),
  hostWord: z.string().optional(),
  selfPlayerId: z.string().optional(),
  /** From `game:state`; prefer over inferring host from `youArePlayerId` */
  hostId: z.string().optional(),
  hostName: z.string().optional(),
})

export const CreateGamePayloadSchema = z.object({
  hostName: z.string().min(1).max(20),
  pointsPerLetter: z.number().min(1).max(50),
  categories: z.array(CategorySchema).min(1).max(10),
})

export const JoinPayloadSchema = z.object({
  inviteCode: z
    .string()
    .length(6)
    .regex(/^[A-Z0-9]+$/i)
    .transform((s) => s.toUpperCase()),
  name: z.string().min(1).max(20),
})

export const GuessEmitSchema = z.object({
  gameId: z.string().min(1),
  letter: z
    .string()
    .length(1)
    .regex(/^[A-Za-z]$/)
    .transform((c) => c.toUpperCase()),
})

export type TGameStatus = z.infer<typeof GameStatusSchema>
export type TPlayer = z.infer<typeof PlayerSchema>
export type TMaskedSlot = z.infer<typeof MaskedSlotSchema>
export type TGameState = z.infer<typeof GameStateSchema>
export type TCreateGamePayload = z.infer<typeof CreateGamePayloadSchema>
export type TJoinPayload = z.infer<typeof JoinPayloadSchema>
export type TGuessEmitPayload = z.infer<typeof GuessEmitSchema>
export type TCategoryInput = z.infer<typeof CategorySchema>

export type TGuessResult = TGuessResultEvent

export { WORD_REGEX }
