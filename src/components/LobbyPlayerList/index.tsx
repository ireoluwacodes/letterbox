import type { ILobbyPlayerListProps } from "./@types"
import { BrutalCard } from "@/components/BrutalCard"

export function LobbyPlayerList({
  players,
  youArePlayerId,
}: ILobbyPlayerListProps) {
  return (
    <BrutalCard interactive={false}>
      <p className="mb-4 font-(family-name:--font-heading) text-[28px] font-bold tracking-[-0.02em]">
        players
      </p>
      {players.length === 0 ? (
        <p className="text-base font-medium">
          nobody here yet. share the code.
        </p>
      ) : (
        <ul className="space-y-3">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 font-medium"
            >
              <span
                className={
                  p.connected
                    ? "size-3 shrink-0 bg-foreground"
                    : "size-3 shrink-0 border-[3px] border-foreground bg-transparent"
                }
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{p.name}</span>
              {p.isHost ? (
                <span className="text-[14px] font-bold">host</span>
              ) : null}
              {p.id === youArePlayerId ? (
                <span className="text-[14px] font-bold">you</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </BrutalCard>
  )
}
