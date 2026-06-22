import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useForgotPassword } from "../lib/auth";
import { useResendTimer } from "../lib/useResendTimer";
import { SEO } from "@/components/SEO";
import { AuthLayout } from "@/components/static/AuthLayout";
import toast from "react-hot-toast";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const forgotMutation = useForgotPassword();
  const { cooldown, canResend, startCooldown } = useResendTimer();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Enter your email address");
      return;
    }
    forgotMutation.mutate(
      { email },
      {
        onSuccess: () => {
          startCooldown();
          toast.success("Reset code sent to your email");
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <AuthLayout variant="login">
      <SEO
        title="Forgot Password"
        description="Reset your Evalio account password."
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px]"
      >
        <div className="mb-8 lg:mb-10">
          <p className="static-badge">Reset password</p>
          <h1 className="static-title mt-4 text-[2rem]">
            Forgot your password?
          </h1>
          <p className="static-subtitle mt-2">
            Enter your email and we'll send you a code to reset it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="static-auth-card space-y-5">
          <div>
            <label htmlFor="email" className="static-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="static-input"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={forgotMutation.isPending || !canResend || !email}
            className="landing-cta-primary landing-cta-sharp w-full justify-center text-[13px] disabled:opacity-60"
          >
            {forgotMutation.isPending
              ? "Sending…"
              : canResend
                ? "Send reset code"
                : `Resend in ${cooldown}s`}
          </button>
          <p className="text-center text-[13px] text-[var(--landing-fg-faint)]">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-[var(--landing-accent)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
