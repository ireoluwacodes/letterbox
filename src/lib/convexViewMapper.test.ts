import { describe, expect, it } from "vitest"

import type { Id } from "../../convex/_generated/dataModel"
import type { GameView } from "../../convex/lib/sanitize"
import { countJoinedPlayersForLobby, gameViewToGameState } from "@/lib/convexViewMapper"
import { LETTERBOX_HOST_ROW_ID } from "@/lib/convexViewMapperTypes"

function minimalView(overrides: Partial<GameView> = {}): GameView {
  const base: GameView = {
    id: "jx7aaaaaaaaaaaaaaaa" as Id<"games">,
    inviteCode: "ABCDEF",
    status: "lobby",
    pointsPerLetter: 5,
    viewerRole: "host",
    viewerPlayerId: null,
    hostName: "pat",
    hostConnected: true,
    players: [],
    currentCategory: {
      id: "k97aaaaaaaaaaaaaaaa" as Id<"categories">,
      name: "animal",
      order: 0,
      totalCategories: 2,
      wordLength: 3,
      maskedWord: "_ _ _",
      revealed: [false, false, false],
      guessedLetters: [],
      word: "CAT",
    },
    turnOrder: null,
    currentPlayerId: null,
    nextPlayerId: null,
    turnDeadline: undefined,
    recentGuesses: [],
    finalScores: null,
    winners: null,
    tied: null,
  }
  return { ...base, ...overrides }
}

describe("gameViewToGameState", () => {
  it("maps in_progress to playing", () => {
    const g = gameViewToGameState(
      minimalView({
        status: "in_progress",
        turnOrder: [],
        currentPlayerId: null,
      }),
    )
    expect(g.status).toBe("playing")
  })

  it("prepends a synthetic host row", () => {
    const g = gameViewToGameState(minimalView())
    expect(g.players[0]?.id).toBe(LETTERBOX_HOST_ROW_ID)
    expect(g.players[0]?.isHost).toBe(true)
  })
})

describe("countJoinedPlayersForLobby", () => {
  it("excludes the synthetic host row", () => {
    const g = gameViewToGameState(minimalView())
    expect(countJoinedPlayersForLobby(g.players)).toBe(0)
  })
})
