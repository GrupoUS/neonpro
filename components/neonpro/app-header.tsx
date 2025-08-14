/**
 * NEONPROV1 Design System - AppHeader Component
 * Main header with breadcrumbs and user menu
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface AppHeaderProps {
  onMenuToggle?: () => void;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  agenda: 'Agenda',
  pacientes: 'Pacientes',
  financeiro: 'Financeiro',
  profile: 'Perfil',
  settings: 'Configurações',
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuToggle,
  className,
}) => {
  const pathname = usePathname();
  
  const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/dashboard' }
    ];

    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const isActive = index === segments.length - 1;
      
      breadcrumbs.push({
        label,
        href: isActive ? undefined : href,
        isActive,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className={cn(
      'sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700',
      'backdrop-blur-sm bg-white/95 dark:bg-slate-900/95',
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                {item.href && !item.isActive ? (
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-neon-primary dark:text-slate-400 dark:hover:text-neon-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn(
                    'font-medium',
                    item.isActive 
                      ? 'text-neon-primary dark:text-neon-accent' 
                      : 'text-slate-600 dark:text-slate-400'
                  )}>
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar..."
              className="pl-10 w-64 neon-input"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-healthcare-critical rounded-full text-xs" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <div className="w-8 h-8 bg-neon-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">Dr. João Silva</p>
                <p className="text-xs text-slate-500">joao@neonprov1.com</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};