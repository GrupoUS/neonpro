"use client";

/**
 * Compliance Dashboard Page
 * FASE 4: Frontend Components - Compliance Monitoring
 * Compliance: LGPD/ANVISA/CFM + WCAG 2.1 AA
 */

import { ComplianceStatusDashboard } from "@/components/dashboard/ai-powered";

// Metadata for SEO and accessibility
export const metadata = {
	title: "Compliance Monitor | NeonPro Healthcare",
	description: "Monitoramento em tempo real da conformidade LGPD, ANVISA e CFM",
	keywords: ["compliance", "LGPD", "ANVISA", "CFM", "monitoring", "healthcare"],
};

interface CompliancePageProps {
	searchParams?: Record<string, string | string[] | undefined>;
}

export default function CompliancePage({ searchParams }: CompliancePageProps) {
	return (
		<main
			className="min-h-screen bg-background p-4 md:p-6"
			role="main"
			aria-labelledby="compliance-heading"
		>
			<div className="space-y-6">
				<div>
					<h1 
						id="compliance-heading"
						className="text-3xl font-bold tracking-tight"
					>
						Compliance Monitor
					</h1>
					<p className="text-muted-foreground">
						Monitoramento em tempo real da conformidade LGPD, ANVISA e CFM
					</p>
				</div>
				
				<div 
					role="region"
					aria-label="Dashboard de monitoramento de compliance regulatório"
					className="w-full"
				>
					<ComplianceStatusDashboard />
				</div>
			</div>
		</main>
	);
}