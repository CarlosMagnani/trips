import type { CurrencyCode } from "./currencyTypes"

export interface ExchangeRate {
  id: string
  from: CurrencyCode
  to: CurrencyCode
  rate: number
  updatedAt: string
  source: "manual"
}
