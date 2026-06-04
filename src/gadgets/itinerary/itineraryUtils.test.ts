import { describe, it, expect } from "vitest"
import { isValidDateRange, generateDays, formatDayLabel } from "./itineraryUtils"

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
