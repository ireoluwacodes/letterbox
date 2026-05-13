import type { ITurnPanelProps } from "./@types"
import { BrutalCard } from "@/components/BrutalCard"

function nextPlayer(
  players: ITurnPanelProps["players"],
  currentId: string | null
): string | null {
  if (!players.length) return null
  if (!currentId) return players[0]?.name ?? null
  const idx = players.findIndex((p) => p.id === currentId)
  if (idx < 0) return players[0]?.name ?? null
  return players[(idx + 1) % players.length].name
}

export function TurnPanel({
  players,
  currentPlayerId,
  youArePlayerId,
}: ITurnPanelProps) {
  const current = players.find((p) => p.id === currentPlayerId)
  const currentLabel =
    (current?.name ?? "—").toLowerCase() +
    (current?.id === youArePlayerId ? " (you)" : "")
  const nextName = nextPlayer(players, currentPlayerId)

  return (
    <BrutalCard interactive={false} className="flex flex-col gap-4">
      <p className="text-[14px] font-bold tracking-wide">
        now guessing
      </p>
      <p className="font-[family-name:var(--font-sans)] text-xl font-bold tracking-[-0.02em]">
        {currentLabel}
      </p>
      <p className="text-[14px] font-bold tracking-wide">next up</p>
      <p className="text-base font-medium">
        {(nextName ?? "—").toLowerCase()}
      </p>
    </BrutalCard>
  )
}
