"use client";

import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import type { Button } from "@/components/ui/button";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Bell, Settings, LogOut, Menu, Home } from "lucide-react";
import type { useRouter } from "next/navigation";
import type { createClient } from "@/app/utils/supabase/client";

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({
  children,
  user,
  breadcrumbs = [],
  title,
  subtitle,
}: DashboardLayoutProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getUserInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex h-16 items-center px-4 lg:px-6">
          <div className="flex items-center space-x-4 flex-1">
            <Button variant="ghost" size="sm" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">N</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">NeonPro</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                    <AvatarFallback>{getUserInitials(user.email || "")}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">
                      <Home className="h-4 w-4" />
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center">
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {crumb.href && index < breadcrumbs.length - 1 ? (
                          <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}

          {/* Page Header */}
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
              {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
            </div>
          )}

          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
