'use client'

import { Alert, AlertDescription, } from '@/components/ui/alert'
import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input, } from '@/components/ui/input'
import { Label, } from '@/components/ui/label'
import { Progress, } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger, } from '@/components/ui/tabs'
import { cn, } from '@/lib/utils'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Filter,
  PauseCircle,
  PlayCircle,
  Search,
  Settings,
  Shield,
  Target,
  TrendingUp,
  User,
  Workflow,
  Zap,
} from 'lucide-react'
import type React from 'react'
import { useState, } from 'react'
import type { ComplianceFramework, } from '../types'
import type { RemediationWorkflow, } from './RemediationEngine'

interface WorkflowManagerProps {
  className?: string
}

// Mock data (would be fetched from API)
const mockWorkflows: RemediationWorkflow[] = [
  {
    id: 'workflow_1',
    violationId: 'violation_1',
    framework: 'WCAG',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'dev@clinic.com',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000,), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000,), // 2 hours ago
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000,), // Tomorrow
    actions: [],
    selectedAction: 'action_1',
    progress: {
      totalSteps: 5,
      completedSteps: 3,
      percentage: 60,
    },
    timeline: [],
    estimatedEffort: 4,
    actualEffort: 2.5,
    blockers: [],
    metrics: {
      escalations: 0,
      reopenCount: 0,
    },
  },
  {
    id: 'workflow_2',
    violationId: 'violation_2',
    framework: 'LGPD',
    status: 'assigned',
    priority: 'critical',
    assignedTo: 'legal@clinic.com',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000,), // 6 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000,), // 1 hour ago
    dueDate: new Date(Date.now() + 18 * 60 * 60 * 1000,), // 18 hours
    actions: [],
    progress: {
      totalSteps: 3,
      completedSteps: 0,
      percentage: 0,
    },
    timeline: [],
    estimatedEffort: 6,
    blockers: [{
      id: 'blocker_1',
      description: 'Waiting for legal team review',
      severity: 'medium',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000,),
    },],
    metrics: {
      escalations: 1,
      reopenCount: 0,
    },
  },
  {
    id: 'workflow_3',
    violationId: 'violation_3',
    framework: 'ANVISA',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'medical@clinic.com',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000,), // 5 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000,), // 1 day ago
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000,),
    actions: [],
    progress: {
      totalSteps: 4,
      completedSteps: 4,
      percentage: 100,
    },
    timeline: [],
    estimatedEffort: 3,
    actualEffort: 2.8,
    blockers: [],
    metrics: {
      timeToResolution: 96, // 4 days in hours
      escalations: 0,
      reopenCount: 0,
      satisfactionRating: 4,
    },
  },
]

const StatusBadge = ({ status, }: { status: RemediationWorkflow['status'] },) => {
  const statusConfig = {
    created: { color: 'bg-gray-100 text-gray-800', icon: Clock, },
    assigned: { color: 'bg-blue-100 text-blue-800', icon: User, },
    in_progress: { color: 'bg-orange-100 text-orange-800', icon: PlayCircle, },
    review: { color: 'bg-purple-100 text-purple-800', icon: Eye, },
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, },
    cancelled: { color: 'bg-red-100 text-red-800', icon: PauseCircle, },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn('text-xs font-medium', config.color,)}>
      <Icon className="w-3 h-3 mr-1" />
      {status.replace('_', ' ',)}
    </Badge>
  )
}

const PriorityBadge = ({ priority, }: { priority: RemediationWorkflow['priority'] },) => {
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }

  return (
    <Badge variant="outline" className={cn('text-xs', priorityColors[priority],)}>
      {priority}
    </Badge>
  )
}

const FrameworkIcon = ({ framework, }: { framework: ComplianceFramework },) => {
  const iconClass = 'w-4 h-4'
  const frameworkIcons = {
    WCAG: Shield,
    LGPD: FileText,
    ANVISA: Target,
    CFM: User,
  }

  const Icon = frameworkIcons[framework] || Shield
  return <Icon className={iconClass} />
}

const formatRelativeTime = (date: Date,): string => {
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) return 'Há poucos minutos'
  if (diffInHours < 24) return `Há ${Math.floor(diffInHours,)} horas`
  if (diffInHours < 48) return 'Ontem'
  return `Há ${Math.floor(diffInHours / 24,)} dias`
}

