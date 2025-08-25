"use client";

/**
 * Health Monitoring Dashboard Page
 * FASE 4: Frontend Components - System Health
 * Compliance: LGPD/ANVISA/CFM + WCAG 2.1 AA
 */

import { HealthMonitoringDashboard } from "@/components/dashboard/ai-powered";

// Metadata for SEO and accessibility
export const metadata = {
	title: "System Health Monitor | NeonPro Healthcare",
	description: "Status em tempo real da infraestrutura e performance do sistema",
	keywords: ["health", "monitoring", "system", "performance", "infrastructure"],
};

interface HealthPageProps {
	searchParams?: Record<string, string | string[] | undefined>;
}

export default function HealthPage({ searchParams }: HealthPageProps) {
	return (
		<main
			className="min-h-screen bg-background p-4 md:p-6"
			role="main"
			aria-labelledby="health-heading"
		>
			<div className="space-y-6">
				<div>
					<h1 
						id="health-heading"
						className="text-3xl font-bold tracking-tight"
					>
						Monitoramento de Saúde
					</h1>
					<p className="text-muted-foreground">
						Status em tempo real da infraestrutura e performance do sistema
					</p>
				</div>
				
				<div 
					role="region"
					aria-label="Dashboard de monitoramento de saúde do sistema"
					className="w-full"
				>
					<HealthMonitoringDashboard />
				</div>
			</div>
		</main>
	);
}