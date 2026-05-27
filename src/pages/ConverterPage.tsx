import { useState, useCallback } from "react"
import { PageHeader } from "@/components/PageHeader"
import { ConverterForm } from "@/gadgets/converter/ConverterForm"
import { readStorage, writeStorage } from "@/storage/localStore"
import type { ExchangeRate } from "@/gadgets/converter/converterTypes"
import { generateId, isoNow } from "@/types/common"

export function ConverterPage() {
  const [storage, setStorage] = useState(() => readStorage())

  const lastRate = storage.exchangeRates[0]

  const saveRate = useCallback((rate: number) => {
    const newRate: ExchangeRate = {
      id: generateId(),
      from: "BRL",
      to: "ARS",
      rate,
      updatedAt: isoNow(),
      source: "manual",
    }
    const updated = {
      ...readStorage(),
      exchangeRates: [newRate],
    }
    writeStorage(updated)
    setStorage(updated)
  }, [])

  return (
    <div className="pb-24">
      <PageHeader title="Currency Converter" />
      <div className="px-4 py-4">
        <ConverterForm lastRate={lastRate?.rate} onSaveRate={saveRate} />
      </div>
    </div>
  )
}
