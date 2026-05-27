import { describe, it, expect } from "vitest"
import { formatCurrency } from "./formatCurrency"

describe("formatCurrency", () => {
  it("formats BRL with R$ symbol", () => {
    expect(formatCurrency(100, "BRL")).toBe("R$\u00A0100.00")
  })

  it("formats ARS with $ symbol", () => {
    expect(formatCurrency(250.5, "ARS")).toBe("$\u00A0250.50")
  })

  it("formats zero", () => {
    expect(formatCurrency(0, "BRL")).toBe("R$\u00A00.00")
  })

  it("formats large numbers with separators", () => {
    const result = formatCurrency(1234567.89, "BRL")
    expect(result).toContain("1,234,567.89")
  })
})
