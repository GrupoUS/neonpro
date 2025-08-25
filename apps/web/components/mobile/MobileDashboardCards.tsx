/**
 * Mobile Dashboard Cards
 * FASE 4: Frontend Components - Mobile First Design
 * Compliance: LGPD/ANVISA/CFM
 */

"use client";

import { useState } from "react";
import {
	Activity,
	AlertTriangle,
	BarChart3,
	Calendar,
	ChevronRight,
	Clock,
	Gauge,
	Shield,
	Stethoscope,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface MobileDashboardCardProps {
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
}: MobileDashboardCardProps) {
	const getStatusColor = () => {
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
			className={`neonpro-card group cursor-pointer hover:shadow-lg transition-all ${className}`}
			onClick={onClick}
			role={onClick ? "button" : "article"}
			tabIndex={onClick ? 0 : undefined}
			aria-label={`${title}: ${value}${description ? `. ${description}` : ""}`}
			onKeyDown={onClick ? (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			} : undefined}
		>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div className={`group-hover:neonpro-glow p-2 rounded-lg ${getStatusColor()}`}>
						<Icon className="h-4 w-4" aria-hidden="true" />
					</div>
					<div className="flex items-center gap-1">
						{badge && (
							<Badge 
								variant="secondary" 
								className="text-xs"
								aria-label={`Badge: ${badge}`}
							>
								{badge}
							</Badge>
						)}
						{onClick && (
							<ChevronRight 
								className="h-4 w-4 text-muted-foreground" 
								aria-hidden="true"
							/>
						)}
					</div>
				</div>
				<CardTitle 
					className="text-sm font-medium text-muted-foreground"
					id={`card-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
				>
					{title}
				</CardTitle>
			</CardHeader>
			
			<CardContent className="space-y-2">
				<div className="flex items-baseline justify-between">
					<div className="text-2xl font-bold text-foreground">
						{value}
					</div>
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
								{trend.value > 0 ? "+" : ""}{trend.value}%
							</span>
						</div>
					)}
				</div>

				{description && (
					<p className="text-xs text-muted-foreground">
						{description}
					</p>
				)}

				{trend?.label && (
					<p className="text-xs text-muted-foreground">
						{trend.label}
					</p>
				)}

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
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
			{children}
		</div>
	);
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
				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
			</div>
			<div className="px-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{children}
				</div>
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
			<h3 className="text-sm font-medium text-muted-foreground mb-3">
				Ações Rápidas
			</h3>
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
				<div
					className={`h-2 w-2 rounded-full ${config.color} ${
						config.pulse ? "animate-pulse" : ""
					}`}
				/>
			</div>
			<span className="text-xs text-muted-foreground">
				{label || config.text}
			</span>
		</div>
	);
}