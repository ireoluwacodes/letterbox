import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useLayoutEffect } from "react"

import type { TSocketAckVoid } from "@/shared/socketEvents"
import { BrutalButton } from "@/components/BrutalButton"
import { HostUnmaskedStrip } from "@/components/HostUnmaskedStrip"
import { KeyboardGrid } from "@/components/KeyboardGrid"
import { LastGuesses } from "@/components/LastGuesses"
import { MaskedWord } from "@/components/MaskedWord"
import { Scoreboard } from "@/components/Scoreboard"
import { Timer } from "@/components/Timer"
import { TurnPanel } from "@/components/TurnPanel"
import { useGameSocket } from "@/hooks/useGameSocket"
import { useKeyboardInput } from "@/hooks/useKeyboardInput"
import { useRecoverSocketSessionForRoute } from "@/hooks/useRecoverSocketSessionForRoute"
import { useCountdown } from "@/hooks/useCountdown"
import { SOCKET_EVENTS } from "@/shared/socketEvents"
import { useGameStore } from "@/stores/gameStore"
import { useSocketStore } from "@/stores/socketStore"
import { useToastStore } from "@/stores/toastStore"

export const Route = createFileRoute("/play/$gameId")({
  component: PlayPage,
})

function PlayPage() {
  const { gameId } = Route.useParams()
  const navigate = useNavigate()
  const game = useGameStore((s) => s.game)
  const youId = useGameStore((s) => s.youArePlayerId)
  const youHost = useGameStore((s) => s.youAreHost)
  const lastGuesses = useGameStore((s) => s.lastGuesses)
  const flashing = useGameStore((s) => s.flashingIndices)
  const paused = useGameStore((s) => s.pausedOverlay)
  const emit = useSocketStore((s) => s.emit)

  useLayoutEffect(() => {
    useSocketStore.getState().connect()
  }, [])

  useGameSocket(gameId)
  useRecoverSocketSessionForRoute(gameId)

  useEffect(() => {
    if (game?.status === "finished") {
      void navigate({ to: "/over/$gameId", params: { gameId } })
    }
    if (game?.status === "lobby") {
      void navigate({ to: "/lobby/$gameId", params: { gameId } })
    }
  }, [game?.status, gameId, navigate])

  const deadline = game?.turnDeadline ?? null
  const remaining = useCountdown(deadline)

  const catName = game
    ? game.categories[game.currentCategoryIndex]?.name
    : undefined
  const masked = game?.maskedSlots ?? []
  const letters = game?.letterGuessState ?? {}

  const currentSpeakerName = game
    ? (game.players.find((p) => p.id === game.currentPlayerId)?.name ??
      "player")
    : "player"

  const yourTurn =
    Boolean(youId) &&
    game != null &&
    game.currentPlayerId === youId &&
    game.status === "playing" &&
    !youHost

  const onGuess = useCallback(
    (letter: string) => {
      if (!yourTurn) return
      const L = letter.toUpperCase()
      if (Object.hasOwn(letters, L)) return
      emit(SOCKET_EVENTS.PLAYER_GUESS, { gameId, letter: L }, (res: TSocketAckVoid) => {
        if (!res.ok) {
          useToastStore.getState().push(res.message.toLowerCase(), 2000)
        }
      })
    },
    [emit, gameId, letters, yourTurn]
  )

  useKeyboardInput(onGuess, yourTurn)

  const catNum = (game?.currentCategoryIndex ?? 0) + 1
  const catTotal = game?.categories.length ?? 0

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b-[3px] border-foreground pb-4">
        <div>
          <p className="font-mono text-sm font-bold">
            category [{catNum}/{catTotal}]
          </p>
          <p className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-[-0.02em]">
            {(catName ?? "").toLowerCase()}
          </p>
        </div>
        <div className="flex items-start gap-4">
          <Timer remainingMs={remaining} />
          {youHost ? (
            <BrutalButton
              type="button"
              size="brutal-sm"
              onClick={() => {
                const gid = game?.gameId ?? gameId
                emit(
                  SOCKET_EVENTS.HOST_END_GAME,
                  { gameId: gid },
                  (res: TSocketAckVoid) => {
                    if (!res.ok) {
                      useToastStore
                        .getState()
                        .push(res.message.toLowerCase(), 2500)
                    }
                  }
                )
              }}
            >
              end game
            </BrutalButton>
          ) : null}
        </div>
      </header>

      {youHost && game?.hostWord ? (
        <HostUnmaskedStrip maskedSlots={masked} hostPhrase={game.hostWord} />
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-4 lg:gap-6">
        <div className="lg:col-span-1">
          <TurnPanel
            players={game?.players ?? []}
            turnOrder={game?.turnOrder ?? []}
            currentPlayerId={game?.currentPlayerId ?? null}
            youArePlayerId={youId}
          />
          <LastGuesses guesses={lastGuesses} />
        </div>

        <div className="flex flex-col items-center gap-6 lg:col-span-2">
          <MaskedWord slots={masked} flashingIndices={flashing} />
          {!youHost ? (
            <KeyboardGrid
              letterGuessState={letters}
              disabled={!yourTurn || paused}
              onLetter={onGuess}
            />
          ) : null}
          <p className="text-[14px] font-bold">
            {youHost
              ? `waiting for ${currentSpeakerName.toLowerCase()}.`
              : yourTurn
                ? "your turn. pick a letter."
                : `waiting for ${currentSpeakerName.toLowerCase()}.`}
          </p>
        </div>

        <div className="lg:col-span-1">
          <Scoreboard
            players={game?.players ?? []}
            currentPlayerId={game?.currentPlayerId ?? null}
            youArePlayerId={youId}
          />
        </div>
      </div>
    </div>
  )
}
