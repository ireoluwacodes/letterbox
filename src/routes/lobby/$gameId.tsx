import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery } from "convex/react"
import { useEffect, useRef } from "react"

import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { BrutalButton } from "@/components/BrutalButton"
import { BrutalCard } from "@/components/BrutalCard"
import { InviteCodeBlock } from "@/components/InviteCodeBlock"
import { LobbyPlayerList } from "@/components/LobbyPlayerList"
import { usePresence } from "@/hooks/usePresence"
import { countJoinedPlayersForLobby, gameViewToGameState } from "@/lib/convexViewMapper"
import { getConvexErrorMessage } from "@/lib/convexErrors"
import { getSessionId } from "@/lib/session"

export const Route = createFileRoute("/lobby/$gameId")({
  component: LobbyPage,
})

function LobbyPage() {
  const { gameId } = Route.useParams()
  const navigate = useNavigate()
  const sessionId = getSessionId()

  const raw = useQuery(api.games.getGameView, {
    gameId: gameId as Id<"games">,
    sessionId,
  })

  const startGame = useMutation(api.games.start)
  const rejoin = useMutation(api.players.rejoin)
  const didRejoin = useRef(false)

  useEffect(() => {
    if (didRejoin.current) return
    didRejoin.current = true
    void rejoin({ gameId: gameId as Id<"games">, sessionId })
  }, [gameId, sessionId, rejoin])

  const game = raw != null ? gameViewToGameState(raw) : null
  const youId =
    raw?.viewerRole === "host"
      ? null
      : raw?.viewerPlayerId != null
        ? String(raw.viewerPlayerId)
        : null
  const youHost = raw?.viewerRole === "host"

  usePresence(gameId, youHost ? "host" : youId != null ? "player" : null)

  useEffect(() => {
    if (raw == null) return
    if (raw.status === "in_progress" || raw.status === "paused") {
      void navigate({ to: "/play/$gameId", params: { gameId } })
    }
    if (raw.status === "finished") {
      void navigate({ to: "/over/$gameId", params: { gameId } })
    }
  }, [raw?.status, gameId, navigate, raw])

  const joinedCount = game ? countJoinedPlayersForLobby(game.players) : 0

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10">
      <div className="grid gap-10 md:grid-cols-5 md:gap-8">
        <div className="md:col-span-3">
          <h1 className="font-[family-name:var(--font-heading)] text-[48px] font-bold tracking-[-0.02em]">
            lobby
          </h1>

          {game?.inviteCode ? (
            <div className="mt-8">
              <InviteCodeBlock code={game.inviteCode} />
            </div>
          ) : (
            <p className="mt-8 font-mono">loading…</p>
          )}

          <BrutalCard interactive={false} className="mt-10">
            <p className="text-base font-medium">
              points per letter: {game?.pointsPerLetter ?? "—"} · categories:{" "}
              {game?.categories.length ?? "—"}
            </p>
          </BrutalCard>

          <div className="mt-10">
            {youHost ? (
              <BrutalButton
                type="button"
                title={
                  joinedCount < 2 ? "need at least 2 players" : undefined
                }
                disabled={joinedCount < 2}
                onClick={() => {
                  void startGame({
                    gameId: gameId as Id<"games">,
                    sessionId,
                  }).catch((e) => {
                    console.error(getConvexErrorMessage(e))
                  })
                }}
              >
                start game →
              </BrutalButton>
            ) : (
              <BrutalCard interactive={false}>
                <p className="font-medium">waiting for host to start.</p>
              </BrutalCard>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <LobbyPlayerList
            players={game?.players ?? []}
            youArePlayerId={youId}
          />
        </div>
      </div>
    </div>
  )
}
