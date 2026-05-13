import type { TPlayer } from "@/shared/schemas"

export interface ITurnPanelProps {
  players: Array<TPlayer>
  currentPlayerId: string | null
  youArePlayerId: string | null
}
