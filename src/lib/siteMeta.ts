/** Default SEO / OG copy (aligned with landing hero). */
export const SITE_NAME = "letterbox"

export const SITE_TAGLINE =
  "guess letters · score points · beat the clock"

export const SITE_DESCRIPTION =
  "the host writes secret words. players take turns guessing one letter at a time, rotating in order until each word is revealed"

export const SITE_KEYWORDS = [
  "letterbox",
  "word game",
  "multiplayer",
  "party game",
  "guess letters",
  "beat the clock",
].join(", ")

/** Public site origin for absolute OG / Twitter image URLs (no trailing slash). */
export function getSiteOrigin(): string {
  const raw = import.meta.env.VITE_SITE_URL as string | undefined
  if (raw == null || raw.trim() === "") return ""
  const trimmed = raw.trim().replace(/\/$/, "")
  try {
    return new URL(trimmed).origin
  } catch {
    return trimmed
  }
}
