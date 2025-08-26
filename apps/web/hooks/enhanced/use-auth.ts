/**
 * 🔐 Enhanced Authentication Hooks - NeonPro Healthcare
 * ======================================================
 *
 * Type-safe authentication hooks with Zod validation,
 * audit logging, LGPD compliance, and healthcare-specific features.
 */

// Import our enhanced API client and schemas
import { apiClient, ApiHelpers, type ApiResponse } from "@neonpro/shared/api-client";
import {
	type ChangePasswordRequest,
	ChangePasswordRequestSchema,
	type ChangePasswordResponse,
	type ForgotPasswordRequest,
	ForgotPasswordRequestSchema,
	type ForgotPasswordResponse,
	// Types
	type LoginRequest,
	// Schemas for validation
	LoginRequestSchema,
	type LoginResponse,
	LoginResponseSchema,
	RefreshTokenRequestSchema,
	type RefreshTokenResponse,
	RefreshTokenResponseSchema,
	type RegisterRequest,
	RegisterRequestSchema,
	type RegisterResponse,
	RegisterResponseSchema,
	type ResetPasswordRequest,
	ResetPasswordRequestSchema,
	type ResetPasswordResponse,
	type UpdateProfileRequest,
	UpdateProfileRequestSchema,
	type UpdateProfileResponse,
	UpdateProfileResponseSchema,
	type UserBase,
	UserBaseSchema,
	type UserPermission,
	type UserRole,
} from "@neonpro/shared/schemas";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
// Import our enhanced query utilities
import { QueryKeys, useHealthcareQueryUtils } from "@/lib/query/query-utils";

// Enhanced auth context with healthcare-specific features
export type AuthContext = {
	user: UserBase | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: Error | null;

	// Role-based access
	hasRole: (role: UserRole | UserRole[]) => boolean;
	hasPermission: (permission: UserPermission | UserPermission[]) => boolean;
	hasAnyPermission: (permissions: UserPermission[]) => boolean;
	hasAllPermissions: (permissions: UserPermission[]) => boolean;

	// Clinic-specific access
	isClinicOwner: boolean;
	isClinicManager: boolean;
	isProfessional: boolean;
	isPatient: boolean;
	isAdmin: boolean;

	// LGPD compliance status
	hasLgpdConsent: boolean;
	isConsentExpired: boolean;
	consentExpiryDate: Date | null;

	// Session information
	sessionId: string | null;
	lastActivity: Date | null;
	tokenExpiry: Date | null;
};

// 👤 Enhanced profile query with validation and audit logging
export function useProfile() {
	const queryUtils = useHealthcareQueryUtils();

	return queryUtils.createQuery({
		queryKey: QueryKeys.auth.user(),
		queryFn: async () => {
			const response = await apiClient.api.v1.auth.profile.$get();
			return await response.json();
		},
		validator: (data: unknown) => UserBaseSchema.parse(data),
		enableAuditLogging: true,
		sensitiveData: true,
		lgpdCompliant: true,

		// Enhanced options for auth data
		staleTime: 1000 * 60 * 2, // 2 minutes for auth data
		gcTime: 1000 * 60 * 5, // 5 minutes cache

		retry: (failureCount, error) => {
			// Don't retry auth errors
			if (ApiHelpers.isAuthError(error)) {
				return false;
			}
			return failureCount < 2;
		},

		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});
}

