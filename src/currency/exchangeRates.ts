import type { CurrencyCode } from "./currencyTypes"

export type RateSource = "manual" | "live" | "cached"

export interface ExchangeRate {
  id: string
  from: CurrencyCode
  to: CurrencyCode
  rate: number
  updatedAt: string
  source: RateSource
}

const API_URL = "https://api.exchangerate-api.com/v4/latest/BRL"

interface ApiResponse {
  base: string
  rates: Record<string, number>
}

export async function fetchBrlToArsRate(): Promise<number> {
  const response = await fetch(API_URL)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = (await response.json()) as ApiResponse
  const rate = data.rates?.ARS
  if (typeof rate !== "number" || !Number.isFinite(rate)) {
    throw new Error("Invalid rate in API response")
  }
  return rate
}
