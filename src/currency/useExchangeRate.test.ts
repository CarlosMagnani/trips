import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useExchangeRate } from "./useExchangeRate"
import { STORAGE_NAMESPACE } from "@/storage/storageKeys"

describe("useExchangeRate", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it("fetches live rate and sets source to live", async () => {
    const mockFetch = vi.mocked(globalThis.fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ base: "BRL", rates: { ARS: 190.5 } }),
    } as Response)

    const { result } = renderHook(() => useExchangeRate())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.rate).toBe(190.5)
    expect(result.current.source).toBe("live")
    expect(result.current.error).toBeNull()

    const storage = JSON.parse(localStorage.getItem(STORAGE_NAMESPACE) ?? "{}")
    expect(storage.exchangeRates[0].rate).toBe(190.5)
    expect(storage.exchangeRates[0].source).toBe("live")
  })

  it("falls back to cached rate when fetch fails", async () => {
    const cachedRate = {
      exchangeRates: [
        {
          id: "cached-id",
          from: "BRL",
          to: "ARS",
          rate: 180,
          updatedAt: "2024-01-01T00:00:00Z",
          source: "live",
        },
      ],
      places: [],
      transactions: [],
    }
    localStorage.setItem(STORAGE_NAMESPACE, JSON.stringify(cachedRate))

    const mockFetch = vi.mocked(globalThis.fetch)
    mockFetch.mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => useExchangeRate())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.rate).toBe(180)
    expect(result.current.source).toBe("cached")
    expect(result.current.error).toBe("Unable to fetch live rate. Using cached rate.")
  })

  it("shows error when fetch fails and no cached rate exists", async () => {
    const mockFetch = vi.mocked(globalThis.fetch)
    mockFetch.mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => useExchangeRate())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.rate).toBeUndefined()
    expect(result.current.source).toBe("manual")
    expect(result.current.error).toBe(
      "Unable to fetch live rate. Please enter a rate manually."
    )
  })

  it("refreshes rate when refresh is called", async () => {
    const mockFetch = vi.mocked(globalThis.fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ base: "BRL", rates: { ARS: 191 } }),
    } as Response)

    const { result } = renderHook(() => useExchangeRate())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.rate).toBe(191)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ base: "BRL", rates: { ARS: 192 } }),
    } as Response)

    result.current.refresh()

    await waitFor(() => expect(result.current.rate).toBe(192))
    expect(result.current.source).toBe("live")
  })
})