// 🚪 Enhanced login mutation with validation and audit logging
export function useLogin() {
	const queryUtils = useHealthcareQueryUtils();
	const router = useRouter();

	return queryUtils.createMutation({
		mutationFn: async (loginData: LoginRequest): Promise<ApiResponse<LoginResponse["data"]>> => {
			// Validate request data
			const validatedData = LoginRequestSchema.parse(loginData);

			const response = await apiClient.api.v1.auth.login.$post({
				json: validatedData,
			});

			return await response.json();
		},

		validator: (data: unknown) =>
			LoginResponseSchema.parse({
				success: true,
				data,
				message: "Login successful",
			}).data!,

		enableAuditLogging: true,
		requiresConsent: false, // Login doesn't require consent, but creates it
		lgpdCompliant: true,
		showSuccessToast: true,
		showErrorToast: true,
		successMessage: "Login realizado com sucesso!",

		// Invalidate and refetch related data
		invalidateQueries: [QueryKeys.auth.user(), QueryKeys.auth.session()],

		onSuccess: (response, _variables) => {
			// Store tokens securely
			if (response.data) {
				apiClient.auth.setTokens(
					response.data.access_token,
					response.data.refresh_token,
					response.data.expires_in,
					response.data.user
				);

				// Log successful login for audit
				apiClient.audit.log({
					timestamp: new Date().toISOString(),
					userId: response.data.user.id,
					sessionId: apiClient.auth.getSessionId() || undefined,
					action: "login",
					resource_type: "auth",
					ip_address: apiClient.utils.getClientIP(),
					user_agent: apiClient.utils.getUserAgent(),
					success: true,
				});

				// Navigate to appropriate dashboard based on role
				const redirectPath = getRoleBasedRedirect(response.data.user.role);
				router.push(redirectPath);
			}
		},

		onError: (error, _variables) => {
			// Clear any partial auth state
			apiClient.auth.clearTokens();

			// Log failed login attempt for security
			apiClient.audit.log({
				timestamp: new Date().toISOString(),
				action: "login",
				resource_type: "auth",
				ip_address: apiClient.utils.getClientIP(),
				user_agent: apiClient.utils.getUserAgent(),
				success: false,
				error_message: ApiHelpers.formatError(error),
			});
		},
	});
}

// 📝 Enhanced register mutation with validation and consent management
export function useRegister() {
	const queryUtils = useHealthcareQueryUtils();
	const router = useRouter();

	return queryUtils.createMutation({
		mutationFn: async (registerData: RegisterRequest): Promise<ApiResponse<RegisterResponse["data"]>> => {
			// Validate request data including LGPD consent
			const validatedData = RegisterRequestSchema.parse(registerData);

			// Ensure LGPD consent is provided
			if (!validatedData.lgpd_consent) {
				throw new Error("Consentimento LGPD é obrigatório para criar uma conta");
			}

			const response = await apiClient.api.v1.auth.register.$post({
				json: validatedData,
			});

			return await response.json();
		},

		validator: (data: unknown) =>
			RegisterResponseSchema.parse({
				success: true,
				data,
				message: "Registration successful",
			}).data!,

		enableAuditLogging: true,
		requiresConsent: false, // Registration creates consent
		lgpdCompliant: true,
		showSuccessToast: true,
		showErrorToast: true,
		successMessage: "Conta criada com sucesso! Verifique seu email.",

		onSuccess: (response, _variables) => {
			// Log successful registration
			apiClient.audit.log({
				timestamp: new Date().toISOString(),
				userId: response.data?.user.id,
				action: "create",
				resource_type: "user",
				ip_address: apiClient.utils.getClientIP(),
				user_agent: apiClient.utils.getUserAgent(),
				success: true,
			});

			// Navigate to email verification or login
			if (response.data?.verification_required) {
				router.push("/auth/verify-email");
			} else {
				router.push("/auth/login");
			}
		},
	});
}

// 🚪 Enhanced logout mutation with audit logging and cleanup
export function useLogout() {
	const queryUtils = useHealthcareQueryUtils();
	const router = useRouter();

	return queryUtils.createMutation({
		mutationFn: async (): Promise<ApiResponse<void>> => {
			const refreshToken = apiClient.auth.getRefreshToken();

			if (refreshToken) {
				const response = await apiClient.api.v1.auth.logout.$post({
					json: { refresh_token: refreshToken, logout_all_devices: false },
				});

				return await response.json();
			}

			return { success: true, message: "Logged out successfully" };
		},

		enableAuditLogging: true,
		lgpdCompliant: true,
		showSuccessToast: true,
		showErrorToast: false, // Don't show error toast for logout
		successMessage: "Logout realizado com sucesso",

		onMutate: async () => {
			// Log logout attempt
			const user = apiClient.auth.getUser();
			if (user) {
				apiClient.audit.log({
					timestamp: new Date().toISOString(),
					userId: user.id,
					sessionId: apiClient.auth.getSessionId() || undefined,
					action: "logout",
					resource_type: "auth",
					ip_address: apiClient.utils.getClientIP(),
					user_agent: apiClient.utils.getUserAgent(),
					success: true,
				});
			}
		},

		onSettled: () => {
			// Always clear tokens and sensitive data
			apiClient.auth.clearTokens();
			queryUtils.clearSensitiveUserData("all");

			// Navigate to login
			router.push("/auth/login");
		},
	});
}

