import { describe, expect, it } from "vitest"

import { getRemainingMs } from "@/lib/countdown"

describe("getRemainingMs", () => {
  it("returns 0 when deadline is null", () => {
    expect(getRemainingMs(null, 1000)).toBe(0)
  })

  it("returns positive ms until deadline", () => {
    expect(getRemainingMs(5000, 4000)).toBe(1000)
  })

  it("never returns negative", () => {
    expect(getRemainingMs(1000, 2000)).toBe(0)
  })
})
