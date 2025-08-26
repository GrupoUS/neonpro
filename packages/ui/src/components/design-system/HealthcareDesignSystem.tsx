"use client";

// Simplified Healthcare Design System - placeholder implementation
export const HEALTHCARE_COLORS = {
	primary: {
		50: "#eff6ff",
		100: "#dbeafe",
		500: "#3b82f6",
		600: "#2563eb",
		700: "#1d4ed8",
		900: "#1e3a8a",
	},
} as const;

export const HEALTHCARE_TYPOGRAPHY = {
	display: "text-4xl font-bold tracking-tight",
	h1: "text-3xl font-semibold tracking-tight",
	body: "text-base",
} as const;

export const HEALTHCARE_SPACING = {
	xs: "0.25rem",
	sm: "0.5rem",
	md: "1rem",
	lg: "1.5rem",
	xl: "2rem",
} as const;

export const HEALTHCARE_ANIMATIONS = {
	fast: "150ms",
	normal: "300ms",
	slow: "500ms",
} as const;

export const HEALTHCARE_ICONS = {
	size: {
		xs: "h-3 w-3",
		sm: "h-4 w-4",
		md: "h-5 w-5",
		lg: "h-6 w-6",
	},
} as const;

export default function HealthcareDesignSystem() {
	return (
		<div className="rounded-lg border p-4">
			<h3 className="font-semibold text-lg">Healthcare Design System</h3>
			<p className="text-gray-600">Design system components will be implemented in a future version.</p>
		</div>
	);
}
