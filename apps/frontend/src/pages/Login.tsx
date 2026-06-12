import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "motion/react"
import { loginSchema, type LoginInput } from "@ai-interview/shared"
import { useLogin } from "../lib/auth"
import { AuthLayout } from "@/components/static/AuthLayout"
import toast from "react-hot-toast"

export function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Welcome back!")
        navigate("/dashboard")
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="mb-8">
          <p className="static-badge">Sign in</p>
          <h1 className="static-title mt-4 text-[2rem]">Welcome back.</h1>
          <p className="static-subtitle mt-2">Continue where you left off.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="static-auth-card space-y-4">
          <div>
            <label htmlFor="email" className="static-label">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="static-input"
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-[12px] text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="static-label">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="static-input"
              {...register("password")}
            />
            {errors.password && <p className="mt-1 text-[12px] text-red-400">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="landing-cta-primary landing-cta-sharp w-full justify-center text-[13px] disabled:opacity-60"
          >
            {loginMutation.isPending ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-[13px] text-[var(--landing-fg-faint)]">
            No account?{" "}
            <Link to="/signup" className="text-[var(--landing-accent)] hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </motion.div>
    </AuthLayout>
  )
}
