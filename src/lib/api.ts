export type TGameExistsReason = "not_found" | "full" | "started"

export type TGameExistsResult =
  | { ok: true }
  | { ok: false; reason: TGameExistsReason }

function getApiBase(): string {
  const base = import.meta.env.VITE_API_URL
  if (!base) {
    console.warn("VITE_API_URL is not set")
  }
  return base ?? ""
}

export async function gameExists(code: string): Promise<TGameExistsResult> {
  const normalized = code.trim().toUpperCase()
  const url = `${getApiBase()}/api/games/${encodeURIComponent(normalized)}/exists`

  try {
    const res = await fetch(url)
    if (!res.ok) {
      if (res.status === 404) return { ok: false, reason: "not_found" }
      return { ok: false, reason: "not_found" }
    }
    const data = (await res.json()) as {
      exists?: boolean
      status?: string
      playerCount?: number
      maxPlayers?: number
    }
    if (data.exists === false) return { ok: false, reason: "not_found" }
    const max = data.maxPlayers ?? 8
    const count = data.playerCount ?? 0
    if (count >= max) return { ok: false, reason: "full" }
    if (data.status != null && data.status !== "lobby") {
      return { ok: false, reason: "started" }
    }
    return { ok: true }
  } catch {
    return { ok: false, reason: "not_found" }
  }
}

export async function fetchDefaultCategories(): Promise<Array<string>> {
  const url = `${getApiBase()}/api/categories/defaults`
  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = (await res.json()) as unknown
    if (!Array.isArray(data)) return []
    return data.filter((x): x is string => typeof x === "string")
  } catch {
    return []
  }
}
