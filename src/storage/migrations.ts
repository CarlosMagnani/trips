import type { ExchangeRate } from "@/currency/exchangeRates"
import type { Place } from "@/gadgets/places/placesTypes"
import type { TransactionNote } from "@/gadgets/budget/budgetTypes"
import type { Trip } from "@/gadgets/itinerary/itineraryTypes"

export interface TripsStorageV1 {
  exchangeRates: ExchangeRate[]
  places: Place[]
  transactions: TransactionNote[]
}

export interface TripsStorageV2 {
  exchangeRates: ExchangeRate[]
  places: Place[]
  transactions: TransactionNote[]
  trips: Trip[]
  activeTripId: string | null
}

export function createEmptyStorage(): TripsStorageV2 {
  return {
    exchangeRates: [],
    places: [],
    transactions: [],
    trips: [],
    activeTripId: null,
  }
}
