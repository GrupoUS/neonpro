import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type React from "react";
import { Header } from "../components/header";
import { HealthcareSidebar } from "../components/healthcare-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full bg-background">
				<HealthcareSidebar />
				<SidebarInset>
					<Header />
					<main className="flex-1 overflow-auto bg-muted/30 p-6">
						<div className="mx-auto max-w-7xl">{children}</div>
					</main>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
