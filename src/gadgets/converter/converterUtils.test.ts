import { describe, it, expect } from "vitest"
import { convert, isValidRate, isValidAmount } from "./converterUtils"

describe("convert", () => {
  it("multiplies amount by rate", () => {
    expect(convert(100, 180)).toBe(18000)
  })

  it("returns 0 for invalid amount", () => {
    expect(convert(NaN, 180)).toBe(0)
  })

  it("returns 0 for invalid rate", () => {
    expect(convert(100, 0)).toBe(0)
  })

  it("returns 0 for negative rate", () => {
    expect(convert(100, -5)).toBe(0)
  })
})

describe("isValidRate", () => {
  it("accepts positive finite numbers", () => {
    expect(isValidRate(180)).toBe(true)
    expect(isValidRate(0.5)).toBe(true)
  })

  it("rejects zero", () => {
    expect(isValidRate(0)).toBe(false)
  })

  it("rejects negative", () => {
    expect(isValidRate(-1)).toBe(false)
  })

  it("rejects NaN", () => {
    expect(isValidRate(NaN)).toBe(false)
  })

  it("rejects Infinity", () => {
    expect(isValidRate(Infinity)).toBe(false)
  })
})

describe("isValidAmount", () => {
  it("accepts zero", () => {
    expect(isValidAmount(0)).toBe(true)
  })

  it("accepts positive", () => {
    expect(isValidAmount(50)).toBe(true)
  })

  it("rejects NaN", () => {
    expect(isValidAmount(NaN)).toBe(false)
  })

  it("rejects negative", () => {
    expect(isValidAmount(-10)).toBe(false)
  })
})
