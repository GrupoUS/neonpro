/**
 * NEONPROV1 - Dashboard Avançado com 21st dev components
 * Dashboard premium com componentes visuais aprimorados
 */
'use client';

import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  Heart,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { AppLayout } from '@/components/neonpro';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// NeonGradientCard Component com cores NEONPROV1
type NeonColorsProps = {
  firstColor: string;
  secondColor: string;
};

type NeonGradientCardProps = {
  className?: string;
  children?: React.ReactNode;
  borderSize?: number;
  borderRadius?: number;
  neonColors?: NeonColorsProps;
};

const NeonGradientCard: React.FC<NeonGradientCardProps> = ({
  className,
  children,
  borderSize = 2,
  borderRadius = 20,
  neonColors = {
    firstColor: '#1E40AF', // NEONPROV1 Primary
    secondColor: '#3B82F6', // NEONPROV1 Secondary
  },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div
      className={cn(
        'relative z-10 size-full rounded-[var(--border-radius)]',
        className,
      )}
      ref={containerRef}
      style={
        {
          '--border-size': `${borderSize}px`,
          '--border-radius': `${borderRadius}px`,
          '--neon-first-color': neonColors.firstColor,
          '--neon-second-color': neonColors.secondColor,
          '--card-width': `${dimensions.width}px`,
          '--card-height': `${dimensions.height}px`,
          '--card-content-radius': `${borderRadius - borderSize}px`,
          '--pseudo-element-width': `${dimensions.width + borderSize * 2}px`,
          '--pseudo-element-height': `${dimensions.height + borderSize * 2}px`,
          '--after-blur': `${dimensions.width / 3}px`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          'relative size-full min-h-[inherit] rounded-[var(--card-content-radius)] bg-background p-6',
          'before:-left-[var(--border-size)] before:-top-[var(--border-size)] before:-z-10 before:absolute before:block',
          "before:h-[var(--pseudo-element-height)] before:w-[var(--pseudo-element-width)] before:rounded-[var(--border-radius)] before:content-['']",
          'before:bg-[length:100%_200%] before:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))]',
          'before:animate-[background-position-spin_3s_infinite_alternate]',
          'after:-left-[var(--border-size)] after:-top-[var(--border-size)] after:-z-10 after:absolute after:block',
          "after:h-[var(--pseudo-element-height)] after:w-[var(--pseudo-element-width)] after:rounded-[var(--border-radius)] after:blur-[var(--after-blur)] after:content-['']",
          'after:bg-[length:100%_200%] after:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] after:opacity-80',
          'after:animate-[background-position-spin_3s_infinite_alternate]',
        )}
      >
        {children}
      </div>
    </div>
  );
};

// CosmicGlowButton Component com cores NEONPROV1
type CosmicGlowButtonProps = {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: string;
  onClick?: () => void;
};

