const SESSION_KEY = "letterbox_socket_session"

export type TSocketSession =
  | { role: "host"; gameId: string; inviteCode: string }
  | { role: "player"; gameId: string; inviteCode: string; name: string }

export function saveHostSocketSession(input: {
  gameId: string
  inviteCode: string
}): void {
  if (typeof localStorage === "undefined") return
  const payload: TSocketSession = {
    role: "host",
    gameId: input.gameId,
    inviteCode: input.inviteCode,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload))
}

export function savePlayerSocketSession(input: {
  gameId: string
  inviteCode: string
  name: string
}): void {
  if (typeof localStorage === "undefined") return
  const payload: TSocketSession = {
    role: "player",
    gameId: input.gameId,
    inviteCode: input.inviteCode,
    name: input.name,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload))
}

export function loadSocketSession(): TSocketSession | null {
  if (typeof localStorage === "undefined") return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as TSocketSession
    if (data.role === "host" && data.gameId && data.inviteCode) return data
    if (
      data.role === "player" &&
      data.gameId &&
      data.inviteCode &&
      data.name
    ) {
      return data
    }
    return null
  } catch {
    return null
  }
}

export function clearSocketSession(): void {
  if (typeof localStorage === "undefined") return
  localStorage.removeItem(SESSION_KEY)
}
