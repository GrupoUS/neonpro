"use client";

import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { BarChart3, Bell, Calendar, FileText, Home, LogOut, Settings, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";

type LayoutProps = {
	children: React.ReactNode;
};

type NavItem = {
	title: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	description?: string;
};

const mainNavItems: NavItem[] = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: Home,
		description: "Visão geral da clínica",
	},
	{
		title: "Pacientes",
		href: "/patients",
		icon: Users,
		description: "Gestão de pacientes",
	},
	{
		title: "Agendamentos",
		href: "/appointments",
		icon: Calendar,
		description: "Calendário e agendamentos",
	},
	{
		title: "Relatórios",
		href: "/reports",
		icon: BarChart3,
		description: "Relatórios e analytics",
	},
	{
		title: "Prontuários",
		href: "/records",
		icon: FileText,
		description: "Prontuários médicos",
	},
];

const settingsNavItems: NavItem[] = [
	{
		title: "Configurações",
		href: "/settings",
		icon: Settings,
		description: "Configurações da clínica",
	},
	{
		title: "Perfil",
		href: "/profile",
		icon: User,
		description: "Meu perfil",
	},
];

function AppSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar>
			<SidebarHeader className="border-sidebar-border border-b">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<div className="h-4 w-4 rounded-sm bg-primary-foreground" />
					</div>
					<div className="flex flex-col">
						<span className="font-semibold text-sm">NeonPro</span>
						<span className="text-muted-foreground text-xs">Clínica Estética</span>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarMenu>
					{mainNavItems.map((item) => {
						const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
						return (
							<SidebarMenuItem key={item.href}>
								<SidebarMenuButton asChild isActive={isActive}>
									<Link className="flex items-center gap-3" href={item.href}>
										<item.icon className="h-4 w-4" />
										<span className="flex-1">{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>

				<div className="mt-8">
					<div className="px-3 py-2">
						<p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Configurações</p>
					</div>
					<SidebarMenu>
						{settingsNavItems.map((item) => {
							const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
							return (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild isActive={isActive}>
										<Link className="flex items-center gap-3" href={item.href}>
											<item.icon className="h-4 w-4" />
											<span className="flex-1">{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</div>
			</SidebarContent>

			<SidebarFooter className="border-sidebar-border border-t">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<button className="flex w-full items-center gap-3">
								<LogOut className="h-4 w-4" />
								<span className="flex-1 text-left">Sair</span>
							</button>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}

function Header() {
	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center">
				<div className="mr-4 flex">
					<SidebarTrigger />
				</div>

				<div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
					<div className="w-full flex-1 md:w-auto md:flex-none">{/* Search component can be added here */}</div>

					<nav className="flex items-center gap-2">
						<Button size="sm" variant="ghost">
							<Bell className="h-4 w-4" />
							<span className="sr-only">Notificações</span>
						</Button>

						<Button size="sm" variant="ghost">
							<User className="h-4 w-4" />
							<span className="sr-only">Perfil do usuário</span>
						</Button>
					</nav>
				</div>
			</div>
		</header>
	);
}

export function AppLayout({ children }: LayoutProps) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full">
				<AppSidebar />
				<div className="flex flex-1 flex-col">
					<Header />
					<main className="flex-1 p-6">{children}</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
