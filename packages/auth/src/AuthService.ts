/**
 * Enterprise Authentication Service
 * Full integration with EnhancedServiceBase and enterprise security
 */

import { EnhancedServiceBase } from "@neonpro/core-services";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import speakeasy from "speakeasy";
import type {
	AuthConfig,
	AuthSession,
	DeviceInfo,
	LoginCredentials,
	LoginResult,
	MfaSetupResult,
	Permission,
	RolePermissions,
	SecurityEvent,
	TokenPayload,
	User,
} from "./types";

/**
 * Healthcare-compliant authentication service with enterprise features
 */
export class AuthService extends EnhancedServiceBase {
	private readonly config: AuthConfig;
	private readonly supabase: SupabaseClient;
	private readonly rolePermissions: RolePermissions;

	constructor(config: AuthConfig, supabaseUrl: string, supabaseKey: string) {
		super("auth-service", {
			enableCache: true,
			enableAnalytics: true,
			enableSecurity: true,
			enableAudit: true,
			healthCheck: {
				enabled: true,
				interval: 30000, // 30 seconds
				timeout: 5000,
			},
		});

		this.config = config;
		this.supabase = createClient(supabaseUrl, supabaseKey);
		this.rolePermissions = this.initializeRolePermissions();
	}

	/**
	 * Authenticate user with enterprise security features
	 */
	async login(credentials: LoginCredentials): Promise<LoginResult> {
		const startTime = this.startTiming("auth_login");

		try {
			// Security: Rate limiting check
			const rateLimitKey = `login_attempts_${credentials.email}`;
			const attempts = await this.security.checkRateLimit(rateLimitKey, this.config.maxLoginAttempts);

			if (attempts >= this.config.maxLoginAttempts) {
				await this.logSecurityEvent({
					type: "failed_login",
					ip: credentials.deviceInfo?.ip || "",
					userAgent: credentials.deviceInfo?.userAgent || "",
					timestamp: new Date(),
					details: { email: credentials.email, reason: "rate_limited" },
					riskScore: 8,
				});

				return {
					success: false,
					error: "Too many login attempts. Please try again later.",
				};
			}

			// Fetch user from database
			const { data: user, error } = await this.supabase
				.from("users")
				.select("*")
				.eq("email", credentials.email)
				.single();

			if (error || !user) {
				await this.incrementLoginAttempts(credentials.email);
				return { success: false, error: "Invalid credentials" };
			}

			// Verify password
			const passwordValid = await bcrypt.compare(credentials.password, user.password_hash);
			if (!passwordValid) {
				await this.incrementLoginAttempts(credentials.email);
				await this.logSecurityEvent({
					type: "failed_login",
					userId: user.id,
					ip: credentials.deviceInfo?.ip || "",
					userAgent: credentials.deviceInfo?.userAgent || "",
					timestamp: new Date(),
					details: { email: credentials.email, reason: "invalid_password" },
					riskScore: 6,
				});

				return { success: false, error: "Invalid credentials" };
			}

			// Check if MFA is required
			if (user.mfa_enabled && !credentials.mfaCode) {
				return {
					success: false,
					requiresMfa: true,
					error: "MFA code required",
				};
			}

			// Verify MFA if provided
			if (user.mfa_enabled && credentials.mfaCode) {
				const mfaValid = speakeasy.totp.verify({
					secret: user.mfa_secret,
					encoding: "base32",
					token: credentials.mfaCode,
					window: 2,
				});

				if (!mfaValid) {
					await this.logSecurityEvent({
						type: "mfa_failure",
						userId: user.id,
						ip: credentials.deviceInfo?.ip || "",
						userAgent: credentials.deviceInfo?.userAgent || "",
						timestamp: new Date(),
						details: { email: credentials.email },
						riskScore: 7,
					});

					return { success: false, error: "Invalid MFA code" };
				}
			}

			// Create session
			const session = await this.createSession(user, credentials.deviceInfo);

			// Generate tokens
			const accessToken = this.generateAccessToken(user, session.id);
			const refreshToken = this.generateRefreshToken(user.id, session.id);

			// Log successful login
			await this.logSecurityEvent({
				type: "login",
				userId: user.id,
				ip: credentials.deviceInfo?.ip || "",
				userAgent: credentials.deviceInfo?.userAgent || "",
				timestamp: new Date(),
				details: { email: credentials.email, sessionId: session.id },
				riskScore: 1,
			});

			// Clear login attempts
			await this.security.clearRateLimit(rateLimitKey);

			// Track analytics
			await this.analytics.trackEvent("user_login", {
				userId: user.id,
				role: user.role,
				mfaEnabled: user.mfa_enabled,
				deviceTrusted: credentials.deviceInfo?.trusted || false,
			});

			this.endTiming("auth_login", startTime);

			return {
				success: true,
				user: this.mapToUserInterface(user),
				accessToken,
				refreshToken,
				sessionId: session.id,
			};
		} catch (error) {
			this.endTiming("auth_login", startTime, { error: true });

			await this.audit.logOperation("login_error", {
				email: credentials.email,
				error: error.message,
				timestamp: new Date(),
			});

			return {
				success: false,
				error: "Authentication service error",
			};
		}
	}

