"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-40 h-full hidden lg:block"
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
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-full w-72 lg:hidden"
          >
            <div className="h-full glass-card rounded-none rounded-r-2xl">
              {/* Mobile Header */}
              <div className="flex h-16 items-center justify-between px-6">
                <h1 className="text-xl font-bold gradient-text">NeonPro</h1>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="glass-button p-2 !px-2 !py-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="mt-8 px-4">
                <ul className="space-y-2">
                  {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                            flex items-center gap-3 rounded-lg px-3 py-2.5
                            transition-all duration-200
                            ${
                              isActive
                                ? "glass-card !bg-grupous-secondary/20 text-grupous-secondary"
                                : "hover:glass-card hover:!bg-white/5"
                            }
                          `}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-[280px]" : "lg:ml-20"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 backdrop-blur-md bg-white/50 dark:bg-gray-900/50 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="glass-button p-2 !px-2 !py-2 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Link
                href="/dashboard"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Dashboard
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                Overview
              </span>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden sm:block">
                <div className="glass-input flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-0 outline-none placeholder-gray-400 text-sm"
                  />
                </div>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <button className="glass-button p-2 !px-2 !py-2 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-grupous-secondary rounded-full animate-pulse" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="glass-button p-2 !px-2 !py-2"
                >
                  <User className="h-5 w-5" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setUserMenuOpen(false)}
                        className="fixed inset-0 z-10"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 glass-card p-2 z-20"
                      >
                        <div className="py-1">
                          <a
                            href="#"
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:glass-card rounded-lg transition-all"
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </a>
                          <a
                            href="#"
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:glass-card rounded-lg transition-all"
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </a>
                          <hr className="my-2 border-gray-200/50 dark:border-gray-700/50" />
                          <a
                            href="#"
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:glass-card rounded-lg transition-all text-red-600 dark:text-red-400"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </a>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
