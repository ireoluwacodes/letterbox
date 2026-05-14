import type { Doc, Id } from "../_generated/dataModel";
import { maskWord } from "./word";

export type PlayerView = {
  id: Id<"players">;
  name: string;
  score: number;
  connected: boolean;
};

export type CategoryView = {
  id: Id<"categories">;
  name: string;
  order: number;
  totalCategories: number;
  wordLength: number;
  maskedWord: string;
  revealed: boolean[];
  guessedLetters: string[];
  word: string | null;
};

export type GuessView = {
  playerName: string;
  letter: string;
  hits: number;
  pointsAwarded: number;
  at: number;
};

export type FinalScore = {
  playerId: Id<"players">;
  name: string;
  score: number;
};

export type GameView = {
  id: Id<"games">;
  inviteCode: string;
  status: string;
  pointsPerLetter: number;
  viewerRole: "host" | "player" | "spectator";
  viewerPlayerId: Id<"players"> | null;
  hostName: string;
  hostConnected: boolean;
  players: PlayerView[];
  currentCategory: CategoryView | null;
  turnOrder: Id<"players">[] | null;
  currentPlayerId: Id<"players"> | null;
  nextPlayerId: Id<"players"> | null;
  turnDeadline: number | undefined;
  recentGuesses: GuessView[];
  finalScores: FinalScore[] | null;
  winners: string[] | null;
  tied: boolean | null;
};

export function buildGameView(
  game: Doc<"games">,
  categories: Doc<"categories">[],
  players: Doc<"players">[],
  recentGuesses: Doc<"guesses">[],
  hostConnected: boolean,
  viewerSessionId: string,
): GameView {
  const viewerPlayer = players.find((p) => p.sessionId === viewerSessionId);
  const viewerRole: "host" | "player" | "spectator" =
    game.hostSessionId === viewerSessionId
      ? "host"
      : viewerPlayer !== undefined
        ? "player"
        : "spectator";

  const isFinished = game.status === "finished";
  const isActive =
    game.status === "in_progress" || game.status === "paused";

  const visiblePlayers: PlayerView[] = players
    .filter((p) => isFinished || !p.leftAt)
    .map((p) => ({
      id: p._id,
      name: p.name,
      score: p.score,
      connected: p.connected,
    }));

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  const currentCat = sortedCategories[game.currentCategoryIndex] ?? null;

  let currentCategory: CategoryView | null = null;
  if (currentCat && !isFinished) {
    currentCategory = {
      id: currentCat._id,
      name: currentCat.name,
      order: currentCat.order,
      totalCategories: categories.length,
      wordLength: currentCat.wordLength,
      maskedWord: maskWord(currentCat.word, currentCat.revealed),
      revealed: currentCat.revealed,
      guessedLetters: currentCat.guessedLetters,
      word: viewerRole === "host" ? currentCat.word : null,
    };
  } else if (currentCat && isFinished) {
    currentCategory = {
      id: currentCat._id,
      name: currentCat.name,
      order: currentCat.order,
      totalCategories: categories.length,
      wordLength: currentCat.wordLength,
      maskedWord: maskWord(currentCat.word, currentCat.revealed),
      revealed: currentCat.revealed,
      guessedLetters: currentCat.guessedLetters,
      word: currentCat.word,
    };
  }

  const turnOrder = isActive ? game.turnOrder : null;
  const currentPlayerId =
    isActive && game.turnOrder.length > 0
      ? (game.turnOrder[game.currentTurnIndex] ?? null)
      : null;
  const nextTurnIndex =
    isActive && game.turnOrder.length > 0
      ? (game.currentTurnIndex + 1) % game.turnOrder.length
      : null;
  const nextPlayerId =
    nextTurnIndex !== null ? (game.turnOrder[nextTurnIndex] ?? null) : null;

  let finalScores: FinalScore[] | null = null;
  let winners: string[] | null = null;
  let tied: boolean | null = null;

  if (isFinished) {
    const sorted = [...players]
      .sort((a, b) => b.score - a.score)
      .map((p) => ({ playerId: p._id, name: p.name, score: p.score }));
    finalScores = sorted;
    const topScore = sorted[0]?.score ?? 0;
    const topPlayers = sorted.filter((p) => p.score === topScore);
    winners = topPlayers.map((p) => p.name);
    tied = topPlayers.length > 1;
  }

  return {
    id: game._id,
    inviteCode: game.inviteCode,
    status: game.status,
    pointsPerLetter: game.pointsPerLetter,
    viewerRole,
    viewerPlayerId: viewerPlayer?._id ?? null,
    hostName: game.hostName,
    hostConnected,
    players: visiblePlayers,
    currentCategory,
    turnOrder,
    currentPlayerId,
    nextPlayerId,
    turnDeadline: game.turnDeadline,
    recentGuesses: recentGuesses.map((g) => ({
      playerName: g.playerName,
      letter: g.letter,
      hits: g.hits,
      pointsAwarded: g.pointsAwarded,
      at: g.at,
    })),
    finalScores,
    winners,
    tied,
  };
}
