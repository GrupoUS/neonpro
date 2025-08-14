'use client';

import { useRouter } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  FileText, 
  Upload, 
  TrendingUp, 
  Star, 
  MessageCircle,
  Clock,
  Shield,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description: string;
  coming_soon?: boolean;
}

interface PortalNavigationProps {
  pathname: string;
  onNavigate?: () => void;
  primaryColor?: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/portal/dashboard',
    icon: Home,
    description: 'Visão geral do seu atendimento'
  },
  {
    name: 'Agendamentos',
    href: '/portal/appointments',
    icon: Calendar,
    description: 'Agende e gerencie suas consultas'
  },
  {
    name: 'Histórico Médico',
    href: '/portal/medical-history',
    icon: FileText,
    description: 'Acesse seu histórico completo'
  },
  {
    name: 'Documentos',
    href: '/portal/uploads',
    icon: Upload,
    description: 'Envie e organize documentos'
  },
  {
    name: 'Progresso',
    href: '/portal/progress',
    icon: TrendingUp,
    description: 'Acompanhe sua evolução'
  },
  {
    name: 'Avaliações',
    href: '/portal/evaluations',
    icon: Star,
    description: 'Avalie nossos serviços'
  },
  {
    name: 'Mensagens',
    href: '/portal/messages',
    icon: MessageCircle,
    badge: 3,
    description: 'Comunicação com a equipe'
  }
];

const quickActions: NavigationItem[] = [
  {
    name: 'Próxima Consulta',
    href: '/portal/appointments/next',
    icon: Clock,
    description: 'Ver detalhes da próxima consulta'
  },
  {
    name: 'Emergência',
    href: '/portal/emergency',
    icon: Shield,
    description: 'Contato de emergência'
  },
  {
    name: 'Relatórios',
    href: '/portal/reports',
    icon: Download,
    description: 'Baixar relatórios médicos'
  }
];

export function PortalNavigation({ 
  pathname, 
  onNavigate,
  primaryColor = '#6366f1'
}: PortalNavigationProps) {
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
    onNavigate?.();
  };

  const isActive = (href: string) => {
    if (href === '/portal/dashboard') {
      return pathname === '/portal/dashboard' || pathname === '/portal';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <div className="px-4 space-y-1">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 px-3 text-left",
                  active && "bg-primary/10 text-primary border-r-2 border-primary font-medium"
                )}
                onClick={() => handleNavigation(item.href)}
                disabled={item.coming_soon}
              >
                <Icon className={cn(
                  "h-5 w-5 mr-3 flex-shrink-0",
                  active ? "text-primary" : "text-slate-500"
                )} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-sm truncate",
                      active ? "text-primary font-medium" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {item.name}
                    </span>
                    
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 h-5 min-w-[20px] text-xs"
                        style={{ 
                          backgroundColor: active ? primaryColor : undefined,
                          color: active ? 'white' : undefined
                        }}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    
                    {item.coming_soon && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Em breve
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {item.description}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-slate-200 dark:border-slate-700" />

        {/* Quick Actions */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Ações Rápidas
          </h3>
          
          {quickActions.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Button
                key={item.name}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start h-10 px-3 text-left",
                  active && "bg-primary/5 text-primary"
                )}
                onClick={() => handleNavigation(item.href)}
              >
                <Icon className={cn(
                  "h-4 w-4 mr-3 flex-shrink-0",
                  active ? "text-primary" : "text-slate-400"
                )} />
                
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "text-sm truncate",
                    active ? "text-primary" : "text-slate-600 dark:text-slate-300"
                  )}>
                    {item.name}
                  </span>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {item.description}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Support Section */}
        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <MessageCircle className="h-6 w-6 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Precisa de ajuda?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nossa equipe está sempre disponível
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => handleNavigation('/portal/support')}
          >
            Falar com Suporte
          </Button>
        </div>
      </div>
    </nav>
  );
}