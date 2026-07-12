import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { LoginInput, SignupInput } from "../schema";

export function useLogin() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (response) => {
      const { user, token } = response.data;
      setAuth(user, token);
    },
  });
}

export function useSignup() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: SignupInput) => authService.signup(data),
    onSuccess: (response) => {
      const { user, token } = response.data;
      setAuth(user, token);
    },
  });
}

export function useMe() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["auth-me"],
    queryFn: () => authService.getMe(),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
