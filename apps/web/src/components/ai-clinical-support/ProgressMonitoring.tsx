'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { ProgressUpdate } from '@/types/ai-clinical-support'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Activity,
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle,
  Edit,
  MessageSquare,
  Plus,
  RefreshCw,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

interface ProgressMonitoringProps {
  patientId: string
  treatmentPlanId?: string
  onUpdateProgress?: (update: ProgressUpdate) => void
}

export function ProgressMonitoring({
  patientId,
  treatmentPlanId,
  onUpdateProgress: _onUpdateProgress,
}: ProgressMonitoringProps) {
  const [_selectedSession, _setSelectedSession] = useState<string>('')
  const [activeTab, setActiveTab] = useState('overview')
  const [isAddingUpdate, setIsAddingUpdate] = useState(false)
  const [newUpdate, setNewUpdate] = useState({
    sessionId: '',
    progressPercentage: 0,
    satisfaction: 5,
    notes: '',
    sideEffects: '',
    photos: [] as string[],
  })

  // Fetch treatment progress
  const { data: progress, isLoading, error, refetch } = useQuery({
    queryKey: ['treatment-progress', patientId, treatmentPlanId],
    queryFn: async () => {
      return await api.aiClinicalSupport.monitorTreatmentProgress({
        patientId,
        treatmentPlanId,
        includeDetailedAnalysis: true,
      })
    },
    enabled: !!patientId && !!treatmentPlanId,
  })

  // Add progress update mutation
  const addProgressUpdate = useMutation({
    mutationFn: async (update: ProgressUpdate) => {
      return await api.aiClinicalSupport.addProgressUpdate(update)
    },
    onSuccess: () => {
      refetch()
      setIsAddingUpdate(false)
      setNewUpdate({
        sessionId: '',
        progressPercentage: 0,
        satisfaction: 5,
        notes: '',
        sideEffects: '',
        photos: [],
      })
    },
  })

  const handleAddUpdate = () => {
    if (!newUpdate.sessionId) return

    addProgressUpdate.mutate({
      ...newUpdate,
      patientId,
      treatmentPlanId: treatmentPlanId!,
      timestamp: new Date().toISOString(),
    })
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-yellow-600'
    return 'text-blue-600'
  }

  const getSatisfactionColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-800'
      case 'ahead':
        return 'bg-blue-100 text-blue-800'
      case 'behind':
        return 'bg-yellow-100 text-yellow-800'
      case 'at_risk':
        return 'bg-orange-100 text-orange-800'
      case 'paused':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR })
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded mb-4'></div>
          <div className='h-32 bg-gray-200 rounded'></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Erro no monitoramento de progresso</AlertTitle>
        <AlertDescription>
          Não foi possível carregar o progresso do tratamento. Por favor, tente novamente.
        </AlertDescription>
      </Alert>
    )
  }

  if (!progress) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center'>
            <Activity className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Monitoramento de Progresso
            </h3>
            <p className='text-gray-500 mb-4'>
              Selecione um plano de tratamento para acompanhar o progresso.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Monitoramento de Progresso
          </h2>
          <p className='text-gray-600 mt-1'>
            Acompanhamento em tempo real para {progress.patientInfo?.name}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => refetch()}
            className='flex items-center gap-2'
          >
            <RefreshCw className='h-4 w-4' />
            Atualizar
          </Button>
          <Button
            onClick={() => setIsAddingUpdate(true)}
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Adicionar Atualização
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Target className='h-4 w-4 text-blue-500' />
              <div>
                <div className='text-sm text-gray-500'>Progresso Geral</div>
                <div className={`text-lg font-bold ${getProgressColor(progress.overallProgress)}`}>
                  {progress.overallProgress}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Star className='h-4 w-4 text-yellow-500' />
              <div>
                <div className='text-sm text-gray-500'>Satisfação Média</div>
                <div
                  className={`text-lg font-bold ${
                    getSatisfactionColor(progress.averageSatisfaction)
                  }`}
                >
                  {progress.averageSatisfaction}/10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-4 w-4 text-green-500' />
              <div>
                <div className='text-sm text-gray-500'>Sessões Completas</div>
                <div className='text-lg font-bold text-green-600'>
                  {progress.completedSessions}/{progress.totalSessions}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-purple-500' />
              <div>
                <div className='text-sm text-gray-500'>Status do Tratamento</div>
                <Badge className={getStatusColor(progress.overallStatus)}>
                  {progress.overallStatus === 'on_track'
                    ? 'No Caminho'
                    : progress.overallStatus === 'ahead'
                    ? 'Adiantado'
                    : progress.overallStatus === 'behind'
                    ? 'Atrasado'
                    : progress.overallStatus === 'at_risk'
                    ? 'Em Risco'
                    : progress.overallStatus === 'paused'
                    ? 'Pausado'
                    : progress.overallStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {progress.aiInsights && progress.aiInsights.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {progress.aiInsights.map((insight, index) => (
            <Alert
              key={index}
              className={insight.type === 'warning'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-blue-200 bg-blue-50'}
            >
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>{insight.title}</AlertTitle>
              <AlertDescription>{insight.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Add Update Form */}
      {isAddingUpdate && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <Plus className='h-5 w-5' />
                Adicionar Atualização de Progresso
              </span>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsAddingUpdate(false)}
              >
                <X className='h-4 w-4' />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='session'>Sessão</Label>
                <Select
                  value={newUpdate.sessionId}
                  onValueChange={(value) => setNewUpdate((prev) => ({ ...prev, sessionId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione a sessão' />
                  </SelectTrigger>
                  <SelectContent>
                    {progress.sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        Sessão {session.sessionNumber} - {formatDate(session.scheduledDate)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='progress'>Progresso (%)</Label>
                <Input
                  id='progress'
                  type='number'
                  min='0'
                  max='100'
                  value={newUpdate.progressPercentage}
                  onChange={(e) =>
                    setNewUpdate((prev) => ({
                      ...prev,
                      progressPercentage: parseInt(e.target.value) || 0,
                    }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor='satisfaction'>Satisfação (1-10)</Label>
              <Input
                id='satisfaction'
                type='number'
                min='1'
                max='10'
                value={newUpdate.satisfaction}
                onChange={(e) =>
                  setNewUpdate((prev) => ({
                    ...prev,
                    satisfaction: parseInt(e.target.value) || 5,
                  }))}
              />
            </div>

            <div>
              <Label htmlFor='notes'>Notas</Label>
              <Textarea
                id='notes'
                placeholder='Observações sobre o progresso...'
                value={newUpdate.notes}
                onChange={(e) => setNewUpdate((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor='sideEffects'>Efeitos Colaterais</Label>
              <Textarea
                id='sideEffects'
                placeholder='Efeitos colaterais observados...'
                value={newUpdate.sideEffects}
                onChange={(e) => setNewUpdate((prev) => ({ ...prev, sideEffects: e.target.value }))}
              />
            </div>

            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setIsAddingUpdate(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddUpdate} disabled={addProgressUpdate.isPending}>
                {addProgressUpdate.isPending ? 'Salvando...' : 'Salvar Atualização'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Visão Geral</TabsTrigger>
          <TabsTrigger value='sessions'>Sessões</TabsTrigger>
          <TabsTrigger value='timeline'>Timeline</TabsTrigger>
          <TabsTrigger value='analytics'>Análise</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Target className='h-5 w-5' />
                  Progresso por Objetivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {progress.goals.map((goal) => (
                    <div key={goal.id} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>{goal.description}</span>
                        <span className='text-sm text-gray-600'>{goal.currentProgress}%</span>
                      </div>
                      <Progress value={goal.currentProgress} className='h-2' />
                      <div className='text-xs text-gray-500'>
                        Meta: {goal.targetProgress}% •{' '}
                        {goal.isAchieved ? '✅ Alcançado' : '🔄 Em andamento'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Tendências e Padões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {progress.trends.map((trend, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <div className='flex items-center gap-2'>
                        {trend.direction === 'improving'
                          ? <TrendingUp className='h-4 w-4 text-green-500' />
                          : <TrendingDown className='h-4 w-4 text-red-500' />}
                        <span className='text-sm font-medium'>{trend.metric}</span>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-medium'>
                          {trend.direction === 'improving' ? 'Melhorando' : 'Requer Atenção'}
                        </div>
                        <div className='text-xs text-gray-500'>{trend.change}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions */}
        <TabsContent value='sessions' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4'>
            {progress.sessions.map((session) => <SessionCard key={session.id} session={session} />)}
          </div>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value='timeline' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                Timeline do Tratamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {progress.timeline.map((event, index) => (
                  <div key={index} className='flex items-start gap-4'>
                    <div className='flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                      {event.type === 'session'
                        ? <Calendar className='h-4 w-4 text-blue-600' />
                        : event.type === 'update'
                        ? <Edit className='h-4 w-4 text-green-600' />
                        : event.type === 'milestone'
                        ? <Award className='h-4 w-4 text-yellow-600' />
                        : <MessageSquare className='h-4 w-4 text-purple-600' />}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h4 className='font-medium'>{event.title}</h4>
                        <Badge variant='outline'>{event.type}</Badge>
                        <span className='text-sm text-gray-500'>{formatDate(event.date)}</span>
                      </div>
                      <p className='text-sm text-gray-600'>{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value='analytics' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Análise de Eficácia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium'>Eficácia Geral</span>
                      <span className='text-sm font-medium'>
                        {progress.efficacyAnalysis.overall}%
                      </span>
                    </div>
                    <Progress value={progress.efficacyAnalysis.overall} className='h-2' />
                  </div>

                  <div className='space-y-2'>
                    <h4 className='text-sm font-medium'>Por Procedimento</h4>
                    {progress.efficacyAnalysis.byProcedure.map((proc, index) => (
                      <div key={index} className='space-y-1'>
                        <div className='flex items-center justify-between text-sm'>
                          <span>{proc.procedureName}</span>
                          <span>{proc.efficacy}%</span>
                        </div>
                        <Progress value={proc.efficacy} className='h-1' />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5' />
                  Identificação de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {progress.riskAssessment.map((risk, index) => (
                    <div key={index} className='flex items-start gap-3'>
                      <AlertTriangle
                        className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          risk.level === 'high'
                            ? 'text-red-500'
                            : risk.level === 'medium'
                            ? 'text-yellow-500'
                            : 'text-green-500'
                        }`}
                      />
                      <div className='flex-1'>
                        <div className='font-medium text-sm'>{risk.factor}</div>
                        <div className='text-xs text-gray-600'>{risk.description}</div>
                        <Badge
                          variant='outline'
                          className={`mt-1 ${
                            risk.level === 'high'
                              ? 'border-red-200 text-red-800'
                              : risk.level === 'medium'
                              ? 'border-yellow-200 text-yellow-800'
                              : 'border-green-200 text-green-800'
                          }`}
                        >
                          {risk.level === 'high'
                            ? 'Alto Risco'
                            : risk.level === 'medium'
                            ? 'Médio Risco'
                            : 'Baixo Risco'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface SessionCardProps {
  session: any
}

function SessionCard({ session }: SessionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Sessão {session.sessionNumber}
          </CardTitle>
          <Badge className={getStatusColor(session.status)}>
            {session.status === 'completed'
              ? 'Concluída'
              : session.status === 'in_progress'
              ? 'Em Andamento'
              : session.status === 'scheduled'
              ? 'Agendada'
              : session.status === 'cancelled'
              ? 'Cancelada'
              : session.status}
          </Badge>
        </div>
        <CardDescription>
          {session.procedureName} • {format(session.scheduledDate, 'dd/MM/yyyy', { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
          <div>
            <span className='text-sm text-gray-500'>Progresso</span>
            <div className='font-medium'>{session.progressPercentage}%</div>
          </div>
          <div>
            <span className='text-sm text-gray-500'>Satisfação</span>
            <div className='font-medium'>{session.satisfactionScore}/10</div>
          </div>
          <div>
            <span className='text-sm text-gray-500'>Atualizações</span>
            <div className='font-medium'>{session.updates.length}</div>
          </div>
          <div>
            <span className='text-sm text-gray-500'>Próxima Sessão</span>
            <div className='font-medium'>
              {session.nextSession
                ? format(session.nextSession, 'dd/MM/yyyy', { locale: ptBR })
                : '-'}
            </div>
          </div>
        </div>

        {session.updates.length > 0 && (
          <div>
            <h4 className='text-sm font-medium mb-2'>Atualizações Recentes</h4>
            <div className='space-y-2'>
              {session.updates.slice(0, 2).map((update: any, index: number) => (
                <div key={index} className='text-sm text-gray-600 p-2 bg-gray-50 rounded'>
                  {update.notes}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
