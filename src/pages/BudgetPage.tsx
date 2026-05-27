import { useState, useCallback } from "react"
import { PageHeader } from "@/components/PageHeader"
import { TransactionForm } from "@/gadgets/budget/TransactionForm"
import { TransactionList } from "@/gadgets/budget/TransactionList"
import { readStorage, writeStorage } from "@/storage/localStore"
import type { TransactionNote } from "@/gadgets/budget/budgetTypes"
import { generateId, isoNow } from "@/types/common"

export function BudgetPage() {
  const [storage, setStorage] = useState(() => readStorage())

  const addTransaction = useCallback(
    (data: Omit<TransactionNote, "id" | "createdAt" | "updatedAt">) => {
      const now = isoNow()
      const transaction: TransactionNote = { ...data, id: generateId(), createdAt: now, updatedAt: now }
      const updated = {
        ...readStorage(),
        transactions: [...readStorage().transactions, transaction],
      }
      writeStorage(updated)
      setStorage(updated)
    },
    []
  )

  const updateTransaction = useCallback(
    (id: string, data: Omit<TransactionNote, "id" | "createdAt" | "updatedAt">) => {
      const current = readStorage()
      const updated = {
        ...current,
        transactions: current.transactions.map((t) =>
          t.id === id ? { ...t, ...data, updatedAt: isoNow() } : t
        ),
      }
      writeStorage(updated)
      setStorage(updated)
    },
    []
  )

  const deleteTransaction = useCallback((id: string) => {
    const current = readStorage()
    const updated = {
      ...current,
      transactions: current.transactions.filter((t) => t.id !== id),
    }
    writeStorage(updated)
    setStorage(updated)
  }, [])

  return (
    <div className="pb-24">
      <PageHeader title="Budget Notes" />
      <div className="px-4 py-4 space-y-4">
        <TransactionForm onSubmit={addTransaction} />
        <TransactionList
          transactions={storage.transactions}
          onUpdate={updateTransaction}
          onDelete={deleteTransaction}
        />
      </div>
    </div>
  )
}
