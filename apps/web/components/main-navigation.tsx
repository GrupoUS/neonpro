/**
 * 🧭 Main Navigation - NeonPro Healthcare
 * =====================================
 * 
 * Responsive main navigation with role-based access,
 * healthcare-specific menu items, and mobile optimization.
 */

'use client';

import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/contexts/auth-context';
import { 
  Activity,
  BarChart3,
  Calendar,
  FileText,
  Heart,
  Home,
  Menu,
  Settings,
  Shield,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  permission?: () => boolean;
  children?: NavigationItem[];
}

export function MainNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  // Simple permission checks based on user role
  const canAccessPatients = () => {
    return user && ['clinic_owner', 'clinic_manager', 'professional'].includes(user.role);
  };

  const canAccessProfessionals = () => {
    return user && ['clinic_owner', 'clinic_manager'].includes(user.role);
  };

  const canAccessCompliance = () => {
    return user && ['clinic_owner', 'clinic_manager'].includes(user.role);
  };

  // Define navigation items based on user role and permissions
  const navigationItems: NavigationItem[] = React.useMemo(() => {
    const items: NavigationItem[] = [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        description: 'Visão geral da clínica',
      },
    ];

    // Add patient management for authorized roles
    if (canAccessPatients()) {
      items.push({
        label: 'Pacientes',
        href: '/patients',
        icon: Users,
        description: 'Gestão de pacientes',
      });
    }

    // Add appointments for all authenticated users
    items.push({
      label: 'Consultas',
      href: '/appointments',
      icon: Calendar,
      description: 'Agendamento e gestão',
    });

    // Add professionals for managers and owners
    if (canAccessProfessionals()) {
      items.push({
        label: 'Profissionais',
        href: '/professionals',
        icon: Stethoscope,
        description: 'Gestão da equipe',
      });
    }

    // Add analytics for managers and owners
    if (canAccessCompliance()) {
      items.push({
        label: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        description: 'Relatórios e métricas',
        badge: 'Pro',
      });
    }

    // Add compliance for managers and owners
    if (canAccessCompliance()) {
      items.push({
        label: 'Conformidade',
        href: '/compliance',
        icon: Shield,
        description: 'LGPD, ANVISA, CFM',
        badge: 'Crítico',
      });
    }

    // Add settings for all authenticated users
    items.push({
      label: 'Configurações',
      href: '/settings',
      icon: Settings,
      description: 'Preferências e conta',
    });

    return items;
  }, [user]);

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const NavigationItems = ({ items, mobile = false }: { items: NavigationItem[]; mobile?: boolean }) => (
    <div className={cn("space-y-2", mobile && "w-full")}>
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isActiveRoute(item.href) 
              ? "bg-accent text-accent-foreground" 
              : "text-muted-foreground",
            mobile && "w-full"
          )}
          onClick={() => mobile && setIsMobileMenuOpen(false)}
        >
          <item.icon className="h-5 w-5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant={item.badge === 'Crítico' ? 'destructive' : 'secondary'}
                  className="ml-2"
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            {item.description && mobile && (
              <p className="text-xs text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-card border-r">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NeonPro
              </span>
            </Link>
          </div>

          {/* User Info */}
          <div className="flex-shrink-0 px-4 py-4 border-b">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'clinic_owner' ? 'Proprietário' :
                   user?.role === 'clinic_manager' ? 'Gerente' :
                   user?.role === 'professional' ? 'Profissional' :
                   user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="px-4 py-4">
              <NavigationItems items={navigationItems} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-4 py-4 border-t">
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                <Shield className="mr-1 h-3 w-3" />
                LGPD Compliant
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="flex items-center h-16 px-4 bg-card border-b">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu</span>
          </Button>

          {/* Mobile Logo in Header */}
          <Link to="/" className="flex items-center space-x-2 ml-4">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NeonPro
            </span>
          </Link>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-80 bg-card border-r shadow-lg">
              <div className="flex flex-col h-full">
                {/* Mobile Logo */}
                <div className="flex items-center h-16 px-6 border-b">
                  <Link 
                    to="/" 
                    className="flex items-center space-x-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      NeonPro
                    </span>
                  </Link>
                </div>

                {/* Mobile User Info */}
                <div className="px-6 py-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user?.name || 'Usuário'}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.role === 'clinic_owner' ? 'Proprietário' :
                         user?.role === 'clinic_manager' ? 'Gerente' :
                         user?.role === 'professional' ? 'Profissional' :
                         'Usuário'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <NavigationItems items={navigationItems} mobile />
                </div>

                {/* Mobile Footer */}
                <div className="px-6 py-4 border-t">
                  <Badge variant="outline" className="w-full justify-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Sistema Seguro
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}