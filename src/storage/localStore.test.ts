import { describe, it, expect, beforeEach } from "vitest"
import { readStorage, writeStorage } from "./localStore"
import { STORAGE_NAMESPACE } from "./storageKeys"

describe("localStore", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("returns empty storage when nothing is saved", () => {
    const data = readStorage()
    expect(data.exchangeRates).toEqual([])
    expect(data.places).toEqual([])
    expect(data.transactions).toEqual([])
    expect(data.trips).toEqual([])
    expect(data.activeTripId).toBeNull()
  })

  it("persists and reads data", () => {
    const data = {
      exchangeRates: [
        {
          id: "1",
          from: "BRL" as const,
          to: "ARS" as const,
          rate: 180,
          updatedAt: "2024-01-01T00:00:00.000Z",
          source: "manual" as const,
        },
      ],
      places: [],
      transactions: [],
      trips: [],
      activeTripId: null,
    }
    writeStorage(data)
    const result = readStorage()
    expect(result.exchangeRates).toHaveLength(1)
    expect(result.exchangeRates[0].rate).toBe(180)
    expect(result.trips).toEqual([])
    expect(result.activeTripId).toBeNull()
  })

  it("returns empty storage for corrupt data", () => {
    localStorage.setItem(STORAGE_NAMESPACE, "not json")
    const data = readStorage()
    expect(data.exchangeRates).toEqual([])
  })

  it("returns empty storage for invalid structure", () => {
    localStorage.setItem(STORAGE_NAMESPACE, JSON.stringify({ foo: "bar" }))
    const data = readStorage()
    expect(data.exchangeRates).toEqual([])
  })

  it("migrates V1 data to V2", () => {
    const v1Data = {
      exchangeRates: [],
      places: [],
      transactions: [],
    }
    localStorage.setItem(STORAGE_NAMESPACE, JSON.stringify(v1Data))
    const data = readStorage()
    expect(data.trips).toEqual([])
    expect(data.activeTripId).toBeNull()
  })
})
