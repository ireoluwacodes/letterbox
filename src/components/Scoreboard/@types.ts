import type { TPlayer } from "@/shared/schemas"

export interface IScoreboardProps {
  players: Array<TPlayer>
  currentPlayerId: string | null
  youArePlayerId: string | null
  /** When false, render list only (no outer BrutalCard) */
  withCard?: boolean
}
