"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Activity,
  Calendar,
  CalendarCheck,
  FileText,
  Heart,
  MessageCircle,
  Plus,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Clock,
  MapPin,
  Phone,
  Download,
  Star,
  Bell,
  AlertCircle
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePatientAuth } from '@/lib/auth/patient-auth'
import { usePatientData } from '@/lib/hooks/use-patient-data'

interface UpcomingAppointment {
  id: string
  date: string
  time: string
  service: string
  professional: string
  professional_avatar?: string
  location: string
  status: 'confirmed' | 'pending' | 'rescheduled'
  type: 'consultation' | 'procedure' | 'follow_up'
}

interface WellnessMetric {
  id: string
  label: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  color: string
}

interface RecentActivity {
  id: string
  type: 'appointment' | 'document' | 'message' | 'update'
  title: string
  description: string
  date: string
  icon: React.ComponentType<{ className?: string }>
}

export function PatientDashboard() {
  const { patient } = usePatientAuth()
  const { appointments, treatmentHistory, isLoading } = usePatientData()

  // Sample data - in production, this would come from API
  const upcomingAppointments: UpcomingAppointment[] = [
    {
      id: '1',
      date: '2025-01-29',
      time: '14:30',
      service: 'Harmonização Facial',
      professional: 'Dra. Marina Silva',
      professional_avatar: '',
      location: 'Sala 102',
      status: 'confirmed',
      type: 'procedure'
    },
    {
      id: '2', 
      date: '2025-02-05',
      time: '10:00',
      service: 'Consulta de Retorno',
      professional: 'Dra. Marina Silva',
      location: 'Sala 101',
      status: 'confirmed',
      type: 'follow_up'
    }
  ]

  const wellnessMetrics: WellnessMetric[] = [
    {
      id: '1',
      label: 'Satisfação com Tratamentos',
      value: 95,
      target: 100,
      unit: '%',
      trend: 'up',
      color: 'text-green-600'
    },
    {
      id: '2',
      label: 'Aderência ao Protocolo',
      value: 88,
      target: 90,
      unit: '%',
      trend: 'up',
      color: 'text-blue-600'
    },
    {
      id: '3',
      label: 'Consultas Realizadas',
      value: 12,
      target: 15,
      unit: '',
      trend: 'stable',
      color: 'text-purple-600'
    }
  ]

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'Consulta realizada',
      description: 'Avaliação pré-procedimento com Dra. Marina',
      date: '2025-01-20',
      icon: CalendarCheck
    },
    {
      id: '2',
      type: 'document',
      title: 'Novo documento disponível',
      description: 'Laudo de exame pré-operatório',
      date: '2025-01-18',
      icon: FileText
    },
    {
      id: '3',
      type: 'message',
      title: 'Mensagem recebida',
      description: 'Orientações pós-procedimento',
      date: '2025-01-15',
      icon: MessageCircle
    }
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const formatAppointmentDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Hoje'
    if (isTomorrow(date)) return 'Amanhã'
    return format(date, "d 'de' MMMM", { locale: ptBR })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: { label: 'Confirmado', variant: 'default' as const },
      pending: { label: 'Pendente', variant: 'secondary' as const },
      rescheduled: { label: 'Reagendado', variant: 'outline' as const }
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border-4 border-white/30">
              <AvatarImage src={patient?.avatar_url} alt={patient?.name} />
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {patient?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                {getGreeting()}, {patient?.name?.split(' ')[0]}! ✨
              </h1>
              <p className="text-white/90 text-lg">
                Bem-vindo ao seu portal de saúde e beleza
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-white/80 text-sm">Consultas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-white/80 text-sm">Tratamentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-white/80 text-sm">Satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2</div>
              <div className="text-white/80 text-sm">Retornos</div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4">
            <Sparkles className="w-12 h-12" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Heart className="w-8 h-8" />
          </div>
          <div className="absolute top-1/2 right-1/4">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild className="h-auto p-4 flex-col gap-2" variant="outline">
          <Link href="/patient-portal/appointments/new">
            <Plus className="w-5 h-5" />
            <span className="text-sm">Agendar</span>
          </Link>
        </Button>
        <Button asChild className="h-auto p-4 flex-col gap-2" variant="outline">
          <Link href="/patient-portal/history">
            <Activity className="w-5 h-5" />
            <span className="text-sm">Histórico</span>
          </Link>
        </Button>
        <Button asChild className="h-auto p-4 flex-col gap-2" variant="outline">
          <Link href="/patient-portal/documents">
            <Download className="w-5 h-5" />
            <span className="text-sm">Documentos</span>
          </Link>
        </Button>
        <Button asChild className="h-auto p-4 flex-col gap-2" variant="outline">
          <Link href="/patient-portal/profile">
            <User className="w-5 h-5" />
            <span className="text-sm">Perfil</span>
          </Link>
        </Button>
      </div>

      {/* Alerts/Notifications */}
      <div className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <Bell className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Lembrete:</strong> Você tem uma consulta agendada para amanhã às 14:30. 
            <Link href="/patient-portal/appointments" className="underline ml-1">
              Ver detalhes
            </Link>
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <Card className="medical-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Próximas Consultas</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/patient-portal/appointments">
                  Ver todas
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm">{appointment.service}</h4>
                        <p className="text-sm text-muted-foreground">
                          {appointment.professional}
                        </p>
                      </div>
                      <Badge {...getStatusBadge(appointment.status)}>
                        {getStatusBadge(appointment.status).label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatAppointmentDate(appointment.date)} às {appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{appointment.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma consulta agendada</p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href="/patient-portal/appointments/new">
                    Agendar consulta
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wellness Metrics */}
        <Card className="medical-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Indicadores de Bem-estar</CardTitle>
            </div>
            <CardDescription>
              Acompanhe seu progresso nos tratamentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {wellnessMetrics.map((metric) => (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <span className={`text-sm font-semibold ${metric.color}`}>
                    {metric.value}{metric.unit}
                  </span>
                </div>
                <Progress 
                  value={(metric.value / metric.target) * 100} 
                  className="h-2" 
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Meta: {metric.target}{metric.unit}</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-3 h-3 ${metric.color}`} />
                    <span className={metric.color}>
                      {metric.trend === 'up' ? 'Melhorando' : 
                       metric.trend === 'down' ? 'Atenção' : 'Estável'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Atividade Recente</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={activity.id}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(activity.date), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {index < recentActivities.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* LGPD Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200 medical-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">
                Seus Dados Estão Protegidos
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                Todas as suas informações médicas são tratadas com máxima segurança, 
                seguindo rigorosamente a Lei Geral de Proteção de Dados (LGPD) e 
                as normas do Conselho Federal de Medicina (CFM).
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="text-blue-700 border-blue-300">
                  <Link href="/patient-portal/consent">
                    Gerenciar Consentimentos
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-blue-700">
                  <Link href="/privacy-policy">
                    Política de Privacidade
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
