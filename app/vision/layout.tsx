'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Eye, 
  BarChart3, 
  Settings, 
  Home,
  Activity,
  FileText,
  Zap,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VisionLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/vision',
    icon: Home,
    description: 'Visão geral do sistema'
  },
  {
    name: 'Nova Análise',
    href: '/vision/analysis',
    icon: Eye,
    description: 'Realizar análise de imagens',
    badge: 'Principal'
  },
  {
    name: 'Relatórios',
    href: '/vision/reports',
    icon: BarChart3,
    description: 'Visualizar análises anteriores'
  },
  {
    name: 'Configurações',
    href: '/vision/settings',
    icon: Settings,
    description: 'Configurar sistema'
  }
];

const quickActions = [
  {
    name: 'Status do Sistema',
    icon: Activity,
    action: () => console.log('Check system status'),
    color: 'text-green-600'
  },
  {
    name: 'Documentação',
    icon: FileText,
    action: () => console.log('Open documentation'),
    color: 'text-blue-600'
  },
  {
    name: 'Suporte',
    icon: HelpCircle,
    action: () => console.log('Open support'),
    color: 'text-purple-600'
  }
];

export default function VisionLayout({ children }: VisionLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NeonPro Vision</h1>
                <p className="text-xs text-gray-500">Sistema de Visão Computacional</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={action.action}
                  className="flex items-center gap-2"
                >
                  <action.icon className={cn("h-4 w-4", action.color)} />
                  <span className="hidden sm:inline">{action.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-blue-600" : "text-gray-500"
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-1.5 py-0.5"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* System Status Card */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Status do Sistema</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">API</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Online</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Modelo IA</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Ativo</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Processamento</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600 font-medium">2 em fila</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Performance</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Precisão Média</span>
                  <span className="text-green-600 font-medium">96.8%</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Tempo Médio</span>
                  <span className="text-blue-600 font-medium">18.5s</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Análises Hoje</span>
                  <span className="text-purple-600 font-medium">47</span>
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Segurança</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Criptografia</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Ativa</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Backup</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Atualizado</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Auditoria</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Ativa</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}