const formatTimeUntil = (date: Date,): string => {
  const now = new Date()
  const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 0) return 'Vencido'
  if (diffInHours < 1) return 'Vence em breve'
  if (diffInHours < 24) return `${Math.floor(diffInHours,)}h restantes`
  return `${Math.floor(diffInHours / 24,)} dias restantes`
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({ className, },) => {
  const [workflows, setWorkflows,] = useState<RemediationWorkflow[]>(mockWorkflows,)
  const [searchTerm, setSearchTerm,] = useState('',)
  const [statusFilter, setStatusFilter,] = useState<string>('all',)
  const [priorityFilter, setPriorityFilter,] = useState<string>('all',)
  const [frameworkFilter, setFrameworkFilter,] = useState<string>('all',)
  const [selectedWorkflow, setSelectedWorkflow,] = useState<RemediationWorkflow | null>(null,)

  // Filter workflows based on search and filters
  const filteredWorkflows = workflows.filter(workflow => {
    if (
      searchTerm && !workflow.id.toLowerCase().includes(searchTerm.toLowerCase(),)
      && !workflow.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase(),)
    ) {
      return false
    }
    if (statusFilter !== 'all' && workflow.status !== statusFilter) {
      return false
    }
    if (priorityFilter !== 'all' && workflow.priority !== priorityFilter) {
      return false
    }
    if (frameworkFilter !== 'all' && workflow.framework !== frameworkFilter) {
      return false
    }
    return true
  },)

  // Calculate statistics
  const stats = {
    total: workflows.length,
    inProgress: workflows.filter(w => w.status === 'in_progress').length,
    overdue:
      workflows.filter(w => w.dueDate && new Date() > w.dueDate && w.status !== 'completed').length,
    completed: workflows.filter(w => w.status === 'completed').length,
    averageResolution: workflows
          .filter(w => w.metrics.timeToResolution)
          .reduce((sum, w,) => sum + (w.metrics.timeToResolution || 0), 0,)
        / workflows.filter(w => w.metrics.timeToResolution).length || 0,
  }

  const _handleAssignWorkflow = async (workflowId: string, assignee: string,) => {
    setWorkflows(prev =>
      prev.map(w =>
        w.id === workflowId
          ? { ...w, assignedTo: assignee, status: 'assigned' as const, updatedAt: new Date(), }
          : w
      )
    )
  }

  const handleStartWorkflow = async (workflowId: string,) => {
    setWorkflows(prev =>
      prev.map(w =>
        w.id === workflowId
          ? { ...w, status: 'in_progress' as const, updatedAt: new Date(), }
          : w
      )
    )
  }

  const handleCompleteWorkflow = async (workflowId: string,) => {
    setWorkflows(prev =>
      prev.map(w =>
        w.id === workflowId
          ? {
            ...w,
            status: 'completed' as const,
            completedAt: new Date(),
            updatedAt: new Date(),
            progress: { ...w.progress, percentage: 100, },
          }
          : w
      )
    )
  }

  return (
    <div className={cn('space-y-6', className,)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workflows de Remediação</h2>
          <p className="text-muted-foreground">
            Gerencie fluxos de trabalho para correção de violações de compliance
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
          <Button size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Auto-remediação
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Em Andamento</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-muted-foreground">Vencidos</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Concluídos</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">Workflows Ativos</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="ID ou responsável"
                      value={searchTerm}
                      onChange={(e,) => setSearchTerm(e.target.value,)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="created">Criado</SelectItem>
                      <SelectItem value="assigned">Atribuído</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="review">Revisão</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Framework</Label>
                  <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="WCAG">WCAG</SelectItem>
                      <SelectItem value="LGPD">LGPD</SelectItem>
                      <SelectItem value="ANVISA">ANVISA</SelectItem>
                      <SelectItem value="CFM">CFM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchTerm('',)
                      setStatusFilter('all',)
                      setPriorityFilter('all',)
                      setFrameworkFilter('all',)
                    }}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflows List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                Workflows ({filteredWorkflows.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWorkflows.map((workflow,) => (
                  <div
                    key={workflow.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        <FrameworkIcon framework={workflow.framework} />
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{workflow.id}</span>
                          <StatusBadge status={workflow.status} />
                          <PriorityBadge priority={workflow.priority} />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Framework: {workflow.framework}</span>
                          <span>Responsável: {workflow.assignedTo || 'Não atribuído'}</span>
                          <span>{formatRelativeTime(workflow.createdAt,)}</span>
                          {workflow.dueDate && (
                            <span
                              className={cn(
                                new Date() > workflow.dueDate && workflow.status !== 'completed'
                                  ? 'text-red-600 font-medium'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {formatTimeUntil(workflow.dueDate,)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Progresso:</span>
                            <Progress value={workflow.progress.percentage} className="w-24 h-2" />
                            <span className="text-sm font-medium">
                              {workflow.progress.percentage}%
                            </span>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {workflow.progress.completedSteps}/{workflow.progress.totalSteps} etapas
                          </div>

                          {workflow.blockers.length > 0 && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {workflow.blockers.length} bloqueios
                            </Badge>
                          )}
                        </div>

                        {workflow.estimatedEffort && (
                          <div className="text-sm text-muted-foreground">
                            Esforço estimado: {workflow.estimatedEffort}h
                            {workflow.actualEffort && ` | Gasto: ${workflow.actualEffort}h`}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedWorkflow(workflow,)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <FrameworkIcon framework={workflow.framework} />
                              Workflow {workflow.id}
                            </DialogTitle>
                            <DialogDescription>
                              Detalhes do workflow de remediação para {workflow.framework}
                            </DialogDescription>
                          </DialogHeader>

                          {selectedWorkflow && (
                            <div className="space-y-6">
                              {/* Workflow Overview */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div className="mt-1">
                                    <StatusBadge status={selectedWorkflow.status} />
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Prioridade</Label>
                                  <div className="mt-1">
                                    <PriorityBadge priority={selectedWorkflow.priority} />
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Responsável</Label>
                                  <p className="mt-1 text-sm">
                                    {selectedWorkflow.assignedTo || 'Não atribuído'}
                                  </p>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Prazo</Label>
                                  <p className="mt-1 text-sm">
                                    {selectedWorkflow.dueDate
                                      ? selectedWorkflow.dueDate.toLocaleDateString('pt-BR',)
                                      : 'Não definido'}
                                  </p>
                                </div>
                              </div>

                              {/* Progress */}
                              <div>
                                <Label className="text-sm font-medium">Progresso</Label>
                                <div className="mt-2 space-y-2">
                                  <Progress
                                    value={selectedWorkflow.progress.percentage}
                                    className="h-3"
                                  />
                                  <p className="text-sm text-muted-foreground">
                                    {selectedWorkflow.progress.completedSteps} de{' '}
                                    {selectedWorkflow.progress.totalSteps}{' '}
                                    etapas concluídas ({selectedWorkflow.progress.percentage}%)
                                  </p>
                                </div>
                              </div>

                              {/* Blockers */}
                              {selectedWorkflow.blockers.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Bloqueios</Label>
                                  <div className="mt-2 space-y-2">
                                    {selectedWorkflow.blockers.map((blocker,) => (
                                      <Alert key={blocker.id}>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                          <div className="flex items-center justify-between">
                                            <span>{blocker.description}</span>
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                'text-xs',
                                                blocker.severity === 'high'
                                                  ? 'text-red-600'
                                                  : blocker.severity === 'medium'
                                                  ? 'text-orange-600'
                                                  : 'text-green-600',
                                              )}
                                            >
                                              {blocker.severity}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Criado: {formatRelativeTime(blocker.createdAt,)}
                                          </p>
                                        </AlertDescription>
                                      </Alert>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Metrics */}
                              <div>
                                <Label className="text-sm font-medium">Métricas</Label>
                                <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Escalações:</span>
                                    <span className="ml-2 font-medium">
                                      {selectedWorkflow.metrics.escalations}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Reaberturas:</span>
                                    <span className="ml-2 font-medium">
                                      {selectedWorkflow.metrics.reopenCount}
                                    </span>
                                  </div>
                                  {selectedWorkflow.metrics.timeToResolution && (
                                    <div>
                                      <span className="text-muted-foreground">
                                        Tempo de resolução:
                                      </span>
                                      <span className="ml-2 font-medium">
                                        {selectedWorkflow.metrics.timeToResolution.toFixed(1,)}h
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {workflow.status === 'created' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartWorkflow(workflow.id,)}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Iniciar
                        </Button>
                      )}

                      {workflow.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteWorkflow(workflow.id,)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredWorkflows.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum workflow encontrado</p>
                    <p className="text-sm">
                      Ajuste os filtros ou aguarde novas violações serem detectadas
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Desempenho de Resolução
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tempo Médio de Resolução</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.averageResolution.toFixed(1,)}h
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Taxa de Conclusão</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((stats.completed / stats.total) * 100,)}%
                      </span>
                    </div>
                    <Progress value={(stats.completed / stats.total) * 100} className="mt-2 h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Taxa de Workflows no Prazo</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(((stats.total - stats.overdue) / stats.total) * 100,)}%
                      </span>
                    </div>
                    <Progress
                      value={((stats.total - stats.overdue) / stats.total) * 100}
                      className="mt-2 h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Distribuição por Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['WCAG', 'LGPD', 'ANVISA', 'CFM',] as ComplianceFramework[]).map(framework => {
                    const count = workflows.filter(w => w.framework === framework).length
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0

                    return (
                      <div key={framework} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FrameworkIcon framework={framework} />
                          <span className="text-sm font-medium">{framework}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <Progress value={percentage} className="h-2" />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {count} ({Math.round(percentage,)}%)
                          </span>
                        </div>
                      </div>
                    )
                  },)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Sistema de Auto-remediação
              </CardTitle>
              <CardDescription>
                Configure e monitore correções automáticas para violações de compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema de auto-remediação em desenvolvimento</p>
                  <p className="text-sm">Correções automáticas serão disponibilizadas em breve</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WorkflowManager
