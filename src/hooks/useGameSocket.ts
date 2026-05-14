import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { clearSocketSession } from "@/lib/socketSession"
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

    /** Letter outcome only (keyboard, last guesses, toasts). Turn UI must follow `game:turn_changed`, not hits/miss here. */
    socket.on(SOCKET_EVENTS.GAME_GUESS_RESULT, (payload) => {
      const g = useGameStore.getState().game
      const cat = g ? (g.categories[g.currentCategoryIndex]?.name ?? "?") : "?"
      useGameStore.getState().applyGuessResult(payload, cat)
      const name =
        g?.players.find((p) => p.id === payload.playerId)?.name ?? "player"
      const pts =
        payload.hits > 0 ? payload.pointsAwarded : ("miss" as const)
      useGameStore.getState().pushLastGuess({
        playerName: name,
        letter: payload.letter.toLowerCase(),
        points: pts,
      })
      const toast = useToastStore.getState()
      if (payload.hits > 0) {
        toast.push(
          `${name.toLowerCase()} +${payload.pointsAwarded} for "${payload.letter.toLowerCase()}"`,
          1500
        )
      } else {
        toast.push(
          `${name.toLowerCase()} missed "${payload.letter.toLowerCase()}"`,
          1500
        )
      }
    })

    /** Current guesser + deadline after each guess (hit or miss). */
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
      const g = useGameStore.getState().game
      const name =
        g?.players.find((p) => p.id === payload.playerId)?.name ?? "player"
      const reason =
        payload.reason === "disconnected" ? "disconnected" : "timeout"
      useToastStore
        .getState()
        .push(`${name.toLowerCase()} skipped (${reason})`, 1500)
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

    /** `game:finished` then authoritative `game:state` with `status: finished` may follow; both update the store. */
    socket.on(SOCKET_EVENTS.GAME_FINISHED, (payload) => {
      useGameStore.getState().setFinishedEvent(payload)
      clearSocketSession()
      navigate({ to: "/over/$gameId", params: { gameId } })
    })

    socket.on(SOCKET_EVENTS.GAME_PAUSED, () => {
      useGameStore.getState().setPaused(true, null)
    })

    socket.on(SOCKET_EVENTS.GAME_RESUMED, () => {
      useGameStore.getState().setPaused(false, null)
    })

    return () => {
      socket.off(SOCKET_EVENTS.GAME_GUESS_RESULT)
      socket.off(SOCKET_EVENTS.GAME_TURN_CHANGED)
      socket.off(SOCKET_EVENTS.GAME_TURN_SKIPPED)
      socket.off(SOCKET_EVENTS.GAME_CATEGORY_COMPLETED)
      socket.off(SOCKET_EVENTS.GAME_NEXT_CATEGORY)
      socket.off(SOCKET_EVENTS.GAME_FINISHED)
      socket.off(SOCKET_EVENTS.GAME_PAUSED)
      socket.off(SOCKET_EVENTS.GAME_RESUMED)
    }
  }, [socket, connected, navigate, gameId])
}
