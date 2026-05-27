import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  backTo?: string
}

export function PageHeader({ title, backTo = "/" }: PageHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b">
      <Button variant="ghost" size="icon" asChild>
        <Link to={backTo} aria-label="Back to home">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <h1 className="text-xl font-semibold">{title}</h1>
    </header>
  )
}
