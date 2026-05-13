/** Pure helper for tests */
export function getRemainingMs(deadline: number | null, now: number): number {
  if (deadline == null) return 0
  return Math.max(0, deadline - now)
}
