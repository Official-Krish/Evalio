import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "./api"
import type {
  LoginInput,
  SignupInput,
  VerifyOtpInput,
  ResendOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@evalio/shared"

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: api.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LoginInput) => api.login(input),
    onSuccess: (data) => {
      queryClient.setQueryData(["session"], data)
    },
  })
}

export function useSignup() {
  return useMutation({
    mutationFn: (input: SignupInput) => api.signup(input),
  })
}

export function useVerifyOtp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: VerifyOtpInput) => api.verifyOtp(input),
    onSuccess: (data) => {
      queryClient.setQueryData(["session"], data)
    },
  })
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (input: ResendOtpInput) => api.resendOtp(input),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => api.forgotPassword(input),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => api.resetPassword(input),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["session"], { user: null })
    },
  })
}
