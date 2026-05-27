import type { CurrencyCode } from "@/currency/currencyTypes"

export type TransactionType = "expense" | "income"

export const TRANSACTION_TYPES: TransactionType[] = ["expense", "income"]

export interface TransactionNote {
  id: string
  title: string
  amount: number
  currency: CurrencyCode
  type: TransactionType
  note?: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface BudgetSummary {
  currency: CurrencyCode
  incomeTotal: number
  expenseTotal: number
  balance: number
}
