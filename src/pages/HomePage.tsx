import { Link } from "react-router-dom"
import { ArrowLeftRight, MapPin, Receipt } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { readStorage } from "@/storage/localStore"

const gadgets = [
  {
    to: "/converter",
    label: "Currency Converter",
    description: "BRL to ARS conversion",
    icon: ArrowLeftRight,
    hint: (data: ReturnType<typeof readStorage>) => {
      const rate = data.exchangeRates[0]
      return rate ? `Last rate: ${rate.rate}` : "Set a rate to start"
    },
  },
  {
    to: "/places",
    label: "Places by Distance",
    description: "Track places sorted by distance",
    icon: MapPin,
    hint: (data: ReturnType<typeof readStorage>) => {
      const count = data.places.length
      return count > 0 ? `${count} saved place${count === 1 ? "" : "s"}` : "No places yet"
    },
  },
  {
    to: "/budget",
    label: "Budget Notes",
    description: "Track expenses and income",
    icon: Receipt,
    hint: (data: ReturnType<typeof readStorage>) => {
      const count = data.transactions.length
      return count > 0 ? `${count} transaction${count === 1 ? "" : "s"}` : "No transactions yet"
    },
  },
]

export function HomePage() {
  const data = readStorage()

  return (
    <div className="px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Trips</h1>
      <div className="space-y-3">
        {gadgets.map(({ to, label, description, icon: Icon, hint }) => (
          <Link key={to} to={to}>
            <Card className="active:scale-[0.98] transition-transform">
              <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{label}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
                  <p className="text-xs text-muted-foreground mt-1">{hint(data)}</p>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
