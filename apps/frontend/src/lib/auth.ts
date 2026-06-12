import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "./api"
import type { LoginInput, SignupInput } from "@ai-interview/shared"

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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SignupInput) => api.signup(input),
    onSuccess: (data) => {
      queryClient.setQueryData(["session"], data)
    },
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
