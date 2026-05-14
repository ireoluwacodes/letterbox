import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { throwError } from "./lib/errors";
import { parseOrFail, GuessInput } from "./lib/validation";
import { MAX_PLAYERS, MAX_CATEGORIES, GUESS_MIN_INTERVAL_MS } from "./lib/constants";
import {
  countOccurrences,
  applyReveal,
  isFullyRevealed,
} from "./lib/word";
import { scheduleTurnTimer, nextConnectedTurnIndex } from "./lib/turn";

export const submit = mutation({
  args: {
    gameId: v.id("games"),
    sessionId: v.string(),
    letter: v.string(),
  },
  handler: async (ctx, args) => {
    parseOrFail(GuessInput, args);
    const letter = args.letter.toUpperCase();

    const game = await ctx.db.get(args.gameId);
    if (!game) throwError("GAME_NOT_FOUND", "Game not found");
    if (game.status !== "in_progress")
      throwError("GAME_NOT_IN_PROGRESS", "Game is not in progress");

    const currentPlayerId = game.turnOrder[game.currentTurnIndex];
    if (!currentPlayerId) throwError("NOT_YOUR_TURN", "No current player");

    const player = await ctx.db.get(currentPlayerId);
    if (!player) throwError("PLAYER_NOT_FOUND", "Player not found");
    if (player.sessionId !== args.sessionId)
      throwError("NOT_YOUR_TURN", "It is not your turn");

    const now = Date.now();
    if (
      player.lastGuessAt !== undefined &&
      now - player.lastGuessAt < GUESS_MIN_INTERVAL_MS
    ) {
      throwError("RATE_LIMITED", "Please wait before guessing again");
    }

    const category = await ctx.db
      .query("categories")
      .withIndex("by_game_and_order", (q) =>
        q.eq("gameId", args.gameId).eq("order", game.currentCategoryIndex),
      )
      .unique();
    if (!category || category.completedAt !== undefined)
      throwError("GAME_NOT_IN_PROGRESS", "Current category is not available");

    if (category.guessedLetters.includes(letter))
      throwError("LETTER_ALREADY_GUESSED", "That letter has already been guessed");

    if (game.turnTimerJobId) {
      try {
        await ctx.scheduler.cancel(game.turnTimerJobId);
      } catch {}
    }

    const hits = countOccurrences(category.word, letter);
    const newRevealed = applyReveal(category.word, category.revealed, letter);
    const pointsAwarded = hits * game.pointsPerLetter;

    await ctx.db.patch(category._id, {
      revealed: newRevealed,
      guessedLetters: [...category.guessedLetters, letter],
    });

    await ctx.db.patch(player._id, {
      lastGuessAt: now,
      score: hits > 0 ? player.score + pointsAwarded : player.score,
    });

    await ctx.db.insert("guesses", {
      gameId: args.gameId,
      categoryId: category._id,
      playerId: player._id,
      playerName: player.name,
      letter,
      hits,
      pointsAwarded,
      at: now,
    });

    const categoryCompleted = isFullyRevealed(category.word, newRevealed);

    if (categoryCompleted) {
      await ctx.db.patch(category._id, { completedAt: now });

      const allCategories = await ctx.db
        .query("categories")
        .withIndex("by_game_and_order", (q) => q.eq("gameId", args.gameId))
        .take(MAX_CATEGORIES);

      const gameFinished =
        game.currentCategoryIndex + 1 >= allCategories.length;

      if (gameFinished) {
        await ctx.db.patch(args.gameId, {
          status: "finished",
          finishedAt: now,
          turnDeadline: undefined,
          turnTimerJobId: undefined,
        });
        return { hits, pointsAwarded, categoryCompleted: true, gameFinished: true };
      }

      const allPlayers = await ctx.db
        .query("players")
        .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
        .take(MAX_PLAYERS);
      const nextTurnIndex = nextConnectedTurnIndex(
        game.turnOrder,
        game.currentTurnIndex,
        allPlayers,
      );
      await ctx.db.patch(args.gameId, {
        currentCategoryIndex: game.currentCategoryIndex + 1,
        currentTurnIndex: nextTurnIndex ?? game.currentTurnIndex,
        turnTimerJobId: undefined,
      });
      await scheduleTurnTimer(ctx, args.gameId);
      return { hits, pointsAwarded, categoryCompleted: true, gameFinished: false };
    }

    const allPlayers = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .take(MAX_PLAYERS);
    const nextTurnIndex = nextConnectedTurnIndex(
      game.turnOrder,
      game.currentTurnIndex,
      allPlayers,
    );
    if (nextTurnIndex !== null) {
      await ctx.db.patch(args.gameId, {
        currentTurnIndex: nextTurnIndex,
        turnTimerJobId: undefined,
      });
    }
    await scheduleTurnTimer(ctx, args.gameId);
    return { hits, pointsAwarded, categoryCompleted: false, gameFinished: false };
  },
});
