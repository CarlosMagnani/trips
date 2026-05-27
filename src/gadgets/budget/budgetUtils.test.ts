import { describe, it, expect } from "vitest"
import { computeBudgetSummaries, isValidTransactionAmount, isValidTransactionTitle } from "./budgetUtils"
import type { TransactionNote } from "./budgetTypes"

function makeTransaction(overrides: Partial<TransactionNote> = {}): TransactionNote {
  return {
    id: "1",
    title: "Test",
    amount: 100,
    currency: "BRL",
    type: "expense",
    date: "2024-01-01",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("computeBudgetSummaries", () => {
  it("returns summaries for each currency", () => {
    const summaries = computeBudgetSummaries([])
    expect(summaries).toHaveLength(2)
    expect(summaries.map((s) => s.currency)).toEqual(["BRL", "ARS"])
  })

  it("groups totals by currency", () => {
    const transactions = [
      makeTransaction({ id: "1", amount: 100, currency: "BRL", type: "income" }),
      makeTransaction({ id: "2", amount: 50, currency: "BRL", type: "expense" }),
      makeTransaction({ id: "3", amount: 200, currency: "ARS", type: "income" }),
    ]
    const summaries = computeBudgetSummaries(transactions)

    const brl = summaries.find((s) => s.currency === "BRL")!
    expect(brl.incomeTotal).toBe(100)
    expect(brl.expenseTotal).toBe(50)
    expect(brl.balance).toBe(50)

    const ars = summaries.find((s) => s.currency === "ARS")!
    expect(ars.incomeTotal).toBe(200)
    expect(ars.expenseTotal).toBe(0)
    expect(ars.balance).toBe(200)
  })

  it("does not mix currencies", () => {
    const transactions = [
      makeTransaction({ amount: 100, currency: "BRL", type: "expense" }),
      makeTransaction({ amount: 500, currency: "ARS", type: "expense" }),
    ]
    const summaries = computeBudgetSummaries(transactions)

    const brl = summaries.find((s) => s.currency === "BRL")!
    expect(brl.expenseTotal).toBe(100)

    const ars = summaries.find((s) => s.currency === "ARS")!
    expect(ars.expenseTotal).toBe(500)
  })
})

describe("isValidTransactionAmount", () => {
  it("accepts positive numbers", () => {
    expect(isValidTransactionAmount(10)).toBe(true)
  })

  it("rejects zero", () => {
    expect(isValidTransactionAmount(0)).toBe(false)
  })

  it("rejects negative", () => {
    expect(isValidTransactionAmount(-5)).toBe(false)
  })
})

describe("isValidTransactionTitle", () => {
  it("accepts non-empty strings", () => {
    expect(isValidTransactionTitle("Lunch")).toBe(true)
  })

  it("rejects empty strings", () => {
    expect(isValidTransactionTitle("")).toBe(false)
    expect(isValidTransactionTitle("   ")).toBe(false)
  })
})
