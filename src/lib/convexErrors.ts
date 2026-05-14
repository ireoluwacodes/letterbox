import { ConvexError } from "convex/values"

export function getConvexErrorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    const data = error.data as { message?: string } | undefined
    if (data != null && typeof data.message === "string") {
      return data.message
    }
  }
  if (error instanceof Error) return error.message
  return String(error ?? "unknown error")
}

export function getConvexErrorCode(error: unknown): string | undefined {
  if (error instanceof ConvexError) {
    const data = error.data as { code?: string } | undefined
    if (data != null && typeof data.code === "string") return data.code
  }
  return undefined
}
