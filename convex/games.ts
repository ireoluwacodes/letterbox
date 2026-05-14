import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { makeInviteCode, shuffle } from "./lib/rng";
import { normalizeWord, buildInitialRevealed } from "./lib/word";
import { throwError } from "./lib/errors";
import { parseOrFail, CreateGameInput } from "./lib/validation";
import {
  MAX_PLAYERS,
  MAX_CATEGORIES,
  MIN_PLAYERS,
  PRESENCE_STALE_AFTER_MS,
} from "./lib/constants";
import { buildGameView } from "./lib/sanitize";
import { scheduleTurnTimer } from "./lib/turn";

export const create = mutation({
  args: {
    sessionId: v.string(),
    hostName: v.string(),
    pointsPerLetter: v.number(),
    categories: v.array(v.object({ name: v.string(), word: v.string() })),
  },
  handler: async (ctx, args) => {
    parseOrFail(CreateGameInput, args);

    let inviteCode: string | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = makeInviteCode();
      const existing = await ctx.db
        .query("games")
        .withIndex("by_invite_code", (q) => q.eq("inviteCode", code))
        .unique();
      if (!existing) {
        inviteCode = code;
        break;
      }
    }
    if (!inviteCode) {
      throw new Error("Failed to generate a unique invite code after 5 attempts");
    }

    const now = Date.now();
    const gameId = await ctx.db.insert("games", {
      inviteCode,
      hostSessionId: args.sessionId,
      hostName: args.hostName.trim(),
      status: "lobby",
      pointsPerLetter: args.pointsPerLetter,
      currentCategoryIndex: 0,
      turnOrder: [],
      currentTurnIndex: 0,
      hostLastSeenAt: now,
      createdAt: now,
    });

    for (let i = 0; i < args.categories.length; i++) {
      const { name, word } = args.categories[i];
      const normalized = normalizeWord(word);
      await ctx.db.insert("categories", {
        gameId,
        order: i,
        name: name.trim(),
        word: normalized,
        wordLength: normalized.length,
        revealed: buildInitialRevealed(normalized),
        guessedLetters: [],
      });
    }

    return { gameId, inviteCode };
  },
});

export const getByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const code = args.inviteCode.toUpperCase();
    const game = await ctx.db
      .query("games")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", code))
      .unique();
    if (!game) {
      return { exists: false as const, maxPlayers: MAX_PLAYERS };
    }
    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", game._id))
      .take(MAX_PLAYERS + 1);
    const playerCount = players.filter((p) => !p.leftAt).length;
    return {
      exists: true as const,
      gameId: game._id,
      status: game.status,
      playerCount,
      maxPlayers: MAX_PLAYERS,
    };
  },
});

export const getGameView = query({
  args: { gameId: v.id("games"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return null;

    const [categories, players, recentGuesses] = await Promise.all([
      ctx.db
        .query("categories")
        .withIndex("by_game_and_order", (q) => q.eq("gameId", args.gameId))
        .take(MAX_CATEGORIES),
      ctx.db
        .query("players")
        .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
        .take(MAX_PLAYERS),
      ctx.db
        .query("guesses")
        .withIndex("by_game_recent", (q) => q.eq("gameId", args.gameId))
        .order("desc")
        .take(5),
    ]);

    const hostConnected =
      Date.now() - game.hostLastSeenAt < PRESENCE_STALE_AFTER_MS;

    return buildGameView(
      game,
      categories,
      players,
      recentGuesses,
      hostConnected,
      args.sessionId,
    );
  },
});

export const getCompletedCategories = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_game_and_order", (q) => q.eq("gameId", args.gameId))
      .take(MAX_CATEGORIES);
    return categories
      .filter((c) => c.completedAt !== undefined)
      .sort((a, b) => a.order - b.order)
      .map((c) => ({ name: c.name, word: c.word, order: c.order }));
  },
});

export const getCategoryScoreBreakdown = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const [categories, guesses] = await Promise.all([
      ctx.db
        .query("categories")
        .withIndex("by_game_and_order", (q) => q.eq("gameId", args.gameId))
        .take(MAX_CATEGORIES),
      // max 26 letters × MAX_CATEGORIES per game
      ctx.db
        .query("guesses")
        .withIndex("by_game_recent", (q) => q.eq("gameId", args.gameId))
        .take(MAX_CATEGORIES * 26 + 10),
    ]);

    const scoreLookup: Record<string, number> = {};
    for (const g of guesses) {
      const key = `${String(g.playerId)}:${String(g.categoryId)}`;
      scoreLookup[key] = (scoreLookup[key] ?? 0) + g.pointsAwarded;
    }

    return {
      categories: categories
        .sort((a, b) => a.order - b.order)
        .map((c) => ({ id: c._id, name: c.name, word: c.word, order: c.order })),
      scoreLookup,
    };
  },
});

export const start = mutation({
  args: { gameId: v.id("games"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throwError("GAME_NOT_FOUND", "Game not found");
    if (game.hostSessionId !== args.sessionId)
      throwError("NOT_HOST", "Only the host can start the game");
    if (game.status !== "lobby")
      throwError("GAME_ALREADY_STARTED", "Game has already started");

    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .take(MAX_PLAYERS);
    const activePlayers = players.filter((p) => !p.leftAt);
    if (activePlayers.length < MIN_PLAYERS) {
      throwError(
        "NOT_ENOUGH_PLAYERS",
        `Need at least ${MIN_PLAYERS} players to start`,
      );
    }

    const turnOrder = shuffle(
      activePlayers.map((p) => p._id),
      args.gameId + String(Date.now()),
    );

    await ctx.db.patch(args.gameId, {
      status: "in_progress",
      turnOrder,
      currentTurnIndex: 0,
      currentCategoryIndex: 0,
      hostLastSeenAt: Date.now(),
    });

    await scheduleTurnTimer(ctx, args.gameId);
    return null;
  },
});

export const endGame = mutation({
  args: { gameId: v.id("games"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throwError("GAME_NOT_FOUND", "Game not found");
    if (game.hostSessionId !== args.sessionId)
      throwError("NOT_HOST", "Only the host can end the game");
    if (game.status === "finished") return null;

    if (game.turnTimerJobId) {
      try {
        await ctx.scheduler.cancel(game.turnTimerJobId);
      } catch {}
    }

    await ctx.db.patch(args.gameId, {
      status: "finished",
      finishedAt: Date.now(),
      turnDeadline: undefined,
      turnTimerJobId: undefined,
    });

    return null;
  },
});
