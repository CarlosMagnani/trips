import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/FieldError"
import { isValidTransactionAmount, isValidTransactionTitle } from "./budgetUtils"
import type { TransactionNote, TransactionType } from "./budgetTypes"
import { TRANSACTION_TYPES } from "./budgetTypes"
import type { CurrencyCode } from "@/currency/currencyTypes"
import { CURRENCY_CODES } from "@/currency/currencyTypes"

interface TransactionFormProps {
  onSubmit: (data: Omit<TransactionNote, "id" | "createdAt" | "updatedAt">) => void
  initial?: TransactionNote
  onCancel?: () => void
}

export function TransactionForm({ onSubmit, initial, onCancel }: TransactionFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [amount, setAmount] = useState(initial?.amount.toString() ?? "")
  const [currency, setCurrency] = useState<CurrencyCode>(initial?.currency ?? "BRL")
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense")
  const [note, setNote] = useState(initial?.note ?? "")
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().split("T")[0])
  const [titleError, setTitleError] = useState("")
  const [amountError, setAmountError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let hasError = false

    if (!isValidTransactionTitle(title)) {
      setTitleError("Title is required")
      hasError = true
    } else {
      setTitleError("")
    }

    const parsedAmount = parseFloat(amount)
    if (!isValidTransactionAmount(parsedAmount)) {
      setAmountError("Enter a valid amount greater than 0")
      hasError = true
    } else {
      setAmountError("")
    }

    if (!hasError) {
      onSubmit({
        title: title.trim(),
        amount: parsedAmount,
        currency,
        type,
        note: note.trim() || undefined,
        date,
      })
      if (!initial) {
        setTitle("")
        setAmount("")
        setNote("")
        setDate(new Date().toISOString().split("T")[0])
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="tx-title">Title</Label>
        <Input
          id="tx-title"
          placeholder="Transaction title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <FieldError message={titleError} />
      </div>

      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="tx-amount">Amount</Label>
          <Input
            id="tx-amount"
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
        <div className="w-24 space-y-1.5">
          <Label htmlFor="tx-currency">Currency</Label>
          <Select
            id="tx-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
          >
            {CURRENCY_CODES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="tx-type">Type</Label>
          <Select
            id="tx-type"
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
          >
            {TRANSACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="tx-date">Date</Label>
          <Input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tx-note">Note (optional)</Label>
        <Textarea
          id="tx-note"
          placeholder="Optional note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {initial ? "Update" : "Add Transaction"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
