import type { Place } from "./placesTypes"

function toMeters(distance: number, unit: string): number {
  return unit === "km" ? distance * 1000 : distance
}

export function sortPlacesByDistance(places: Place[]): Place[] {
  return [...places].sort((a, b) => {
    const aM = toMeters(a.distance, a.distanceUnit)
    const bM = toMeters(b.distance, b.distanceUnit)
    if (aM !== bM) return aM - bM
    return a.createdAt.localeCompare(b.createdAt)
  })
}

export function isValidDistance(distance: number): boolean {
  return Number.isFinite(distance) && distance > 0
}

export function isValidPlaceName(name: string): boolean {
  return name.trim().length > 0
}
