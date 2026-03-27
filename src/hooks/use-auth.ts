// ─── TanStack Query hooks — Auth ─────────────────────────────────────────────
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { User, ApiResponse } from '@/types';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@/lib/schemas';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ─── Current user ─────────────────────────────────────────────────────────────
export function useCurrentUser() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () =>
      apiClient.get<ApiResponse<User>>('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    enabled: Boolean(accessToken),
  });
}

// ─── Register ─────────────────────────────────────────────────────────────────
export function useRegister() {
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: (data: Omit<RegisterInput, 'confirmPassword'>) =>
      apiClient.post<ApiResponse<AuthTokens>>('/auth/register', data),
    onSuccess: ({ data }) => {
      setUser(data.user);
    },
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function useLogin() {
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: (data: LoginInput) => apiClient.post<ApiResponse<AuthTokens>>('/auth/login', data),
    onSuccess: ({ data }) => {
      setUser(data.user);
    },
  });
}

// ─── Forgot password ──────────────────────────────────────────────────────────
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) =>
      apiClient.post<ApiResponse<null>>('/auth/forgot-password', data),
  });
}

// ─── Reset password ───────────────────────────────────────────────────────────
export function useResetPassword(token: string) {
  return useMutation({
    mutationFn: (data: Pick<ResetPasswordInput, 'password'>) =>
      apiClient.post<ApiResponse<null>>('/auth/reset-password', { ...data, token }),
  });
}
