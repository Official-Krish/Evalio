import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "motion/react"
import { signupSchema, type SignupInput } from "@ai-interview/shared"
import { useSignup } from "../lib/auth"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import toast from "react-hot-toast"

export function SignupPage() {
  const navigate = useNavigate()
  const signupMutation = useSignup()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = (data: SignupInput) => {
    signupMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Account created!")
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
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Start your AI interview practice</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4">
          <Input
            label="Name"
            placeholder="Your name"
            error={errors.name?.message}
            {...register("name")}
          />
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
            placeholder="At least 6 characters"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" loading={signupMutation.isPending} className="w-full">
            Create account
          </Button>
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
