import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { useSession } from "./lib/auth"
import { ThemeProvider } from "./lib/theme"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { AppLayout } from "./components/layout/AppLayout"
import { LandingPage } from "./pages/Landing"
import { LoginPage } from "./pages/Login"
import { SignupPage } from "./pages/Signup"
import { DashboardPage } from "./pages/Dashboard"
import { NewInterviewPage } from "./pages/NewInterview"
import { InterviewPage } from "./pages/Interview"
import { ResultsPage } from "./pages/Results"

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useSession()
  if (isLoading) return null
  if (!data?.user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  {
    path: "/dashboard",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
    ],
  },
  {
    path: "/interview/new",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <NewInterviewPage /> },
    ],
  },
  {
    path: "/interview/:id",
    element: (
      <AuthGuard>
        <InterviewPage />
      </AuthGuard>
    ),
  },
  {
    path: "/results/:id",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <ResultsPage /> },
    ],
  },
])

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--color-bg-elevated)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
