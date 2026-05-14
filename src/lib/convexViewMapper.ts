import type { GameView } from "../../convex/lib/sanitize"
import type { TGameState, TPlayer } from "@/shared/schemas"
import {
  letterGuessStateFromCategory,
  parseMaskedWordToSlots,
} from "@/lib/publicGameAdapter"
import { LETTERBOX_HOST_ROW_ID } from "@/lib/convexViewMapperTypes"

function mapStatus(s: GameView["status"]): TGameState["status"] {
  if (s === "in_progress") return "playing"
  if (s === "lobby") return "lobby"
  if (s === "paused") return "paused"
  if (s === "finished") return "finished"
  return "lobby"
}

function buildCategoriesPlaceholder(view: GameView): Array<{ name: string }> {
  const cur = view.currentCategory
  const n = cur?.totalCategories ?? 1
  const out: Array<{ name: string }> = []
  for (let i = 0; i < n; i++) {
    if (cur != null && i === cur.order) {
      out.push({ name: cur.name })
    } else {
      out.push({ name: `category ${i + 1}` })
    }
  }
  return out
}

export function gameViewToGameState(view: GameView): TGameState {
  const cur = view.currentCategory
  const maskedWord = cur?.maskedWord
  const maskedSlots = parseMaskedWordToSlots(maskedWord)
  const letterGuessState = letterGuessStateFromCategory(
    cur?.guessedLetters,
    maskedWord,
  )

  const hostWord =
    view.viewerRole === "host" && cur?.word != null && cur.word.length > 0
      ? cur.word
      : undefined

  const basePlayers: Array<TPlayer> = view.players.map((p) => ({
    id: p.id,
    name: p.name,
    score: p.score,
    connected: p.connected,
    isHost: false,
  }))

  const hostRow: TPlayer = {
    id: LETTERBOX_HOST_ROW_ID,
    name: view.hostName,
    score: 0,
    connected: view.hostConnected,
    isHost: true,
  }

  /** Synthetic host row is lobby-only so play/over scoreboards stay real players only. */
  const includeHostRow =
    view.hostName.trim().length > 0 && view.status === "lobby"
  const players = includeHostRow ? [hostRow, ...basePlayers] : basePlayers

  const turnOrder = (view.turnOrder ?? []).map((id) => String(id))

  return {
    gameId: String(view.id),
    inviteCode: view.inviteCode,
    status: mapStatus(view.status),
    pointsPerLetter: view.pointsPerLetter,
    players,
    categories: buildCategoriesPlaceholder(view),
    currentCategoryIndex: cur?.order ?? 0,
    turnOrder,
    currentPlayerId: view.currentPlayerId
      ? String(view.currentPlayerId)
      : null,
    turnDeadline: view.turnDeadline ?? null,
    maskedSlots,
    letterGuessState,
    hostWord,
    selfPlayerId: view.viewerPlayerId
      ? String(view.viewerPlayerId)
      : undefined,
    hostId: includeHostRow ? LETTERBOX_HOST_ROW_ID : undefined,
    hostName: view.hostName,
  }
}

export function countJoinedPlayersForLobby(players: Array<TPlayer>): number {
  return players.filter((p) => p.id !== LETTERBOX_HOST_ROW_ID).length
}