// 🔒 Enhanced change password mutation with validation
export function useChangePassword() {
	const queryUtils = useHealthcareQueryUtils();

	return queryUtils.createMutation({
		mutationFn: async (passwordData: ChangePasswordRequest): Promise<ApiResponse<ChangePasswordResponse["data"]>> => {
			const validatedData = ChangePasswordRequestSchema.parse(passwordData);

			const response = await apiClient.api.v1.auth["change-password"].$post({
				json: validatedData,
			});

			return await response.json();
		},

		enableAuditLogging: true,
		requiresConsent: true,
		lgpdCompliant: true,
		showSuccessToast: true,
		showErrorToast: true,
		successMessage: "Senha alterada com sucesso",

		onSuccess: () => {
			// Log password change for security
			const user = apiClient.auth.getUser();
			if (user) {
				apiClient.audit.log({
					timestamp: new Date().toISOString(),
					userId: user.id,
					sessionId: apiClient.auth.getSessionId() || undefined,
					action: "password_change",
					resource_type: "auth",
					ip_address: apiClient.utils.getClientIP(),
					user_agent: apiClient.utils.getUserAgent(),
					success: true,
				});
			}
		},
	});
}

// 📧 Enhanced forgot password mutation
export function useForgotPassword() {
	const queryUtils = useHealthcareQueryUtils();

	return queryUtils.createMutation({
		mutationFn: async (forgotData: ForgotPasswordRequest): Promise<ApiResponse<ForgotPasswordResponse["data"]>> => {
			const validatedData = ForgotPasswordRequestSchema.parse(forgotData);

			const response = await apiClient.api.v1.auth["forgot-password"].$post({
				json: validatedData,
			});

			return await response.json();
		},

		enableAuditLogging: true,
		showSuccessToast: true,
		showErrorToast: true,
		successMessage: "Instruções enviadas para seu email",
	});
}

