import type { TPublicGame } from "@/shared/apiTypes"
import type { TGameState, TMaskedSlot, TPlayer } from "@/shared/schemas"

export function deriveCurrentPlayerId(game: TPublicGame): string | null {
  const { turnOrder, currentTurnIndex } = game
  if (!turnOrder.length) return null
  if (currentTurnIndex < 0 || currentTurnIndex >= turnOrder.length) return null
  return turnOrder[currentTurnIndex] ?? null
}

/** Map server status to route / UI status used in the app */
export function mapApiStatusToUi(
  status: TPublicGame["status"]
): TGameState["status"] {
  if (status === "in_progress") return "playing"
  return status
}

export function parseMaskedWordToSlots(
  maskedWord: string | undefined
): Array<TMaskedSlot> {
  if (maskedWord == null || maskedWord === "") return []
  const segments = maskedWord.split(" ")
  const slots: Array<TMaskedSlot> = []
  for (const seg of segments) {
    if (seg === "") {
      slots.push({ kind: "space" })
      continue
    }
    if (seg === "_") {
      slots.push({ kind: "letter", char: null })
    } else {
      slots.push({ kind: "letter", char: seg })
    }
  }
  return slots
}

export function letterGuessStateFromCategory(
  guessedLetters: Array<string> | undefined,
  maskedWord: string | undefined
): Record<string, "hit" | "miss"> {
  if (!guessedLetters?.length) return {}
  const tokens =
    maskedWord != null && maskedWord !== ""
      ? maskedWord.split(" ").filter((t) => t !== "")
      : []
  const out: Record<string, "hit" | "miss"> = {}
  for (const L of guessedLetters) {
    const u = L.toUpperCase()
    const hit = tokens.some((t) => t !== "_" && t.toUpperCase() === u)
    out[u] = hit ? "hit" : "miss"
  }
  return out
}

function resolveHostPlayerId(
  game: TPublicGame,
  youAreHost: boolean
): string | undefined {
  const id = game.hostId ?? game.hostPlayerId
  if (id != null && id !== "") return id
  if (youAreHost && game.players.length === 1) return game.players[0]?.id
  return undefined
}

function toViewPlayers(
  game: TPublicGame,
  youArePlayerId: string | null,
  youAreHost: boolean
): Array<TPlayer> {
  const hostIdResolved = resolveHostPlayerId(game, youAreHost)
  return game.players.map((p) => ({
    id: p.id,
    name: p.name,
    score: p.score,
    connected: p.connected,
    isHost:
      hostIdResolved != null && hostIdResolved !== ""
        ? p.id === hostIdResolved
        : Boolean(youAreHost && p.id === youArePlayerId),
  }))
}

export function readHostSecretWords(gameId: string): Array<string> | null {
  if (typeof sessionStorage === "undefined") return null
  try {
    const raw = sessionStorage.getItem("letterbox_host_words_v1")
    if (!raw) return null
    const map = JSON.parse(raw) as Record<string, Array<string>>
    return map[gameId] ?? null
  } catch {
    return null
  }
}

export function writeHostSecretWords(
  gameId: string,
  words: Array<string>
): void {
  if (typeof sessionStorage === "undefined") return
  try {
    const raw = sessionStorage.getItem("letterbox_host_words_v1")
    const map = raw
      ? (JSON.parse(raw) as Record<string, Array<string>>)
      : {}
    map[gameId] = words
    sessionStorage.setItem("letterbox_host_words_v1", JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function publicGameToGameState(
  game: TPublicGame,
  options: {
    youArePlayerId: string | null
    youAreHost: boolean
  }
): TGameState {
  const idx = game.currentCategoryIndex
  const cat =
    idx >= 0 && idx < game.categories.length
      ? game.categories[idx]
      : undefined
  const maskedWord = cat !== undefined ? cat.maskedWord : undefined
  const maskedSlots = parseMaskedWordToSlots(maskedWord)
  const letterGuessState = letterGuessStateFromCategory(
    cat !== undefined ? cat.guessedLetters : undefined,
    maskedWord
  )
  const secretWords = readHostSecretWords(game.id)
  const hostWord =
    options.youAreHost && secretWords != null
      ? (secretWords[game.currentCategoryIndex] ?? "")
      : undefined

  return {
    gameId: game.id,
    inviteCode: game.inviteCode,
    status: mapApiStatusToUi(game.status),
    pointsPerLetter: game.pointsPerLetter,
    players: toViewPlayers(game, options.youArePlayerId, options.youAreHost),
    categories: game.categories.map((c) => ({ name: c.name })),
    currentCategoryIndex: game.currentCategoryIndex,
    turnOrder: [...game.turnOrder],
    currentPlayerId: deriveCurrentPlayerId(game),
    turnDeadline: game.turnDeadline,
    maskedSlots,
    letterGuessState,
    hostWord: hostWord && hostWord.length > 0 ? hostWord : undefined,
    selfPlayerId: options.youArePlayerId ?? undefined,
    hostId: game.hostId ?? game.hostPlayerId,
    hostName: game.hostName,
  }
}
