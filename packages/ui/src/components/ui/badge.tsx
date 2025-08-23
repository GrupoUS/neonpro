import { cva, type VariantProps } from "class-variance-authority";
import {
	Activity,
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	Shield,
	User,
	XCircle,
	Zap,
} from "lucide-react";
import type * as React from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold text-xs backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-gradient-primary text-primary-foreground shadow-healthcare-sm hover:scale-105 hover:shadow-healthcare-md",
				secondary:
					"border-transparent bg-gradient-to-br from-secondary via-secondary/90 to-secondary text-secondary-foreground shadow-healthcare-sm hover:scale-105 hover:shadow-healthcare-md",
				destructive:
					"border-transparent bg-gradient-to-br from-destructive via-destructive/90 to-destructive text-destructive-foreground shadow-healthcare-sm hover:scale-105 hover:shadow-healthcare-md",
				outline:
					"border-border/60 bg-background/80 text-foreground backdrop-blur-sm hover:bg-accent/50",

				// NEONPROV1 Healthcare status variants
				patient:
					"border-transparent bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 text-primary shadow-healthcare-sm backdrop-blur-sm hover:scale-105",
				appointment:
					"border-transparent bg-gradient-to-br from-secondary/20 via-secondary/15 to-secondary/10 text-secondary shadow-healthcare-sm backdrop-blur-sm hover:scale-105",
				professional:
					"border-transparent bg-gradient-to-br from-info/20 via-info/15 to-info/10 text-info shadow-healthcare-sm backdrop-blur-sm hover:scale-105",

				// NEONPROV1 Medical priority variants
				critical:
					"animate-pulse-healthcare border-transparent bg-gradient-to-br from-destructive/20 via-destructive/15 to-destructive/10 text-destructive shadow-healthcare-md ring-2 ring-destructive/20 backdrop-blur-sm",
				urgent:
					"border-transparent bg-gradient-to-br from-warning/20 via-warning/15 to-warning/10 text-warning shadow-healthcare-sm backdrop-blur-sm hover:scale-105",
				normal:
					"border-transparent bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-healthcare-sm backdrop-blur-sm hover:scale-105",
				low: "border-transparent bg-gradient-to-br from-muted-foreground/15 via-muted-foreground/10 to-muted-foreground/5 text-muted-foreground shadow-healthcare-sm backdrop-blur-sm hover:scale-105",

				// NEONPROV1 Appointment status variants
				scheduled:
					"border-transparent bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-healthcare-sm backdrop-blur-sm hover:scale-105",
				confirmed:
					"border-transparent bg-gradient-to-br from-success/15 via-success/10 to-success/5 text-success shadow-healthcare-sm backdrop-blur-sm hover:scale-105",
				"in-progress":
					"border-transparent bg-gradient-to-br from-warning/15 via-warning/10 to-warning/5 text-warning shadow-healthcare-sm backdrop-blur-sm hover:scale-105",
				completed:
					"border-transparent bg-gradient-to-br from-success/20 via-success/15 to-success/10 text-success shadow-healthcare-md backdrop-blur-sm hover:scale-105",
				cancelled:
					"border-transparent bg-gradient-to-br from-destructive/15 via-destructive/10 to-destructive/5 text-destructive shadow-healthcare-sm backdrop-blur-sm hover:scale-105",
				"no-show":
					"border-transparent bg-gradient-to-br from-muted-foreground/15 via-muted-foreground/10 to-muted-foreground/5 text-muted-foreground shadow-healthcare-sm backdrop-blur-sm hover:scale-105",

				// NEONPROV1 Professional availability variants
				available:
					"border-transparent bg-gradient-to-br from-success/15 via-success/10 to-success/5 text-success shadow-healthcare-sm backdrop-blur-sm hover:scale-105",
				busy: "border-transparent bg-gradient-to-br from-warning/15 via-warning/10 to-warning/5 text-warning shadow-healthcare-sm backdrop-blur-sm hover:scale-105",
				offline:
					"border-transparent bg-gradient-to-br from-muted-foreground/15 via-muted-foreground/10 to-muted-foreground/5 text-muted-foreground shadow-healthcare-sm backdrop-blur-sm hover:scale-105",

				// NEONPROV1 LGPD compliance variants
				"lgpd-compliant":
					"border-transparent bg-gradient-to-br from-success/15 via-success/10 to-success/5 text-success shadow-healthcare-sm ring-1 ring-success/20 backdrop-blur-sm hover:scale-105",
				"lgpd-warning":
					"border-transparent bg-gradient-to-br from-warning/15 via-warning/10 to-warning/5 text-warning shadow-healthcare-sm ring-1 ring-warning/20 backdrop-blur-sm hover:scale-105",
				"lgpd-violation":
					"border-transparent bg-gradient-to-br from-destructive/15 via-destructive/10 to-destructive/5 text-destructive shadow-healthcare-md ring-1 ring-destructive/20 backdrop-blur-sm hover:scale-105",
			},
			size: {
				default: "px-2.5 py-0.5 text-xs",
				sm: "rounded-sm px-2 py-0.5 text-xs",
				lg: "rounded-lg px-3 py-1 text-sm",
			},
			withIcon: {
				true: "gap-1",
				false: "",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			withIcon: false,
		},
	},
);

