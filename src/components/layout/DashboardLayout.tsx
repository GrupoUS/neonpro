"use client";

import { BottomNav, MobileBottomSpacer } from "@/components/mobile/bottom-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useMobileViewport } from "@/hooks/use-touch-gestures";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  ChevronRight,
  Home,
  Menu,
  Search,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile, isTablet } = useMobileViewport();
  const pathname = usePathname();

  const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    {
      icon: BarChart3,
      label: "Visualizations",
      href: "/dashboard/visualizations",
    },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Users, label: "Team", href: "/team" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Hidden on mobile */}
        {!isMobile && (
          <aside
            className={cn(
              "glass-subtle w-64 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="h-full glass-card rounded-none rounded-r-2xl border-l-0">
              {/* Logo */}
              <div className="flex h-16 items-center justify-between px-6">
                <motion.div
                  animate={{ opacity: sidebarOpen ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={sidebarOpen ? "block" : "hidden"}
                >
                  <h1 className="text-xl font-bold gradient-text">NeonPro</h1>
                </motion.div>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="glass-button p-2 !px-2 !py-2"
                >
                  <ChevronRight
                    className={`h-5 w-5 transition-transform ${
                      sidebarOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Navigation */}
              <nav className="mt-8 px-4">
                <ul className="space-y-2">
                  {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`
                            group relative flex items-center gap-3 rounded-lg px-3 py-2.5
                            transition-all duration-200
                            ${
                              isActive
                                ? "glass-card !bg-grupous-secondary/20 text-grupous-secondary"
                                : "hover:glass-card hover:!bg-white/5"
                            }
                          `}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <motion.span
                            animate={{
                              opacity: sidebarOpen ? 1 : 0,
                              x: sidebarOpen ? 0 : -10,
                            }}
                            transition={{ duration: 0.2 }}
                            className={`${
                              sidebarOpen ? "block" : "hidden"
                            } font-medium`}
                          >
                            {item.label}
                          </motion.span>

                          {/* Tooltip for collapsed sidebar */}
                          {!sidebarOpen && (
                            <div className="absolute left-full ml-2 hidden group-hover:block">
                              <div className="glass-card px-2 py-1 text-sm whitespace-nowrap">
                                {item.label}
                              </div>
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <header className="glass-subtle border-b border-border safe-area-top">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6">
              <div className="flex items-center">
                {/* Mobile menu button */}
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                )}
                <h1 className="text-2xl font-semibold text-gray-100 ml-2 lg:ml-0">
                  Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-white/10">
                  <Bell className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-white/10">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main
            className={cn(
              "flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900",
              isMobile || isTablet ? "pb-safe-nav" : ""
            )}
          >
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              {children}
              {/* Add spacer for mobile bottom nav */}
              <MobileBottomSpacer />
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </>
  );
}
