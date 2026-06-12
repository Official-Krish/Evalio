import { Outlet } from "react-router-dom"
import { AppBar } from "./AppBar"
import { Footer } from "../Footer"

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppBar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-[88px] pb-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}