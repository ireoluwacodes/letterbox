import { describe, expect, it } from "vitest"

import { useGameStore } from "./index"
import type { TPublicGame } from "@/shared/apiTypes"
import type { TGuessResult } from "@/shared/schemas"


function lobbyGame(overrides: Partial<TPublicGame> = {}): TPublicGame {
  return {
    id: "g1",
    inviteCode: "ABC123",
    status: "in_progress",
    pointsPerLetter: 5,
    categories: [
      {
        id: "c1",
        name: "Animal",
        revealed: [],
        guessedLetters: [],
        maskedWord: "_ _ _ _ _",
      },
    ],
    currentCategoryIndex: 0,
    players: [
      {
        id: "p1",
        name: "One",
        score: 0,
        connected: true,
        joinedAt: 0,
      },
    ],
    turnOrder: ["p1"],
    currentTurnIndex: 0,
    turnDeadline: null,
    createdAt: 0,
    ...overrides,
  }
}

describe("gameStore", () => {
  it("pushLastGuess keeps last five entries", () => {
    useGameStore.getState().reset()
    for (let i = 0; i < 7; i++) {
      useGameStore.getState().pushLastGuess({
        playerName: `P${i}`,
        letter: "a",
        points: 1,
      })
    }
    expect(useGameStore.getState().lastGuesses).toHaveLength(5)
    expect(useGameStore.getState().lastGuesses[0]?.playerName).toBe("P2")
    expect(useGameStore.getState().lastGuesses[4]?.playerName).toBe("P6")
  })

  it("applyGuessResult adds category points on hit", () => {
    useGameStore.getState().reset()
    useGameStore.getState().setIdentity("p1", false)
    useGameStore.getState().setGameStateFromServer(lobbyGame())

    const result: TGuessResult = {
      playerId: "p1",
      letter: "A",
      hits: 2,
      pointsAwarded: 10,
    }

    useGameStore.getState().applyGuessResult(result, "Animal")

    expect(useGameStore.getState().guessHistoryByCategory.p1.Animal).toBe(10)
  })

  it("setFinishedEvent marks game finished and merges final scores", () => {
    useGameStore.getState().reset()
    useGameStore.getState().setIdentity("p1", false)
    useGameStore.getState().setGameStateFromServer(lobbyGame())

    useGameStore.getState().setFinishedEvent({
      finalScores: [
        {
          id: "p1",
          name: "One",
          score: 42,
          connected: true,
          joinedAt: 0,
        },
      ],
      tied: false,
    })

    const g = useGameStore.getState().game
    expect(g?.status).toBe("finished")
    expect(g?.players[0]?.score).toBe(42)
    expect(useGameStore.getState().finishedEvent?.tied).toBe(false)
  })

  it("host self id uses hostId from state, not first player in list", () => {
    useGameStore.getState().reset()
    useGameStore.getState().setIdentity(null, true)
    const g = lobbyGame({
      hostId: "h1",
      players: [
        {
          id: "pGuest",
          name: "Guest",
          score: 0,
          connected: true,
          joinedAt: 1,
        },
        {
          id: "h1",
          name: "Host",
          score: 0,
          connected: true,
          joinedAt: 0,
        },
      ],
      turnOrder: ["pGuest", "h1"],
      currentTurnIndex: 0,
    })
    useGameStore.getState().setGameStateFromServer(g)

    expect(useGameStore.getState().youArePlayerId).toBe("h1")
    const hostRows = useGameStore.getState().game?.players.filter((p) => p.isHost)
    expect(hostRows).toHaveLength(1)
    expect(hostRows?.[0]?.id).toBe("h1")
  })
})
