import { describe, it, expect } from "vitest"
import {
  isValidDateRange,
  generateDays,
  formatDayLabel,
  getItineraryHint,
} from "./itineraryUtils"
import type { Trip, TravelMode } from "./itineraryTypes"
import { generateId } from "@/types/common"

describe("isValidDateRange", () => {
  it("accepts valid date range", () => {
    expect(isValidDateRange("2024-01-01", "2024-01-05")).toBe(true)
  })

  it("accepts same start and end date", () => {
    expect(isValidDateRange("2024-01-01", "2024-01-01")).toBe(true)
  })

  it("rejects end date before start date", () => {
    expect(isValidDateRange("2024-01-05", "2024-01-01")).toBe(false)
  })

  it("rejects invalid dates", () => {
    expect(isValidDateRange("invalid", "2024-01-01")).toBe(false)
    expect(isValidDateRange("2024-01-01", "invalid")).toBe(false)
  })
})

describe("generateDays", () => {
  it("generates correct number of days", () => {
    const days = generateDays("2024-01-01", "2024-01-05")
    expect(days).toHaveLength(5)
  })

  it("generates days with correct dates", () => {
    const days = generateDays("2024-01-01", "2024-01-03")
    expect(days[0].date).toBe("2024-01-01")
    expect(days[1].date).toBe("2024-01-02")
    expect(days[2].date).toBe("2024-01-03")
  })

  it("generates single day for same start and end", () => {
    const days = generateDays("2024-01-01", "2024-01-01")
    expect(days).toHaveLength(1)
    expect(days[0].date).toBe("2024-01-01")
  })

  it("each day has unique id", () => {
    const days = generateDays("2024-01-01", "2024-01-05")
    const ids = days.map((d) => d.id)
    expect(new Set(ids).size).toBe(5)
  })

  it("each day has default travel mode", () => {
    const days = generateDays("2024-01-01", "2024-01-03")
    days.forEach((day) => {
      expect(day.travelMode).toBe("walking")
    })
  })

  it("each day starts with empty stops", () => {
    const days = generateDays("2024-01-01", "2024-01-03")
    days.forEach((day) => {
      expect(day.stops).toEqual([])
    })
  })
})

describe("formatDayLabel", () => {
  it("formats day label correctly", () => {
    const label = formatDayLabel("2024-01-01", 0)
    expect(label).toMatch(/Day 1/)
    expect(label).toMatch(/Mon/)
    expect(label).toMatch(/1/)
  })

  it("includes day index", () => {
    const label = formatDayLabel("2024-01-05", 4)
    expect(label).toMatch(/Day 5/)
  })
})

describe("getItineraryHint", () => {
  it('returns "No trip planned" hint when trip is null', () => {
    expect(getItineraryHint(null, new Date("2024-06-15"))).toBe(
      "No trip planned — tap to start"
    )
  })

  it("formats summary for a trip in progress with stops and walking", () => {
    const trip = makeTrip({
      startDate: "2024-06-01",
      endDate: "2024-06-07",
      days: [
        makeDay("2024-06-01", "walking", 2),
        makeDay("2024-06-02", "walking", 0),
        makeDay("2024-06-03", "walking", 2),
        makeDay("2024-06-04", "driving", 0),
        makeDay("2024-06-05", "driving", 0),
        makeDay("2024-06-06", "driving", 0),
        makeDay("2024-06-07", "driving", 0),
      ],
    })
    expect(getItineraryHint(trip, new Date("2024-06-03"))).toBe(
      "Day 3 of 7, 4 stops, Walking"
    )
  })

  it("resolves to first day when today is before the trip", () => {
    const trip = makeTrip({
      startDate: "2024-06-10",
      endDate: "2024-06-12",
      days: [
        makeDay("2024-06-10", "driving", 1),
        makeDay("2024-06-11", "driving", 1),
        makeDay("2024-06-12", "driving", 1),
      ],
    })
    expect(getItineraryHint(trip, new Date("2024-06-01"))).toBe(
      "Day 1 of 3, 3 stops, Driving"
    )
  })

  it("resolves to last day when today is after the trip", () => {
    const trip = makeTrip({
      startDate: "2024-06-10",
      endDate: "2024-06-12",
      days: [
        makeDay("2024-06-10", "driving", 0),
        makeDay("2024-06-11", "driving", 0),
        makeDay("2024-06-12", "driving", 2),
      ],
    })
    expect(getItineraryHint(trip, new Date("2024-07-01"))).toBe(
      "Day 3 of 3, 2 stops, Driving"
    )
  })

  it("singularises stop count when there is exactly one", () => {
    const trip = makeTrip({
      startDate: "2024-06-10",
      endDate: "2024-06-10",
      days: [makeDay("2024-06-10", "walking", 1)],
    })
    expect(getItineraryHint(trip, new Date("2024-06-10"))).toBe(
      "Day 1 of 1, 1 stop, Walking"
    )
  })

  it("falls back to walking travel mode when day has no mode", () => {
    const trip = makeTrip({
      startDate: "2024-06-10",
      endDate: "2024-06-10",
      days: [makeDay("2024-06-10", "walking", 0)],
    })
    expect(getItineraryHint(trip, new Date("2024-06-10"))).toBe(
      "Day 1 of 1, 0 stops, Walking"
    )
  })
})

function makeDay(date: string, travelMode: TravelMode, stopCount: number) {
  return {
    id: `day-${date}`,
    date,
    travelMode,
    stops: Array.from({ length: stopCount }, (_, i) => ({
      id: `stop-${date}-${i}`,
      name: `Stop ${i + 1}`,
      lat: 0,
      lng: 0,
      order: i,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    })),
  }
}

function makeTrip(overrides: {
  startDate?: string
  endDate?: string
  days?: ReturnType<typeof makeDay>[]
} = {}): Trip {
  return {
    id: generateId(),
    startDate: "2024-06-01",
    endDate: "2024-06-07",
    days: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  } as Trip
}
