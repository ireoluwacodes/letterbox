import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    inviteCode: v.string(),
    hostSessionId: v.string(),
    hostName: v.string(),
    status: v.union(
      v.literal("lobby"),
      v.literal("in_progress"),
      v.literal("paused"),
      v.literal("finished"),
    ),
    pointsPerLetter: v.number(),
    currentCategoryIndex: v.number(),
    turnOrder: v.array(v.id("players")),
    currentTurnIndex: v.number(),
    turnDeadline: v.optional(v.number()),
    turnTimerJobId: v.optional(v.id("_scheduled_functions")),
    hostLastSeenAt: v.number(),
    pauseReason: v.optional(v.string()),
    finishedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_invite_code", ["inviteCode"])
    .index("by_status", ["status"]),

  categories: defineTable({
    gameId: v.id("games"),
    order: v.number(),
    name: v.string(),
    word: v.string(),
    wordLength: v.number(),
    revealed: v.array(v.boolean()),
    guessedLetters: v.array(v.string()),
    completedAt: v.optional(v.number()),
  }).index("by_game_and_order", ["gameId", "order"]),

  players: defineTable({
    gameId: v.id("games"),
    sessionId: v.string(),
    name: v.string(),
    score: v.number(),
    connected: v.boolean(),
    lastSeenAt: v.number(),
    joinedAt: v.number(),
    leftAt: v.optional(v.number()),
    lastGuessAt: v.optional(v.number()),
    disconnectGraceJobId: v.optional(v.id("_scheduled_functions")),
  })
    .index("by_game", ["gameId"])
    .index("by_session_and_game", ["sessionId", "gameId"]),

  guesses: defineTable({
    gameId: v.id("games"),
    categoryId: v.id("categories"),
    playerId: v.id("players"),
    playerName: v.string(),
    letter: v.string(),
    hits: v.number(),
    pointsAwarded: v.number(),
    at: v.number(),
  }).index("by_game_recent", ["gameId", "at"]),
});
