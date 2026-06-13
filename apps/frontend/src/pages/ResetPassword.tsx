import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "motion/react"
import { resetPasswordSchema, passwordRequirements, type ResetPasswordInput } from "@ai-interview/shared"
import { useResetPassword, useForgotPassword } from "../lib/auth"
import { useResendTimer } from "../lib/useResendTimer"
import { AuthLayout } from "@/components/static/AuthLayout"
import toast from "react-hot-toast"

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const emailParam = searchParams.get("email") ?? ""

  const [showPassword, setShowPassword] = useState(false)
  const [digits, setDigits] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { cooldown, canResend, startCooldown } = useResendTimer()

  const resetMutation = useResetPassword()
  const forgotMutation = useForgotPassword()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: emailParam, otp: "", password: "" },
  })

  const watchedPassword = watch("password", "")
  const otp = digits.join("")

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]
    next[index] = value.slice(-1)
    setDigits(next)
    setValue("otp", next.join(""))
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text")
    const nums = text.replace(/\D/g, "").slice(0, 6).split("")
    const next = ["", "", "", "", "", ""]
    nums.forEach((n, i) => { next[i] = n })
    setDigits(next)
    setValue("otp", next.join(""))
    const focusAt = Math.min(nums.length, 5)
    inputRefs.current[focusAt]?.focus()
  }

  const handleResend = () => {
    forgotMutation.mutate(
      { email: emailParam },
      {
        onSuccess: () => {
          toast.success("New code sent!")
          startCooldown()
          setDigits(["", "", "", "", "", ""])
          inputRefs.current[0]?.focus()
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const onSubmit = (data: ResetPasswordInput) => {
    resetMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Password reset! Sign in with your new password.")
        navigate("/login")
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <AuthLayout variant="login">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px]"
      >
        <div className="mb-8 lg:mb-10">
          <p className="static-badge">Reset password</p>
          <h1 className="static-title mt-4 text-[2rem]">Set a new password.</h1>
          <p className="static-subtitle mt-2">
            Enter the code sent to <span className="text-[var(--landing-fg)] font-medium">{emailParam || "your email"}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="static-auth-card space-y-5">
          <input type="hidden" {...register("email")} />

          <div>
            <label className="static-label">Reset code</label>
            <div className="flex gap-2 justify-between mt-1.5">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
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
            {errors.otp && <p className="mt-1 text-[12px] text-red-400">{errors.otp.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="static-label">New password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                className="static-input pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--landing-fg-faint)] hover:text-[var(--landing-fg)] transition-colors text-sm"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-[12px] text-red-400">{errors.password.message}</p>}
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {passwordRequirements.map((req) => {
                const met = !watchedPassword || req.test(watchedPassword)
                return (
                  <div
                    key={req.label}
                    className={`text-[11px] flex items-center gap-1.5 transition-colors ${
                      !watchedPassword
                        ? "text-[var(--landing-fg-faint)]"
                        : met
                          ? "text-emerald-400"
                          : "text-red-400"
                    }`}
                  >
                    <span className="text-[13px] leading-none shrink-0">{met ? "✓" : "○"}</span>
                    {req.label}
                  </div>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={resetMutation.isPending || otp.length !== 6}
            className="landing-cta-primary landing-cta-sharp w-full justify-center text-[13px] disabled:opacity-60"
          >
            {resetMutation.isPending ? "Resetting…" : "Reset password"}
          </button>

          <p className="text-center text-[13px] text-[var(--landing-fg-faint)]">
            <button
              type="button"
              onClick={handleResend}
              disabled={forgotMutation.isPending || !canResend}
              className="text-[var(--landing-accent)] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
            >
              {forgotMutation.isPending
                ? "Sending…"
                : canResend
                  ? "Resend code"
                  : `Resend in ${cooldown}s`}
            </button>
          </p>
        </form>
      </motion.div>
    </AuthLayout>
  )
}
