"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  FileText,
  BarChart3,
  Settings,
  Menu,
  Bell,
  Search,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sidebar Component
const Sidebar: React.FC<{ 
  className?: string; 
  onNavigate?: (path: string) => void; 
  activePath?: string 
}> = ({ className, onNavigate, activePath }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/dashboard" },
    { id: "appointments", label: "Appointments", icon: Calendar, path: "/dashboard/appointments" },
    { id: "patients", label: "Patients", icon: Users, path: "/dashboard/patients" },
    { id: "treatments", label: "Treatments", icon: FileText, path: "/dashboard/treatments" },
    { id: "reports", label: "Reports", icon: BarChart3, path: "/dashboard/reports" },
    { id: "settings", label: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-sidebar text-sidebar-foreground", className)}>
      {/* Logo/Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-bold font-serif text-sidebar-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            NeonPro
          </h2>
          <p className="text-sm text-sidebar-foreground/70 font-sans">
            Clinic Management
          </p>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activePath === item.path;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate?.(item.path)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-sans",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/50 font-sans">
          © 2025 NeonPro Clinic
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients, appointments..."
              className="pl-10 w-64 font-sans"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@neonpro.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

// Main Dashboard Layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/dashboard");

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setSidebarOpen(false);
    // Aqui você pode adicionar navegação real com Next.js router
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <Sidebar 
            onNavigate={handleNavigate} 
            activePath={currentPath}
          />
        </SheetContent>
      </Sheet>

      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-80 border-r border-border">
          <Sidebar 
            onNavigate={handleNavigate} 
            activePath={currentPath}
            className="w-full" 
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}