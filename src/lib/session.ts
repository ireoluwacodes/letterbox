const SESSION_ID_KEY = "letterbox_session_id"

function randomUuidV4(): string {
  const c = globalThis.crypto as Crypto | undefined
  if (c?.randomUUID) {
    return c.randomUUID()
  }
  const bytes = new Uint8Array(16)
  if (c?.getRandomValues) {
    c.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** Stable anonymous id for Convex `sessionId` (host/player presence and authz). */
export function getSessionId(): string {
  if (typeof localStorage === "undefined") {
    return randomUuidV4()
  }
  let id = localStorage.getItem(SESSION_ID_KEY)
  if (id == null || id === "") {
    id = randomUuidV4()
    localStorage.setItem(SESSION_ID_KEY, id)
  }
  return id
}
