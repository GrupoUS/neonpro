/**
 * NEONPROV1 Design System - AppLayout Component
 * Main application layout with sidebar and header
 */
"use client";

import type React from "react";
import { useState } from "react";
import type { cn } from "@/lib/utils";
import type { AppHeader } from "./app-header";
import type { AppSidebar } from "./app-sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <AppSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <AppHeader onMenuToggle={toggleSidebar} />

        {/* Page Content */}
        <main className={cn("flex-1 p-6", "animate-fade-in", className)} onClick={closeSidebar}>
          {children}
        </main>
      </div>
    </div>
  );
};
