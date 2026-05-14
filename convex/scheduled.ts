import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  PRESENCE_STALE_AFTER_MS,
  HOST_DISCONNECT_GRACE_MS,
  MAX_PLAYERS,
  MAX_CATEGORIES,
  STALE_GAME_TTL_MS,
} from "./lib/constants";
import { scheduleTurnTimer, nextConnectedTurnIndex } from "./lib/turn";

export const timeoutTurn = internalMutation({
  args: {
    gameId: v.id("games"),
    expectedTurnIndex: v.number(),
    expectedCategoryIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return;
    if (game.status !== "in_progress") return;
    if (
      game.currentTurnIndex !== args.expectedTurnIndex ||
      game.currentCategoryIndex !== args.expectedCategoryIndex
    )
      return;

    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .take(MAX_PLAYERS);

    const nextIndex = nextConnectedTurnIndex(
      game.turnOrder,
      game.currentTurnIndex,
      players,
    );

    if (nextIndex === null) {
      await ctx.db.patch(args.gameId, {
        status: "paused",
        pauseReason: "no_connected_players",
        turnDeadline: undefined,
        turnTimerJobId: undefined,
      });
      return;
    }

    await ctx.db.patch(args.gameId, {
      currentTurnIndex: nextIndex,
      turnTimerJobId: undefined,
    });
    await scheduleTurnTimer(ctx, args.gameId);
  },
});

export const endGameIfHostStillGone = internalMutation({
  args: {
    gameId: v.id("games"),
    pausedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return;
    if (game.status !== "paused") return;
    if (game.hostLastSeenAt > args.pausedAt) return;

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
  },
});

export const checkPresence = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const staleThreshold = now - PRESENCE_STALE_AFTER_MS;

    const [lobbyGames, inProgressGames] = await Promise.all([
      ctx.db
        .query("games")
        .withIndex("by_status", (q) => q.eq("status", "lobby"))
        .take(100),
      ctx.db
        .query("games")
        .withIndex("by_status", (q) => q.eq("status", "in_progress"))
        .take(100),
    ]);
    const games = [...lobbyGames, ...inProgressGames];

    for (const game of games) {
      const players = await ctx.db
        .query("players")
        .withIndex("by_game", (q) => q.eq("gameId", game._id))
        .take(MAX_PLAYERS);

      for (const player of players) {
        if (
          player.connected &&
          !player.leftAt &&
          player.lastSeenAt < staleThreshold
        ) {
          await ctx.db.patch(player._id, { connected: false });
        }
      }

      if (
        game.status === "in_progress" &&
        game.hostLastSeenAt < staleThreshold
      ) {
        if (game.turnTimerJobId) {
          try {
            await ctx.scheduler.cancel(game.turnTimerJobId);
          } catch {}
        }
        await ctx.db.patch(game._id, {
          status: "paused",
          pauseReason: "host_disconnected",
          turnDeadline: undefined,
          turnTimerJobId: undefined,
        });
        await ctx.scheduler.runAfter(
          HOST_DISCONNECT_GRACE_MS,
          internal.scheduled.endGameIfHostStillGone,
          { gameId: game._id, pausedAt: now },
        );
      }
    }
  },
});

export const cleanupStaleGames = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const staleThreshold = now - STALE_GAME_TTL_MS;

    const games = await ctx.db.query("games").take(200);

    for (const game of games) {
      const lastActivity = Math.max(
        game.createdAt,
        game.hostLastSeenAt,
        game.finishedAt ?? 0,
      );
      if (lastActivity > staleThreshold) continue;

      let categories;
      do {
        categories = await ctx.db
          .query("categories")
          .withIndex("by_game_and_order", (q) => q.eq("gameId", game._id))
          .take(MAX_CATEGORIES);
        for (const cat of categories) await ctx.db.delete(cat._id);
      } while (categories.length === MAX_CATEGORIES);

      let players;
      do {
        players = await ctx.db
          .query("players")
          .withIndex("by_game", (q) => q.eq("gameId", game._id))
          .take(MAX_PLAYERS);
        for (const player of players) await ctx.db.delete(player._id);
      } while (players.length === MAX_PLAYERS);

      let guesses;
      do {
        guesses = await ctx.db
          .query("guesses")
          .withIndex("by_game_recent", (q) => q.eq("gameId", game._id))
          .take(50);
        for (const guess of guesses) await ctx.db.delete(guess._id);
      } while (guesses.length === 50);

      await ctx.db.delete(game._id);
    }
  },
});
