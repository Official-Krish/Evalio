import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSession } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingPage } from "./pages/Landing";
import { LoginPage } from "./pages/Login";
import { SignupPage } from "./pages/Signup";
import { VerifyOtpPage } from "./pages/VerifyOtp";
import { ForgotPasswordPage } from "./pages/ForgotPassword";
import { ResetPasswordPage } from "./pages/ResetPassword";
import { DashboardPage } from "./pages/Dashboard";
import { NewInterviewPage } from "./pages/NewInterview";
import { InterviewPage } from "./pages/Interview";
import { ResultsPage } from "./pages/Results";
import { ProfilePage } from "./pages/Profile";
import { PricingPage } from "./pages/Pricing";
import { AboutPage } from "./pages/About";
import { FAQPage } from "./pages/FAQ";
import { ContactPage } from "./pages/Contact";
import { FeedbackPage } from "./pages/Feedback";
import { AdminFeedbackPage } from "./pages/AdminFeedback";
import { BlogPage } from "./pages/Blog";
import { BlogPostPage } from "./pages/BlogPost";
import { CareersPage } from "./pages/Careers";
import { DocsPage } from "./pages/Docs";
import { PrivacyPage } from "./pages/Privacy";
import { TermsPage } from "./pages/Terms";
import { CookiesPage } from "./pages/Cookies";
import { NotFoundPage } from "./pages/NotFound";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useSession();
  if (isLoading) return null;
  if (!data?.user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/faq", element: <FAQPage /> },
  { path: "/contact", element: <ContactPage /> },
  {
    path: "/feedback",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [{ index: true, element: <FeedbackPage /> }],
  },
  {
    path: "/admin/feedback",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [{ index: true, element: <AdminFeedbackPage /> }],
  },
  { path: "/blog", element: <BlogPage /> },
  { path: "/blog/:slug", element: <BlogPostPage /> },
  { path: "/careers", element: <CareersPage /> },
  { path: "/docs", element: <DocsPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/cookies", element: <CookiesPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/verify-otp", element: <VerifyOtpPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  {
    path: "/dashboard",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [{ index: true, element: <DashboardPage /> }],
  },
  {
    path: "/interview/new",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [{ index: true, element: <NewInterviewPage /> }],
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
    children: [{ index: true, element: <ResultsPage /> }],
  },
  {
    path: "/profile",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [{ index: true, element: <ProfilePage /> }],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ marginTop: 72 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--color-bg-elevated)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              fontSize: "13px",
              padding: "12px 16px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              maxWidth: 400,
            },
            success: {
              iconTheme: {
                primary: "#b8a88a",
                secondary: "#080808",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#080808",
              },
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
