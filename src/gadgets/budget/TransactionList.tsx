import { useState } from "react"
import { Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/EmptyState"
import { TransactionForm } from "./TransactionForm"
import { computeBudgetSummaries, sortTransactionsByDate } from "./budgetUtils"
import { formatCurrency } from "@/currency/formatCurrency"
import type { TransactionNote } from "./budgetTypes"

interface TransactionListProps {
  transactions: TransactionNote[]
  onUpdate: (id: string, data: Omit<TransactionNote, "id" | "createdAt" | "updatedAt">) => void
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, onUpdate, onDelete }: TransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const summaries = computeBudgetSummaries(transactions)
  const sorted = sortTransactionsByDate(transactions)

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Add a transaction above to start tracking your budget."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {summaries
          .filter((s) => s.incomeTotal > 0 || s.expenseTotal > 0)
          .map((summary) => (
            <Card key={summary.currency}>
              <CardContent className="p-3 space-y-1">
                <p className="font-medium text-sm">{summary.currency}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Income</span>
                  <span className="text-green-600">
                    {formatCurrency(summary.incomeTotal, summary.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expenses</span>
                  <span className="text-destructive">
                    {formatCurrency(summary.expenseTotal, summary.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-1">
                  <span>Balance</span>
                  <span
                    className={summary.balance >= 0 ? "text-green-600" : "text-destructive"}
                  >
                    {formatCurrency(summary.balance, summary.currency)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="space-y-2">
        {sorted.map((tx) => (
          <div key={tx.id}>
            {editingId === tx.id ? (
              <Card>
                <CardContent className="p-4">
                  <TransactionForm
                    initial={tx}
                    onSubmit={(data) => {
                      onUpdate(tx.id, data)
                      setEditingId(null)
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{tx.title}</p>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          tx.type === "income"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(tx.amount, tx.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                    {tx.note && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {tx.note}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(tx.id)}
                      aria-label="Edit transaction"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(tx.id)}
                      aria-label="Delete transaction"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
