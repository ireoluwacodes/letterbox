import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useLayoutEffect, useMemo } from "react"

import { BrutalButton } from "@/components/BrutalButton"
import { BrutalCard } from "@/components/BrutalCard"
import { EmptyState } from "@/components/EmptyState"
import { Scoreboard } from "@/components/Scoreboard"
import { REPLAY_SESSION_KEY } from "@/lib/constants"
import { useGameSocket } from "@/hooks/useGameSocket"
import { useRecoverSocketSessionForRoute } from "@/hooks/useRecoverSocketSessionForRoute"
import { useGameStore } from "@/stores/gameStore"
import { useSocketStore } from "@/stores/socketStore"

export const Route = createFileRoute("/over/$gameId")({
  component: OverPage,
})

function OverPage() {
  const { gameId } = Route.useParams()
  const navigate = useNavigate()
  const game = useGameStore((s) => s.game)
  const youHost = useGameStore((s) => s.youAreHost)
  const youId = useGameStore((s) => s.youArePlayerId)
  const guessHistoryByCategory = useGameStore((s) => s.guessHistoryByCategory)
  const finishedEvent = useGameStore((s) => s.finishedEvent)

  useLayoutEffect(() => {
    useSocketStore.getState().connect()
  }, [])

  useGameSocket(gameId)
  useRecoverSocketSessionForRoute(gameId)

  const headline = useMemo(() => {
    if (finishedEvent?.tied) {
      const sorted = [...finishedEvent.finalScores].sort(
        (a, b) => b.score - a.score
      )
      const top = sorted[0]?.score ?? 0
      const winners = sorted.filter((p) => p.score === top)
      return `tied at ${top} — ${winners.map((w) => w.name.toLowerCase()).join(" & ")}`
    }
    if (!game?.players.length) return "game over"
    const sorted = [...game.players].sort((a, b) => b.score - a.score)
    const top = sorted[0]?.score ?? 0
    const winners = sorted.filter((p) => p.score === top)
    if (winners.length === 1) {
      return `${winners[0].name.toLowerCase()} wins with ${winners[0].score}`
    }
    return `tied at ${top} — ${winners.map((w) => w.name.toLowerCase()).join(" & ")}`
  }, [game?.players, finishedEvent])

  function playAgain() {
    if (!game) return
    const payload = {
      hostName:
        game.hostName?.trim() ||
        game.players.find((p) => p.isHost)?.name ||
        "",
      pointsPerLetter: game.pointsPerLetter,
      categories: game.categories.map((c) => ({
        name: c.name,
        word: "",
      })),
    }
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(REPLAY_SESSION_KEY, JSON.stringify(payload))
    }
    void navigate({ to: "/host/setup" })
  }

  if (game?.status === "playing" && finishedEvent == null) {
    return (
      <div className="mx-auto max-w-[600px] px-6 py-20">
        <EmptyState message="this round is still in progress." />
        <BrutalButton
          type="button"
          className="mt-8"
          onClick={() =>
            void navigate({ to: "/play/$gameId", params: { gameId } })
          }
        >
          back to game
        </BrutalButton>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[600px] px-6 py-16">
      <h1 className="text-center font-[family-name:var(--font-heading)] text-[48px] font-bold tracking-[-0.02em]">
        game over
      </h1>
      <p className="mt-4 text-center text-xl font-bold">{headline}</p>

      <BrutalCard interactive={false} className="mt-12">
        <Scoreboard
          players={game?.players ?? []}
          currentPlayerId={null}
          youArePlayerId={youId}
          withCard={false}
        />
        <div className="mt-8 space-y-6 border-t-[3px] border-foreground pt-8">
          {(game?.players ?? []).map((p) => (
            <div key={p.id}>
              <p className="font-mono text-sm font-bold">
                {p.name.toLowerCase()}
              </p>
              <p className="mt-2 font-mono text-xs font-bold wrap-break-word">
                {Object.entries(guessHistoryByCategory[p.id] ?? {})
                  .map(([cat, pts]) => `[${cat}] ${pts}`)
                  .join(" · ") || "—"}
              </p>
            </div>
          ))}
        </div>
      </BrutalCard>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {youHost ? (
          <BrutalButton type="button" onClick={() => playAgain()}>
            play again
          </BrutalButton>
        ) : null}
        <BrutalButton
          type="button"
          variant="outline"
          onClick={() => void navigate({ to: "/" })}
        >
          home
        </BrutalButton>
      </div>
    </div>
  )
}
