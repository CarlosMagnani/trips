import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from "./routes"
import { MobileNav } from "./layout/MobileNav"

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <MobileNav />
    </BrowserRouter>
  )
}
