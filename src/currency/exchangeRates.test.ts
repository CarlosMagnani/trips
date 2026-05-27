import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { fetchBrlToArsRate } from "./exchangeRates"

describe("fetchBrlToArsRate", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns the ARS rate on success", async () => {
    const mockFetch = vi.mocked(globalThis.fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ base: "BRL", rates: { ARS: 185.42 } }),
    } as Response)

    const rate = await fetchBrlToArsRate()
    expect(rate).toBe(185.42)
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.exchangerate-api.com/v4/latest/BRL"
    )
  })

  it("throws on HTTP error", async () => {
    const mockFetch = vi.mocked(globalThis.fetch)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    await expect(fetchBrlToArsRate()).rejects.toThrow("HTTP error! status: 500")
  })

  it("throws when ARS rate is missing", async () => {
    const mockFetch = vi.mocked(globalThis.fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ base: "BRL", rates: {} }),
    } as Response)

    await expect(fetchBrlToArsRate()).rejects.toThrow(
      "Invalid rate in API response"
    )
  })

  it("throws when ARS rate is not a number", async () => {
    const mockFetch = vi.mocked(globalThis.fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ base: "BRL", rates: { ARS: null } }),
    } as Response)

    await expect(fetchBrlToArsRate()).rejects.toThrow(
      "Invalid rate in API response"
    )
  })
})
