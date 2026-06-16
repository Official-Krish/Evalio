import { Outlet } from "react-router-dom";
import { AppBar } from "./AppBar";
import { Footer } from "../Footer";
import { Ambient } from "../landing/Ambient";

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--landing-bg)]">
      <Ambient />
      <AppBar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-[88px] pb-8 relative z-[1]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
