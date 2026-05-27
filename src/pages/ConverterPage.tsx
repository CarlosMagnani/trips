import { useCallback } from "react"
import { PageHeader } from "@/components/PageHeader"
import { ConverterForm } from "@/gadgets/converter/ConverterForm"
import { readStorage, writeStorage } from "@/storage/localStore"
import type { ExchangeRate, RateSource } from "@/currency/exchangeRates"
import { useExchangeRate } from "@/currency/useExchangeRate"
import { generateId, isoNow } from "@/types/common"

export function ConverterPage() {
  const { rate, source, isLoading, error, refresh } = useExchangeRate()

  const saveRate = useCallback((rateValue: number, rateSource: RateSource) => {
    const newRate: ExchangeRate = {
      id: generateId(),
      from: "BRL",
      to: "ARS",
      rate: rateValue,
      updatedAt: isoNow(),
      source: rateSource,
    }
    const updated = {
      ...readStorage(),
      exchangeRates: [newRate],
    }
    writeStorage(updated)
  }, [])

  return (
    <div className="pb-24">
      <PageHeader title="Currency Converter" />
      <div className="px-4 py-4">
        <ConverterForm
          fetchedRate={rate}
          fetchedSource={source}
          isLoading={isLoading}
          fetchError={error}
          onRefresh={refresh}
          onSaveRate={saveRate}
        />
      </div>
    </div>
  )
}