	/**
	 * Logout user and invalidate session
	 */
	async logout(sessionId: string): Promise<void> {
		try {
			const session = await this.getSession(sessionId);
			if (session) {
				// Invalidate session
				await this.supabase.from("auth_sessions").update({ is_active: false }).eq("id", sessionId);

				// Log security event
				await this.logSecurityEvent({
					type: "logout",
					userId: session.userId,
					ip: "",
					userAgent: "",
					timestamp: new Date(),
					details: { sessionId },
					riskScore: 1,
				});

				// Clear cached session
				await this.cache.delete(`session_${sessionId}`);
			}
		} catch (error) {
			await this.audit.logOperation("logout_error", {
				sessionId,
				error: error.message,
				timestamp: new Date(),
			});
		}
	} /**
	 * Verify and refresh access token
	 */
	async refreshToken(refreshToken: string): Promise<LoginResult> {
		try {
			const payload = jwt.verify(refreshToken, this.config.jwtSecret) as TokenPayload;

			const session = await this.getSession(payload.sessionId);
			if (!session || !session.isActive) {
				return { success: false, error: "Invalid session" };
			}

			const { data: user } = await this.supabase.from("users").select("*").eq("id", payload.userId).single();

			if (!user) {
				return { success: false, error: "User not found" };
			}

			// Generate new access token
			const accessToken = this.generateAccessToken(user, session.id);

			return {
				success: true,
				user: this.mapToUserInterface(user),
				accessToken,
				sessionId: session.id,
			};
		} catch (_error) {
			return { success: false, error: "Invalid refresh token" };
		}
	}

