import type { ExchangeRate } from "@/currency/exchangeRates"
import type { Place } from "@/gadgets/places/placesTypes"
import type { TransactionNote } from "@/gadgets/budget/budgetTypes"

export interface TripsStorageV1 {
  exchangeRates: ExchangeRate[]
  places: Place[]
  transactions: TransactionNote[]
}

export function createEmptyStorage(): TripsStorageV1 {
  return {
    exchangeRates: [],
    places: [],
    transactions: [],
  }
}
