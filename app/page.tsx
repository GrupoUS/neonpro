"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Users, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Stethoscope,
  UserCheck,
  Clock,
  Plus,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  Settings,
  LogOut,
  Star,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// NeonGradientCard Component
interface NeonColorsProps {
  firstColor: string;
  secondColor: string;
}

interface NeonGradientCardProps {
  className?: string;
  children?: React.ReactNode;
  borderSize?: number;
  borderRadius?: number;
  neonColors?: NeonColorsProps;
}

const NeonGradientCard: React.FC<NeonGradientCardProps> = ({
  className,
  children,
  borderSize = 2,
  borderRadius = 20,
  neonColors = {
    firstColor: "oklch(0.5854 0.2041 277.1173)",
    secondColor: "oklch(0.4568 0.2146 277.0229)",
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
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        "--border-size": `${borderSize}px`,
        "--border-radius": `${borderRadius}px`,
        "--neon-first-color": neonColors.firstColor,
        "--neon-second-color": neonColors.secondColor,
        "--card-width": `${dimensions.width}px`,
        "--card-height": `${dimensions.height}px`,
        "--card-content-radius": `${borderRadius - borderSize}px`,
        "--pseudo-element-width": `${dimensions.width + borderSize * 2}px`,
        "--pseudo-element-height": `${dimensions.height + borderSize * 2}px`,
        "--after-blur": `${dimensions.width / 3}px`,
      } as React.CSSProperties}
      className={cn(
        "relative z-10 size-full rounded-[var(--border-radius)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative size-full min-h-[inherit] rounded-[var(--card-content-radius)] bg-card p-6",
          "before:absolute before:-left-[var(--border-size)] before:-top-[var(--border-size)] before:-z-10 before:block",
          "before:h-[var(--pseudo-element-height)] before:w-[var(--pseudo-element-width)] before:rounded-[var(--border-radius)] before:content-['']",
          "before:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] before:bg-[length:100%_200%]",
          "before:animate-[background-position-spin_3s_infinite_alternate]",
          "after:absolute after:-left-[var(--border-size)] after:-top-[var(--border-size)] after:-z-10 after:block",
          "after:h-[var(--pseudo-element-height)] after:w-[var(--pseudo-element-width)] after:rounded-[var(--border-radius)] after:blur-[var(--after-blur)] after:content-['']",
          "after:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] after:bg-[length:100%_200%] after:opacity-80",
          "after:animate-[background-position-spin_3s_infinite_alternate]",
        )}
      >
        {children}
      </div>
    </div>
  );
};

// CosmicGlowButton Component
interface CosmicGlowButtonProps {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: string;
  onClick?: () => void;
}

const CosmicGlowButton: React.FC<CosmicGlowButtonProps> = ({
  className,
  color,
  speed = "5s",
  children,
  onClick,
}) => {
  const glowColor = color || "oklch(0.5854 0.2041 277.1173)";
  const content = children ?? "Click me";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center py-3 px-6 rounded-xl font-semibold text-sm cursor-pointer",
        "bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20",
        "text-primary-foreground shadow-lg shadow-primary/20",
        "overflow-hidden transition-all duration-300 hover:scale-105 border border-primary/20",
        className
      )}
    >
      <span
        className="absolute inset-0 rounded-xl blur-lg opacity-40 animate-[glow-scale_5s_infinite]"
        style={{
          background: `radial-gradient(circle at center, ${glowColor} 10%, transparent 60%)`,
          animationDuration: speed,
          zIndex: 0,
        }}
      />
      <span
        className="absolute inset-0 rounded-xl opacity-20 animate-[glow-slide_5s_infinite_linear]"
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