interface BadgeProps
	extends React.ComponentProps<"div">,
		VariantProps<typeof badgeVariants> {
	icon?: React.ReactNode;
	pulse?: boolean;
	interactive?: boolean;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
	(
		{
			className,
			variant,
			size,
			withIcon,
			icon,
			pulse,
			interactive,
			onClick,
			...props
		},
		ref,
	) => {
		const hasIcon = Boolean(icon);

		return (
			<div
				className={cn(
					badgeVariants({ variant, size, withIcon: hasIcon }),
					pulse && "animate-pulse",
					interactive && "cursor-pointer transition-shadow hover:shadow-sm",
					className,
				)}
				data-interactive={interactive}
				data-variant={variant}
				onClick={onClick}
				ref={ref}
				role={interactive ? "button" : undefined}
				tabIndex={interactive ? 0 : undefined}
				{...props}
			>
				{icon && (
					<span aria-hidden="true" className="flex items-center justify-center">
						{icon}
					</span>
				)}
				{props.children}
			</div>
		);
	},
);
Badge.displayName = "Badge"; // Healthcare-specific badge components

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
	status:
		| "critical"
		| "urgent"
		| "normal"
		| "low"
		| "scheduled"
		| "confirmed"
		| "in-progress"
		| "completed"
		| "cancelled"
		| "no-show";
	showIcon?: boolean;
}

const StatusBadge = forwardRef<HTMLDivElement, StatusBadgeProps>(
	({ status, showIcon = true, ...props }, ref) => {
		const getStatusIcon = () => {
			if (!showIcon) {
				return;
			}

			switch (status) {
				case "critical":
					return <AlertCircle className="h-3 w-3" />;
				case "urgent":
					return <Zap className="h-3 w-3" />;
				case "normal":
					return <Activity className="h-3 w-3" />;
				case "low":
					return <Clock className="h-3 w-3" />;
				case "scheduled":
					return <Calendar className="h-3 w-3" />;
				case "confirmed":
					return <CheckCircle className="h-3 w-3" />;
				case "in-progress":
					return <Activity className="h-3 w-3" />;
				case "completed":
					return <CheckCircle className="h-3 w-3" />;
				case "cancelled":
					return <XCircle className="h-3 w-3" />;
				case "no-show":
					return <XCircle className="h-3 w-3" />;
				default:
					return <Clock className="h-3 w-3" />;
			}
		};

		const getStatusLabel = () => {
			switch (status) {
				case "critical":
					return "Crítico";
				case "urgent":
					return "Urgente";
				case "normal":
					return "Normal";
				case "low":
					return "Baixa";
				case "scheduled":
					return "Agendado";
				case "confirmed":
					return "Confirmado";
				case "in-progress":
					return "Em Andamento";
				case "completed":
					return "Concluído";
				case "cancelled":
					return "Cancelado";
				case "no-show":
					return "Faltou";
				default:
					return "Status";
			}
		};

		return (
			<Badge
				icon={getStatusIcon()}
				pulse={status === "critical"}
				ref={ref}
				variant={status}
				{...props}
			>
				{props.children || getStatusLabel()}
			</Badge>
		);
	},
);
StatusBadge.displayName = "StatusBadge";

interface ProfessionalBadgeProps extends Omit<BadgeProps, "variant"> {
	availability: "available" | "busy" | "offline";
	specialty?: string;
	showIcon?: boolean;
}

