'use client';

import {
  Activity,
  Calendar,
  Clock,
  Heart,
  Settings,
  Star,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

// NeonGradientCard Component
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
    firstColor: 'oklch(0.5854 0.2041 277.1173)',
    secondColor: 'oklch(0.5106 0.2301 276.9656)',
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
        className
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
          'after:animate-[background-position-spin_3s_infinite_alternate]'
        )}
      >
        {children}
      </div>
    </div>
  );
};

// NEONPROV1 Theme Demo Page
export default function ThemeDemoPage() {
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  const metrics = [
    {
      title: 'Pacientes Ativos',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      neonColors: {
        firstColor: 'oklch(0.5854 0.2041 277.1173)',
        secondColor: 'oklch(0.5106 0.2301 276.9656)',
      },
    },
    {
      title: 'Consultas Hoje',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      icon: Calendar,
      neonColors: {
        firstColor: 'oklch(0.4568 0.2146 277.0229)',
        secondColor: 'oklch(0.3984 0.1773 277.3662)',
      },
    },
    {
      title: 'Taxa de Recuperação',
      value: '94.8%',
      change: '+2.1%',
      trend: 'up',
      icon: Heart,
      neonColors: {
        firstColor: 'oklch(0.3984 0.1773 277.3662)',
        secondColor: 'oklch(0.3588 0.1354 278.6973)',
      },
    },
    {
      title: 'Emergências',
      value: '23',
      change: '-5.3%',
      trend: 'down',
      icon: Activity,
      neonColors: {
        firstColor: 'oklch(0.6368 0.2078 25.3313)',
        secondColor: 'oklch(0.5854 0.2041 277.1173)',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <style global jsx>{`
        @keyframes background-position-spin {
          0% {
            background-position: top center;
          }
          100% {
            background-position: bottom center;
          }
        }
      `}</style>

      {/* Header */}
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-bold text-4xl text-foreground">
            NEONPROV1 Theme Demo
          </h1>
          <p className="mb-6 text-muted-foreground text-xl">
            Demonstração do tema NEONPROV1 do tweakcn.com aplicado ao sistema
            NeonPro
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="px-3 py-1" variant="default">
              OKLCH Colors
            </Badge>
            <Badge className="px-3 py-1" variant="secondary">
              Healthcare UI
            </Badge>
            <Badge className="px-3 py-1" variant="outline">
              shadcn/ui
            </Badge>
          </div>
        </div>

        {/* Color Palette Demo */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Paleta de Cores NEONPROV1</CardTitle>
            <CardDescription>
              Cores baseadas em OKLCH do tema tweakcn.com para máxima fidelidade
              visual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              <div className="text-center">
                <div
                  className="mx-auto mb-2 h-20 w-20 rounded-lg"
                  style={{ backgroundColor: 'oklch(0.5854 0.2041 277.1173)' }}
                />
                <p className="font-mono text-muted-foreground text-xs">
                  Primary
                </p>
              </div>
              <div className="text-center">
                <div
                  className="mx-auto mb-2 h-20 w-20 rounded-lg"
                  style={{ backgroundColor: 'oklch(0.8687 0.0043 56.3660)' }}
                />
                <p className="font-mono text-muted-foreground text-xs">
                  Secondary
                </p>
              </div>
              <div className="text-center">
                <div
                  className="mx-auto mb-2 h-20 w-20 rounded-lg"
                  style={{ backgroundColor: 'oklch(0.9376 0.0260 321.9388)' }}
                />
                <p className="font-mono text-muted-foreground text-xs">
                  Accent
                </p>
              </div>
              <div className="text-center">
                <div
                  className="mx-auto mb-2 h-20 w-20 rounded-lg"
                  style={{ backgroundColor: 'oklch(0.6368 0.2078 25.3313)' }}
                />
                <p className="font-mono text-muted-foreground text-xs">
                  Destructive
                </p>
              </div>
              <div className="text-center">
                <div
                  className="mx-auto mb-2 h-20 w-20 rounded-lg"
                  style={{ backgroundColor: 'oklch(0.9232 0.0026 48.7171)' }}
                />
                <p className="font-mono text-muted-foreground text-xs">Muted</p>
              </div>
              <div className="text-center">
                <div
                  className="mx-auto mb-2 h-20 w-20 rounded-lg"
                  style={{ backgroundColor: 'oklch(0.9699 0.0013 106.4238)' }}
                />
                <p className="font-mono text-muted-foreground text-xs">Card</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Variants Demo */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Variações de Botões</CardTitle>
            <CardDescription>
              Botões usando as cores do tema NEONPROV1 com estados hover e focus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">
                <Stethoscope className="mr-2 h-4 w-4" />
                Primary Button
              </Button>
              <Button variant="secondary">
                <Users className="mr-2 h-4 w-4" />
                Secondary Button
              </Button>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Outline Button
              </Button>
              <Button variant="ghost">
                <Activity className="mr-2 h-4 w-4" />
                Ghost Button
              </Button>
              <Button variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Destructive Button
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid with Neon Cards */}
        <div className="mb-8">
          <h2 className="mb-6 font-bold text-2xl text-foreground">
            Cartões com Efeito Neon (NeonGradientCard)
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, _index) => {
              const Icon = metric.icon;
              return (
                <NeonGradientCard
                  className="h-48"
                  key={metric.title}
                  neonColors={metric.neonColors}
                >
                  <div
                    className="flex h-full cursor-pointer flex-col justify-between transition-all duration-300 hover:scale-105"
                    onMouseEnter={() => setActiveMetric(metric.title)}
                    onMouseLeave={() => setActiveMetric(null)}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-xl bg-primary/10 p-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge
                        className="text-xs"
                        variant={
                          metric.trend === 'up' ? 'default' : 'destructive'
                        }
                      >
                        {metric.change}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold text-2xl text-foreground">
                        {metric.value}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {metric.title}
                      </p>
                    </div>
                    {activeMetric === metric.title && (
                      <div className="mt-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground text-xs">
                          Hover ativo
                        </span>
                      </div>
                    )}
                  </div>
                </NeonGradientCard>
              );
            })}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Status Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Status</CardTitle>
              <CardDescription>
                Badges e indicadores usando as cores do tema NEONPROV1
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="status-scheduled">Agendado</Badge>
                  <Badge className="status-confirmed">Confirmado</Badge>
                  <Badge className="status-pending">Pendente</Badge>
                  <Badge className="status-cancelled">Cancelado</Badge>
                  <Badge className="status-completed">Concluído</Badge>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-accent/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                        <UserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Dr. Silva</p>
                        <p className="text-muted-foreground text-sm">
                          Cardiologista
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">Online</Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border bg-accent/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                        <Clock className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Próxima Consulta
                        </p>
                        <p className="text-muted-foreground text-sm">
                          15:30 - Maria Santos
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Em 30min</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Tema</CardTitle>
              <CardDescription>
                Especificações técnicas do tema NEONPROV1
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">
                      Fonte Principal
                    </p>
                    <p className="text-muted-foreground">Inter</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Fonte Serifada
                    </p>
                    <p className="text-muted-foreground">Lora</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Fonte Mono</p>
                    <p className="text-muted-foreground">Libre Baskerville</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Border Radius</p>
                    <p className="text-muted-foreground">1.25rem</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="mb-2 font-medium text-foreground">
                    Cores Primárias (OKLCH)
                  </p>
                  <div className="space-y-1 font-mono text-xs">
                    <p className="text-muted-foreground">
                      Primary: oklch(0.5854 0.2041 277.1173)
                    </p>
                    <p className="text-muted-foreground">
                      Secondary: oklch(0.8687 0.0043 56.3660)
                    </p>
                    <p className="text-muted-foreground">
                      Accent: oklch(0.9376 0.0260 321.9388)
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="mb-2 font-medium text-foreground">
                    Sistema de Sombras
                  </p>
                  <div className="space-y-2">
                    <div className="rounded-lg border bg-card p-3 shadow-xs">
                      Shadow XS
                    </div>
                    <div className="rounded-lg border bg-card p-3 shadow-sm">
                      Shadow SM
                    </div>
                    <div className="rounded-lg border bg-card p-3 shadow-md">
                      Shadow MD
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="mb-2 font-semibold text-foreground text-lg">
                ✅ Tema NEONPROV1 Instalado com Sucesso!
              </h3>
              <p className="mb-4 text-muted-foreground">
                Todas as cores, componentes e estilos do tema tweakcn.com foram
                aplicados corretamente ao projeto NeonPro
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="default">
                  <Star className="mr-2 h-4 w-4" />
                  Começar Desenvolvimento
                </Button>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Personalizar Tema
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
