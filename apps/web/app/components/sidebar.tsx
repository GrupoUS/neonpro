"use client";

import {
	BarChart3,
	Calendar,
	CreditCard,
	FileText,
	Heart,
	LayoutDashboard,
	Settings,
	Shield,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const sidebarItems = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Patients",
		href: "/dashboard/patients",
		icon: Users,
	},
	{
		title: "Appointments",
		href: "/dashboard/appointments",
		icon: Calendar,
	},
	{
		title: "Treatments",
		href: "/dashboard/treatments",
		icon: Heart,
	},
	{
		title: "Analytics",
		href: "/dashboard/analytics",
		icon: BarChart3,
	},
	{
		title: "Financial",
		href: "/dashboard/financial",
		icon: CreditCard,
	},
	{
		title: "Reports",
		href: "/dashboard/reports",
		icon: FileText,
	},
	{
		title: "Compliance",
		href: "/dashboard/compliance",
		icon: Shield,
	},
	{
		title: "Settings",
		href: "/dashboard/settings",
		icon: Settings,
	},
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<div className="flex h-full w-64 flex-col border-r bg-background">
			<div className="flex h-16 items-center border-b px-6">
				<Link className="flex items-center space-x-2" href="/dashboard">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<span className="font-bold text-primary-foreground text-sm">N</span>
					</div>
					<span className="font-bold text-lg">NeonPro</span>
				</Link>
			</div>

			<ScrollArea className="flex-1 px-3 py-4">
				<nav className="space-y-2">
					{sidebarItems.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;

						return (
							<Button
								asChild
								className={cn("w-full justify-start", isActive && "bg-secondary")}
								key={item.href}
								variant={isActive ? "secondary" : "ghost"}
							>
								<Link href={item.href}>
									<Icon className="mr-2 h-4 w-4" />
									{item.title}
								</Link>
							</Button>
						);
					})}
				</nav>
			</ScrollArea>
		</div>
	);
}
