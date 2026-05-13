import type { IScoreboardProps } from "./@types"
import { BrutalCard } from "@/components/BrutalCard"
import { CardTitle } from "@/components/ui/card"

import { cn } from "@/lib/utils"

export function Scoreboard({
  players,
  currentPlayerId,
  youArePlayerId,
  withCard = true,
}: IScoreboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score)

  const inner = (
    <>
      <CardTitle className="text-xl">scores</CardTitle>
      <ul className="mt-4 space-y-2">
        {sorted.map((p, rank) => (
          <li
            key={p.id}
            className={cn(
              "flex items-center gap-2 border-l-4 border-transparent pl-2 font-medium",
              p.id === currentPlayerId && "border-foreground"
            )}
          >
            <span className="w-6 font-mono text-sm font-bold tabular-nums">
              {rank + 1}
            </span>
            <span
              className={cn(
                "mt-0.5 size-3 shrink-0 border-[3px] border-foreground",
                p.connected ? "bg-foreground" : "bg-transparent"
              )}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate">
              {p.name.toLowerCase()}
              {p.id === youArePlayerId ? " · you" : ""}
            </span>
            <span className="font-mono text-sm font-bold tabular-nums">
              {p.score}
            </span>
          </li>
        ))}
      </ul>
    </>
  )

  if (!withCard) return inner

  return <BrutalCard interactive={false}>{inner}</BrutalCard>
}
