import type { TPlayer } from "@/shared/schemas"

export interface ILobbyPlayerListProps {
  players: Array<TPlayer>
  youArePlayerId: string | null
}
