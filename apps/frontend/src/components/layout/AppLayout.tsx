import { Outlet, useLocation } from "react-router-dom";
import { AppBar } from "./AppBar";
import { Footer } from "../Footer";
import { Ambient } from "../landing/Ambient";

export function AppLayout() {
  const location = useLocation();
  const isWidePage = ["/dashboard", "/profile", "/analysis"].some((p) =>
    location.pathname.startsWith(p),
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--landing-bg)]">
      <Ambient />
      <AppBar />
      <main
        className={`flex-1 w-full px-4 pt-[88px] pb-8 relative z-[1] transition-all duration-300 ${
          isWidePage ? "max-w-[1360px] md:px-8" : "max-w-5xl mx-auto"
        }`}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
