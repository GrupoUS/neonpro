/**
 * 🔐 Authentication Hooks - NeonPro Healthcare
 * =============================================
 *
 * Hooks customizados para autenticação com TanStack Query
 * e integração completa com Hono RPC client.
 */

import { apiClient } from "@neonpro/shared/api-client";
import type {
	AuthUser,
	ChangePassword,
	ForgotPassword,
	Login,
	LoginResponse,
	Register,
	RegisterResponse,
	ResetPassword,
} from "@neonpro/shared/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys for auth
export const AUTH_QUERY_KEYS = {
	profile: ["auth", "profile"] as const,
	user: (id: string) => ["auth", "user", id] as const,
} as const;

// 👤 Get current user profile
export function useProfile() {
	return useQuery({
		queryKey: AUTH_QUERY_KEYS.profile,
		queryFn: async () => {
			const response = await apiClient.api.v1.auth.profile.$get();
			const result = await response.json();

			if (!result.success) {
				throw new Error(result.message || "Failed to fetch profile");
			}

			return result.data;
		},
		retry: (failureCount, error: any) => {
			// Don't retry on auth errors
			if (error?.message?.includes("UNAUTHORIZED")) {
				return false;
			}
			return failureCount < 2;
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
	});
}

// 🚪 Login mutation
export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (loginData: Login): Promise<LoginResponse> => {
			const response = await apiClient.api.v1.auth.login.$post({
				json: loginData,
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.message || "Login failed");
			}

			// Store tokens
			if (result.data?.tokens) {
				apiClient.auth.setTokens(result.data.tokens.accessToken, result.data.tokens.refreshToken);
			}

			return result as LoginResponse;
		},

		onSuccess: (data) => {
			// Cache user data
			if (data.data?.user) {
				queryClient.setQueryData(AUTH_QUERY_KEYS.profile, data.data.user);
			}

			// Invalidate any cached data that might need refresh
			queryClient.invalidateQueries({
				queryKey: ["auth"],
			});
		},

		onError: (error) => {
			console.error("Login failed:", error);
			// Clear any cached auth data
			queryClient.removeQueries({
				queryKey: ["auth"],
			});
		},
	});
}

// 📝 Register mutation
export function useRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (registerData: Register): Promise<RegisterResponse> => {
			const response = await apiClient.api.v1.auth.register.$post({
				json: registerData,
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.message || "Registration failed");
			}

			return result as RegisterResponse;
		},

		onSuccess: () => {
			// Invalidate auth queries
			queryClient.invalidateQueries({
				queryKey: ["auth"],
			});
		},
	});
}

// 🚪 Logout mutation
export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const response = await apiClient.api.v1.auth.logout.$post();
			const result = await response.json();

			if (!result.success) {
				throw new Error(result.message || "Logout failed");
			}

			return result;
		},

		onSuccess: () => {
			// Clear tokens
			apiClient.auth.clearTokens();

			// Clear all cached data
			queryClient.clear();
		},

		onSettled: () => {
			// Always clear auth data, even on error
			apiClient.auth.clearTokens();
			queryClient.removeQueries({
				queryKey: ["auth"],
			});
		},
	});
}

// 🔒 Change password mutation
export function useChangePassword() {
	return useMutation({
		mutationFn: async (passwordData: ChangePassword) => {
			const response = await apiClient.api.v1.auth["change-password"].$post({
				json: passwordData,
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.message || "Password change failed");
			}

			return result;
		},
	});
}

// 📧 Forgot password mutation
export function useForgotPassword() {
	return useMutation({
		mutationFn: async (forgotData: ForgotPassword) => {
			const response = await apiClient.api.v1.auth["forgot-password"].$post({
				json: forgotData,
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.message || "Password reset request failed");
			}

			return result;
		},
	});
}

// 🔐 Reset password mutation
export function useResetPassword() {
	return useMutation({
		mutationFn: async (resetData: ResetPassword) => {
			const response = await apiClient.api.v1.auth["reset-password"].$post({
				json: resetData,
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.message || "Password reset failed");
			}

			return result;
		},
	});
}

// 🔄 Refresh token mutation (usually automatic)
export function useRefreshToken() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const refreshToken = apiClient.auth.getAccessToken();

			if (!refreshToken) {
				throw new Error("No refresh token available");
			}

			const response = await apiClient.api.v1.auth.refresh.$post({
				json: { refreshToken },
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error("Token refresh failed");
			}

			// Update tokens
			if (result.data?.tokens) {
				apiClient.auth.setTokens(result.data.tokens.accessToken, result.data.tokens.refreshToken);
			}

			return result;
		},

		onError: () => {
			// Clear tokens and cached data on refresh failure
			apiClient.auth.clearTokens();
			queryClient.removeQueries({
				queryKey: ["auth"],
			});
		},
	});
}

// 🛡️ Check authentication status
export function useAuthStatus() {
	const { data: user, isLoading, error } = useProfile();

	return {
		isAuthenticated: !!user && !error,
		user,
		isLoading,
		error,
		hasRole: (role: string) => user?.role === role,
		hasPermission: (permission: string) => user?.permissions?.includes(permission) ?? false,
	};
}

// 🔧 Auth utilities hook
export function useAuthUtils() {
	const queryClient = useQueryClient();

	return {
		// Clear all auth-related cache
		clearAuthCache: () => {
			queryClient.removeQueries({
				queryKey: ["auth"],
			});
		},

		// Update cached user data
		updateUser: (userData: Partial<AuthUser>) => {
			queryClient.setQueryData(AUTH_QUERY_KEYS.profile, (old: AuthUser | undefined) => {
				if (!old) return old;
				return { ...old, ...userData };
			});
		},

		// Check if token exists (doesn't validate)
		hasToken: () => !!apiClient.auth.getAccessToken(),

		// Force refresh profile
		refreshProfile: () => {
			queryClient.invalidateQueries({
				queryKey: AUTH_QUERY_KEYS.profile,
			});
		},
	};
}
