import { create } from "zustand"

import type { TPublicGame } from "@/shared/apiTypes"
import type { TGuessResult } from "@/shared/schemas"

import type { IGameStoreState, TGameStore, TLastGuess } from "./@types"
import { publicGameToGameState } from "@/lib/publicGameAdapter"

const initial: IGameStoreState = {
  game: null,
  lastGuesses: [],
  youArePlayerId: null,
  youAreHost: false,
  guessHistoryByCategory: {},
  flashingIndices: new Set(),
  pausedOverlay: false,
  pauseCountdownMs: null,
  categoryCompleteHoldUntil: null,
  finishedEvent: null,
}

function trimGuesses(list: Array<TLastGuess>): Array<TLastGuess> {
  return list.slice(-5)
}

export const useGameStore = create<TGameStore>((set, get) => ({
  ...initial,

  setGameStateFromServer: (publicGame: TPublicGame) =>
    set((s) => {
      let nextYouId = s.youArePlayerId
      if (nextYouId == null && s.youAreHost) {
        const hostFromServer =
          publicGame.hostId ?? publicGame.hostPlayerId
        if (hostFromServer != null && hostFromServer !== "") {
          nextYouId = hostFromServer
        } else if (publicGame.players.length === 1) {
          nextYouId = publicGame.players[0]?.id ?? null
        }
      }
      const game = publicGameToGameState(publicGame, {
        youArePlayerId: nextYouId,
        youAreHost: s.youAreHost,
      })
      return {
        game,
        youArePlayerId: nextYouId,
      }
    }),

  setIdentity: (youArePlayerId, youAreHost) =>
    set({ youArePlayerId, youAreHost }),

  reset: () => set({ ...initial, flashingIndices: new Set() }),

  applyGuessResult: (result: TGuessResult, categoryName: string) => {
    const { guessHistoryByCategory } = get()
    const pid = result.playerId
    const prevPlayer = guessHistoryByCategory[pid] ?? {}
    let nextCat = { ...prevPlayer }

    const isHit = result.hits > 0
    const pointsEarned = result.pointsAwarded
    if (isHit && pointsEarned > 0) {
      nextCat = {
        ...nextCat,
        [categoryName]: (nextCat[categoryName] ?? 0) + pointsEarned,
      }
    }

    const nextHistory = {
      ...guessHistoryByCategory,
      [pid]: nextCat,
    }

    set((s) => {
      const g = s.game
      return {
        guessHistoryByCategory: nextHistory,
        game: g
          ? {
              ...g,
              letterGuessState: {
                ...g.letterGuessState,
                [result.letter.toUpperCase()]: isHit ? "hit" : "miss",
              },
            }
          : null,
      }
    })
  },

  pushLastGuess: (guess) =>
    set((s) => ({
      lastGuesses: trimGuesses([...s.lastGuesses, guess]),
    })),

  setFlashingIndices: (indices) =>
    set(() => ({
      flashingIndices: new Set(indices),
    })),

  clearFlash: (index) =>
    set((s) => {
      const next = new Set(s.flashingIndices)
      next.delete(index)
      return { flashingIndices: next }
    }),

  setPaused: (pausedOverlay, resumeDeadline = null) =>
    set({
      pausedOverlay,
      pauseCountdownMs: resumeDeadline,
    }),

  setCategoryCompleteHold: (until) => set({ categoryCompleteHoldUntil: until }),

  clearGuessedLetters: () =>
    set((s) =>
      s.game
        ? {
            game: {
              ...s.game,
              letterGuessState: {},
            },
          }
        : {}
    ),

  setFinishedEvent: (payload) =>
    set((s) => {
      if (payload == null) {
        return { finishedEvent: null }
      }
      const g = s.game
      if (g == null) {
        return { finishedEvent: payload }
      }
      const byId = new Map(payload.finalScores.map((p) => [p.id, p]))
      const players = g.players.map((p) => {
        const fs = byId.get(p.id)
        if (fs == null) return p
        return {
          ...p,
          score: fs.score,
          connected: fs.connected,
        }
      })
      return {
        finishedEvent: payload,
        game: {
          ...g,
          status: "finished",
          players,
        },
      }
    }),

  setHostLobbyFromCreateAck: (input) =>
    set(() => ({
      game: {
        gameId: input.gameId,
        inviteCode: input.inviteCode,
        status: "lobby",
        pointsPerLetter: input.pointsPerLetter,
        players: [],
        categories: input.categoryNames.map((name) => ({ name })),
        currentCategoryIndex: 0,
        turnOrder: [],
        currentPlayerId: null,
        turnDeadline: null,
      },
    })),
}))