// 🔐 Enhanced reset password mutation
export function useResetPassword() {
	const queryUtils = useHealthcareQueryUtils();
	const router = useRouter();

	return queryUtils.createMutation({
		mutationFn: async (resetData: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponse["data"]>> => {
			const validatedData = ResetPasswordRequestSchema.parse(resetData);

			const response = await apiClient.api.v1.auth["reset-password"].$post({
				json: validatedData,
			});

			return await response.json();
		},

		enableAuditLogging: true,
		showSuccessToast: true,
		showErrorToast: true,
		successMessage: "Senha redefinida com sucesso",

		onSuccess: () => {
			// Navigate to login after successful reset
			router.push("/auth/login");
		},
	});
}

// ✏️ Enhanced update profile mutation
export function useUpdateProfile() {
	const queryUtils = useHealthcareQueryUtils();

	return queryUtils.createMutation({
		mutationFn: async (profileData: UpdateProfileRequest): Promise<ApiResponse<UpdateProfileResponse["data"]>> => {
			const validatedData = UpdateProfileRequestSchema.parse(profileData);

			const response = await apiClient.api.v1.auth.profile.$put({
				json: validatedData,
			});

			return await response.json();
		},

		validator: (data: unknown) =>
			UpdateProfileResponseSchema.parse({
				success: true,
				data,
				message: "Profile updated",
			}).data!,

		enableAuditLogging: true,
		requiresConsent: true,
		lgpdCompliant: true,
		showSuccessToast: true,
		showErrorToast: true,
		successMessage: "Perfil atualizado com sucesso",

		// Update cached user data
		invalidateQueries: [QueryKeys.auth.user()],

		onSuccess: (response) => {
			// Update stored user data
			if (response.data?.user) {
				apiClient.auth.setTokens(
					apiClient.auth.getAccessToken()!,
					apiClient.auth.getRefreshToken()!,
					undefined,
					response.data.user
				);
			}
		},
	});
}

// 🔄 Enhanced refresh token mutation (automatic)
export function useRefreshToken() {
	const queryUtils = useHealthcareQueryUtils();

	return queryUtils.createMutation({
		mutationFn: async (): Promise<ApiResponse<RefreshTokenResponse["data"]>> => {
			const refreshToken = apiClient.auth.getRefreshToken();

			if (!refreshToken) {
				throw new Error("No refresh token available");
			}

			const request = RefreshTokenRequestSchema.parse({
				refresh_token: refreshToken,
			});

			const response = await apiClient.api.v1.auth.refresh.$post({
				json: request,
			});

			return await response.json();
		},

		validator: (data: unknown) =>
			RefreshTokenResponseSchema.parse({
				success: true,
				data,
				message: "Token refreshed",
			}).data!,

		enableAuditLogging: false, // Too frequent for audit logs
		showSuccessToast: false,
		showErrorToast: false, // Handled by API client

		onSuccess: (response) => {
			if (response.data) {
				apiClient.auth.setTokens(response.data.access_token, response.data.refresh_token, response.data.expires_in);
			}
		},

		onError: () => {
			// Clear tokens and redirect to login on refresh failure
			apiClient.auth.clearTokens();
			window.location.href = "/auth/login";
		},
	});
}

// 🛡️ Enhanced authentication status hook with comprehensive context
export function useAuthStatus(): AuthContext {
	const { data: user, isLoading, error } = useProfile();

	const authContext = useMemo<AuthContext>(() => {
		const isAuthenticated = !!user && !error;

		// Role checking functions
		const hasRole = (roles: UserRole | UserRole[]): boolean => {
			if (!user) {
				return false;
			}
			const roleArray = Array.isArray(roles) ? roles : [roles];
			return roleArray.includes(user.role);
		};

		const hasPermission = (permissions: UserPermission | UserPermission[]): boolean => {
			if (!user?.permissions) {
				return false;
			}
			const permArray = Array.isArray(permissions) ? permissions : [permissions];
			return permArray.every((perm) => user.permissions.includes(perm));
		};

		const hasAnyPermission = (permissions: UserPermission[]): boolean => {
			if (!user?.permissions) {
				return false;
			}
			return permissions.some((perm) => user.permissions.includes(perm));
		};

		const hasAllPermissions = (permissions: UserPermission[]): boolean => {
			if (!user?.permissions) {
				return false;
			}
			return permissions.every((perm) => user.permissions.includes(perm));
		};

		// LGPD compliance status
		const consentDate = user?.lgpd_consent_date ? new Date(user.lgpd_consent_date) : null;
		const consentExpiryDate = consentDate ? new Date(consentDate.getTime() + 365 * 24 * 60 * 60 * 1000) : null; // 1 year
		const isConsentExpired = consentExpiryDate ? consentExpiryDate < new Date() : false;

		return {
			user: user || null,
			isAuthenticated,
			isLoading,
			error,

			// Role functions
			hasRole,
			hasPermission,
			hasAnyPermission,
			hasAllPermissions,

			// Convenience role checks
			isClinicOwner: hasRole("clinic_owner"),
			isClinicManager: hasRole("clinic_manager"),
			isProfessional: hasRole("professional"),
			isPatient: hasRole("patient"),
			isAdmin: hasRole("admin"),

			// LGPD compliance
			hasLgpdConsent: !!consentDate,
			isConsentExpired,
			consentExpiryDate,

			// Session info
			sessionId: apiClient.auth.getSessionId(),
			lastActivity: user?.last_login ? new Date(user.last_login) : null,
			tokenExpiry: null, // Would need to be calculated from token
		};
	}, [user, isLoading, error]);

	return authContext;
}

// 🔧 Enhanced auth utilities hook
export function useAuthUtils() {
	const queryUtils = useHealthcareQueryUtils();

	return {
		// Clear all auth-related cache
		clearAuthCache: useCallback(() => {
			queryUtils.clearSensitiveUserData("all");
		}, [queryUtils]),

		// Check if token exists and is valid
		hasValidToken: useCallback((): boolean => {
			return apiClient.auth.isAuthenticated() && !apiClient.auth.shouldRefresh();
		}, []),

		// Force refresh profile
		refreshProfile: useCallback(() => {
			return queryUtils.queryClient.invalidateQueries({
				queryKey: QueryKeys.auth.user(),
			});
		}, [queryUtils]),

		// Check LGPD consent status
		checkConsentStatus: useCallback((user: UserBase | null) => {
			if (!user?.lgpd_consent_date) {
				return { hasConsent: false, isExpired: false };
			}

			const consentDate = new Date(user.lgpd_consent_date);
			const expiryDate = new Date(consentDate.getTime() + 365 * 24 * 60 * 60 * 1000);
			const isExpired = expiryDate < new Date();

			return { hasConsent: true, isExpired, expiryDate };
		}, []),

		// Get user permissions for a specific resource
		getResourcePermissions: useCallback((user: UserBase | null, resourceType: string) => {
			if (!user?.permissions) {
				return [];
			}

			return user.permissions.filter((perm) => perm.includes(resourceType));
		}, []),

		// Export user data for LGPD compliance
		exportUserData: useCallback(
			async (userId: string) => {
				return await queryUtils.exportUserData(userId);
			},
			[queryUtils]
		),
	};
}

// Helper function to get role-based redirect path
function getRoleBasedRedirect(role: UserRole): string {
	switch (role) {
		case "admin":
			return "/admin/dashboard";
		case "clinic_owner":
		case "clinic_manager":
			return "/clinic/dashboard";
		case "professional":
			return "/professional/dashboard";
		case "patient":
			return "/patient/dashboard";
		default:
			return "/dashboard";
	}
}

// 🔧 Main unified auth hook - combines all auth functionality
export function useAuth() {
	const authStatus = useAuthStatus();
	const authUtils = useAuthUtils();
	const login = useLogin();
	const logout = useLogout();
	const register = useRegister();
	const profile = useProfile();
	const changePassword = useChangePassword();
	const forgotPassword = useForgotPassword();
	const resetPassword = useResetPassword();
	const updateProfile = useUpdateProfile();
	const refreshToken = useRefreshToken();

	return {
		// Core authentication state
		...authStatus,

		// Auth utilities
		...authUtils,

		// Authentication actions
		login: login.mutate,
		loginAsync: login.mutateAsync,
		logout: logout.mutate,
		logoutAsync: logout.mutateAsync,
		register: register.mutate,
		registerAsync: register.mutateAsync,

		// Profile management
		profile: profile.data,
		updateProfile: updateProfile.mutate,
		updateProfileAsync: updateProfile.mutateAsync,

		// Password management
		changePassword: changePassword.mutate,
		changePasswordAsync: changePassword.mutateAsync,
		forgotPassword: forgotPassword.mutate,
		forgotPasswordAsync: forgotPassword.mutateAsync,
		resetPassword: resetPassword.mutate,
		resetPasswordAsync: resetPassword.mutateAsync,

		// Token management
		refreshToken: refreshToken.mutate,
		refreshTokenAsync: refreshToken.mutateAsync,

		// Loading states
		isLoggingIn: login.isPending,
		isLoggingOut: logout.isPending,
		isRegistering: register.isPending,
		isUpdatingProfile: updateProfile.isPending,
		isChangingPassword: changePassword.isPending,
		isForgettingPassword: forgotPassword.isPending,
		isResettingPassword: resetPassword.isPending,
		isRefreshingToken: refreshToken.isPending,

		// Error states
		loginError: login.error,
		logoutError: logout.error,
		registerError: register.error,
		updateProfileError: updateProfile.error,
		changePasswordError: changePassword.error,
		forgotPasswordError: forgotPassword.error,
		resetPasswordError: resetPassword.error,
		refreshTokenError: refreshToken.error,
	};
}
