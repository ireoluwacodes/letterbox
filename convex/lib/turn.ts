import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { TURN_TIMEOUT_MS } from "./constants";

export function nextConnectedTurnIndex(
  turnOrder: Id<"players">[],
  fromIndex: number,
  players: Doc<"players">[],
): number | null {
  const playerMap = new Map<Id<"players">, Doc<"players">>(
    players.map((p) => [p._id, p]),
  );
  const n = turnOrder.length;
  for (let i = 1; i < n; i++) {
    const idx = (fromIndex + i) % n;
    const player = playerMap.get(turnOrder[idx]);
    if (player?.connected) return idx;
  }
  return null;
}

export async function scheduleTurnTimer(
  ctx: MutationCtx,
  gameId: Id<"games">,
): Promise<void> {
  const game = await ctx.db.get(gameId);
  if (!game || game.status !== "in_progress") return;

  if (game.turnTimerJobId) {
    try {
      await ctx.scheduler.cancel(game.turnTimerJobId);
    } catch {}
  }

  const jobId = await ctx.scheduler.runAfter(
    TURN_TIMEOUT_MS,
    internal.scheduled.timeoutTurn,
    {
      gameId,
      expectedTurnIndex: game.currentTurnIndex,
      expectedCategoryIndex: game.currentCategoryIndex,
    },
  );

  await ctx.db.patch(gameId, {
    turnDeadline: Date.now() + TURN_TIMEOUT_MS,
    turnTimerJobId: jobId,
  });
}
