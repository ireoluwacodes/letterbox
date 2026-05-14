import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useLayoutEffect } from "react"

import type { TSocketAckVoid } from "@/shared/socketEvents"
import { BrutalButton } from "@/components/BrutalButton"
import { BrutalCard } from "@/components/BrutalCard"
import { InviteCodeBlock } from "@/components/InviteCodeBlock"
import { LobbyPlayerList } from "@/components/LobbyPlayerList"
import { SOCKET_EVENTS } from "@/shared/socketEvents"
import { useGameSocket } from "@/hooks/useGameSocket"
import { useRecoverSocketSessionForRoute } from "@/hooks/useRecoverSocketSessionForRoute"
import { useGameStore } from "@/stores/gameStore"
import { useSocketStore } from "@/stores/socketStore"

export const Route = createFileRoute("/lobby/$gameId")({
  component: LobbyPage,
})

function LobbyPage() {
  const { gameId } = Route.useParams()
  const navigate = useNavigate()
  const game = useGameStore((s) => s.game)
  const youId = useGameStore((s) => s.youArePlayerId)
  const youHost = useGameStore((s) => s.youAreHost)
  const emit = useSocketStore((s) => s.emit)

  useLayoutEffect(() => {
    useSocketStore.getState().connect()
  }, [])

  useGameSocket(gameId)
  useRecoverSocketSessionForRoute(gameId)

  useEffect(() => {
    if (game?.status === "playing") {
      void navigate({
        to: "/play/$gameId",
        params: { gameId },
      })
    }
    if (game?.status === "finished") {
      void navigate({
        to: "/over/$gameId",
        params: { gameId },
      })
    }
  }, [game?.status, gameId, navigate])

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
                  (game?.players.length ?? 0) < 2
                    ? "need at least 2 players"
                    : undefined
                }
                disabled={(game?.players.length ?? 0) < 2}
                onClick={() => {
                  emit(SOCKET_EVENTS.HOST_START, { gameId }, (res: TSocketAckVoid) => {
                    if (!res.ok) console.error(res.message)
                  })
                }}
              >
                start game →
              </BrutalButton>
            ) : (
              <BrutalCard interactive={false}>
                <p className="font-medium">
                  waiting for host to start.
                </p>
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
