/**
 * Healthcare Design System Integration
 * FASE 3: Frontend Enhancement - Complete Design System
 * Visual Consistency & Healthcare-Optimized Patterns
 * Compliance: WCAG 2.1 AA+, LGPD/ANVISA/CFM
 */

"use client";

import { useState, useEffect, useRef, useId } from "react";
import {
	Heart,
	Stethoscope,
	Activity,
	Shield,
	User,
	Calendar,
	AlertTriangle,
	CheckCircle,
	Clock,
	Zap,
	Thermometer,
	Users,
	FileText,
	Pill,
	Eye,
	Brain,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Progress } from "../Progress";

// Healthcare Design System Color Palette
export const HEALTHCARE_COLORS = {
	primary: {
		50: "#eff6ff",
		100: "#dbeafe", 
		500: "#3b82f6",
		600: "#2563eb",
		700: "#1d4ed8",
		900: "#1e3a8a",
	},
	medical: {
		emergency: "#dc2626", // Critical alerts
		warning: "#ea580c",   // Important notifications  
		success: "#16a34a",   // Positive outcomes
		info: "#0284c7",      // General information
		neutral: "#6b7280",   // Background elements
	},
	accessibility: {
		focus: "#2563eb",
		contrast: "#000000",
		background: "#ffffff",
		text: "#1f2937",
		muted: "#6b7280",
	},
} as const;

// Healthcare Typography Scale
export const HEALTHCARE_TYPOGRAPHY = {
	display: "text-4xl font-bold tracking-tight",
	h1: "text-3xl font-semibold tracking-tight",
	h2: "text-2xl font-semibold tracking-tight", 
	h3: "text-xl font-semibold",
	h4: "text-lg font-medium",
	body: "text-base",
	small: "text-sm",
	caption: "text-xs",
	medical: "font-mono text-sm", // For medical codes, measurements
} as const;

// Healthcare Spacing System
export const HEALTHCARE_SPACING = {
	xs: "0.25rem",  // 4px
	sm: "0.5rem",   // 8px  
	md: "1rem",     // 16px
	lg: "1.5rem",   // 24px
	xl: "2rem",     // 32px
	"2xl": "3rem",  // 48px
	"3xl": "4rem",  // 64px
	// Healthcare-specific spacing
	touch: "2.75rem", // 44px minimum touch target
	card: "1.5rem",   // Standard card padding
	section: "2rem",  // Section separation
} as const;

// Healthcare Animation Presets
export const HEALTHCARE_ANIMATIONS = {
	gentle: "transition-all duration-300 ease-in-out",
	medical: "transition-all duration-200 ease-out", // Faster for critical actions
	loading: "animate-pulse",
	success: "animate-bounce duration-500",
	error: "animate-shake duration-300",
	heartbeat: "animate-pulse duration-1000",
} as const;

// Healthcare-Specific Icon Mappings
export const HEALTHCARE_ICONS = {
	patient: User,
	doctor: Stethoscope,
	emergency: AlertTriangle,
	medication: Pill,
	vitals: Activity,
	appointment: Calendar,
	record: FileText,
	diagnostic: Eye,
	treatment: Heart,
	ai_prediction: Brain,
	temperature: Thermometer,
	success: CheckCircle,
	pending: Clock,
	critical: Zap,
	compliance: Shield,
	team: Users,
} as const;

