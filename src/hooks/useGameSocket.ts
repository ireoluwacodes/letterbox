import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { SOCKET_EVENTS } from "@/shared/socketEvents"
import { useGameStore } from "@/stores/gameStore"
import { useSocketStore } from "@/stores/socketStore"
import { useToastStore } from "@/stores/toastStore"

export function useGameSocket(gameId: string): void {
  const navigate = useNavigate()
  const socket = useSocketStore((s) => s.socket)
  const connected = useSocketStore((s) => s.connected)

  useEffect(() => {
    if (!socket || !connected) return

    socket.on(SOCKET_EVENTS.GAME_STATE, (payload) => {
      useGameStore.getState().setGameState(payload)
    })

    socket.on(SOCKET_EVENTS.GAME_GUESS_RESULT, (payload) => {
      const g = useGameStore.getState().game
      const cat = g ? (g.categories[g.currentCategoryIndex]?.name ?? "?") : "?"
      useGameStore.getState().applyGuessResult(payload, cat)
      const pts =
        payload.outcome === "hit"
          ? (payload.pointsEarned ?? 0)
          : ("miss" as const)
      useGameStore.getState().pushLastGuess({
        playerName: payload.playerName,
        letter: payload.letter.toLowerCase(),
        points: pts,
      })
      const toast = useToastStore.getState()
      if (payload.outcome === "hit") {
        toast.push(
          `${payload.playerName.toLowerCase()} +${payload.pointsEarned ?? 0} for "${payload.letter.toLowerCase()}"`,
          1500
        )
      } else {
        toast.push(
          `${payload.playerName.toLowerCase()} missed "${payload.letter.toLowerCase()}"`,
          1500
        )
      }
    })

    socket.on(SOCKET_EVENTS.GAME_TURN_CHANGED, (payload) => {
      useGameStore.setState((s) =>
        s.game
          ? {
              game: {
                ...s.game,
                currentPlayerId: payload.currentPlayerId,
                turnDeadline: payload.turnDeadline,
              },
            }
          : {}
      )
    })

    socket.on(SOCKET_EVENTS.GAME_TURN_SKIPPED, (payload) => {
      useToastStore
        .getState()
        .push(`${payload.playerName.toLowerCase()} skipped (timeout)`, 1500)
    })

    socket.on(SOCKET_EVENTS.GAME_CATEGORY_COMPLETED, (payload) => {
      useToastStore
        .getState()
        .push(`category complete — ${payload.word.toLowerCase()}`, 800)
      useGameStore.getState().setCategoryCompleteHold(Date.now() + 800)
    })

    socket.on(SOCKET_EVENTS.GAME_NEXT_CATEGORY, () => {
      useGameStore.getState().clearGuessedLetters()
      useGameStore.getState().setCategoryCompleteHold(null)
    })

    socket.on(SOCKET_EVENTS.GAME_FINISHED, () => {
      navigate({ to: "/over/$gameId", params: { gameId } })
    })

    socket.on(SOCKET_EVENTS.GAME_PAUSED, (payload) => {
      useGameStore.getState().setPaused(true, payload.resumeDeadline ?? null)
    })

    socket.on(SOCKET_EVENTS.GAME_RESUMED, () => {
      useGameStore.getState().setPaused(false, null)
    })

    socket.on(SOCKET_EVENTS.GAME_ERROR, (payload) => {
      useToastStore.getState().push(payload.message.toLowerCase(), 3000)
      if (payload.fatal) {
        navigate({ to: "/" })
      }
    })

    return () => {
      socket.off(SOCKET_EVENTS.GAME_STATE)
      socket.off(SOCKET_EVENTS.GAME_GUESS_RESULT)
      socket.off(SOCKET_EVENTS.GAME_TURN_CHANGED)
      socket.off(SOCKET_EVENTS.GAME_TURN_SKIPPED)
      socket.off(SOCKET_EVENTS.GAME_CATEGORY_COMPLETED)
      socket.off(SOCKET_EVENTS.GAME_NEXT_CATEGORY)
      socket.off(SOCKET_EVENTS.GAME_FINISHED)
      socket.off(SOCKET_EVENTS.GAME_PAUSED)
      socket.off(SOCKET_EVENTS.GAME_RESUMED)
      socket.off(SOCKET_EVENTS.GAME_ERROR)
    }
  }, [socket, connected, navigate, gameId])
}
