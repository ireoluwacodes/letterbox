import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { throwError } from "./lib/errors";
import { scheduleTurnTimer } from "./lib/turn";

export const heartbeat = mutation({
  args: {
    gameId: v.id("games"),
    sessionId: v.string(),
    role: v.union(v.literal("host"), v.literal("player")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    if (args.role === "host") {
      // Host path reads + writes games — kept isolated so player heartbeats
      // never touch this document and can't conflict with it.
      const game = await ctx.db.get(args.gameId);
      if (!game) return null;
      if (game.hostSessionId !== args.sessionId)
        throwError("NOT_HOST", "Only the host can send host heartbeats");

      const wasPausedDueToHost =
        game.status === "paused" && game.pauseReason === "host_disconnected";

      await ctx.db.patch(args.gameId, { hostLastSeenAt: now });

      if (wasPausedDueToHost) {
        await ctx.db.patch(args.gameId, {
          status: "in_progress",
          pauseReason: undefined,
        });
        await scheduleTurnTimer(ctx, args.gameId);
      }
    } else {
      // Player path never reads the games document — only touches the single
      // player row. This eliminates conflicts with anything that writes games
      // (checkPresence, guesses.submit, turn timers, etc.).
      const player = await ctx.db
        .query("players")
        .withIndex("by_session_and_game", (q) =>
          q.eq("sessionId", args.sessionId).eq("gameId", args.gameId),
        )
        .unique();
      if (!player) return null;

      await ctx.db.patch(player._id, { lastSeenAt: now, connected: true });
    }

    return null;
  },
});
