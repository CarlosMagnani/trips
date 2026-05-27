import { useState, useEffect } from "react"
import { fetchBrlToArsRate } from "./exchangeRates"
import type { ExchangeRate, RateSource } from "./exchangeRates"
import { readStorage, writeStorage } from "@/storage/localStore"
import { generateId, isoNow } from "@/types/common"

export interface UseExchangeRateResult {
  rate: number | undefined
  source: RateSource
  isLoading: boolean
  error: string | null
  refresh: () => void
}

function getLastRate(): ExchangeRate | undefined {
  const storage = readStorage()
  return storage.exchangeRates[0]
}

function saveLiveRate(rate: number): void {
  const newRate: ExchangeRate = {
    id: generateId(),
    from: "BRL",
    to: "ARS",
    rate,
    updatedAt: isoNow(),
    source: "live",
  }
  const storage = readStorage()
  writeStorage({ ...storage, exchangeRates: [newRate] })
}

interface RateState {
  rate: number | undefined
  source: RateSource
  error: string | null
}

async function loadRate(): Promise<RateState> {
  try {
    const liveRate = await fetchBrlToArsRate()
    saveLiveRate(liveRate)
    return { rate: liveRate, source: "live", error: null }
  } catch {
    const cached = getLastRate()
    if (cached) {
      return {
        rate: cached.rate,
        source: "cached",
        error: "Unable to fetch live rate. Using cached rate.",
      }
    }
    return {
      rate: undefined,
      source: "manual",
      error: "Unable to fetch live rate. Please enter a rate manually.",
    }
  }
}

export function useExchangeRate(): UseExchangeRateResult {
  const [rate, setRate] = useState<number | undefined>()
  const [source, setSource] = useState<RateSource>("manual")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setIsLoading(true)
      setError(null)
      const result = await loadRate()
      if (!cancelled) {
        setRate(result.rate)
        setSource(result.source)
        setError(result.error)
        setIsLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  const refresh = () => {
    setIsLoading(true)
    setError(null)
    loadRate().then((result) => {
      setRate(result.rate)
      setSource(result.source)
      setError(result.error)
      setIsLoading(false)
    })
  }

  return { rate, source, isLoading, error, refresh }
}
