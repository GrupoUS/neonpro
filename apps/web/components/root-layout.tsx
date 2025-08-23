/**
 * 🌐 Root Layout - NeonPro Healthcare
 * =================================
 *
 * Root layout component for TanStack Router integration
 * with Next.js App Router compatibility.
 */

"use client";

import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "@/components/ui/toaster";

export function RootLayout() {
	return (
		<div className="min-h-screen bg-background">
			{/* Main Router Content */}
			<Outlet />

			{/* Global Toaster for notifications */}
			<Toaster />

			{/* Development tools */}
			{process.env.NODE_ENV === "development" && <TanStackRouterDevtools />}
		</div>
	);
}
