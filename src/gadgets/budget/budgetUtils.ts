import type { CurrencyCode } from "@/currency/currencyTypes"
import { CURRENCY_CODES } from "@/currency/currencyTypes"
import type { BudgetSummary, TransactionNote } from "./budgetTypes"

export function computeBudgetSummaries(
  transactions: TransactionNote[]
): BudgetSummary[] {
  return CURRENCY_CODES.map((currency: CurrencyCode) => {
    const filtered = transactions.filter((t) => t.currency === currency)
    const incomeTotal = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
    const expenseTotal = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
    return {
      currency,
      incomeTotal,
      expenseTotal,
      balance: incomeTotal - expenseTotal,
    }
  })
}

export function isValidTransactionAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0
}

export function isValidTransactionTitle(title: string): boolean {
  return title.trim().length > 0
}

export function sortTransactionsByDate(
  transactions: TransactionNote[]
): TransactionNote[] {
  return [...transactions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  )
}