const CosmicGlowButton: React.FC<CosmicGlowButtonProps> = ({
  className,
  color,
  speed = '5s',
  children,
  onClick,
}) => {
  const glowColor = color || '#1E40AF'; // NEONPROV1 Primary
  const content = children ?? 'Click me';

  return (
    <button
      className={cn(
        'relative inline-flex cursor-pointer items-center justify-center rounded-xl px-6 py-3 font-semibold text-sm',
        'bg-gradient-to-r from-neon-primary via-neon-secondary to-neon-primary',
        'text-white shadow-lg shadow-neon-primary/20',
        'overflow-hidden transition-all duration-300 hover:scale-105',
        className,
      )}
      onClick={onClick}
    >
      <span
        className="absolute inset-0 animate-[glow-scale_5s_infinite] rounded-xl opacity-40 blur-lg"
        style={{
          background: `radial-gradient(circle at center, ${glowColor} 10%, transparent 60%)`,
          animationDuration: speed,
          zIndex: 0,
        }}
      />
      <span
        className="absolute inset-0 animate-[glow-slide_5s_infinite_linear] rounded-xl opacity-20"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, transparent 0deg, ${glowColor} 120deg, transparent 240deg)`,
          animationDuration: speed,
          zIndex: 0,
        }}
      />
      <span className="relative z-10">{content}</span>
    </button>
  );
};

// Main Advanced Dashboard Component
export default function AdvancedDashboard() {
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  const metrics = [
    {
      title: 'Pacientes Ativos',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: '#1E40AF', // NEONPROV1 Primary
      bgColor: 'bg-gradient-to-br from-neon-primary/10 to-neon-primary/20',
    },
    {
      title: 'Consultas Hoje',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      icon: Calendar,
      color: '#3B82F6', // NEONPROV1 Secondary
      bgColor: 'bg-gradient-to-br from-neon-secondary/10 to-neon-secondary/20',
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 127.8k',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: '#10B981', // NEONPROV1 Success
      bgColor: 'bg-gradient-to-br from-neon-success/10 to-neon-success/20',
    },
    {
      title: 'Taxa Satisfação',
      value: '94.8%',
      change: '+2.1%',
      trend: 'up',
      icon: Heart,
      color: '#60A5FA', // NEONPROV1 Accent
      bgColor: 'bg-gradient-to-br from-neon-accent/10 to-neon-accent/20',
    },
  ];

  const recentPatients = [
    {
      id: 1,
      name: 'Maria Silva',
      condition: 'Harmonização Facial',
      time: '14:30',
      status: 'Em Atendimento',
      priority: 'normal',
    },
    {
      id: 2,
      name: 'João Santos',
      condition: 'Botox Preventivo',
      time: '14:15',
      status: 'Aguardando',
      priority: 'high',
    },
    {
      id: 3,
      name: 'Ana Costa',
      condition: 'Limpeza de Pele',
      time: '14:00',
      status: 'Finalizado',
      priority: 'low',
    },
    {
      id: 4,
      name: 'Carlos Oliveira',
      condition: 'Preenchimento Labial',
      time: '13:45',
      status: 'Reagendado',
      priority: 'normal',
    },
  ];

  return (
    <AppLayout>
      <style global jsx>{`
        @keyframes background-position-spin {
          0% {
            background-position: top center;
          }
          100% {
            background-position: bottom center;
          }
        }
        @keyframes glow-scale {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.7;
          }
        }
        @keyframes glow-slide {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 font-bold text-3xl text-neon-primary">
              Dashboard Avançado NEONPROV1
            </h1>
            <p className="text-gray-600">
              Gestão Inteligente para Clínicas de Estética - Premium Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <input
                className="rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-10 text-gray-900 placeholder-gray-400 focus:border-neon-primary focus:outline-none focus:ring-2 focus:ring-neon-primary/20"
                placeholder="Buscar pacientes..."
                type="text"
              />
            </div>
            <CosmicGlowButton className="text-sm" color="#1E40AF">
              <Bell className="mr-2 h-4 w-4" />
              Notificações
            </CosmicGlowButton>
          </div>
        </div>

        {/* Premium KPI Cards with Neon Effects */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, _index) => {
            const Icon = metric.icon;
            return (
              <NeonGradientCard
                className="h-full"
                key={metric.title}
                neonColors={{
                  firstColor: metric.color,
                  secondColor: `${metric.color}80`, // Add transparency
                }}
              >
                <div
                  className={cn(
                    'h-full cursor-pointer rounded-xl p-6 transition-all duration-300 hover:scale-105',
                    metric.bgColor,
                  )}
                  onMouseEnter={() => setActiveMetric(metric.title)}
                  onMouseLeave={() => setActiveMetric(null)}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className="rounded-xl p-3"
                      style={{ backgroundColor: `${metric.color}20` }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: metric.color }}
                      />
                    </div>
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor:
                          metric.trend === 'up' ? '#10B981' : '#EF4444',
                        color: 'white',
                      }}
                      variant={
                        metric.trend === 'up' ? 'default' : 'destructive'
                      }
                    >
                      {metric.change}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold text-2xl text-gray-900">
                      {metric.value}
                    </h3>
                    <p className="text-gray-600 text-sm">{metric.title}</p>
                  </div>
                  {activeMetric === metric.title && (
                    <div className="mt-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-neon-success" />
                      <span className="text-gray-600 text-xs">
                        Tendência positiva
                      </span>
                    </div>
                  )}
                </div>
              </NeonGradientCard>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Patients - Enhanced */}
          <Card className="border-gray-200 bg-white shadow-lg lg:col-span-2">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Próximas Consultas
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Agendamentos para hoje
                  </p>
                </div>
                <CosmicGlowButton className="px-4 py-2 text-xs" color="#1E40AF">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Consulta
                </CosmicGlowButton>
              </div>

              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 transition-all duration-200 hover:border-neon-primary/30 hover:shadow-md"
                    key={patient.id}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-neon-primary to-neon-secondary shadow-lg">
                        <UserCheck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {patient.name}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {patient.condition}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-700 text-sm">
                          {patient.time}
                        </span>
                      </div>
                      <Badge
                        className="text-xs"
                        variant={
                          patient.priority === 'high'
                            ? 'destructive'
                            : patient.priority === 'normal'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {patient.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button
                  className="w-full transition-colors hover:bg-neon-primary hover:text-white"
                  variant="outline"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Ver Todas as Consultas
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Actions - Enhanced */}
          <Card className="border-gray-200 bg-white shadow-lg">
            <div className="p-6">
              <h3 className="mb-6 font-semibold text-gray-900 text-lg">
                Ações Rápidas
              </h3>
              <div className="space-y-4">
                <CosmicGlowButton
                  className="w-full justify-start"
                  color="#1E40AF"
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  Agendar Consulta
                </CosmicGlowButton>
                <CosmicGlowButton
                  className="w-full justify-start"
                  color="#3B82F6"
                >
                  <Users className="mr-3 h-5 w-5" />
                  Cadastrar Paciente
                </CosmicGlowButton>
                <CosmicGlowButton
                  className="w-full justify-start"
                  color="#10B981"
                >
                  <DollarSign className="mr-3 h-5 w-5" />
                  Registrar Pagamento
                </CosmicGlowButton>
                <CosmicGlowButton
                  className="w-full justify-start"
                  color="#60A5FA"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Relatórios
                </CosmicGlowButton>
              </div>

              {/* System Status - Enhanced */}
              <div className="mt-8 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-neon-primary" />
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Status do Sistema
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs">
                      Servidor Principal
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-neon-success" />
                      <span className="font-medium text-neon-success text-xs">
                        Online
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs">
                      Banco de Dados
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-neon-success" />
                      <span className="font-medium text-neon-success text-xs">
                        Conectado
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs">
                      Sistema NEONPROV1
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-neon-primary" />
                      <span className="font-medium text-neon-primary text-xs">
                        Premium Active
                      </span>
                    </div>
                  </div>
                  <div className="border-gray-200 border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-xs">
                        Uptime Sistema
                      </span>
                      <span className="font-bold text-neon-success text-xs">
                        99.9%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Metrics Row */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-neon-primary/20 bg-gradient-to-br from-neon-primary/5 to-neon-secondary/5">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neon-primary">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-2xl text-neon-primary">
                4.9/5
              </h3>
              <p className="text-gray-600 text-sm">
                Avaliação Média dos Pacientes
              </p>
            </div>
          </Card>

          <Card className="border-neon-success/20 bg-gradient-to-br from-neon-success/5 to-neon-success/10">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neon-success">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-2xl text-neon-success">92%</h3>
              <p className="text-gray-600 text-sm">
                Taxa de Retorno de Pacientes
              </p>
            </div>
          </Card>

          <Card className="border-neon-accent/20 bg-gradient-to-br from-neon-accent/5 to-neon-accent/10">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neon-accent">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-2xl text-neon-accent">87%</h3>
              <p className="text-gray-600 text-sm">Eficiência Operacional</p>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
