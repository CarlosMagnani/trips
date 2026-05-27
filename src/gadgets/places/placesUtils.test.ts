import { describe, it, expect } from "vitest"
import { sortPlacesByDistance, isValidDistance, isValidPlaceName } from "./placesUtils"
import type { Place } from "./placesTypes"

function makePlace(overrides: Partial<Place> = {}): Place {
  return {
    id: "1",
    name: "Test",
    distance: 1,
    distanceUnit: "km",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("sortPlacesByDistance", () => {
  it("sorts by distance ascending", () => {
    const places = [
      makePlace({ id: "1", distance: 10 }),
      makePlace({ id: "2", distance: 5 }),
      makePlace({ id: "3", distance: 1 }),
    ]
    const sorted = sortPlacesByDistance(places)
    expect(sorted.map((p) => p.id)).toEqual(["3", "2", "1"])
  })

  it("normalizes km and m", () => {
    const places = [
      makePlace({ id: "1", distance: 1, distanceUnit: "km" }),
      makePlace({ id: "2", distance: 500, distanceUnit: "m" }),
    ]
    const sorted = sortPlacesByDistance(places)
    expect(sorted[0].id).toBe("2")
  })

  it("sorts deterministically when distances are equal", () => {
    const places = [
      makePlace({ id: "b", distance: 5, createdAt: "2024-01-02T00:00:00.000Z" }),
      makePlace({ id: "a", distance: 5, createdAt: "2024-01-01T00:00:00.000Z" }),
    ]
    const sorted = sortPlacesByDistance(places)
    expect(sorted[0].id).toBe("a")
  })

  it("does not mutate the input array", () => {
    const places = [makePlace({ distance: 5 }), makePlace({ distance: 1 })]
    const original = [...places]
    sortPlacesByDistance(places)
    expect(places).toEqual(original)
  })
})

describe("isValidDistance", () => {
  it("accepts positive numbers", () => {
    expect(isValidDistance(1)).toBe(true)
    expect(isValidDistance(0.5)).toBe(true)
  })

  it("rejects zero", () => {
    expect(isValidDistance(0)).toBe(false)
  })

  it("rejects negative", () => {
    expect(isValidDistance(-1)).toBe(false)
  })
})

describe("isValidPlaceName", () => {
  it("accepts non-empty strings", () => {
    expect(isValidPlaceName("Cafe")).toBe(true)
  })

  it("rejects empty strings", () => {
    expect(isValidPlaceName("")).toBe(false)
    expect(isValidPlaceName("   ")).toBe(false)
  })
})
