import { STORAGE_NAMESPACE } from "./storageKeys"
import { createEmptyStorage, type TripsStorageV1 } from "./migrations"

function isValidStorage(data: unknown): data is TripsStorageV1 {
  if (typeof data !== "object" || data === null) return false
  const d = data as Record<string, unknown>
  return (
    Array.isArray(d.exchangeRates) &&
    Array.isArray(d.places) &&
    Array.isArray(d.transactions)
  )
}

export function readStorage(): TripsStorageV1 {
  try {
    const raw = localStorage.getItem(STORAGE_NAMESPACE)
    if (raw === null) return createEmptyStorage()
    const parsed: unknown = JSON.parse(raw)
    if (!isValidStorage(parsed)) return createEmptyStorage()
    return parsed
  } catch {
    return createEmptyStorage()
  }
}

export function writeStorage(data: TripsStorageV1): void {
  try {
    localStorage.setItem(STORAGE_NAMESPACE, JSON.stringify(data))
  } catch {
    // Storage full or unavailable; silently fail for MVP
  }
}