	/**
	 * Setup MFA for user
	 */
	async setupMfa(userId: string): Promise<MfaSetupResult> {
		try {
			const secret = speakeasy.generateSecret({
				name: `NeonPro Healthcare (${userId})`,
				issuer: "NeonPro",
			});

			const qrCode = secret.otpauth_url ? await QRCode.toDataURL(secret.otpauth_url) : "";

			// Generate backup codes
			const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());

			// Store MFA secret temporarily (user must verify to activate)
			await this.cache.set(
				`mfa_setup_${userId}`,
				{
					secret: secret.base32,
					backupCodes,
					expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
				},
				600000,
			);

			return {
				secret: secret.base32 || "",
				qrCode,
				backupCodes,
			};
		} catch (_error) {
			throw new Error("Failed to setup MFA");
		}
	}

	/**
	 * Verify MFA setup and activate
	 */
	async verifyMfaSetup(userId: string, code: string): Promise<boolean> {
		try {
			const setup = await this.cache.get(`mfa_setup_${userId}`);
			if (!setup) {
				return false;
			}

			const verified = speakeasy.totp.verify({
				secret: setup.secret,
				encoding: "base32",
				token: code,
				window: 2,
			});

			if (verified) {
				// Activate MFA for user
				await this.supabase
					.from("users")
					.update({
						mfa_enabled: true,
						mfa_secret: setup.secret,
					})
					.eq("id", userId);

				// Store backup codes
				await this.supabase.from("user_backup_codes").insert(
					setup.backupCodes.map((code: string) => ({
						user_id: userId,
						code: code,
						used: false,
					})),
				);

				// Clear setup cache
				await this.cache.delete(`mfa_setup_${userId}`);

				await this.audit.logOperation("mfa_enabled", {
					userId,
					timestamp: new Date(),
				});

				return true;
			}

			return false;
		} catch (_error) {
			return false;
		}
	}

	/**
	 * Check user permissions for resource access
	 */
	async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
		try {
			const cacheKey = `permissions_${userId}`;
			let userPermissions = await this.cache.get(cacheKey);

			if (!userPermissions) {
				const { data: user } = await this.supabase.from("users").select("role, permissions").eq("id", userId).single();

				if (!user) return false;

				// Get role-based permissions
				const rolePerms = this.rolePermissions[user.role] || [];

				// Combine with user-specific permissions
				userPermissions = [...rolePerms, ...(user.permissions || [])];

				// Cache for 5 minutes
				await this.cache.set(cacheKey, userPermissions, 300000);
			}

			return userPermissions.some((perm: Permission) => perm.resource === resource && perm.action === action);
		} catch (_error) {
			return false;
		}
	}

	/**
	 * Get user sessions
	 */
	async getUserSessions(userId: string): Promise<AuthSession[]> {
		try {
			const { data: sessions } = await this.supabase
				.from("auth_sessions")
				.select("*")
				.eq("user_id", userId)
				.eq("is_active", true)
				.order("last_activity", { ascending: false });

			return sessions || [];
		} catch (_error) {
			return [];
		}
	}

	/**
	 * Revoke user session
	 */
	async revokeSession(sessionId: string): Promise<void> {
		try {
			await this.supabase.from("auth_sessions").update({ is_active: false }).eq("id", sessionId);

			await this.cache.delete(`session_${sessionId}`);
		} catch (_error) {
			// Handle error silently
		}
	}

	// Private helper methods
	private generateAccessToken(user: User, sessionId: string): string {
		const payload: TokenPayload = {
			userId: user.id,
			email: user.email,
			role: user.role,
			permissions: this.rolePermissions[user.role] || [],
			sessionId,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + this.parseTimeToSeconds(this.config.jwtExpiresIn),
		};

		return jwt.sign(payload, this.config.jwtSecret);
	}

	private generateRefreshToken(userId: string, sessionId: string): string {
		const payload = {
			userId,
			sessionId,
			type: "refresh",
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + this.parseTimeToSeconds(this.config.refreshTokenExpiresIn),
		};

		return jwt.sign(payload, this.config.jwtSecret);
	}

	private async createSession(user: User, deviceInfo?: DeviceInfo): Promise<AuthSession> {
		const session = {
			id: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
			user_id: user.id,
			device_info: deviceInfo || {},
			expires_at: new Date(Date.now() + this.config.sessionTimeout),
			last_activity: new Date(),
			is_active: true,
		};

		await this.supabase.from("auth_sessions").insert(session);

		// Cache session for quick access
		await this.cache.set(`session_${session.id}`, session, this.config.sessionTimeout);

		return {
			id: session.id,
			userId: session.user_id,
			deviceInfo: session.device_info,
			expiresAt: session.expires_at,
			lastActivity: session.last_activity,
			isActive: session.is_active,
		};
	}

	private async getSession(sessionId: string): Promise<AuthSession | null> {
		try {
			// Try cache first
			const cached = await this.cache.get(`session_${sessionId}`);
			if (cached) {
				return cached;
			}

			// Fallback to database
			const { data: session } = await this.supabase
				.from("auth_sessions")
				.select("*")
				.eq("id", sessionId)
				.eq("is_active", true)
				.single();

			if (session) {
				const authSession = {
					id: session.id,
					userId: session.user_id,
					deviceInfo: session.device_info,
					expiresAt: new Date(session.expires_at),
					lastActivity: new Date(session.last_activity),
					isActive: session.is_active,
				};

				// Update cache
				await this.cache.set(`session_${sessionId}`, authSession, 300000);
				return authSession;
			}

			return null;
		} catch (_error) {
			return null;
		}
	}

	private async logSecurityEvent(event: SecurityEvent): Promise<void> {
		try {
			await this.supabase.from("security_events").insert(event);

			// High-risk events need immediate audit
			if (event.riskScore >= 7) {
				await this.audit.logOperation("high_risk_security_event", event);
			}
		} catch (_error) {
			// Continue execution even if logging fails
		}
	}

	private async incrementLoginAttempts(email: string): Promise<void> {
		const key = `login_attempts_${email}`;
		await this.security.incrementRateLimit(key, 3600); // 1 hour window
	}

	private mapToUserInterface(dbUser: Record<string, unknown>): User {
		return {
			id: dbUser.id,
			email: dbUser.email,
			name: dbUser.name,
			role: dbUser.role,
			healthcareProvider: dbUser.healthcare_provider,
			permissions: dbUser.permissions || [],
			mfaEnabled: dbUser.mfa_enabled,
			lastLogin: dbUser.last_login ? new Date(dbUser.last_login) : undefined,
			createdAt: new Date(dbUser.created_at),
			updatedAt: new Date(dbUser.updated_at),
		};
	}

	private parseTimeToSeconds(timeString: string): number {
		const units: Record<string, number> = {
			s: 1,
			m: 60,
			h: 3600,
			d: 86400,
		};

		const match = timeString.match(/^(\d+)([smhd])$/);
		if (!match) return 3600; // default 1 hour

		const [, value, unit] = match;
		return parseInt(value, 10) * units[unit];
	}

	private initializeRolePermissions(): RolePermissions {
		return {
			admin: [{ resource: "*", action: "*" }],
			manager: [
				{ resource: "patients", action: "read" },
				{ resource: "patients", action: "write" },
				{ resource: "appointments", action: "*" },
				{ resource: "reports", action: "*" },
				{ resource: "staff", action: "read" },
			],
			doctor: [
				{ resource: "patients", action: "read" },
				{ resource: "patients", action: "write" },
				{ resource: "appointments", action: "read" },
				{ resource: "appointments", action: "write" },
				{ resource: "medical_records", action: "*" },
				{ resource: "prescriptions", action: "*" },
			],
			nurse: [
				{ resource: "patients", action: "read" },
				{ resource: "appointments", action: "read" },
				{ resource: "medical_records", action: "read" },
				{ resource: "vital_signs", action: "*" },
			],
			receptionist: [
				{ resource: "patients", action: "read" },
				{ resource: "appointments", action: "*" },
				{ resource: "scheduling", action: "*" },
			],
			patient: [
				{ resource: "own_data", action: "read" },
				{ resource: "own_appointments", action: "read" },
				{ resource: "own_medical_records", action: "read" },
			],
			auditor: [
				{ resource: "audit_logs", action: "read" },
				{ resource: "compliance_reports", action: "read" },
				{ resource: "security_events", action: "read" },
			],
			system: [
				{ resource: "*", action: "read" },
				{ resource: "system_operations", action: "*" },
			],
		};
	}
}
