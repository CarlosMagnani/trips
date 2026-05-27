import type { CurrencyCode } from "./currencyTypes"
import { CURRENCY_META } from "./currencyTypes"

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const meta = CURRENCY_META[currency]
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${meta.symbol}\u00A0${formatted}`
}
