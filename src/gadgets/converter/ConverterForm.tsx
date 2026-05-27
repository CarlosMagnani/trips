import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { FieldError } from "@/components/FieldError"
import { formatCurrency } from "@/currency/formatCurrency"
import { convert, isValidRate, isValidAmount } from "./converterUtils"

interface ConverterFormProps {
  lastRate?: number
  onSaveRate: (rate: number) => void
}

export function ConverterForm({ lastRate, onSaveRate }: ConverterFormProps) {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState(lastRate?.toString() ?? "")
  const [amountError, setAmountError] = useState("")
  const [rateError, setRateError] = useState("")

  const parsedAmount = parseFloat(amount)
  const parsedRate = parseFloat(rate)
  const hasValidInput = isValidAmount(parsedAmount) && isValidRate(parsedRate)
  const result = hasValidInput ? convert(parsedAmount, parsedRate) : null

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
      onSaveRate(parsedRate)
    }
  }

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
          <Label htmlFor="rate">Exchange Rate (BRL to ARS)</Label>
          <Input
            id="rate"
            type="number"
            inputMode="decimal"
            placeholder="e.g. 180"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            min="0"
            step="0.0001"
          />
          <FieldError message={rateError} />
          {lastRate && (
            <p className="text-xs text-muted-foreground">
              Last used rate: {lastRate}
            </p>
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
              <span className="text-sm">{parsedRate}</span>
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
