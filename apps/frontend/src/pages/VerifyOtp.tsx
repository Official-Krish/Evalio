import {
  useState,
  useRef,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { useVerifyOtp, useResendOtp } from "../lib/auth";
import { useResendTimer } from "../lib/useResendTimer";
import { SEO } from "@/components/SEO";
import { AuthLayout } from "@/components/static/AuthLayout";
import toast from "react-hot-toast";

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailParam);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { cooldown, canResend, startCooldown } = useResendTimer();

  const verifyMutation = useVerifyOtp();
  const resendMutation = useResendOtp();

  const otp = digits.join("");

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const nums = text.replace(/\D/g, "").slice(0, 6).split("");
    const next = ["", "", "", "", "", ""];
    nums.forEach((n, i) => {
      next[i] = n;
    });
    setDigits(next);
    const focusAt = Math.min(nums.length, 5);
    inputRefs.current[focusAt]?.focus();
  };

  const handleVerify = () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }
    if (otp.length !== 6) {
      toast.error("Enter the full 6-digit code");
      return;
    }
    verifyMutation.mutate(
      { email, otp },
      {
        onSuccess: () => {
          toast.success("Email verified! Welcome aboard.");
          navigate("/dashboard");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleResend = () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    resendMutation.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success("New code sent!");
          startCooldown();
          setDigits(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <AuthLayout variant="signup">
      <SEO
        title="Verify Email"
        description="Verify your email address for Evalio."
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px]"
      >
        <div className="mb-8 lg:mb-10">
          <p className="static-badge">Verify email</p>
          <h1 className="static-title mt-4 text-[2rem]">Check your inbox.</h1>
          <p className="static-subtitle mt-2">
            We sent a 6-digit code to{" "}
            <span className="text-[var(--landing-fg)] font-medium">
              {email || "your email"}
            </span>
          </p>
        </div>

        <div className="static-auth-card space-y-6">
          {!emailParam && (
            <div>
              <label htmlFor="email" className="static-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="static-input"
              />
            </div>
          )}

          <div>
            <label className="static-label">Verification code</label>
            <div className="flex gap-2 justify-between mt-1.5">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-lg font-semibold bg-[var(--landing-surface)] border border-[var(--landing-line)] rounded-lg text-[var(--landing-fg)] outline-none focus:border-[var(--landing-accent)] focus:ring-1 focus:ring-[var(--landing-accent)] transition-colors"
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={verifyMutation.isPending || otp.length !== 6 || !email}
            className="landing-cta-primary landing-cta-sharp w-full justify-center text-[13px] disabled:opacity-60 cursor-pointer"
          >
            {verifyMutation.isPending ? "Verifying…" : "Verify email"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendMutation.isPending || !canResend || !email}
              className="text-[13px] text-[var(--landing-accent)] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
            >
              {resendMutation.isPending
                ? "Sending…"
                : canResend
                  ? "Resend code"
                  : `Resend in ${cooldown}s`}
            </button>
          </div>

          <p className="text-center text-[13px] text-[var(--landing-fg-faint)]">
            <Link
              to="/signup"
              className="text-[var(--landing-accent)] hover:underline"
            >
              Use a different email
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
