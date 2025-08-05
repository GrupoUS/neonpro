"use client";

import type { useState } from "react";
import type { ErrorBoundary } from "@/components/ui/error-boundary";
import type { cn } from "@/lib/utils";
import type { DashboardHeader } from "./dashboard-header";
import type { DashboardSidebar } from "./dashboard-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: any;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <ErrorBoundary
        onError={(error) => console.error("Dashboard Sidebar Error:", error)}
        fallback={
          <div className="w-64 h-screen bg-muted flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Erro no menu lateral</p>
          </div>
        }
      >
        <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} user={user} />
      </ErrorBoundary>

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          "lg:ml-64", // Always show sidebar on large screens
        )}
      >
        {/* Header */}
        <ErrorBoundary
          onError={(error) => console.error("Dashboard Header Error:", error)}
          fallback={
            <div className="h-16 bg-muted border-b flex items-center px-6">
              <p className="text-sm text-muted-foreground">Erro no cabeçalho</p>
            </div>
          }
        >
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} user={user} />
        </ErrorBoundary>

        {/* Page content */}
        <ErrorBoundary
          onError={(error) => console.error("Dashboard Content Error:", error)}
          className="m-6"
          showDetails={process.env.NODE_ENV === "development"}
        >
          <main className="p-6">{children}</main>
        </ErrorBoundary>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
