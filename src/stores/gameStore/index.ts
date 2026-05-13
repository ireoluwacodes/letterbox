import { create } from "zustand"

import type { TGameState, TGuessResult } from "@/shared/schemas"

import type { IGameStoreState, TGameStore, TLastGuess } from "./@types"

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
}

function trimGuesses(list: Array<TLastGuess>): Array<TLastGuess> {
  return list.slice(-5)
}

export const useGameStore = create<TGameStore>((set, get) => ({
  ...initial,

  setGameState: (game: TGameState) =>
    set((s) => ({
      game,
      youArePlayerId:
        game.selfPlayerId !== undefined ? game.selfPlayerId : s.youArePlayerId,
      youAreHost:
        game.selfPlayerId != null
          ? Boolean(
              game.players.find((p) => p.id === game.selfPlayerId && p.isHost)
            )
          : s.youAreHost,
    })),

  setIdentity: (youArePlayerId, youAreHost) =>
    set({ youArePlayerId, youAreHost }),

  reset: () => set({ ...initial, flashingIndices: new Set() }),

  applyGuessResult: (result: TGuessResult, categoryName: string) => {
    const { guessHistoryByCategory } = get()
    const pid = result.playerId
    const prevPlayer = guessHistoryByCategory[pid] ?? {}
    let nextCat = { ...prevPlayer }

    if (result.outcome === "hit" && result.pointsEarned != null) {
      nextCat = {
        ...nextCat,
        [categoryName]: (nextCat[categoryName] ?? 0) + result.pointsEarned,
      }
    }

    const nextHistory = {
      ...guessHistoryByCategory,
      [pid]: nextCat,
    }

    set((s) => {
      const nextFlash = new Set(s.flashingIndices)
      if (result.revealedIndices?.length) {
        for (const i of result.revealedIndices) nextFlash.add(i)
      }
      const g = s.game
      return {
        guessHistoryByCategory: nextHistory,
        flashingIndices: nextFlash,
        game: g
          ? {
              ...g,
              letterGuessState: {
                ...g.letterGuessState,
                [result.letter.toUpperCase()]: result.outcome,
              },
            }
          : null,
      }
    })

    if (result.revealedIndices?.length) {
      const indices = result.revealedIndices
      setTimeout(() => {
        set((s) => {
          const next = new Set(s.flashingIndices)
          for (const i of indices) next.delete(i)
          return { flashingIndices: next }
        })
      }, 80)
    }
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
}))
