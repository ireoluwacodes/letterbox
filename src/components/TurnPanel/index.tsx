import type { ITurnPanelProps } from "./@types"
import { BrutalCard } from "@/components/BrutalCard"

function playerName(
  players: ITurnPanelProps["players"],
  id: string | undefined
): string | null {
  if (!id) return null
  return players.find((p) => p.id === id)?.name ?? null
}

/** Next guesser after `currentId`, using server `turnOrder` when provided */
function nextTurnName(
  players: ITurnPanelProps["players"],
  turnOrder: Array<string>,
  currentId: string | null
): string | null {
  if (!players.length) return null
  if (turnOrder.length > 0) {
    if (!currentId) {
      return playerName(players, turnOrder[0])
    }
    const i = turnOrder.indexOf(currentId)
    const from = i < 0 ? 0 : (i + 1) % turnOrder.length
    return playerName(players, turnOrder[from])
  }
  if (!currentId) return players[0]?.name ?? null
  const idx = players.findIndex((p) => p.id === currentId)
  if (idx < 0) return players[0]?.name ?? null
  return players[(idx + 1) % players.length].name
}

export function TurnPanel({
  players,
  turnOrder,
  currentPlayerId,
  youArePlayerId,
}: ITurnPanelProps) {
  const current = players.find((p) => p.id === currentPlayerId)
  const currentLabel =
    (current?.name ?? "—").toLowerCase() +
    (current?.id === youArePlayerId ? " (you)" : "")
  const nextName = nextTurnName(players, turnOrder, currentPlayerId)

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
