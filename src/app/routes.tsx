import { Routes, Route, Navigate } from "react-router-dom"
import { AppShell } from "./layout/AppShell"
import { HomePage } from "@/pages/HomePage"
import { ConverterPage } from "@/pages/ConverterPage"
import { PlacesPage } from "@/pages/PlacesPage"
import { BudgetPage } from "@/pages/BudgetPage"

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/converter" element={<ConverterPage />} />
        <Route path="/places" element={<PlacesPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
