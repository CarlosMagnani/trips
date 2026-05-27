import { NavLink } from "react-router-dom"
import { Home, ArrowLeftRight, MapPin, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/converter", label: "Converter", icon: ArrowLeftRight },
  { to: "/places", label: "Places", icon: MapPin },
  { to: "/budget", label: "Budget", icon: Receipt },
]

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="flex justify-around max-w-lg mx-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 py-2 px-3 text-xs min-w-[64px] transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
