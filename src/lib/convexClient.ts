import { ConvexReactClient } from "convex/react"

const url = import.meta.env.VITE_CONVEX_URL as string | undefined

if (import.meta.env.DEV && (url == null || url === "")) {
  console.warn(
    "VITE_CONVEX_URL is not set. Convex queries and mutations will fail until it is configured.",
  )
}

export const convexReactClient = new ConvexReactClient(url ?? "")
