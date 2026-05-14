import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { throwError } from "./lib/errors";
import { parseOrFail, JoinInput } from "./lib/validation";
import { MAX_PLAYERS } from "./lib/constants";
import { scheduleTurnTimer, nextConnectedTurnIndex } from "./lib/turn";

export const join = mutation({
  args: {
    inviteCode: v.string(),
    sessionId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedCode = args.inviteCode.toUpperCase();
    parseOrFail(JoinInput, { ...args, inviteCode: normalizedCode });

    const game = await ctx.db
      .query("games")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", normalizedCode))
      .unique();
    if (!game) throwError("GAME_NOT_FOUND", "Game not found");
    if (game.status === "finished")
      throwError("GAME_FINISHED", "Game has already ended");

    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("by_session_and_game", (q) =>
        q.eq("sessionId", args.sessionId).eq("gameId", game._id),
      )
      .unique();

    if (existingPlayer) {
      if (existingPlayer.disconnectGraceJobId) {
        try {
          await ctx.scheduler.cancel(existingPlayer.disconnectGraceJobId);
        } catch {}
      }
      await ctx.db.patch(existingPlayer._id, {
        connected: true,
        lastSeenAt: Date.now(),
        leftAt: undefined,
        disconnectGraceJobId: undefined,
      });
      return {
        gameId: game._id,
        playerId: existingPlayer._id,
        rejoined: true,
      };
    }

    if (game.status !== "lobby")
      throwError("GAME_ALREADY_STARTED", "Game has already started");

    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", game._id))
      .take(MAX_PLAYERS + 1);
    const activePlayers = players.filter((p) => !p.leftAt);

    if (activePlayers.length >= MAX_PLAYERS)
      throwError("GAME_FULL", "Game is full");

    const trimmedName = args.name.trim();
    const nameTaken = activePlayers.some(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase(),
    );
    if (nameTaken) throwError("NAME_TAKEN", "That name is already taken");

    const now = Date.now();
    const playerId = await ctx.db.insert("players", {
      gameId: game._id,
      sessionId: args.sessionId,
      name: trimmedName,
      score: 0,
      connected: true,
      lastSeenAt: now,
      joinedAt: now,
    });

    return { gameId: game._id, playerId, rejoined: false };
  },
});

export const rejoin = mutation({
  args: { gameId: v.id("games"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status === "finished") return null;

    const player = await ctx.db
      .query("players")
      .withIndex("by_session_and_game", (q) =>
        q.eq("sessionId", args.sessionId).eq("gameId", args.gameId),
      )
      .unique();
    if (!player) return null;

    if (player.disconnectGraceJobId) {
      try {
        await ctx.scheduler.cancel(player.disconnectGraceJobId);
      } catch {}
    }

    await ctx.db.patch(player._id, {
      connected: true,
      lastSeenAt: Date.now(),
      leftAt: undefined,
      disconnectGraceJobId: undefined,
    });

    return { gameId: game._id, playerId: player._id, name: player.name };
  },
});

export const leave = mutation({
  args: { gameId: v.id("games"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_session_and_game", (q) =>
        q.eq("sessionId", args.sessionId).eq("gameId", args.gameId),
      )
      .unique();
    if (!player) return null;

    const now = Date.now();
    await ctx.db.patch(player._id, { connected: false, leftAt: now });

    const game = await ctx.db.get(args.gameId);
    if (game?.status === "in_progress") {
      const isCurrentPlayer =
        game.turnOrder[game.currentTurnIndex] === player._id;
      if (isCurrentPlayer) {
        const players = await ctx.db
          .query("players")
          .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
          .take(MAX_PLAYERS);
        const updatedPlayers = players.map((p) =>
          p._id === player._id ? { ...p, connected: false } : p,
        );
        const nextIndex = nextConnectedTurnIndex(
          game.turnOrder,
          game.currentTurnIndex,
          updatedPlayers,
        );
        if (nextIndex !== null) {
          await ctx.db.patch(args.gameId, { currentTurnIndex: nextIndex });
        }
        await scheduleTurnTimer(ctx, args.gameId);
      }
    }

    return null;
  },
});
