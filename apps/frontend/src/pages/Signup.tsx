import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "motion/react"
import { signupSchema, type SignupInput } from "@ai-interview/shared"
import { useSignup } from "../lib/auth"
import { AuthLayout } from "@/components/static/AuthLayout"
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
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="mb-8">
          <p className="static-badge">Get started</p>
          <h1 className="static-title mt-4 text-[2rem]">Start interviewing.</h1>
          <p className="static-subtitle mt-2">Free during early access. No card required.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="static-auth-card space-y-4">
          <div>
            <label htmlFor="name" className="static-label">Name</label>
            <input id="name" type="text" placeholder="Your name" className="static-input" {...register("name")} />
            {errors.name && <p className="mt-1 text-[12px] text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="static-label">Email</label>
            <input id="email" type="email" placeholder="you@example.com" className="static-input" {...register("email")} />
            {errors.email && <p className="mt-1 text-[12px] text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="static-label">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              className="static-input"
              {...register("password")}
            />
            {errors.password && <p className="mt-1 text-[12px] text-red-400">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="landing-cta-primary landing-cta-sharp w-full justify-center text-[13px] disabled:opacity-60"
          >
            {signupMutation.isPending ? "Creating…" : "Start interview"}
          </button>
          <p className="text-center text-[13px] text-[var(--landing-fg-faint)]">
            Already have an account?{" "}
            <Link to="/login" className="text-[var(--landing-accent)] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </AuthLayout>
  )
}
