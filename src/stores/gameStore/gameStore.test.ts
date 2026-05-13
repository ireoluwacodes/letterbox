import { describe, expect, it } from "vitest"

import { useGameStore } from "./index"
import type { TGuessResult } from "@/shared/schemas"

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
    useGameStore.getState().setGameState({
      gameId: "g1",
      inviteCode: "ABC123",
      status: "playing",
      pointsPerLetter: 5,
      players: [
        {
          id: "p1",
          name: "One",
          score: 0,
          connected: true,
        },
      ],
      categories: [{ name: "Animal" }],
      currentCategoryIndex: 0,
      currentPlayerId: "p1",
      turnDeadline: null,
    })

    const result: TGuessResult = {
      playerId: "p1",
      playerName: "One",
      letter: "A",
      outcome: "hit",
      pointsEarned: 10,
    }

    useGameStore.getState().applyGuessResult(result, "Animal")

    expect(useGameStore.getState().guessHistoryByCategory.p1.Animal).toBe(10)
  })
})
