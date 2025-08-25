/**
 * Main Application Layout
 * FASE 4: Frontend Components - Integrated Layout
 * Compliance: LGPD/ANVISA/CFM + WCAG 2.1 AA
 */

"use client";

import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { 
	MobileNavigation, 
	MobileBottomNavigation 
} from "@/components/mobile/MobileNavigation";
import {
	SkipToContentLink,
	AccessibilityPanel,
	StatusAnnouncer,
	KeyboardHelper,
} from "@/components/accessibility/AccessibilityComponents";

interface MainLayoutProps {
	children: React.ReactNode;
	showMobileNav?: boolean;
	showAccessibilityPanel?: boolean;
	className?: string;
}

export function MainLayout({
	children,
	showMobileNav = true,
	showAccessibilityPanel = true,
	className = "",
}: MainLayoutProps) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
		
		// Set up global accessibility styles
		const root = document.documentElement;
		
		// Respect user's motion preferences
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (prefersReducedMotion.matches) {
			root.classList.add("reduce-motion");
		}
		
		// Respect user's contrast preferences
		const prefersHighContrast = window.matchMedia("(prefers-contrast: high)");
		if (prefersHighContrast.matches) {
			root.classList.add("high-contrast");
		}
		
		// Set focus-visible for keyboard navigation
		root.classList.add("focus-visible");
	}, []);

	if (!isClient) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-muted rounded w-1/4"></div>
						<div className="h-64 bg-muted rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`min-h-screen bg-background ${className}`}>
			{/* Accessibility Features */}
			<SkipToContentLink />
			<StatusAnnouncer />
			<KeyboardHelper />
			
			{/* Mobile Navigation */}
			{showMobileNav && (
				<header className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
					<div className="flex items-center justify-between h-14 px-4">
						<div className="flex items-center gap-2">
							<MobileNavigation />
							<div>
								<h1 className="text-lg font-semibold">NeonPro</h1>
								<span className="text-xs text-muted-foreground">Healthcare</span>
							</div>
						</div>
						
						<div className="flex items-center gap-2">
							{/* Status indicators could go here */}
							<div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" title="Sistema Online" />
						</div>
					</div>
				</header>
			)}

			{/* Main Content */}
			<main 
				id="main-content" 
				className="flex-1 pb-16 md:pb-0"
				tabIndex={-1}
			>
				<div className="container mx-auto">
					{children}
				</div>
			</main>

			{/* Mobile Bottom Navigation */}
			{showMobileNav && <MobileBottomNavigation />}

			{/* Accessibility Panel */}
			{showAccessibilityPanel && <AccessibilityPanel />}

			{/* Toast Notifications */}
			<Toaster />
		</div>
	);
}

// Specialized layout for dashboard pages
export function DashboardPageLayout({
	children,
	title,
	description,
	compliance,
}: {
	children: React.ReactNode;
	title: string;
	description?: string;
	compliance?: string[];
}) {
	return (
		<MainLayout>
			<div className="space-y-6 p-4 md:p-6">
				{/* Page Header */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl md:text-3xl font-bold text-foreground">
							{title}
						</h1>
						{compliance && compliance.length > 0 && (
							<div className="hidden md:flex gap-2">
								{compliance.map((framework) => (
									<div
										key={framework}
										className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium"
									>
										{framework}
									</div>
								))}
							</div>
						)}
					</div>
					
					{description && (
						<p className="text-muted-foreground text-sm md:text-base">
							{description}
						</p>
					)}
					
					{compliance && compliance.length > 0 && (
						<div className="md:hidden flex gap-2 flex-wrap">
							{compliance.map((framework) => (
								<div
									key={framework}
									className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium"
								>
									{framework}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Page Content */}
				<div className="space-y-6">
					{children}
				</div>
			</div>
		</MainLayout>
	);
}

// Auth layout for login/signup pages
export function AuthLayout({ 
	children 
}: { 
	children: React.ReactNode 
}) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted">
			<SkipToContentLink />
			<StatusAnnouncer />
			
			<main 
				id="main-content"
				className="min-h-screen flex items-center justify-center p-4"
				tabIndex={-1}
			>
				<div className="w-full max-w-md space-y-6">
					{/* Logo/Brand */}
					<div className="text-center space-y-2">
						<div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
							<span className="text-primary-foreground font-bold text-xl">N</span>
						</div>
						<h1 className="text-2xl font-bold">NeonPro Healthcare</h1>
						<p className="text-muted-foreground text-sm">
							Sistema seguro e em compliance com LGPD, ANVISA e CFM
						</p>
					</div>
					
					{children}
				</div>
			</main>
			
			<AccessibilityPanel />
			<Toaster />
		</div>
	);
}

// Error layout for error pages
export function ErrorLayout({
	children,
	statusCode,
}: {
	children: React.ReactNode;
	statusCode?: number;
}) {
	return (
		<MainLayout showMobileNav={false}>
			<div className="min-h-[60vh] flex items-center justify-center p-4">
				<div className="text-center space-y-6 max-w-md">
					{statusCode && (
						<div className="text-6xl font-bold text-muted-foreground">
							{statusCode}
						</div>
					)}
					{children}
				</div>
			</div>
		</MainLayout>
	);
}

// Print layout for reports
export function PrintLayout({ 
	children,
	title,
	compliance = ["LGPD", "ANVISA", "CFM"],
}: { 
	children: React.ReactNode;
	title?: string;
	compliance?: string[];
}) {
	return (
		<div className="print:block hidden">
			<div className="space-y-4">
				{/* Print Header */}
				<div className="border-b pb-4">
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-xl font-bold">NeonPro Healthcare</h1>
							{title && (
								<h2 className="text-lg font-medium text-muted-foreground">
									{title}
								</h2>
							)}
						</div>
						<div className="text-right text-sm text-muted-foreground">
							<p>Data: {new Date().toLocaleDateString("pt-BR")}</p>
							<p>Compliance: {compliance.join(", ")}</p>
						</div>
					</div>
				</div>
				
				{/* Print Content */}
				<div className="space-y-4">
					{children}
				</div>
				
				{/* Print Footer */}
				<div className="border-t pt-4 text-xs text-muted-foreground">
					<p>
						Este relatório foi gerado automaticamente pelo sistema NeonPro Healthcare
						em conformidade com LGPD, ANVISA e CFM.
					</p>
				</div>
			</div>
		</div>
	);
}