import { Outlet } from "react-router-dom"

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-lg mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