// Medical Dashboard Component - NeonPro Clinic
const NeonProDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  const metrics = [
    {
      title: "Pacientes Ativos",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "oklch(0.5854 0.2041 277.1173)", // NEONPROV1 Primary
      bgColor: "bg-gradient-to-br from-primary/10 to-primary/20"
    },
    {
      title: "Consultas Hoje",
      value: "156",
      change: "+8.2%",
      trend: "up",
      icon: Calendar,
      color: "oklch(0.9376 0.0260 321.9388)", // NEONPROV1 Accent
      bgColor: "bg-gradient-to-br from-accent/10 to-accent/20"
    },
    {
      title: "Taxa de Satisfação",
      value: "94.8%",
      change: "+2.1%",
      trend: "up",
      icon: Heart,
      color: "oklch(0.5106 0.2301 276.9656)", // NEONPROV1 Chart-2
      bgColor: "bg-gradient-to-br from-secondary/10 to-secondary/20"
    },
    {
      title: "Procedimentos",
      value: "423",
      change: "+15.3%",
      trend: "up",
      icon: Activity,
      color: "oklch(0.4568 0.2146 277.0229)", // NEONPROV1 Chart-3
      bgColor: "bg-gradient-to-br from-muted/10 to-muted/20"
    }
  ];

  const recentPatients = [
    {
      id: 1,
      name: "Maria Silva",
      condition: "Limpeza de Pele",
      time: "14:30",
      status: "Em Atendimento",
      priority: "normal"
    },
    {
      id: 2,
      name: "João Santos",
      condition: "Botox Facial",
      time: "14:15",
      status: "Agendado",
      priority: "high"
    },
    {
      id: 3,
      name: "Ana Costa",
      condition: "Preenchimento",
      time: "14:00",
      status: "Aguardando",
      priority: "low"
    },
    {
      id: 4,
      name: "Carlos Oliveira",
      condition: "Avaliação",
      time: "13:45",
      status: "Concluído",
      priority: "normal"
    }
  ];

  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, active: true },
    { name: 'Pacientes', icon: Users, active: false },
    { name: 'Agendamentos', icon: Calendar, active: false },
    { name: 'Procedimentos', icon: Activity, active: false },
    { name: 'Configurações', icon: Settings, active: false },
    { name: 'Sair', icon: LogOut, active: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <style jsx global>{`
        @keyframes background-position-spin {
          0% { background-position: top center; }
          100% { background-position: bottom center; }
        }
        @keyframes glow-scale {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes glow-slide {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-sidebar backdrop-blur-xl border-r border-sidebar-border transition-transform duration-300 z-50",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">NeonPro</h1>
              <p className="text-xs text-sidebar-foreground/70">Clínica Estética</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  item.active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.active && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">DR</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Dr. Roberto</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">Dermatologista</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-card/50 backdrop-blur-xl border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard NeonPro</h1>
                <p className="text-muted-foreground">Bem-vindo ao sistema de gestão da clínica</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar pacientes..."
                  className="pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <NeonGradientCard
                  key={metric.title}
                  className="h-full"
                  neonColors={{
                    firstColor: metric.color,
                    secondColor: metric.color.replace('0.7', '0.5')
                  }}
                >
                  <div
                    className={cn(
                      "h-full p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer",
                      metric.bgColor
                    )}
                    onMouseEnter={() => setActiveMetric(metric.title)}
                    onMouseLeave={() => setActiveMetric(null)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="p-3 rounded-xl bg-primary/10"
                      >
                        <Icon
                          className="w-6 h-6 text-primary"
                        />
                      </div>
                      <Badge
                        variant={metric.trend === 'up' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {metric.change}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {metric.value}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {metric.title}
                      </p>
                    </div>
                    {activeMetric === metric.title && (
                      <div className="mt-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Patients */}
            <Card className="lg:col-span-2 bg-card border-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Pacientes Recentes</h3>
                  <CosmicGlowButton
                    color="oklch(0.5854 0.2041 277.1173)"
                    className="text-xs py-2 px-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Paciente
                  </CosmicGlowButton>
                </div>
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{patient.name}</h4>
                          <p className="text-sm text-muted-foreground">{patient.condition}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{patient.time}</span>
                        </div>
                        <Badge
                          variant={patient.priority === 'high' ? 'destructive' : 
                                  patient.priority === 'normal' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {patient.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Ações Rápidas</h3>
                <div className="space-y-4">
                  <CosmicGlowButton
                    color="oklch(0.5854 0.2041 277.1173)"
                    className="w-full justify-start"
                  >
                    <Calendar className="w-5 h-5 mr-3" />
                    Novo Agendamento
                  </CosmicGlowButton>
                  <CosmicGlowButton
                    color="oklch(0.9376 0.0260 321.9388)"
                    className="w-full justify-start"
                  >
                    <Activity className="w-5 h-5 mr-3" />
                    Iniciar Procedimento
                  </CosmicGlowButton>
                  <CosmicGlowButton
                    color="oklch(0.5106 0.2301 276.9656)"
                    className="w-full justify-start"
                  >
                    <MessageCircle className="w-5 h-5 mr-3" />
                    Chat com Pacientes
                  </CosmicGlowButton>
                  <CosmicGlowButton
                    color="oklch(0.4568 0.2146 277.0229)"
                    className="w-full justify-start"
                  >
                    <Star className="w-5 h-5 mr-3" />
                    Avaliar Satisfação
                  </CosmicGlowButton>
                </div>

                {/* System Status */}
                <div className="mt-8 p-4 rounded-xl bg-muted/20 border border-border">
                  <h4 className="text-sm font-medium text-foreground mb-3">Status do Sistema</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Servidor</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Banco de Dados</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">Conectado</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Tema NEONPROV1</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-xs text-primary">Ativo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NeonProDashboard;