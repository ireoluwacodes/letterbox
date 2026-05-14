import type { TPlayer } from "@/shared/schemas"

export interface ITurnPanelProps {
  players: Array<TPlayer>
  /** Server rotation order; when empty, “next up” falls back to `players` order */
  turnOrder: Array<string>
  currentPlayerId: string | null
  youArePlayerId: string | null
}
