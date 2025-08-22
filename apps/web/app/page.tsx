'use client';

'use client';

import {
  Activity,
  ArrowRight,
  BarChart3,
  Calendar,
  Clock,
  FileText,
  Heart,
  Shield,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppointments } from '@/hooks/useAppointments';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { usePatients } from '@/hooks/usePatients';

export default function HomePage() {
  const router = useRouter();
  const {
    totalPatients,
    monthlyRevenue,
    upcomingAppointments,
    revenueGrowth,
    loading: metricsLoading,
  } = useDashboardMetrics();

  const { recentPatients, loading: patientsLoading } = usePatients();
  const { todaysAppointments, loading: appointmentsLoading } =
    useAppointments();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        {/* Navigation */}
        <nav className="container mx-auto flex items-center justify-between border-border/50 border-b p-6">
          <div className="flex items-center space-x-3">
            <div className="neonpro-gradient neonpro-glow flex h-10 w-10 items-center justify-center rounded-lg">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-2xl text-primary">
              NeonPro Healthcare
            </h1>
          </div>
          <Button
            className="neonpro-button-primary"
            onClick={() => router.push('/login')}
          >
            Acessar Sistema
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </nav>

        {/* Hero Content */}
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 font-bold text-5xl text-foreground leading-tight lg:text-6xl">
              Revolução Digital para
              <span className="neonpro-glow mt-2 block text-primary">
                Clínicas Estéticas Brasileiras
              </span>
            </h1>
            <p className="mx-auto mb-12 max-w-3xl text-muted-foreground text-xl leading-relaxed">
              Gestão inteligente com compliance total LGPD, ANVISA e CFM.
              Transforme sua clínica com tecnologia de ponta, resultados reais e
              a confiança do mercado brasileiro de medicina estética.
            </p>

            {/* Trust Indicators */}
            <div className="mb-12 flex flex-wrap justify-center gap-4">
              <div className="compliance-badge">
                <Shield className="mr-2 h-4 w-4" />
                LGPD Compliant
              </div>
              <div className="compliance-badge">
                <Stethoscope className="mr-2 h-4 w-4" />
                ANVISA Aprovado
              </div>
              <div className="compliance-badge">
                <FileText className="mr-2 h-4 w-4" />
                CFM Certificado
              </div>
              <div className="compliance-badge">
                <Star className="mr-2 h-4 w-4" />
                ISO 27001
              </div>
            </div>

            {/* CTA Section */}
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Button
                className="neonpro-button-primary px-8 py-4 text-lg"
                onClick={() => router.push('/signup')}
                size="lg"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                className="border-primary/20 px-8 py-4 text-foreground text-lg hover:bg-primary/5"
                size="lg"
                variant="outline"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Demonstração
              </Button>
            </div>

            {/* Trust Line */}
            <p className="mt-8 text-muted-foreground text-sm">
              ✓ Teste grátis por 30 dias • ✓ Sem cartão de crédito • ✓ Suporte
              especializado em saúde
            </p>
          </div>
        </div>
      </section>
      {/* Real-time Metrics Section */}
      <section className="container mx-auto px-6 pb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl text-foreground">
            Performance em Tempo Real
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Acompanhe o crescimento da sua clínica com métricas atualizadas
            automaticamente
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Revenue Card */}
          <Card className="neonpro-card group">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-all">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                Receita Mensal
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {metricsLoading ? (
                  <Skeleton className="h-4 w-20 bg-muted" />
                ) : (
                  `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% este mês`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-8 w-32 bg-muted" />
              ) : (
                <div className="flex items-center">
                  <p className="font-bold text-3xl text-foreground">
                    R$ {monthlyRevenue.toLocaleString('pt-BR')}
                  </p>
                  {revenueGrowth >= 0 && (
                    <TrendingUp className="ml-2 h-5 w-5 text-primary" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patients Card */}
          <Card className="neonpro-card group">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 transition-all">
                  <Users className="h-4 w-4 text-chart-5" />
                </div>
                Total Pacientes
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Cadastros ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-8 w-16 bg-muted" />
              ) : (
                <p className="font-bold text-3xl text-foreground">
                  {totalPatients.toLocaleString('pt-BR')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Appointments Card */}
          <Card className="neonpro-card group">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10 transition-all">
                  <Calendar className="h-4 w-4 text-chart-3" />
                </div>
                Consultas Agendadas
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Próximos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-8 w-12 bg-muted" />
              ) : (
                <p className="font-bold text-3xl text-foreground">
                  {upcomingAppointments}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card className="neonpro-card group">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-chart-4/10 transition-all">
                  <Clock className="h-4 w-4 text-chart-4" />
                </div>
                Consultas Hoje
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Agenda do dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <Skeleton className="h-8 w-12 bg-muted" />
              ) : (
                <p className="font-bold text-3xl text-foreground">
                  {todaysAppointments.length}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>{' '}
      {/* Features Section */}
      <section className="container mx-auto px-6 pb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl text-foreground">
            Recursos Especializados para Medicina Estética
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Ferramentas desenvolvidas especificamente para as necessidades do
            mercado brasileiro de estética e bem-estar
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Feature 1: Smart Scheduling */}
          <Card className="neonpro-card group">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="group-hover:neonpro-glow flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-all">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-xl">
                    Agendamento Inteligente
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    IA especializada para clínicas estéticas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Sistema avançado com lembretes automáticos via WhatsApp, gestão
                de filas de espera para procedimentos específicos e otimização
                inteligente baseada em preferências de horário e histórico de
                tratamentos.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2: Patient Management */}
          <Card className="neonpro-card group">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="group-hover:neonpro-glow flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10 transition-all">
                  <Users className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-xl">
                    Gestão de Pacientes
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Prontuários estéticos completos e seguros
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Prontuários digitais especializados com histórico de
                procedimentos estéticos, anexos de imagens antes/depois,
                evolução de tratamentos e compliance total com LGPD, ANVISA e
                CFM.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3: Analytics */}
          <Card className="neonpro-card group">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="group-hover:neonpro-glow flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10 transition-all">
                  <BarChart3 className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-xl">
                    Analytics Estético
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Insights especializados para crescimento
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Relatórios financeiros detalhados por procedimento, análise de
                sazonalidade estética, ROI por tratamento, taxa de retorno de
                pacientes e previsões baseadas em IA para o mercado brasileiro.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4: Compliance */}
          <Card className="neonpro-card group">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="group-hover:neonpro-glow flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10 transition-all">
                  <Shield className="h-6 w-6 text-chart-4" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-xl">
                    Compliance Brasileiro
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Conformidade especializada em saúde
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Conformidade automática com LGPD, ANVISA e CFM. Auditoria em
                tempo real, relatórios específicos para fiscalizações sanitárias
                e documentação automática para processos regulatórios do setor
                estético.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>{' '}
      {/* Recent Patients Section */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Patients */}
          <Card className="neonpro-card">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                Pacientes Recentes
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Últimos cadastros na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div className="flex items-center space-x-3" key={i}>
                      <Skeleton className="h-10 w-10 rounded-full bg-muted" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32 bg-muted" />
                        <Skeleton className="h-3 w-24 bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentPatients.length > 0 ? (
                <div className="space-y-3">
                  {recentPatients.slice(0, 5).map((patient) => (
                    <div
                      className="flex items-center space-x-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                      key={patient.id}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="neonpro-gradient text-primary-foreground">
                          {patient.name?.charAt(0).toUpperCase() || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {patient.name || 'Nome não informado'}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {new Date(patient.created_at).toLocaleDateString(
                            'pt-BR'
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-300">
                  Nenhum paciente cadastrado ainda
                </p>
              )}

              {!patientsLoading && recentPatients.length > 5 && (
                <Button
                  className="mt-4 w-full text-primary hover:bg-primary/10"
                  onClick={() => router.push('/login')}
                  variant="ghost"
                >
                  Ver todos os pacientes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="neonpro-card">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-chart-4/10">
                  <Activity className="h-4 w-4 text-chart-4" />
                </div>
                Agenda de Hoje
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Consultas programadas para hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      className="space-y-2 rounded-lg border border-border p-3"
                      key={i}
                    >
                      <Skeleton className="h-4 w-20 bg-muted" />
                      <Skeleton className="h-4 w-32 bg-muted" />
                      <Skeleton className="h-3 w-24 bg-muted" />
                    </div>
                  ))}
                </div>
              ) : todaysAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todaysAppointments.slice(0, 3).map((appointment) => (
                    <div
                      className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                      key={appointment.id}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-semibold text-foreground">
                          {new Date(
                            appointment.appointment_date
                          ).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <Badge className="neonpro-badge-success">
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="mb-1 font-medium text-foreground text-sm">
                        {appointment.patients?.name ||
                          'Paciente não identificado'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {appointment.services?.name ||
                          'Serviço não especificado'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhuma consulta agendada para hoje
                  </p>
                </div>
              )}

              {!appointmentsLoading && todaysAppointments.length > 3 && (
                <Button
                  className="mt-4 w-full text-primary hover:bg-primary/10"
                  onClick={() => router.push('/login')}
                  variant="ghost"
                >
                  Ver agenda completa
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </section>{' '}
      {/* Trust/Social Proof Section */}
      <section className="container mx-auto px-6 pb-20">
        <div className="text-center">
          <h3 className="mb-6 font-bold text-3xl text-foreground">
            Confiança e Segurança para o Mercado Brasileiro
          </h3>
          <p className="mx-auto mb-12 max-w-3xl text-lg text-muted-foreground">
            Desenvolvido com foco nas regulamentações brasileiras e necessidades
            específicas do setor de medicina estética nacional
          </p>

          {/* Enhanced Compliance Badges */}
          <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="compliance-badge flex-col py-6">
              <Shield className="mx-auto mb-2 h-8 w-8" />
              <div className="font-semibold">LGPD</div>
              <div className="text-xs opacity-80">Lei Geral de Proteção</div>
            </div>
            <div className="compliance-badge flex-col py-6">
              <Stethoscope className="mx-auto mb-2 h-8 w-8" />
              <div className="font-semibold">ANVISA</div>
              <div className="text-xs opacity-80">Vigilância Sanitária</div>
            </div>
            <div className="compliance-badge flex-col py-6">
              <FileText className="mx-auto mb-2 h-8 w-8" />
              <div className="font-semibold">CFM</div>
              <div className="text-xs opacity-80">Conselho Federal</div>
            </div>
            <div className="compliance-badge flex-col py-6">
              <Star className="mx-auto mb-2 h-8 w-8" />
              <div className="font-semibold">ISO 27001</div>
              <div className="text-xs opacity-80">Segurança Info.</div>
            </div>
          </div>

          {/* Trust Pillars */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="neonpro-card group text-center">
              <CardContent className="pt-6">
                <div className="neonpro-gradient group-hover:neonpro-glow mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full transition-all">
                  <Shield className="h-10 w-10 text-primary-foreground" />
                </div>
                <h4 className="mb-4 font-semibold text-foreground text-xl">
                  Proteção de Dados Médicos
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Criptografia de nível bancário, backup automático em nuvem
                  brasileira e compliance total com LGPD para dados sensíveis de
                  saúde
                </p>
              </CardContent>
            </Card>

            <Card className="neonpro-card group text-center">
              <CardContent className="pt-6">
                <div className="neonpro-gradient group-hover:neonpro-glow mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full transition-all">
                  <Heart className="h-10 w-10 text-primary-foreground" />
                </div>
                <h4 className="mb-4 font-semibold text-foreground text-xl">
                  Especialista em Medicina Estética
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Desenvolvido por especialistas para o mercado brasileiro de
                  estética, com funcionalidades específicas para procedimentos e
                  regulamentações locais
                </p>
              </CardContent>
            </Card>

            <Card className="neonpro-card group text-center">
              <CardContent className="pt-6">
                <div className="neonpro-gradient group-hover:neonpro-glow mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full transition-all">
                  <Star className="h-10 w-10 text-primary-foreground" />
                </div>
                <h4 className="mb-4 font-semibold text-foreground text-xl">
                  Suporte Especializado 24/7
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Equipe técnica especializada em saúde, treinamento
                  personalizado e suporte prioritário para clínicas em todo o
                  Brasil
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Call to Action Section */}
      <section className="border-border border-t bg-gradient-to-r from-primary/5 to-chart-5/5 py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="mx-auto max-w-4xl">
            <h3 className="mb-6 font-bold text-4xl text-foreground lg:text-5xl">
              Transforme sua Clínica Estética Hoje
            </h3>
            <p className="mx-auto mb-12 max-w-3xl text-muted-foreground text-xl leading-relaxed">
              Junte-se a centenas de clínicas brasileiras que já confiam no
              NeonPro Healthcare para gerenciar seus negócios com eficiência,
              segurança total e resultados comprovados no mercado de medicina
              estética.
            </p>

            <div className="mb-8 flex flex-col justify-center gap-6 sm:flex-row">
              <Button
                className="neonpro-button-primary px-10 py-4 text-lg"
                onClick={() => router.push('/signup')}
                size="lg"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                className="border-primary/20 px-10 py-4 text-foreground text-lg hover:bg-primary/5"
                size="lg"
                variant="outline"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Demonstração Personalizada
              </Button>
            </div>

            {/* Enhanced Trust Line */}
            <div className="flex flex-wrap justify-center gap-6 text-muted-foreground text-sm">
              <div className="trust-indicator">Teste grátis por 30 dias</div>
              <div className="trust-indicator">Sem cartão de crédito</div>
              <div className="trust-indicator">
                Suporte especializado em saúde
              </div>
              <div className="trust-indicator">Treinamento incluído</div>
            </div>

            {/* Social Proof Numbers */}
            <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 font-bold text-3xl text-primary">500+</div>
                <div className="text-muted-foreground text-sm">
                  Clínicas Atendidas
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 font-bold text-3xl text-primary">50k+</div>
                <div className="text-muted-foreground text-sm">
                  Pacientes Gerenciados
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 font-bold text-3xl text-primary">
                  99.9%
                </div>
                <div className="text-muted-foreground text-sm">
                  Uptime Garantido
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 font-bold text-3xl text-primary">24/7</div>
                <div className="text-muted-foreground text-sm">
                  Suporte Disponível
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
