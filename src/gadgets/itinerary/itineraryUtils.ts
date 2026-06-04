import type { Trip, TripDay } from "./itineraryTypes"
import { generateId } from "@/types/common"

export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start
}

export function generateDays(startDate: string, endDate: string): TripDay[] {
  const days: TripDay[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  const current = new Date(start)
  while (current <= end) {
    days.push({
      id: generateId(),
      date: current.toISOString().split("T")[0],
      travelMode: "walking",
      stops: [],
    })
    current.setDate(current.getDate() + 1)
  }

  return days
}

export function formatDayLabel(date: string, dayIndex: number): string {
  const [year, month, day] = date.split("-").map(Number)
  const d = new Date(year, month - 1, day)
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" })
  return `Day ${dayIndex + 1} · ${weekday} ${day}`
}

export function getItineraryHint(trip: Trip | null, today: Date = new Date()): string {
  if (!trip) {
    return "No trip planned — tap to start"
  }

  const totalDays = trip.days.length
  const totalStops = trip.days.reduce((sum, day) => sum + day.stops.length, 0)
  const currentDayIndex = resolveCurrentDayIndex(trip, today)
  const currentDay = trip.days[currentDayIndex]
  const travelMode = currentDay?.travelMode ?? "walking"
  const modeLabel = travelMode === "driving" ? "Driving" : "Walking"
  const stopsLabel = `${totalStops} stop${totalStops === 1 ? "" : "s"}`

  return `Day ${currentDayIndex + 1} of ${totalDays}, ${stopsLabel}, ${modeLabel}`
}

function resolveCurrentDayIndex(trip: Trip, today: Date): number {
  if (trip.days.length === 0) return 0

  const todayIso = toLocalIsoDate(today)
  const matchingIndex = trip.days.findIndex((day) => day.date === todayIso)
  if (matchingIndex !== -1) return matchingIndex

  // Today is before the trip: show Day 1
  if (todayIso < trip.days[0].date) return 0

  // Today is after the trip: show the last day
  return trip.days.length - 1
}

// Build a YYYY-MM-DD string from the *local* date parts of `d`.
// `Date#toISOString()` always emits UTC, which would shift the date in
// UTC-negative time zones during the local evening. Trip dates are
// stored as local-calendar dates, so the comparison must use local parts.
function toLocalIsoDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