// Healthcare Status Indicators
interface HealthcareStatusProps {
	type: keyof typeof HEALTHCARE_ICONS;
	status: "critical" | "warning" | "success" | "info" | "neutral";
	label: string;
	value?: string | number;
	pulse?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function HealthcareStatus({ 
	type, 
	status, 
	label, 
	value, 
	pulse = false, 
	size = "md",
	className 
}: HealthcareStatusProps) {
	const statusId = useId();
	const Icon = HEALTHCARE_ICONS[type];
	
	const getStatusColor = () => {
		switch (status) {
			case "critical": return "text-red-600 bg-red-50 border-red-200";
			case "warning": return "text-orange-600 bg-orange-50 border-orange-200";  
			case "success": return "text-green-600 bg-green-50 border-green-200";
			case "info": return "text-blue-600 bg-blue-50 border-blue-200";
			default: return "text-gray-600 bg-gray-50 border-gray-200";
		}
	};

	const getIconSize = () => {
		switch (size) {
			case "sm": return "h-4 w-4";
			case "lg": return "h-8 w-8";
			default: return "h-6 w-6";
		}
	};

	return (
		<div 
			className={`
				flex items-center gap-3 p-3 rounded-lg border ${getStatusColor()}
				${pulse ? HEALTHCARE_ANIMATIONS.heartbeat : ""}
				${className}
			`}
			role="status"
			aria-labelledby={statusId}
		>
			<Icon className={`${getIconSize()} flex-shrink-0`} />
			<div className="flex-1 min-w-0">
				<p id={statusId} className="font-medium text-sm">
					{label}
				</p>
				{value && (
					<p className="text-xs opacity-80 font-mono">
						{value}
					</p>
				)}
			</div>
		</div>
	);
}

// Healthcare Card Component with Medical Context
interface HealthcareCardProps {
	type: "patient" | "emergency" | "medication" | "appointment" | "diagnostic";
	title: string;
	subtitle?: string;
	status?: "active" | "pending" | "completed" | "critical";
	priority?: "high" | "medium" | "low";
	lgpdCompliant?: boolean;
	children: React.ReactNode;
	actions?: React.ReactNode;
	onClick?: () => void;
	className?: string;
}

export function HealthcareCard({
	type,
	title,
	subtitle,
	status = "active",
	priority = "medium",
	lgpdCompliant = false,
	children,
	actions,
	onClick,
	className,
}: HealthcareCardProps) {
	const cardId = useId();
	const titleId = useId();
	
	const getTypeIcon = () => {
		switch (type) {
			case "patient": return <User className="h-5 w-5" />;
			case "emergency": return <AlertTriangle className="h-5 w-5 text-red-500" />;
			case "medication": return <Pill className="h-5 w-5" />;
			case "appointment": return <Calendar className="h-5 w-5" />;
			case "diagnostic": return <Eye className="h-5 w-5" />;
			default: return <FileText className="h-5 w-5" />;
		}
	};

	const getStatusColor = () => {
		switch (status) {
			case "critical": return "border-l-red-500";
			case "pending": return "border-l-yellow-500";
			case "completed": return "border-l-green-500";
			default: return "border-l-blue-500";
		}
	};

	const getPriorityBadge = () => {
		switch (priority) {
			case "high": return <Badge variant="destructive">Alta</Badge>;
			case "low": return <Badge variant="outline">Baixa</Badge>;
			default: return <Badge variant="secondary">Média</Badge>;
		}
	};

	return (
		<Card 
			className={`
				border-l-4 ${getStatusColor()} 
				${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
				${className}
			`}
			onClick={onClick}
			role={onClick ? "button" : "article"}
			tabIndex={onClick ? 0 : undefined}
			aria-labelledby={titleId}
			onKeyDown={onClick ? (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			} : undefined}
		>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						{getTypeIcon()}
						<div>
							<CardTitle id={titleId} className="text-lg">
								{title}
							</CardTitle>
							{subtitle && (
								<CardDescription>
									{subtitle}
								</CardDescription>
							)}
						</div>
					</div>
					<div className="flex items-center gap-2">
						{getPriorityBadge()}
						{lgpdCompliant && (
							<Badge variant="outline" className="text-xs">
								<Shield className="h-3 w-3 mr-1" />
								LGPD
							</Badge>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{children}
				{actions && (
					<div className="mt-4 pt-4 border-t flex gap-2">
						{actions}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// Healthcare Progress Indicator
interface HealthcareProgressProps {
	label: string;
	value: number;
	max?: number;
	type?: "treatment" | "recovery" | "medication" | "diagnostic";
	showPercentage?: boolean;
	critical?: boolean;
	unit?: string;
	className?: string;
}

export function HealthcareProgress({
	label,
	value,
	max = 100,
	type = "treatment",
	showPercentage = true,
	critical = false,
	unit,
	className,
}: HealthcareProgressProps) {
	const progressId = useId();
	const percentage = Math.round((value / max) * 100);
	
	const getProgressColor = () => {
		if (critical && percentage < 30) return "bg-red-500";
		if (percentage < 50) return "bg-yellow-500";
		if (percentage >= 80) return "bg-green-500";
		return "bg-blue-500";
	};

	const getTypeIcon = () => {
		switch (type) {
			case "treatment": return <Heart className="h-4 w-4" />;
			case "recovery": return <Activity className="h-4 w-4" />;
			case "medication": return <Pill className="h-4 w-4" />;
			case "diagnostic": return <Eye className="h-4 w-4" />;
			default: return <Activity className="h-4 w-4" />;
		}
	};

	return (
		<div className={`space-y-2 ${className}`} role="progressbar" aria-labelledby={progressId}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{getTypeIcon()}
					<label id={progressId} className="text-sm font-medium">
						{label}
					</label>
				</div>
				<div className="text-sm font-medium">
					{showPercentage ? `${percentage}%` : `${value}${unit ? ` ${unit}` : ""}`}
				</div>
			</div>
			<div className="w-full bg-gray-200 rounded-full h-2">
				<div 
					className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
					style={{ width: `${percentage}%` }}
					role="presentation"
				/>
			</div>
			{critical && percentage < 30 && (
				<p className="text-xs text-red-600 flex items-center gap-1">
					<AlertTriangle className="h-3 w-3" />
					Nível crítico - atenção necessária
				</p>
			)}
		</div>
	);
}

// Healthcare Button with Medical Context
interface HealthcareButtonProps {
	variant?: "emergency" | "primary" | "secondary" | "diagnostic" | "medication";
	size?: "sm" | "md" | "lg";
	type?: keyof typeof HEALTHCARE_ICONS;
	loading?: boolean;
	critical?: boolean;
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
	disabled?: boolean;
}

export function HealthcareButton({
	variant = "primary",
	size = "md",
	type,
	loading = false,
	critical = false,
	children,
	className,
	onClick,
	disabled,
}: HealthcareButtonProps) {
	const Icon = type ? HEALTHCARE_ICONS[type] : null;
	
	const getVariantStyles = () => {
		switch (variant) {
			case "emergency":
				return "bg-red-600 hover:bg-red-700 text-white border-red-600 focus:ring-red-500";
			case "diagnostic":
				return "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 focus:ring-blue-500";
			case "medication":
				return "bg-green-600 hover:bg-green-700 text-white border-green-600 focus:ring-green-500";
			case "secondary":
				return "bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 focus:ring-gray-500";
			default:
				return "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 focus:ring-blue-500";
		}
	};

	const getSizeStyles = () => {
		switch (size) {
			case "sm": return "px-3 py-1.5 text-sm";
			case "lg": return "px-6 py-3 text-lg";
			default: return "px-4 py-2 text-base";
		}
	};

	return (
		<Button
			className={`
				${getVariantStyles()} ${getSizeStyles()}
				${critical ? "animate-pulse" : ""} 
				${HEALTHCARE_ANIMATIONS.medical}
				focus:ring-2 focus:ring-offset-2 focus:outline-none
				disabled:opacity-50 disabled:cursor-not-allowed
				flex items-center gap-2 font-medium
				${className}
			`}
			onClick={onClick}
			disabled={disabled || loading}
		>
			{loading ? (
				<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
			) : (
				Icon && <Icon className="h-4 w-4" />
			)}
			{children}
		</Button>
	);
}

// Healthcare Design System Provider (for global styling)
interface HealthcareDesignSystemProps {
	children: React.ReactNode;
	theme?: "light" | "dark" | "high-contrast";
	className?: string;
}

export function HealthcareDesignSystem({ 
	children, 
	theme = "light", 
	className 
}: HealthcareDesignSystemProps) {
	const [currentTheme, setCurrentTheme] = useState(theme);

	useEffect(() => {
		document.documentElement.setAttribute('data-healthcare-theme', currentTheme);
	}, [currentTheme]);

	const getThemeClasses = () => {
		switch (currentTheme) {
			case "dark": return "dark bg-gray-900 text-white";
			case "high-contrast": return "high-contrast bg-black text-white";
			default: return "bg-white text-gray-900";
		}
	};

	return (
		<div 
			className={`
				healthcare-design-system 
				${getThemeClasses()}
				${className}
			`}
			data-theme={currentTheme}
		>
			{children}
		</div>
	);
}

// Export all design system components and utilities
export {
	HEALTHCARE_COLORS,
	HEALTHCARE_TYPOGRAPHY, 
	HEALTHCARE_SPACING,
	HEALTHCARE_ANIMATIONS,
	HEALTHCARE_ICONS,
};

export default HealthcareDesignSystem;