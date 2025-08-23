/**
 * 👥 Patients Layout - NeonPro Healthcare
 * =====================================
 *
 * Layout for patient management with context-aware navigation
 * and healthcare-specific patient tools.
 */

"use client";

import { Outlet } from "@tanstack/react-router";
import { Filter, Plus, Search } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MainNavigation } from "@/components/main-navigation";
import { Button } from "@/components/ui/button";

export function PatientsLayout() {
	return (
		<div className="min-h-screen bg-background">
			{/* Main Navigation */}
			<MainNavigation />

			{/* Main Content Area */}
			<div className="md:pl-64">
				{/* Top Header with Breadcrumbs and Actions */}
				<header className="sticky top-0 z-10 border-b bg-card">
					<div className="px-4 py-3">
						<div className="flex items-center justify-between">
							<Breadcrumbs />
							<div className="flex items-center space-x-2">
								<Button size="sm" variant="outline">
									<Filter className="mr-2 h-4 w-4" />
									Filtros
								</Button>
								<Button size="sm" variant="outline">
									<Search className="mr-2 h-4 w-4" />
									Buscar
								</Button>
								<Button size="sm">
									<Plus className="mr-2 h-4 w-4" />
									Novo Paciente
								</Button>
							</div>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1">
					<div className="px-4 py-6">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
}
