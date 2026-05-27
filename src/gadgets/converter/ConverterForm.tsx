import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { FieldError } from "@/components/FieldError"
import { formatCurrency } from "@/currency/formatCurrency"
import { convert, isValidRate, isValidAmount } from "./converterUtils"
import type { RateSource } from "@/currency/exchangeRates"
import { RefreshCw, Loader2, AlertCircle } from "lucide-react"

interface ConverterFormProps {
  fetchedRate?: number
  fetchedSource: RateSource
  isLoading: boolean
  fetchError: string | null
  onRefresh: () => void
  onSaveRate: (rate: number, source: RateSource) => void
}

const sourceConfig: Record<
  RateSource,
  { label: string; color: string }
> = {
  live: {
    label: "Live",
    color: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-600/20",
  },
  cached: {
    label: "Cached",
    color: "text-amber-700 bg-amber-50 ring-1 ring-amber-600/20",
  },
  manual: {
    label: "Manual",
    color: "text-slate-700 bg-slate-100 ring-1 ring-slate-600/20",
  },
}

export function ConverterForm({
  fetchedRate,
  fetchedSource,
  isLoading,
  fetchError,
  onRefresh,
  onSaveRate,
}: ConverterFormProps) {
  const [amount, setAmount] = useState("")
  const [manualRate, setManualRate] = useState("")
  const [hasEditedRate, setHasEditedRate] = useState(false)
  const [amountError, setAmountError] = useState("")
  const [rateError, setRateError] = useState("")

  const rate = hasEditedRate
    ? manualRate
    : fetchedRate?.toString() ?? ""

  const parsedAmount = parseFloat(amount)
  const parsedRate = parseFloat(rate)
  const hasValidInput = isValidAmount(parsedAmount) && isValidRate(parsedRate)
  const result = hasValidInput ? convert(parsedAmount, parsedRate) : null

  const currentSource: RateSource = hasEditedRate ? "manual" : fetchedSource

  function handleRateChange(value: string) {
    setManualRate(value)
    setHasEditedRate(true)
  }

  function handleRefresh() {
    setHasEditedRate(false)
    setManualRate("")
    onRefresh()
  }

  function handleConvert(e: React.FormEvent) {
    e.preventDefault()
    let hasError = false

    if (!amount || !isValidAmount(parsedAmount)) {
      setAmountError("Enter a valid amount")
      hasError = true
    } else {
      setAmountError("")
    }

    if (!rate || !isValidRate(parsedRate)) {
      setRateError("Enter a valid rate greater than 0")
      hasError = true
    } else {
      setRateError("")
    }

    if (!hasError && isValidRate(parsedRate)) {
      onSaveRate(parsedRate, currentSource)
    }
  }

  const config = sourceConfig[currentSource]

  return (
    <div className="space-y-4">
      <form onSubmit={handleConvert} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (BRL)</Label>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <FieldError message={amountError} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="rate">Exchange Rate (BRL to ARS)</Label>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
              data-testid="rate-source-badge"
            >
              {config.label}
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              id="rate"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 180"
              value={rate}
              onChange={(e) => handleRateChange(e.target.value)}
              min="0"
              step="0.0001"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              aria-label="Refresh exchange rate"
              data-testid="refresh-rate-button"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
            </Button>
          </div>
          <FieldError message={rateError} />
          {fetchError && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span data-testid="fetch-error">{fetchError}</span>
            </div>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full">
          Convert
        </Button>
      </form>

      {result !== null && hasValidInput && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">BRL</span>
              <span className="text-lg font-semibold">
                {formatCurrency(parsedAmount, "BRL")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Rate</span>
              <span className="text-sm flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium ${config.color}`}
                >
                  {config.label}
                </span>
                {parsedRate}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ARS</span>
              <span className="text-xl font-bold">
                {formatCurrency(result, "ARS")}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
