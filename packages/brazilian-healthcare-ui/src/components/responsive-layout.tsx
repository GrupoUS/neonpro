"use client";

import { type ReactNode, useEffect, useState } from "react";
import type { ConnectivityLevel, RegionalSettings } from "../types";

interface ResponsiveLayoutProps {
	children: ReactNode;
	connectivity?: ConnectivityLevel;
	regional?: RegionalSettings;
	emergencyMode?: boolean;
	className?: string;
}

export function ResponsiveLayout({
	children,
	connectivity,
	regional,
	emergencyMode = false,
	className = "",
}: ResponsiveLayoutProps) {
	const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");
	const [isLowBandwidth, setIsLowBandwidth] = useState(false);
	const [connectionSpeed, setConnectionSpeed] = useState<string>("unknown");

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			if (width < 768) {
				setViewport("mobile");
			} else if (width < 1024) {
				setViewport("tablet");
			} else {
				setViewport("desktop");
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Monitor connectivity for Brazilian network conditions
	useEffect(() => {
		if (connectivity) {
			const isSlow =
				connectivity.type === "2G" ||
				(connectivity.type === "3G" && connectivity.strength === "weak") ||
				connectivity.latency > 1000;
			setIsLowBandwidth(isSlow);
			setConnectionSpeed(`${connectivity.type} ${connectivity.strength}`);
		}

		// Use Network Information API if available
		if ("connection" in navigator) {
			const connection = (navigator as any).connection;
			const updateConnectionInfo = () => {
				setConnectionSpeed(connection.effectiveType || "unknown");
				setIsLowBandwidth(connection.effectiveType === "slow-2g" || connection.effectiveType === "2g");
			};

			updateConnectionInfo();
			connection.addEventListener("change", updateConnectionInfo);

			return () => connection.removeEventListener("change", updateConnectionInfo);
		}
	}, [connectivity]);

	// Brazilian region-specific optimizations
	const getRegionalOptimizations = () => {
		if (!regional) return {};

		const baseOptimizations = {
			// All regions: Touch-friendly, high contrast for sunlight
			minTouchTarget: "12px", // 48px minimum as per spacing.12
			highContrast: true,
		};

		switch (regional.region) {
			case "Norte":
			case "Nordeste":
				// Rural areas, often slower connections
				return {
					...baseOptimizations,
					reduceAnimations: true,
					compressImages: true,
					prefetchDisabled: true,
				};

			case "Sudeste":
			case "Sul":
				// Urban areas, better connectivity
				return {
					...baseOptimizations,
					enableAdvancedFeatures: true,
					highQualityImages: true,
				};

			default:
				return baseOptimizations;
		}
	};

	const optimizations = getRegionalOptimizations();

	return (
		<div
			className={`responsive-layout min-h-screen ${emergencyMode ? "emergency-mode" : ""} ${className}`}
			data-connectivity={connectionSpeed}
			data-viewport={viewport}
			style={
				{
					"--min-touch-target": (optimizations as any).minTouchTarget || "48px",
				} as React.CSSProperties
			}
		>
			{/* Connectivity Status Bar - Critical for Brazilian healthcare */}
			<div
				className={`connectivity-bar border-b p-2 text-sm ${
					isLowBandwidth
						? "border-yellow-200 bg-yellow-50 text-yellow-800"
						: "border-green-200 bg-green-50 text-green-800"
				}`}
			>
				<div className="mx-auto flex max-w-7xl items-center justify-between">
					<div className="flex items-center">
						<span className="mr-2">{isLowBandwidth ? "📶" : "📶"}</span>
						<span>
							{connectionSpeed} • {regional?.region}
						</span>
					</div>

					{isLowBandwidth && <div className="rounded bg-yellow-100 px-2 py-1 text-xs">MODO ECONOMIA</div>}

					{emergencyMode && (
						<div className="animate-pulse rounded bg-red-500 px-2 py-1 text-white text-xs">EMERGÊNCIA</div>
					)}
				</div>
			</div>

			{/* Main Layout */}
			<div
				className={`layout-container ${viewport === "mobile" ? "mobile-layout" : viewport === "tablet" ? "tablet-layout" : "desktop-layout"}`}
			>
				{viewport === "mobile" && (
					<MobileLayout isLowBandwidth={isLowBandwidth} optimizations={optimizations}>
						{children}
					</MobileLayout>
				)}

				{viewport === "tablet" && (
					<TabletLayout isLowBandwidth={isLowBandwidth} optimizations={optimizations}>
						{children}
					</TabletLayout>
				)}

				{viewport === "desktop" && (
					<DesktopLayout isLowBandwidth={isLowBandwidth} optimizations={optimizations}>
						{children}
					</DesktopLayout>
				)}
			</div>

			{/* Accessibility Shortcuts - WCAG 2.1 AA+ */}
			<div className="sr-only">
				<a className="skip-link" href="#main-content">
					Pular para o conteúdo principal
				</a>
				<a className="skip-link" href="#navigation">
					Pular para navegação
				</a>
			</div>

			<style dangerouslySetInnerHTML={{__html: `
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #000;
          color: #fff;
          padding: 8px;
          text-decoration: none;
          z-index: 100;
        }
        
        .skip-link:focus {
          top: 6px;
        }

        .emergency-mode {
          --primary-color: #dc2626;
          --border-color: #fca5a5;
        }

        /* Touch targets for tablets - healthcare requirement */
        .tablet-layout button,
        .tablet-layout [role="button"],
        .mobile-layout button,
        .mobile-layout [role="button"] {
          min-height: var(--min-touch-target);
          min-width: var(--min-touch-target);
        }
      `}} />
		</div>
	);
} // Mobile Layout - Optimized for single-hand use
function MobileLayout({
	children,
	isLowBandwidth,
	optimizations,
}: {
	children: ReactNode;
	isLowBandwidth: boolean;
	optimizations: any;
}) {
	return (
		<div className="mobile-layout">
			{/* Bottom navigation for thumb access */}
			<div className="flex-1 overflow-y-auto pb-16">
				<main className="p-4" id="main-content">
					{children}
				</main>
			</div>

			{/* Fixed bottom navigation */}
			<nav className="fixed right-0 bottom-0 left-0 border-gray-200 border-t bg-white p-2" id="navigation">
				<div className="flex justify-around">
					<button className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
						<span className="mb-1 text-xl">🏥</span>
						<span className="text-xs">Pacientes</span>
					</button>
					<button className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
						<span className="mb-1 text-xl">📅</span>
						<span className="text-xs">Agenda</span>
					</button>
					<button className="flex flex-col items-center p-2 text-red-600">
						<span className="mb-1 text-xl">🚨</span>
						<span className="text-xs">Emergência</span>
					</button>
				</div>
			</nav>
		</div>
	);
}

// Tablet Layout - Clinical workflow optimized
function TabletLayout({
	children,
	isLowBandwidth,
	optimizations,
}: {
	children: ReactNode;
	isLowBandwidth: boolean;
	optimizations: any;
}) {
	return (
		<div className="tablet-layout flex h-screen">
			{/* Side navigation */}
			<nav className="w-64 border-gray-200 border-r bg-white p-4" id="navigation">
				<div className="space-y-2">
					<button className="flex w-full items-center rounded-lg p-3 text-left hover:bg-gray-100">
						<span className="mr-3 text-xl">🏥</span>
						<span>Pacientes</span>
					</button>
					<button className="flex w-full items-center rounded-lg p-3 text-left hover:bg-gray-100">
						<span className="mr-3 text-xl">📅</span>
						<span>Agenda</span>
					</button>
					<button className="flex w-full items-center rounded-lg bg-red-50 p-3 text-left text-red-700">
						<span className="mr-3 text-xl">🚨</span>
						<span>Emergência</span>
					</button>
				</div>
			</nav>

			{/* Main content */}
			<main className="flex-1 overflow-y-auto p-6" id="main-content">
				{children}
			</main>
		</div>
	);
}

// Desktop Layout - Full feature set
function DesktopLayout({
	children,
	isLowBandwidth,
	optimizations,
}: {
	children: ReactNode;
	isLowBandwidth: boolean;
	optimizations: any;
}) {
	return (
		<div className="desktop-layout flex h-screen">
			{/* Sidebar */}
			<aside className="w-64 border-gray-200 border-r bg-white">
				<div className="p-4">
					<h1 className="mb-6 font-bold text-gray-900 text-xl">NeonPro</h1>
					<nav className="space-y-2" id="navigation">
						<a className="flex items-center rounded-lg p-3 hover:bg-gray-100" href="#">
							<span className="mr-3 text-xl">📊</span>
							<span>Dashboard</span>
						</a>
						<a className="flex items-center rounded-lg p-3 hover:bg-gray-100" href="#">
							<span className="mr-3 text-xl">🏥</span>
							<span>Pacientes</span>
						</a>
						<a className="flex items-center rounded-lg p-3 hover:bg-gray-100" href="#">
							<span className="mr-3 text-xl">📅</span>
							<span>Agenda</span>
						</a>
						<a className="flex items-center rounded-lg bg-red-50 p-3 text-red-700" href="#">
							<span className="mr-3 text-xl">🚨</span>
							<span>Emergência</span>
						</a>
					</nav>
				</div>
			</aside>

			{/* Main area */}
			<div className="flex flex-1 flex-col">
				{/* Header */}
				<header className="border-gray-200 border-b bg-white p-4">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-gray-900 text-lg">Sistema de Saúde</h2>
						<div className="flex items-center space-x-4">
							<div className="text-gray-600 text-sm">Dr. João Silva • CRM 12345</div>
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
								JS
							</div>
						</div>
					</div>
				</header>

				{/* Content */}
				<main className="flex-1 overflow-y-auto bg-gray-50 p-6" id="main-content">
					{children}
				</main>
			</div>
		</div>
	);
}
