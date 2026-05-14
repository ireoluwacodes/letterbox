import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery } from "convex/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import type { TLastGuess } from "@/shared/schemas"
import { BrutalButton } from "@/components/BrutalButton"
import { HostUnmaskedStrip } from "@/components/HostUnmaskedStrip"
import { KeyboardGrid } from "@/components/KeyboardGrid"
import { LastGuesses } from "@/components/LastGuesses"
import { MaskedWord } from "@/components/MaskedWord"
import { Scoreboard } from "@/components/Scoreboard"
import { Timer } from "@/components/Timer"
import { TurnPanel } from "@/components/TurnPanel"
import { useCountdown } from "@/hooks/useCountdown"
import { useKeyboardInput } from "@/hooks/useKeyboardInput"
import { usePresence } from "@/hooks/usePresence"
import { clearSocketSession } from "@/lib/socketSession"
import { getConvexErrorMessage } from "@/lib/convexErrors"
import { gameViewToGameState } from "@/lib/convexViewMapper"
import { getSessionId } from "@/lib/session"
import { useToastStore } from "@/stores/toastStore"

export const Route = createFileRoute("/play/$gameId")({
  component: PlayPage,
})

function PlayPage() {
  const { gameId } = Route.useParams()
  const navigate = useNavigate()
  const sessionId = getSessionId()

  const raw = useQuery(api.games.getGameView, {
    gameId: gameId as Id<"games">,
    sessionId,
  })

  const completedCats = useQuery(api.games.getCompletedCategories, {
    gameId: gameId as Id<"games">,
  })

  const submitGuess = useMutation(api.guesses.submit)
  const endGame = useMutation(api.games.endGame)
  const rejoin = useMutation(api.players.rejoin)
  const didRejoin = useRef(false)

  useEffect(() => {
    if (didRejoin.current) return
    didRejoin.current = true
    void rejoin({ gameId: gameId as Id<"games">, sessionId })
  }, [gameId, sessionId, rejoin])

  const game = raw != null ? gameViewToGameState(raw) : null
  const youHost = raw?.viewerRole === "host"
  const youId =
    raw?.viewerPlayerId != null ? String(raw.viewerPlayerId) : null

  usePresence(gameId, youHost ? "host" : youId != null ? "player" : null)

  const lastGuesses: Array<TLastGuess> = useMemo(() => {
    const list = raw?.recentGuesses ?? []
    const mapped = list.map((g) => ({
      playerName: g.playerName,
      letter: g.letter.toLowerCase(),
      points: g.hits > 0 ? g.pointsAwarded : ("miss" as const),
    }))
    return [...mapped].reverse()
  }, [raw?.recentGuesses])

  const [flashingIndices, setFlashingIndices] = useState(() => new Set<number>())

  const guessSigRef = useRef<string>("")
  const guessMountedRef = useRef(false)
  const completedLenRef = useRef<number | null>(null)
  const pausedRef = useRef(false)

  useEffect(() => {
    if (raw == null) return
    if (raw.status === "lobby") {
      void navigate({ to: "/lobby/$gameId", params: { gameId } })
    }
    if (raw.status === "finished") {
      clearSocketSession()
      void navigate({ to: "/over/$gameId", params: { gameId } })
    }
  }, [raw?.status, gameId, navigate, raw])

  useEffect(() => {
    if (raw == null) return
    const first = raw.recentGuesses.at(0)
    const sig =
      first != null
        ? `${first.at}:${first.letter}:${first.playerName}`
        : ""
    if (!guessMountedRef.current) {
      guessMountedRef.current = true
      guessSigRef.current = sig
      return
    }
    if (sig !== "" && sig !== guessSigRef.current && first != null) {
      guessSigRef.current = sig
      const toast = useToastStore.getState()
      const name = first.playerName.toLowerCase()
      if (first.hits > 0) {
        toast.push(
          `${name} +${first.pointsAwarded} for "${first.letter.toLowerCase()}"`,
          1500,
        )
      } else {
        toast.push(`${name} missed "${first.letter.toLowerCase()}"`, 1500)
      }
    }
  }, [raw?.recentGuesses, raw])

  useEffect(() => {
    if (completedCats == null) return
    const n = completedCats.length
    if (completedLenRef.current === null) {
      completedLenRef.current = n
      return
    }
    if (n > completedLenRef.current) {
      const last = completedCats[completedCats.length - 1]
      if (last.word) {
        useToastStore
          .getState()
          .push(`category complete — ${last.word.toLowerCase()}`, 800)
      }
    }
    completedLenRef.current = n
  }, [completedCats])

  useEffect(() => {
    if (raw == null) return
    if (raw.status === "paused" && !pausedRef.current) {
      pausedRef.current = true
      useToastStore.getState().push("paused — host disconnected", 2000)
    }
    if (raw.status === "in_progress" && pausedRef.current) {
      pausedRef.current = false
      useToastStore.getState().push("resumed", 1200)
    }
  }, [raw?.status, raw])

  const prevRevealedRef = useRef<Array<boolean> | null>(null)
  const prevCategoryOrderRef = useRef<number | null>(null)

  useEffect(() => {
    const order = raw?.currentCategory?.order
    if (order !== prevCategoryOrderRef.current) {
      prevCategoryOrderRef.current = order ?? null
      prevRevealedRef.current = null
    }
  }, [raw?.currentCategory?.order])

  useEffect(() => {
    const rev = raw?.currentCategory?.revealed
    if (rev == null) return
    if (prevRevealedRef.current == null) {
      prevRevealedRef.current = [...rev]
      return
    }
    const prev = prevRevealedRef.current
    const indices: Array<number> = []
    for (let i = 0; i < rev.length; i++) {
      if (rev[i] && !prev[i]) indices.push(i)
    }
    prevRevealedRef.current = [...rev]
    if (indices.length === 0) return
    setFlashingIndices(new Set(indices))
    const t = window.setTimeout(() => setFlashingIndices(new Set()), 400)
    return () => window.clearTimeout(t)
  }, [raw?.currentCategory?.revealed])

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

  const paused = raw?.status === "paused"

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
      void submitGuess({
        gameId: gameId as Id<"games">,
        sessionId,
        letter: L,
      }).catch((e) => {
        useToastStore.getState().push(getConvexErrorMessage(e).toLowerCase(), 2000)
      })
    },
    [yourTurn, letters, submitGuess, gameId, sessionId],
  )

  useKeyboardInput(onGuess, yourTurn && !paused)

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
                void endGame({
                  gameId: gameId as Id<"games">,
                  sessionId,
                }).catch((e) => {
                  useToastStore
                    .getState()
                    .push(getConvexErrorMessage(e).toLowerCase(), 2500)
                })
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
          <MaskedWord slots={masked} flashingIndices={flashingIndices} />
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