const ProfessionalBadge = forwardRef<HTMLDivElement, ProfessionalBadgeProps>(
	({ availability, specialty, showIcon = true, ...props }, ref) => {
		const getAvailabilityIcon = () => {
			if (!showIcon) {
				return;
			}

			switch (availability) {
				case "available":
					return <CheckCircle className="h-3 w-3" />;
				case "busy":
					return <Clock className="h-3 w-3" />;
				case "offline":
					return <XCircle className="h-3 w-3" />;
				default:
					return <User className="h-3 w-3" />;
			}
		};

		const getAvailabilityLabel = () => {
			switch (availability) {
				case "available":
					return "Disponível";
				case "busy":
					return "Ocupado";
				case "offline":
					return "Offline";
				default:
					return "Status";
			}
		};

		return (
			<Badge
				icon={getAvailabilityIcon()}
				ref={ref}
				title={
					specialty
						? `${getAvailabilityLabel()} - ${specialty}`
						: getAvailabilityLabel()
				}
				variant={availability}
				{...props}
			>
				{props.children || getAvailabilityLabel()}
			</Badge>
		);
	},
);
ProfessionalBadge.displayName = "ProfessionalBadge";
interface LGPDBadgeProps extends Omit<BadgeProps, "variant"> {
	compliance: "compliant" | "warning" | "violation";
	score?: number;
	showIcon?: boolean;
}

const LGPDBadge = forwardRef<HTMLDivElement, LGPDBadgeProps>(
	({ compliance, score, showIcon = true, ...props }, ref) => {
		const getComplianceIcon = () => {
			if (!showIcon) {
				return;
			}

			switch (compliance) {
				case "compliant":
					return <Shield className="h-3 w-3" />;
				case "warning":
					return <AlertCircle className="h-3 w-3" />;
				case "violation":
					return <XCircle className="h-3 w-3" />;
				default:
					return <Shield className="h-3 w-3" />;
			}
		};

		const getComplianceLabel = () => {
			switch (compliance) {
				case "compliant":
					return score ? `LGPD Conforme (${score}%)` : "LGPD Conforme";
				case "warning":
					return score ? `LGPD Atenção (${score}%)` : "LGPD Atenção";
				case "violation":
					return score ? `LGPD Violação (${score}%)` : "LGPD Violação";
				default:
					return "LGPD";
			}
		};

		const getVariant = () => {
			switch (compliance) {
				case "compliant":
					return "lgpd-compliant";
				case "warning":
					return "lgpd-warning";
				case "violation":
					return "lgpd-violation";
				default:
					return "lgpd-compliant";
			}
		};

		return (
			<Badge
				icon={getComplianceIcon()}
				pulse={compliance === "violation"}
				ref={ref}
				variant={getVariant() as any}
				{...props}
			>
				{props.children || getComplianceLabel()}
			</Badge>
		);
	},
);
LGPDBadge.displayName = "LGPDBadge";

interface PriorityBadgeProps extends Omit<BadgeProps, "variant"> {
	priority: "critical" | "urgent" | "normal" | "low";
	showIcon?: boolean;
}

const PriorityBadge = forwardRef<HTMLDivElement, PriorityBadgeProps>(
	({ priority, showIcon = true, ...props }, ref) => {
		const getPriorityIcon = () => {
			if (!showIcon) {
				return;
			}

			switch (priority) {
				case "critical":
					return <AlertCircle className="h-3 w-3" />;
				case "urgent":
					return <Zap className="h-3 w-3" />;
				case "normal":
					return <Activity className="h-3 w-3" />;
				case "low":
					return <Clock className="h-3 w-3" />;
				default:
					return <Activity className="h-3 w-3" />;
			}
		};

		const getPriorityLabel = () => {
			switch (priority) {
				case "critical":
					return "Crítico";
				case "urgent":
					return "Urgente";
				case "normal":
					return "Normal";
				case "low":
					return "Baixa";
				default:
					return "Normal";
			}
		};

		return (
			<Badge
				icon={getPriorityIcon()}
				pulse={priority === "critical"}
				ref={ref}
				variant={priority}
				{...props}
			>
				{props.children || getPriorityLabel()}
			</Badge>
		);
	},
);
PriorityBadge.displayName = "PriorityBadge";

export {
	Badge,
	StatusBadge,
	ProfessionalBadge,
	LGPDBadge,
	PriorityBadge,
	badgeVariants,
	type BadgeProps,
	type StatusBadgeProps,
	type ProfessionalBadgeProps,
	type LGPDBadgeProps,
	type PriorityBadgeProps,
};
