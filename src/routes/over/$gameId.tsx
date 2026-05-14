import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { useEffect, useMemo } from "react"

import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { BrutalButton } from "@/components/BrutalButton"
import { BrutalCard } from "@/components/BrutalCard"
import { EmptyState } from "@/components/EmptyState"
import { Scoreboard } from "@/components/Scoreboard"
import { REPLAY_SESSION_KEY } from "@/lib/constants"
import { gameViewToGameState } from "@/lib/convexViewMapper"
import { getSessionId } from "@/lib/session"
import { usePresence } from "@/hooks/usePresence"

export const Route = createFileRoute("/over/$gameId")({
  component: OverPage,
})

function OverPage() {
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

  const breakdown = useQuery(api.games.getCategoryScoreBreakdown, {
    gameId: gameId as Id<"games">,
  })

  const game = raw != null ? gameViewToGameState(raw) : null
  const youHost = raw?.viewerRole === "host"
  const youId =
    raw?.viewerPlayerId != null ? String(raw.viewerPlayerId) : null

  usePresence(gameId, youHost ? "host" : youId != null ? "player" : null)

  useEffect(() => {
    if (raw == null) return
    if (raw.status === "lobby") {
      void navigate({ to: "/lobby/$gameId", params: { gameId } })
    }
    if (raw.status === "in_progress" || raw.status === "paused") {
      void navigate({ to: "/play/$gameId", params: { gameId } })
    }
  }, [raw?.status, gameId, navigate, raw])

  const headline = useMemo(() => {
    if (raw?.status !== "finished") return "game over"
    if (raw.tied === true && raw.finalScores != null && raw.finalScores.length > 0) {
      const sorted = [...raw.finalScores].sort((a, b) => b.score - a.score)
      const top = sorted[0]?.score ?? 0
      const winners = sorted.filter((p) => p.score === top)
      return `tied at ${top} — ${winners.map((w) => w.name.toLowerCase()).join(" & ")}`
    }
    if (
      raw.winners != null &&
      raw.winners.length === 1 &&
      raw.finalScores != null
    ) {
      const sorted = [...raw.finalScores].sort((a, b) => b.score - a.score)
      const top = sorted[0]
      return `${top.name.toLowerCase()} wins with ${top.score}`
    }
    if (game?.players.length) {
      const sorted = [...game.players].sort((a, b) => b.score - a.score)
      const top = sorted[0]?.score ?? 0
      const winners = sorted.filter((p) => p.score === top)
      if (winners.length === 1) {
        return `${winners[0].name.toLowerCase()} wins with ${winners[0].score}`
      }
      return `tied at ${top} — ${winners.map((w) => w.name.toLowerCase()).join(" & ")}`
    }
    return "game over"
  }, [game?.players, raw])

  function playAgain() {
    const rows =
      completedCats != null && completedCats.length > 0
        ? completedCats.map((c) => ({ name: c.name, word: "" }))
        : (game?.categories.map((c) => ({ name: c.name, word: "" })) ?? [])
    const payload = {
      hostName:
        game?.hostName?.trim() ||
        game?.players.find((p) => p.isHost)?.name ||
        "",
      pointsPerLetter: game?.pointsPerLetter ?? 5,
      categories: rows,
    }
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(REPLAY_SESSION_KEY, JSON.stringify(payload))
    }
    void navigate({ to: "/host/setup" })
  }

  if (raw === undefined) {
    return (
      <div className="mx-auto max-w-[600px] px-6 py-20">
        <p className="font-mono text-sm font-bold">loading…</p>
      </div>
    )
  }

  if (raw === null) {
    return (
      <div className="mx-auto max-w-[600px] px-6 py-20">
        <p className="font-mono text-sm font-bold">game not found.</p>
        <BrutalButton
          type="button"
          className="mt-8"
          onClick={() => void navigate({ to: "/" })}
        >
          home
        </BrutalButton>
      </div>
    )
  }

  if (raw.status !== "finished") {
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
        {breakdown != null && breakdown.categories.length > 0 && (
          <div className="mt-8 space-y-6 border-t-[3px] border-foreground pt-8">
            {[...(game?.players ?? [])]
              .sort((a, b) => b.score - a.score)
              .map((p) => (
                <div key={p.id}>
                  <p className="font-mono text-sm font-bold">
                    {p.name.toLowerCase()}
                  </p>
                  <ul className="mt-2 space-y-0.5">
                    {breakdown.categories.map((cat) => {
                      const pts =
                        breakdown.scoreLookup[`${p.id}:${cat.id}`] ?? 0
                      return (
                        <li
                          key={cat.id}
                          className="flex items-baseline gap-2 font-mono text-xs"
                        >
                          <span className="opacity-60">
                            {cat.name.toLowerCase()}
                          </span>
                          <span className="font-bold">{pts}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
          </div>
        )}
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
