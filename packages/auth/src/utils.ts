/**
 * Authentication Utilities
 * Helper functions for authentication and security
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { PasswordPolicy, TokenPayload } from "./types";

/**
 * JWT Token utilities
 */

/**
 * Verify JWT token and extract payload
 */
export function verifyToken(token: string, secret: string): TokenPayload | null {
	try {
		return jwt.verify(token, secret) as TokenPayload;
	} catch (_error) {
		return null;
	}
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
	try {
		const decoded = jwt.decode(token) as TokenPayload;
		if (!decoded || !decoded.exp) return true;

		return Date.now() >= decoded.exp * 1000;
	} catch (_error) {
		return true;
	}
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
	try {
		const decoded = jwt.decode(token) as TokenPayload;
		if (!decoded || !decoded.exp) return null;

		return new Date(decoded.exp * 1000);
	} catch (_error) {
		return null;
	}
}

/**
 * Extract user ID from token
 */
export function getUserIdFromToken(token: string): string | null {
	try {
		const decoded = jwt.decode(token) as TokenPayload;
		return decoded?.userId || null;
	} catch (_error) {
		return null;
	}
}

/**
 * Password utilities
 */

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
	const saltRounds = 12;
	return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}

/**
 * Validate password against policy
 */
export function validatePassword(
	password: string,
	policy: PasswordPolicy,
): {
	valid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (password.length < policy.minLength) {
		errors.push(`Password must be at least ${policy.minLength} characters long`);
	}

	if (policy.requireUppercase && !/[A-Z]/.test(password)) {
		errors.push("Password must contain at least one uppercase letter");
	}

	if (policy.requireLowercase && !/[a-z]/.test(password)) {
		errors.push("Password must contain at least one lowercase letter");
	}

	if (policy.requireNumbers && !/\d/.test(password)) {
		errors.push("Password must contain at least one number");
	}

	if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		errors.push("Password must contain at least one special character");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Generate secure random password
 */
export function generateSecurePassword(length: number = 16): string {
	const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const lowercase = "abcdefghijklmnopqrstuvwxyz";
	const numbers = "0123456789";
	const special = '!@#$%^&*(),.?":{}|<>';

	const allChars = uppercase + lowercase + numbers + special;
	let password = "";

	// Ensure at least one character from each category
	password += uppercase[Math.floor(Math.random() * uppercase.length)];
	password += lowercase[Math.floor(Math.random() * lowercase.length)];
	password += numbers[Math.floor(Math.random() * numbers.length)];
	password += special[Math.floor(Math.random() * special.length)];

	// Fill the rest randomly
	for (let i = 4; i < length; i++) {
		password += allChars[Math.floor(Math.random() * allChars.length)];
	}

	// Shuffle the password
	return password
		.split("")
		.sort(() => Math.random() - 0.5)
		.join("");
}

/**
 * Security utilities
 */

/**
 * Generate secure random string
 */
export function generateSecureRandom(length: number = 32): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";

	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return result;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
	return input
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#x27;")
		.replace(/\//g, "&#x2F;");
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validate CPF (Brazilian document)
 */
export function isValidCPF(cpf: string): boolean {
	cpf = cpf.replace(/[^\d]/g, "");

	if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
		return false;
	}

	let sum = 0;
	for (let i = 0; i < 9; i++) {
		sum += parseInt(cpf.charAt(i), 10) * (10 - i);
	}

	let checkDigit = 11 - (sum % 11);
	if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
	if (checkDigit !== parseInt(cpf.charAt(9), 10)) return false;

	sum = 0;
	for (let i = 0; i < 10; i++) {
		sum += parseInt(cpf.charAt(i), 10) * (11 - i);
	}

	checkDigit = 11 - (sum % 11);
	if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;

	return checkDigit === parseInt(cpf.charAt(10), 10);
}

/**
 * Validate CNS (Brazilian health card)
 */
export function isValidCNS(cns: string): boolean {
	cns = cns.replace(/[^\d]/g, "");

	if (cns.length !== 15) return false;

	let sum = 0;
	for (let i = 0; i < 15; i++) {
		sum += parseInt(cns.charAt(i), 10) * (15 - i);
	}

	return sum % 11 === 0;
}

/**
 * Calculate risk score based on various factors
 */
export function calculateRiskScore(factors: {
	newDevice?: boolean;
	unusualLocation?: boolean;
	failedAttempts?: number;
	timeOfDay?: number; // 0-23
	dayOfWeek?: number; // 0-6
}): number {
	let score = 1; // Base score

	if (factors.newDevice) score += 3;
	if (factors.unusualLocation) score += 4;
	if (factors.failedAttempts) score += factors.failedAttempts * 2;

	// Higher risk during off-hours
	if (factors.timeOfDay !== undefined) {
		if (factors.timeOfDay < 6 || factors.timeOfDay > 22) score += 2;
	}

	// Higher risk on weekends for healthcare systems
	if (factors.dayOfWeek !== undefined) {
		if (factors.dayOfWeek === 0 || factors.dayOfWeek === 6) score += 1;
	}

	return Math.min(score, 10); // Cap at 10
}

/**
 * Session utilities
 */

/**
 * Generate session ID
 */
export function generateSessionId(): string {
	return `session_${Date.now()}_${generateSecureRandom(16)}`;
}

/**
 * Check if session is expired
 */
export function isSessionExpired(expiresAt: Date): boolean {
	return new Date() > expiresAt;
}

/**
 * Calculate session timeout
 */
export function calculateSessionTimeout(lastActivity: Date, timeoutMinutes: number): Date {
	return new Date(lastActivity.getTime() + timeoutMinutes * 60 * 1000);
}

/**
 * Should refresh session (within 5 minutes of expiry)
 */
export function shouldRefreshSession(expiresAt: Date): boolean {
	const fiveMinutes = 5 * 60 * 1000;
	return expiresAt.getTime() - Date.now() < fiveMinutes;
}

/**
 * Audit utilities
 */

/**
 * Create audit log entry
 */
export function createAuditEntry(action: string, userId?: string, details?: Record<string, string | number | boolean>) {
	return {
		id: generateSecureRandom(16),
		action,
		userId,
		timestamp: new Date(),
		details: details || {},
		ip: "", // Will be filled by server
		userAgent: navigator?.userAgent || "",
	};
}

/**
 * Sanitize sensitive data for audit logs
 */
export function sanitizeForAudit(data: Record<string, unknown>): Record<string, unknown> {
	const sanitized = { ...data };
	const sensitiveFields = ["password", "token", "secret", "mfa_secret", "cpf"];

	for (const field of sensitiveFields) {
		if (sanitized[field]) {
			sanitized[field] = "[REDACTED]";
		}
	}

	return sanitized;
}

/**
 * Healthcare-specific utilities
 */

/**
 * Validate healthcare provider license
 */
export function validateProviderLicense(license: string, specialty: string): boolean {
	// Implement specific validation logic based on specialty
	// This is a simplified example
	const cleanLicense = license.replace(/[^\d]/g, "");

	switch (specialty.toLowerCase()) {
		case "medicine":
			return /^\d{4,8}$/.test(cleanLicense); // CRM format
		case "nursing":
			return /^\d{6,8}$/.test(cleanLicense); // COREN format
		case "psychology":
			return /^\d{5,7}$/.test(cleanLicense); // CRP format
		default:
			return cleanLicense.length >= 4 && cleanLicense.length <= 10;
	}
}

/**
 * Check if user can access patient data based on LGPD
 */
export function canAccessPatientData(
	userRole: string,
	patientConsent: boolean,
	emergencyAccess: boolean = false,
): boolean {
	// Emergency access overrides consent requirements
	if (emergencyAccess) return true;

	// Admin and doctors need consent for non-emergency access
	if (["admin", "doctor"].includes(userRole)) {
		return patientConsent;
	}

	// Nurses can access with consent for assigned patients
	if (userRole === "nurse") {
		return patientConsent;
	}

	// Patients can always access their own data
	if (userRole === "patient") {
		return true;
	}

	// Other roles need explicit consent
	return patientConsent;
}

/**
 * Generate healthcare audit message
 */
export function generateHealthcareAuditMessage(action: string, patientId?: string, providerId?: string): string {
	const timestamp = new Date().toISOString();
	let message = `[${timestamp}] Healthcare action: ${action}`;

	if (patientId) {
		message += ` | Patient: ${patientId}`;
	}

	if (providerId) {
		message += ` | Provider: ${providerId}`;
	}

	return message;
}
