/**
 * Modern Supabase Email Confirmation Handler for NeonPro Healthcare
 * Handles email confirmations, password resets, and email changes
 * Healthcare compliance with security and audit requirements
 */

import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const token_hash = requestUrl.searchParams.get("token_hash");
	const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
	const next = requestUrl.searchParams.get("next") ?? "/";
	const error = requestUrl.searchParams.get("error");

	// Handle confirmation errors
	if (error) {
		return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${encodeURIComponent(error)}`);
	}

	if (token_hash && type) {
		const cookieStore = cookies();

		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					getAll() {
						return cookieStore.getAll();
					},
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value, options }) => {
							cookieStore.set(name, value, options);
						});
					},
				},
				global: {
					headers: {
						"X-Client-Type": "neonpro-healthcare-confirm",
						"X-Compliance": "LGPD-ANVISA-CFM",
					},
				},
			}
		);

		try {
			// Verify the OTP token
			const {
				data: { session },
				error: verifyError,
			} = await supabase.auth.verifyOtp({
				type,
				token_hash,
			});

			if (verifyError) {
				return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=verification_failed`);
			}

			if (session?.user) {
				// Healthcare audit logging for successful email confirmation
				await logHealthcareEmailConfirmation(session.user.id, type, {
					ip_address: request.ip || "unknown",
					user_agent: request.headers.get("user-agent") || "unknown",
				});

				// Redirect based on confirmation type
				switch (type) {
					case "signup":
						// New user signup confirmation
						return NextResponse.redirect(`${requestUrl.origin}/complete-profile?confirmed=true`);

					case "recovery":
						// Password reset confirmation
						return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password?confirmed=true`);

					case "email_change":
						// Email change confirmation
						return NextResponse.redirect(`${requestUrl.origin}/dashboard/profile?email_changed=true`);

					case "invite":
						// Healthcare professional invitation
						return NextResponse.redirect(`${requestUrl.origin}/complete-profile?invited=true`);

					default: {
						// Default redirect for other types
						const sanitizedNext = next.startsWith("/") ? next : "/dashboard";
						return NextResponse.redirect(`${requestUrl.origin}${sanitizedNext}`);
					}
				}
			}
		} catch (_error) {
			return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=critical_confirmation_error`);
		}
	}

	// Invalid or missing parameters
	return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=invalid_confirmation_link`);
}

/**
 * Healthcare audit logging for email confirmation events
 * LGPD compliance requires tracking of all authentication events
 */
async function logHealthcareEmailConfirmation(
	userId: string,
	confirmationType: string,
	metadata: Record<string, any>
): Promise<void> {
	try {
		const cookieStore = cookies();

		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					getAll() {
						return cookieStore.getAll();
					},
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value, options }) => {
							cookieStore.set(name, value, options);
						});
					},
				},
			}
		);

		await supabase.from("healthcare_audit_logs").insert({
			user_id: userId,
			action: `email_confirmation_${confirmationType}`,
			resource_type: "authentication",
			metadata: {
				confirmation_type: confirmationType,
				...metadata,
			},
			ip_address: metadata.ip_address,
			user_agent: metadata.user_agent,
			timestamp: new Date().toISOString(),
		});
	} catch (_error) {
		// Don't throw - audit logging failure shouldn't block confirmation
	}
}
