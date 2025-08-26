/**
 * Mobile Dashboard Cards - FASE 3 Enhanced
 * Progressive Web App optimized for healthcare workflows
 * WCAG 2.1 AA+ compliant with offline capabilities
 * Compliance: LGPD/ANVISA/CFM
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
	AlertTriangle,
	BarChart3,
	Calendar,
	ChevronRight,
	Download,
	Gauge,
	TouchpadIcon,
	TrendingDown,
	TrendingUp,
	Wifi,
	WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// FASE 3: PWA and offline capabilities
interface OfflineCapable {
	isOnline: boolean;
	lastSync?: Date;
	hasCachedData: boolean;
}

interface TouchGesture {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	startTime: number;
	endTime: number;
}

// Custom hook for online/offline detection
const useOnlineStatus = () => {
	const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	return isOnline;
};

// Custom hook for touch gestures
const useTouchGestures = (onSwipe?: (direction: "left" | "right" | "up" | "down") => void) => {
	const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		const touch = e.touches[0];
		setTouchStart({
			x: touch.clientX,
			y: touch.clientY,
			time: Date.now(),
		});
	}, []);

	const handleTouchEnd = useCallback(
		(e: React.TouchEvent) => {
			if (!touchStart || !onSwipe) return;

			const touch = e.changedTouches[0];
			const endX = touch.clientX;
			const endY = touch.clientY;
			const endTime = Date.now();

			const deltaX = endX - touchStart.x;
			const deltaY = endY - touchStart.y;
			const deltaTime = endTime - touchStart.time;

			// Minimum swipe distance and maximum time for gesture recognition
			const minDistance = 50;
			const maxTime = 500;

			if (deltaTime > maxTime) return;

			if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minDistance) {
				onSwipe(deltaX > 0 ? "right" : "left");
			} else if (Math.abs(deltaY) > minDistance) {
				onSwipe(deltaY > 0 ? "down" : "up");
			}

			setTouchStart(null);
		},
		[touchStart, onSwipe]
	);

	return { handleTouchStart, handleTouchEnd };
};

interface MobileDashboardCardProps extends OfflineCapable {
	title: string;
	value: string | number;
	description?: string;
	icon: React.ComponentType<{ className?: string }>;
	trend?: {
		value: number;
		label: string;
		direction: "up" | "down" | "stable";
	};
	status?: "success" | "warning" | "error" | "info";
	progress?: number;
	badge?: string;
	compliance?: string[];
	onClick?: () => void;
	className?: string;
	// FASE 3: PWA and accessibility enhancements
	isOfflineCapable?: boolean;
	criticalData?: boolean; // For emergency healthcare data
	touchFeedback?: boolean;
	swipeActions?: {
		left?: { action: () => void; label: string };
		right?: { action: () => void; label: string };
	};
	// Accessibility enhancements
	ariaLabel?: string;
	ariaDescribedBy?: string;
	semanticRole?: "article" | "button" | "region";
}

export function MobileDashboardCard({
	title,
	value,
	description,
	icon: Icon,
	trend,
	status = "info",
	progress,
	badge,
	compliance,
	onClick,
	className = "",
	// FASE 3 enhancements
	isOnline,
	lastSync,
	hasCachedData,
	isOfflineCapable = false,
	criticalData = false,
	touchFeedback = true,
	swipeActions,
	ariaLabel,
	ariaDescribedBy,
	semanticRole = "article",
}: MobileDashboardCardProps) {
	// PWA state management
	const onlineStatus = useOnlineStatus();
	const [isPressed, setIsPressed] = useState(false);
	const [_lastTouchTime, setLastTouchTime] = useState(0);

	// Touch gesture handling
	const handleSwipe = useCallback(
		(direction: "left" | "right" | "up" | "down") => {
			if (swipeActions) {
				if (direction === "left" && swipeActions.left) {
					swipeActions.left.action();
				} else if (direction === "right" && swipeActions.right) {
					swipeActions.right.action();
				}
			}
		},
		[swipeActions]
	);

	const { handleTouchStart, handleTouchEnd } = useTouchGestures(handleSwipe);

	// Enhanced touch feedback
	const handleTouchStartFeedback = useCallback(
		(e: React.TouchEvent) => {
			if (touchFeedback) {
				setIsPressed(true);
				setLastTouchTime(Date.now());
				// Haptic feedback on supported devices
				if ("vibrate" in navigator) {
					navigator.vibrate(10);
				}
			}
			handleTouchStart(e);
		},
		[touchFeedback, handleTouchStart]
	);

	const handleTouchEndFeedback = useCallback(
		(e: React.TouchEvent) => {
			setIsPressed(false);
			handleTouchEnd(e);
		},
		[handleTouchEnd]
	);
	const getStatusColor = () => {
		// Override colors for offline/critical states
		if (!onlineStatus && !hasCachedData) {
			return "text-gray-600 bg-gray-50 border-gray-300";
		}
		if (criticalData && !onlineStatus && hasCachedData) {
			return "text-orange-600 bg-orange-50 border-orange-200";
		}

		switch (status) {
			case "success":
				return "text-green-600 bg-green-50 border-green-200";
			case "warning":
				return "text-yellow-600 bg-yellow-50 border-yellow-200";
			case "error":
				return "text-red-600 bg-red-50 border-red-200";
			default:
				return "text-blue-600 bg-blue-50 border-blue-200";
		}
	};

	// FASE 3: Enhanced accessibility and PWA status
	const getCardAriaLabel = () => {
		const baseLabel = ariaLabel || `${title}: ${value}${description ? `. ${description}` : ""}`;
		const offlineStatus = !onlineStatus ? ". Dados offline" : "";
		const criticalStatus = criticalData ? ". Dados críticos de saúde" : "";
		const trendStatus = trend
			? `. Tendência: ${
					trend.direction === "up" ? "subindo" : trend.direction === "down" ? "descendo" : "estável"
				} ${trend.value}%`
			: "";

		return `${baseLabel}${offlineStatus}${criticalStatus}${trendStatus}`;
	};

	const getTrendIcon = () => {
		if (!trend) return null;
		switch (trend.direction) {
			case "up":
				return <TrendingUp className="h-3 w-3 text-green-600" />;
			case "down":
				return <TrendingDown className="h-3 w-3 text-red-600" />;
			default:
				return null;
		}
	};

	return (
		<Card
			className={cn(
				"neonpro-card group transition-all duration-200",
				onClick && "cursor-pointer hover:shadow-lg focus:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2",
				isPressed && touchFeedback && "scale-95 shadow-sm",
				!onlineStatus && !hasCachedData && "opacity-60 border-dashed",
				criticalData && "border-l-4 border-l-red-500",
				className
			)}
			onClick={onClick}
			role={semanticRole}
			tabIndex={onClick ? 0 : undefined}
			aria-label={getCardAriaLabel()}
			aria-describedby={ariaDescribedBy}
			aria-live={criticalData ? "polite" : undefined}
			onKeyDown={
				onClick
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onClick();
							}
						}
					: undefined
			}
			onTouchStart={handleTouchStartFeedback}
			onTouchEnd={handleTouchEndFeedback}
		>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div
						className={cn(
							"p-2 rounded-lg transition-all duration-200",
							getStatusColor(),
							touchFeedback && "group-hover:neonpro-glow",
							isPressed && "scale-90"
						)}
					>
						<Icon className="h-4 w-4" aria-hidden="true" />
					</div>
					<div className="flex items-center gap-1">
						{/* FASE 3: PWA Status Indicators */}
						{isOfflineCapable && (
							<div className="flex items-center gap-1">
								{onlineStatus ? (
									<Wifi className="h-3 w-3 text-green-500" aria-label="Online" />
								) : hasCachedData ? (
									<Download className="h-3 w-3 text-blue-500" aria-label="Dados em cache disponíveis" />
								) : (
									<WifiOff className="h-3 w-3 text-red-500" aria-label="Offline - dados indisponíveis" />
								)}
							</div>
						)}

						{criticalData && (
							<Badge variant="destructive" className="text-xs" aria-label="Dados críticos de saúde">
								<AlertTriangle className="h-3 w-3 mr-1" />
								Crítico
							</Badge>
						)}

						{badge && (
							<Badge variant="secondary" className="text-xs" aria-label={`Badge: ${badge}`}>
								{badge}
							</Badge>
						)}

						{/* Mobile touch indicator */}
						{touchFeedback && <TouchpadIcon className="h-3 w-3 text-muted-foreground/50" aria-hidden="true" />}

						{onClick && <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
					</div>
				</div>
				<div className="flex items-center justify-between">
					<CardTitle
						className={cn(
							"text-sm font-medium transition-colors",
							!onlineStatus && !hasCachedData ? "text-muted-foreground" : "text-foreground"
						)}
						id={`card-title-${title.toLowerCase().replace(/\s+/g, "-")}`}
					>
						{title}
					</CardTitle>

					{/* Last sync indicator for offline data */}
					{lastSync && !onlineStatus && hasCachedData && (
						<span
							className="text-xs text-muted-foreground"
							aria-label={`Última sincronização: ${lastSync.toLocaleString("pt-BR")}`}
						>
							{lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
						</span>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-2">
				<div className="flex items-baseline justify-between">
					<div className="text-2xl font-bold text-foreground">{value}</div>
					{trend && (
						<div className="flex items-center space-x-1 text-xs">
							{getTrendIcon()}
							<span
								className={
									trend.direction === "up"
										? "text-green-600"
										: trend.direction === "down"
											? "text-red-600"
											: "text-muted-foreground"
								}
							>
								{trend.value > 0 ? "+" : ""}
								{trend.value}%
							</span>
						</div>
					)}
				</div>

				{description && <p className="text-xs text-muted-foreground">{description}</p>}

				{trend?.label && <p className="text-xs text-muted-foreground">{trend.label}</p>}

				{progress !== undefined && (
					<div className="space-y-1">
						<Progress value={progress} className="h-2" />
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Progresso</span>
							<span>{progress}%</span>
						</div>
					</div>
				)}

				{compliance && compliance.length > 0 && (
					<div className="flex gap-1">
						{compliance.map((framework) => (
							<Badge key={framework} variant="outline" className="text-xs">
								{framework}
							</Badge>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// Specialized mobile cards for different data types
export function MobileMetricCard({
	title,
	current,
	target,
	unit = "",
	status,
	icon: Icon,
}: {
	title: string;
	current: number;
	target?: number;
	unit?: string;
	status?: "success" | "warning" | "error";
	icon: React.ComponentType<{ className?: string }>;
}) {
	const percentage = target ? Math.round((current / target) * 100) : undefined;

	return (
		<MobileDashboardCard
			title={title}
			value={`${current}${unit}`}
			description={target ? `Meta: ${target}${unit}` : undefined}
			icon={Icon}
			progress={percentage}
			status={status}
		/>
	);
}

export function MobileAlertCard({
	title,
	count,
	severity,
	description,
}: {
	title: string;
	count: number;
	severity: "low" | "medium" | "high" | "critical";
	description?: string;
}) {
	const getAlertStatus = () => {
		switch (severity) {
			case "critical":
				return "error";
			case "high":
				return "error";
			case "medium":
				return "warning";
			default:
				return "info";
		}
	};

	const getSeverityLabel = () => {
		switch (severity) {
			case "critical":
				return "Crítico";
			case "high":
				return "Alto";
			case "medium":
				return "Médio";
			default:
				return "Baixo";
		}
	};

	return (
		<MobileDashboardCard
			title={title}
			value={count}
			description={description}
			icon={AlertTriangle}
			status={getAlertStatus() as any}
			badge={getSeverityLabel()}
		/>
	);
}

// Grid layouts for mobile dashboards
export function MobileDashboardGrid({ children }: { children: React.ReactNode }) {
	return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">{children}</div>;
}

export function MobileDashboardSection({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-4">
			<div className="px-4">
				<h2 className="text-lg font-semibold text-foreground">{title}</h2>
				{description && <p className="text-sm text-muted-foreground">{description}</p>}
			</div>
			<div className="px-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
			</div>
		</div>
	);
}

// Quick actions for mobile
export function MobileQuickActions() {
	const quickActions = [
		{
			label: "Nova Consulta",
			icon: Calendar,
			action: () => console.log("Nova consulta"),
			color: "text-blue-600 bg-blue-50",
		},
		{
			label: "Emergência",
			icon: AlertTriangle,
			action: () => console.log("Emergência"),
			color: "text-red-600 bg-red-50",
		},
		{
			label: "Relatórios",
			icon: BarChart3,
			action: () => console.log("Relatórios"),
			color: "text-green-600 bg-green-50",
		},
		{
			label: "Configurações",
			icon: Gauge,
			action: () => console.log("Configurações"),
			color: "text-purple-600 bg-purple-50",
		},
	];

	return (
		<div className="px-4">
			<h3 className="text-sm font-medium text-muted-foreground mb-3">Ações Rápidas</h3>
			<div className="grid grid-cols-2 gap-3">
				{quickActions.map((action) => {
					const Icon = action.icon;
					return (
						<Button
							key={action.label}
							variant="outline"
							className="h-auto p-4 flex flex-col items-center gap-2"
							onClick={action.action}
						>
							<div className={`p-2 rounded-lg ${action.color}`}>
								<Icon className="h-4 w-4" />
							</div>
							<span className="text-xs">{action.label}</span>
						</Button>
					);
				})}
			</div>
		</div>
	);
}

// Real-time status indicator for mobile
export function MobileStatusIndicator({
	status,
	label,
}: {
	status: "online" | "offline" | "maintenance";
	label?: string;
}) {
	const getStatusConfig = () => {
		switch (status) {
			case "online":
				return {
					color: "bg-green-500",
					text: "Sistema Online",
					pulse: true,
				};
			case "offline":
				return {
					color: "bg-red-500",
					text: "Sistema Offline",
					pulse: false,
				};
			case "maintenance":
				return {
					color: "bg-yellow-500",
					text: "Manutenção",
					pulse: true,
				};
		}
	};

	const config = getStatusConfig();

	return (
		<div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
			<div className="relative">
				<div className={`h-2 w-2 rounded-full ${config.color} ${config.pulse ? "animate-pulse" : ""}`} />
			</div>
			<span className="text-xs text-muted-foreground">{label || config.text}</span>
		</div>
	);
}
