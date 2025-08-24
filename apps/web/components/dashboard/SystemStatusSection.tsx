import { Activity, Cloud, Database, Shield, Zap } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SystemStatusSection() {
	const systemStatus = [
		{
			name: "API Principal",
			status: "Operacional",
			icon: Activity,
			color: "bg-green-100 text-green-800",
			uptime: "99.9%",
		},
		{
			name: "Banco de Dados",
			status: "Operacional",
			icon: Database,
			color: "bg-green-100 text-green-800",
			uptime: "99.8%",
		},
		{
			name: "Serviços Cloud",
			status: "Operacional",
			icon: Cloud,
			color: "bg-green-100 text-green-800",
			uptime: "99.9%",
		},
		{
			name: "Segurança",
			status: "Monitorando",
			icon: Shield,
			color: "bg-blue-100 text-blue-800",
			uptime: "100%",
		},
		{
			name: "AI Services",
			status: "Operacional",
			icon: Zap,
			color: "bg-green-100 text-green-800",
			uptime: "99.7%",
		},
	];

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="h-5 w-5" />
					Status do Sistema
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{systemStatus.map((service, index) => {
						const IconComponent = service.icon;
						return (
							<div className="flex items-center justify-between rounded-lg bg-muted/30 p-3" key={index}>
								<div className="flex items-center gap-3">
									<div className="rounded-full bg-muted p-2">
										<IconComponent className="h-4 w-4" />
									</div>
									<div>
										<p className="font-medium text-sm">{service.name}</p>
										<p className="text-muted-foreground text-xs">Uptime: {service.uptime}</p>
									</div>
								</div>
								<Badge className={service.color}>{service.status}</Badge>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
