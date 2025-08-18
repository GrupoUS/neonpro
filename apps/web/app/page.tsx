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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative">
        {/* Navigation */}
        <nav className="container mx-auto flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-bold text-2xl text-transparent">
              NeonPro
            </h1>
          </div>
          <Button
            className="border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
            onClick={() => router.push('/login')}
          >
            Acessar Sistema
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </nav>

        {/* Hero Content */}
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="mb-6 font-bold text-5xl text-white lg:text-6xl">
            Sistema Completo para
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Clínicas Estéticas
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-slate-300 text-xl">
            Gestão inteligente com compliance LGPD, ANVISA e CFM. Transforme sua
            clínica com tecnologia de ponta e resultados reais.
          </p>

          <div className="mb-8 flex flex-wrap justify-center gap-3">
            <Badge className="border-green-500/30 bg-green-500/20 text-green-400">
              <Shield className="mr-1 h-3 w-3" />
              LGPD Compliant
            </Badge>
            <Badge className="border-blue-500/30 bg-blue-500/20 text-blue-400">
              <Stethoscope className="mr-1 h-3 w-3" />
              ANVISA Aprovado
            </Badge>
            <Badge className="border-purple-500/30 bg-purple-500/20 text-purple-400">
              <FileText className="mr-1 h-3 w-3" />
              CFM Certificado
            </Badge>
          </div>
        </div>
      </section>
      {/* Real-time Metrics Section */}
      <section className="container mx-auto px-6 pb-20">
        <h2 className="mb-12 text-center font-bold text-3xl text-white">
          Resultados em Tempo Real
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Revenue Card */}
          <Card className="border-blue-500/20 bg-white/10 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-white">
                <BarChart3 className="mr-2 h-5 w-5 text-blue-400" />
                Receita Mensal
              </CardTitle>
              <CardDescription className="text-slate-300">
                {metricsLoading ? (
                  <Skeleton className="h-4 w-20 bg-white/20" />
                ) : (
                  `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% este mês`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-8 w-32 bg-white/20" />
              ) : (
                <div className="flex items-center">
                  <p className="font-bold text-3xl text-white">
                    R$ {monthlyRevenue.toLocaleString('pt-BR')}
                  </p>
                  {revenueGrowth >= 0 && (
                    <TrendingUp className="ml-2 h-5 w-5 text-green-400" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patients Card */}
          <Card className="border-green-500/20 bg-white/10 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-white">
                <Users className="mr-2 h-5 w-5 text-green-400" />
                Total Pacientes
              </CardTitle>
              <CardDescription className="text-slate-300">
                Cadastros ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-8 w-16 bg-white/20" />
              ) : (
                <p className="font-bold text-3xl text-white">
                  {totalPatients.toLocaleString('pt-BR')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Appointments Card */}
          <Card className="border-purple-500/20 bg-white/10 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-white">
                <Calendar className="mr-2 h-5 w-5 text-purple-400" />
                Consultas Agendadas
              </CardTitle>
              <CardDescription className="text-slate-300">
                Próximos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-8 w-12 bg-white/20" />
              ) : (
                <p className="font-bold text-3xl text-white">
                  {upcomingAppointments}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card className="border-orange-500/20 bg-white/10 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-white">
                <Clock className="mr-2 h-5 w-5 text-orange-400" />
                Consultas Hoje
              </CardTitle>
              <CardDescription className="text-slate-300">
                Agenda do dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <Skeleton className="h-8 w-12 bg-white/20" />
              ) : (
                <p className="font-bold text-3xl text-white">
                  {todaysAppointments.length}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>{' '}
      {/* Features Section */}
      <section className="container mx-auto px-6 pb-20">
        <h2 className="mb-12 text-center font-bold text-3xl text-white">
          Recursos Avançados
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Feature 1: Smart Scheduling */}
          <Card className="border-green-500/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                  <Calendar className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white">
                    Agendamento Inteligente
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    IA para otimizar sua agenda
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Sistema avançado com lembretes automáticos, gestão de filas de
                espera e otimização inteligente baseada em histórico e
                preferências.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2: Patient Management */}
          <Card className="border-blue-500/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Gestão Completa</CardTitle>
                  <CardDescription className="text-slate-300">
                    Prontuários eletrônicos seguros
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Prontuários digitais com histórico completo, anexos de imagens,
                evolução de tratamentos e compliance total com regulamentações.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3: Analytics */}
          <Card className="border-purple-500/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-white">
                    Analytics Avançado
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Insights para crescimento
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Relatórios financeiros detalhados, análise de performance, ROI
                por tratamento e previsões baseadas em IA.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4: Compliance */}
          <Card className="border-orange-500/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20">
                  <Shield className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Compliance Total</CardTitle>
                  <CardDescription className="text-slate-300">
                    Segurança e conformidade
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Conformidade automática com LGPD, ANVISA e CFM. Auditoria em
                tempo real e relatórios de conformidade para fiscalizações.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>{' '}
      {/* Recent Patients Section */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Patients */}
          <Card className="border-cyan-500/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="mr-2 h-5 w-5 text-cyan-400" />
                Pacientes Recentes
              </CardTitle>
              <CardDescription className="text-slate-300">
                Últimos cadastros na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div className="flex items-center space-x-3" key={i}>
                      <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32 bg-white/20" />
                        <Skeleton className="h-3 w-24 bg-white/20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentPatients.length > 0 ? (
                <div className="space-y-3">
                  {recentPatients.slice(0, 5).map((patient) => (
                    <div
                      className="flex items-center space-x-3 rounded-lg p-2 hover:bg-white/5"
                      key={patient.id}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {patient.name?.charAt(0).toUpperCase() || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">
                          {patient.name || 'Nome não informado'}
                        </p>
                        <p className="text-slate-300 text-sm">
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
                  className="mt-4 w-full text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
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
          <Card className="border-pink-500/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Activity className="mr-2 h-5 w-5 text-pink-400" />
                Agenda de Hoje
              </CardTitle>
              <CardDescription className="text-slate-300">
                Consultas programadas para hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      className="space-y-2 rounded-lg border border-white/10 p-3"
                      key={i}
                    >
                      <Skeleton className="h-4 w-20 bg-white/20" />
                      <Skeleton className="h-4 w-32 bg-white/20" />
                      <Skeleton className="h-3 w-24 bg-white/20" />
                    </div>
                  ))}
                </div>
              ) : todaysAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todaysAppointments.slice(0, 3).map((appointment) => (
                    <div
                      className="rounded-lg border border-white/10 p-3 hover:bg-white/5"
                      key={appointment.id}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">
                          {new Date(
                            appointment.appointment_date
                          ).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <Badge className="border-green-500/30 bg-green-500/20 text-green-400">
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-sm">
                        {appointment.patients?.name ||
                          'Paciente não identificado'}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {appointment.services?.name ||
                          'Serviço não especificado'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                  <p className="text-slate-300">
                    Nenhuma consulta agendada para hoje
                  </p>
                </div>
              )}

              {!appointmentsLoading && todaysAppointments.length > 3 && (
                <Button
                  className="mt-4 w-full text-pink-400 hover:bg-pink-500/20 hover:text-pink-300"
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
          <h3 className="mb-8 font-bold text-2xl text-white">
            Confiança e Segurança Garantidas
          </h3>
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            <Badge className="border-green-500/30 bg-green-500/20 px-4 py-2 text-green-400 text-sm">
              <Shield className="mr-2 h-4 w-4" />
              LGPD Compliant
            </Badge>
            <Badge className="border-blue-500/30 bg-blue-500/20 px-4 py-2 text-blue-400 text-sm">
              <Stethoscope className="mr-2 h-4 w-4" />
              ANVISA Aprovado
            </Badge>
            <Badge className="border-purple-500/30 bg-purple-500/20 px-4 py-2 text-purple-400 text-sm">
              <FileText className="mr-2 h-4 w-4" />
              CFM Certificado
            </Badge>
            <Badge className="border-orange-500/30 bg-orange-500/20 px-4 py-2 text-orange-400 text-sm">
              <Star className="mr-2 h-4 w-4" />
              ISO 27001
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-600">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="mb-2 font-semibold text-lg text-white">
                Dados Protegidos
              </h4>
              <p className="text-slate-300">
                Criptografia de ponta a ponta e compliance total com LGPD
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h4 className="mb-2 font-semibold text-lg text-white">
                Especializado em Estética
              </h4>
              <p className="text-slate-300">
                Desenvolvido especificamente para clínicas de estética e
                bem-estar
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h4 className="mb-2 font-semibold text-lg text-white">
                Suporte 24/7
              </h4>
              <p className="text-slate-300">
                Equipe especializada disponível para ajudar sua clínica
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action Section */}
      <section className="border-white/10 border-t bg-gradient-to-r from-blue-600/20 to-purple-600/20 py-20">
        <div className="container mx-auto px-6 text-center">
          <h3 className="mb-4 font-bold text-4xl text-white">
            Pronto para Transformar sua Clínica?
          </h3>
          <p className="mx-auto mb-8 max-w-2xl text-slate-300 text-xl">
            Junte-se a centenas de clínicas que já confiam no NeonPro para
            gerenciar seus negócios com eficiência, segurança e resultados
            comprovados.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              className="border-0 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 text-white hover:from-blue-600 hover:to-purple-700"
              onClick={() => router.push('/login')}
              size="lg"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              className="border-white/20 px-8 py-3 text-white hover:bg-white/10"
              size="lg"
              variant="outline"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Demonstração
            </Button>
          </div>

          <p className="mt-6 text-slate-400 text-sm">
            Teste grátis por 30 dias • Sem cartão de crédito • Suporte
            especializado
          </p>
        </div>
      </section>
    </div>
  );
}
