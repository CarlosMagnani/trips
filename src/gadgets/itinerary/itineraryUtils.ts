import type { TripDay } from "./itineraryTypes"
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
