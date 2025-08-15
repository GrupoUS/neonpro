'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  Calendar,
  FileText,
  Menu,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import type * as React from 'react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// Sidebar Component
const Sidebar: React.FC<{
  className?: string;
  onNavigate?: (path: string) => void;
  activePath?: string;
}> = ({ className, onNavigate, activePath }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard',
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      path: '/dashboard/appointments',
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: Users,
      path: '/dashboard/patients',
    },
    {
      id: 'treatments',
      label: 'Treatments',
      icon: FileText,
      path: '/dashboard/treatments',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      path: '/dashboard/reports',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
    },
  ];

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-sidebar text-sidebar-foreground',
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="border-sidebar-border border-b p-6">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
          initial={{ opacity: 0, y: -20 }}
        >
          <h2 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text font-bold font-serif text-sidebar-foreground text-transparent text-xl">
            NeonPro
          </h2>
          <p className="font-sans text-sidebar-foreground/70 text-sm">
            Clinic Management
          </p>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activePath === item.path;

          return (
            <motion.button
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-sm transition-all',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
              )}
              initial={{ opacity: 0, x: -20 }}
              key={item.id}
              onClick={() => onNavigate?.(item.path)}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-sidebar-border border-t p-4">
        <div className="font-sans text-sidebar-foreground/50 text-xs">
          © 2025 NeonPro Clinic
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  return (
    <header className="border-border border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            className="lg:hidden"
            onClick={onMenuClick}
            size="sm"
            variant="ghost"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative hidden md:block">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
            <Input
              className="w-64 pl-10 font-sans"
              placeholder="Search patients, appointments..."
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button className="relative" size="sm" variant="ghost">
            <Bell className="h-5 w-5" />
            <span className="-top-1 -right-1 absolute h-3 w-3 rounded-full bg-destructive text-xs" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="relative h-8 w-8 rounded-full" variant="ghost">
                <Avatar className="h-8 w-8">
                  <AvatarImage alt="Admin" src="/avatars/admin.jpg" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="font-medium text-sm leading-none">Admin User</p>
                  <p className="text-muted-foreground text-xs leading-none">
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
  const [currentPath, setCurrentPath] = useState('/dashboard');

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setSidebarOpen(false);
    // Aqui você pode adicionar navegação real com Next.js router
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Mobile Sidebar */}
      <Sheet onOpenChange={setSidebarOpen} open={sidebarOpen}>
        <SheetContent className="w-80 p-0" side="left">
          <Sidebar activePath={currentPath} onNavigate={handleNavigate} />
        </SheetContent>
      </Sheet>

      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden w-80 border-border border-r lg:flex">
          <Sidebar
            activePath={currentPath}
            className="w-full"
            onNavigate={handleNavigate}
          />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
