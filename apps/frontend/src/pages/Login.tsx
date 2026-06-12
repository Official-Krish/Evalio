import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "motion/react"
import { loginSchema, type LoginInput } from "@ai-interview/shared"
import { useLogin } from "../lib/auth"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <svg width="40" height="40" viewBox="0 0 28 28" fill="none" className="mx-auto mb-4">
            <rect width="28" height="28" rx="8" fill="var(--color-accent)" />
            <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6z" fill="white" opacity="0.9" />
            <path d="M11 14c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3z" fill="var(--color-accent)" />
            <path d="M14 6v3m0 10v3M6 14h3m10 0h3" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Sign in to continue your interviews</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" loading={loginMutation.isPending} className="w-full">
            Sign in
          </Button>
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent hover:underline">Create one</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
