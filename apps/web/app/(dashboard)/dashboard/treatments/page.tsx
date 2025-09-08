'use client'

import { motion, } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Heart,
  Plus,
  Search,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { useState, } from 'react'
// Import our treatment components
import { AestheticTreatmentPlan, } from '@/components/treatments/AestheticTreatmentPlan'
import { BeforeAfterSecureGallery, } from '@/components/treatments/BeforeAfterSecureGallery'
import { CosmeticConsentBrazilian, } from '@/components/treatments/CosmeticConsentBrazilian'
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
} from '@/components/ui/dialog'
import { Input, } from '@/components/ui/input'
import { Progress, } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator, } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger, } from '@/components/ui/tabs'

// Import hooks
import { useTreatments, } from '@/hooks/useTreatments'
import type {
  AestheticTreatmentCategory,
  TreatmentPlan,
  TreatmentStatus,
} from '@/types/treatments'

// Visual components maintaining NeonPro design
interface NeonGradientCardProps {
  children: React.ReactNode
  className?: string
}

const NeonGradientCard = ({
  children,
  className = '',
}: NeonGradientCardProps,) => (
  <motion.div
    animate={{ opacity: 1, y: 0, }}
    className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-sm ${className}`}
    initial={{ opacity: 0, y: 20, }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
    <div className="relative z-10">{children}</div>
  </motion.div>
)

// Filter and view options
type ViewMode = 'overview' | 'treatments' | 'sessions' | 'compliance'

export default function TreatmentsPage() {
  // Hook for treatments data
  const {
    treatmentPlans,
    activeTreatments,
    // completedTreatments, // TODO: Display completed treatments
    upcomingSessions,
    todaysSessions,
    // totalTreatments, activeSessionsCount, // TODO: Add summary statistics
    completionRate,
    averageSatisfactionScore,
    loading,
    error,
    searchTreatments,
    filterByCategory,
    filterByStatus,
  } = useTreatments()

  // State management
  const [viewMode, setViewMode,] = useState<ViewMode>('overview',)
  const [searchQuery, setSearchQuery,] = useState('',)
  const [categoryFilter, setCategoryFilter,] = useState<
    AestheticTreatmentCategory | 'all'
  >('all',)
  const [statusFilter, setStatusFilter,] = useState<TreatmentStatus | 'all'>(
    'all',
  )
  // const [selectedTreatment, setSelectedTreatment] = useState<TreatmentPlan | null>(); // TODO: Implement treatment selection
  const [showNewTreatmentDialog, setShowNewTreatmentDialog,] = useState(false,)

  // Handle search
  const handleSearch = (query: string,) => {
    setSearchQuery(query,)
    searchTreatments(query,)
  }

  // Handle category filter
  const handleCategoryFilter = (category: string,) => {
    setCategoryFilter(category as AestheticTreatmentCategory | 'all',)
    filterByCategory(
      category === 'all' ? null : (category as AestheticTreatmentCategory),
    )
  }

  // Handle status filter
  const handleStatusFilter = (status: string,) => {
    setStatusFilter(status as TreatmentStatus | 'all',)
    filterByStatus(status === 'all' ? null : (status as TreatmentStatus),)
  }

  // Mock data for demonstration (in real implementation, this would come from the hook)
  const mockTreatmentPlan: TreatmentPlan = {
    id: '1',
    patient_id: 'patient-1',
    professional_id: 'prof-1',
    treatment_name: 'Rejuvenescimento Facial com Laser',
    treatment_type: 'multi_session',
    category: 'facial',
    status: 'active',
    description:
      'Tratamento de rejuvenescimento facial utilizando laser fracionado para melhoria da textura da pele.',
    expected_sessions: 6,
    completed_sessions: 2,
    session_interval_days: 21,
    cfm_compliance_status: 'compliant',
    professional_license_verified: true,
    ethics_review_required: false,
    lgpd_consent_granted: true,
    lgpd_consent_date: new Date().toISOString(),
    lgpd_photo_consent_status: 'granted',
    data_retention_days: 2555,
    expected_outcomes: {},
    risk_assessment: {},
    total_cost: 3500,
    payment_plan: null,
    insurance_coverage: null,
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000,).toISOString(),
    estimated_completion_date: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    next_session_date: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system',
    last_modified_by: 'system',
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-100">
            Erro ao carregar tratamentos: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">
            Gestão de Tratamentos
          </h2>
          <p className="text-muted-foreground">
            Sistema completo para medicina estética brasileira com conformidade LGPD e CFM
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
          <Button onClick={() => setShowNewTreatmentDialog(true,)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Tratamento
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <NeonGradientCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-slate-300 text-sm">
              Tratamentos Ativos
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-white">
              {activeTreatments.length}
            </div>
            <p className="text-slate-400 text-xs">+2 novos esta semana</p>
          </CardContent>
        </NeonGradientCard>

        <NeonGradientCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-slate-300 text-sm">
              Sessões Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-white">
              {todaysSessions.length}
            </div>
            <p className="text-slate-400 text-xs">
              {upcomingSessions.length} agendadas
            </p>
          </CardContent>
        </NeonGradientCard>

        <NeonGradientCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-slate-300 text-sm">
              Taxa de Conclusão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-white">
              {completionRate.toFixed(1,)}%
            </div>
            <p className="text-slate-400 text-xs">+5.2% vs mês anterior</p>
          </CardContent>
        </NeonGradientCard>

        <NeonGradientCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-slate-300 text-sm">
              Satisfação Média
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-white">
              {averageSatisfactionScore.toFixed(1,)}/10
            </div>
            <p className="text-slate-400 text-xs">Excelente qualidade</p>
          </CardContent>
        </NeonGradientCard>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        className="space-y-4"
        onValueChange={(value: string,) => setViewMode(value as ViewMode,)}
        value={viewMode}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="treatments">Tratamentos</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent className="space-y-4" value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Active Treatments Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Tratamentos em Andamento
                </CardTitle>
                <CardDescription>
                  Acompanhamento dos tratamentos ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeTreatments.slice(0, 3,).map((treatment, index,) => (
                    <div
                      className="flex items-center justify-between rounded-lg border p-3"
                      key={treatment.id || index}
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {treatment.treatment_name || 'Tratamento de Exemplo'}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {treatment.completed_sessions || 2}/
                          {treatment.expected_sessions || 6} sessões
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          className="h-2 w-20"
                          value={((treatment.completed_sessions || 2)
                            / (treatment.expected_sessions || 6))
                            * 100}
                        />
                        <Badge variant="outline">
                          {Math.round(
                            ((treatment.completed_sessions || 2)
                              / (treatment.expected_sessions || 6))
                              * 100,
                          )}
                          %
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {activeTreatments.length === 0 && (
                    <div className="py-6 text-center">
                      <Heart className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhum tratamento ativo no momento
                      </p>
                      <Button
                        className="mt-2"
                        onClick={() => setShowNewTreatmentDialog(true,)}
                        size="sm"
                        variant="outline"
                      >
                        Criar Primeiro Tratamento
                      </Button>
                    </div>
                  )}

                  {activeTreatments.length > 3 && (
                    <Button
                      className="w-full"
                      onClick={() => setViewMode('treatments',)}
                      variant="outline"
                    >
                      Ver Todos os Tratamentos ({activeTreatments.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Today's Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Sessões de Hoje
                </CardTitle>
                <CardDescription>Agenda do dia atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysSessions.slice(0, 4,).map((session, index,) => (
                    <div
                      className="flex items-center justify-between rounded-lg border p-3"
                      key={session.id || index}
                    >
                      <div>
                        <p className="font-medium">
                          Sessão {session.session_number || index + 1}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {new Date(
                            session.scheduled_date || Date.now(),
                          ).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          },)}
                        </p>
                      </div>
                      <Badge
                        variant={session.status === 'completed'
                          ? 'default'
                          : session.status === 'cancelled'
                          ? 'destructive'
                          : 'outline'}
                      >
                        {session.status === 'scheduled' && 'Agendada'}
                        {session.status === 'completed' && 'Concluída'}
                        {session.status === 'cancelled' && 'Cancelada'}
                        {session.status === 'no_show' && 'Faltou'}
                        {session.status === 'rescheduled' && 'Reagendada'}
                      </Badge>
                    </div>
                  ))}

                  {todaysSessions.length === 0 && (
                    <div className="py-6 text-center">
                      <Calendar className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhuma sessão agendada para hoje
                      </p>
                    </div>
                  )}

                  {todaysSessions.length > 4 && (
                    <Button
                      className="w-full"
                      onClick={() => setViewMode('sessions',)}
                      variant="outline"
                    >
                      Ver Todas as Sessões ({todaysSessions.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Treatment Plan Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Exemplo de Plano de Tratamento
              </CardTitle>
              <CardDescription>
                Demonstração da interface de tratamento estético brasileiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AestheticTreatmentPlan
                onScheduleSession={(_id,) => {}}
                onViewProgress={(_id,) => {}}
                treatmentPlan={mockTreatmentPlan}
                variant="card"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent className="space-y-4" value="treatments">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros de Tratamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    className="w-64"
                    onChange={(e,) => handleSearch(e.target.value,)}
                    placeholder="Buscar tratamentos..."
                    value={searchQuery}
                  />
                </div>

                <Select
                  onValueChange={handleCategoryFilter}
                  value={categoryFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    <SelectItem value="facial">Tratamentos Faciais</SelectItem>
                    <SelectItem value="body_contouring">
                      Contorno Corporal
                    </SelectItem>
                    <SelectItem value="skin_rejuvenation">
                      Rejuvenescimento
                    </SelectItem>
                    <SelectItem value="hair_restoration">
                      Restauração Capilar
                    </SelectItem>
                    <SelectItem value="intimate_health">
                      Saúde Íntima
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={handleStatusFilter} value={statusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="planned">Planejado</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Treatments List */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {loading
              ? (
                // Loading skeleton
                Array.from({ length: 4, },).map((_, i,) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="h-4 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-2 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )
              : treatmentPlans.length > 0
              ? (
                treatmentPlans.map((treatment,) => (
                  <AestheticTreatmentPlan
                    key={treatment.id}
                    onScheduleSession={(_id,) => {}}
                    onViewProgress={(_id,) => {}}
                    treatmentPlan={treatment}
                    variant="summary"
                  />
                ))
              )
              : (
                // Show mock data for demonstration
                <div className="col-span-full">
                  <AestheticTreatmentPlan
                    onScheduleSession={(_id,) => {}}
                    onViewProgress={(_id,) => {}}
                    treatmentPlan={mockTreatmentPlan}
                    variant="summary"
                  />
                </div>
              )}
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent className="space-y-4" value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Gestão de Sessões
              </CardTitle>
              <CardDescription>
                Acompanhamento e agendamento de sessões de tratamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 font-semibold text-lg">
                  Calendário de Sessões
                </h3>
                <p className="mb-4 text-muted-foreground">
                  Interface de agendamento e gerenciamento de sessões será implementada aqui.
                </p>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Nova Sessão
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent className="space-y-4" value="compliance">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* LGPD Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Conformidade LGPD
                </CardTitle>
                <CardDescription>
                  Status de conformidade com a Lei Geral de Proteção de Dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Consentimentos Ativos</span>
                  <Badge variant="default">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    100%
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Dados Anonimizados</span>
                  <Badge variant="default">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Conforme
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Retenção de Dados</span>
                  <Badge variant="outline">
                    <Clock className="mr-1 h-3 w-3" />7 anos
                  </Badge>
                </div>

                <Separator />

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Todos os tratamentos estão em conformidade com a LGPD. Próxima auditoria
                    agendada para dezembro de 2024.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* CFM Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Conformidade CFM
                </CardTitle>
                <CardDescription>
                  Status de conformidade com o Conselho Federal de Medicina
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Licenças Verificadas</span>
                  <Badge variant="default">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    100%
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Protocolos Aprovados</span>
                  <Badge variant="default">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Todos
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Revisão Ética</span>
                  <Badge variant="outline">
                    <Clock className="mr-1 h-3 w-3" />
                    Em dia
                  </Badge>
                </div>

                <Separator />

                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    Todos os procedimentos seguem as diretrizes éticas do CFM. Certificações
                    profissionais atualizadas.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Consent Management Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Exemplo de Gestão de Consentimento
              </CardTitle>
              <CardDescription>
                Demonstração do sistema de consentimento LGPD/CFM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CosmeticConsentBrazilian
                mode="new"
                onConsentGranted={(_consent,) => {}}
                showProgress
                treatmentPlan={mockTreatmentPlan}
              />
            </CardContent>
          </Card>

          {/* Photo Gallery Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Exemplo de Galeria Segura
              </CardTitle>
              <CardDescription>
                Demonstração do sistema de fotos com proteção LGPD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BeforeAfterSecureGallery
                canEdit
                canShare
                consentStatus="granted"
                enableComparison
                onPhotoShare={(_id, _hours,) => {}}
                onPhotoUpload={(_file, _type,) => {}}
                photos={[]}
                treatmentSessionId="session-1"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Treatment Dialog */}
      <Dialog
        onOpenChange={setShowNewTreatmentDialog}
        open={showNewTreatmentDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Plano de Tratamento</DialogTitle>
            <DialogDescription>
              Criar um novo plano de tratamento estético com conformidade brasileira
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Plus className="h-4 w-4" />
              <AlertDescription>
                Esta funcionalidade será implementada com formulário completo de criação de
                tratamentos, incluindo seleção de protocolos, configuração de sessões e validação de
                conformidade.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={() => setShowNewTreatmentDialog(false,)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  // Would implement treatment creation here
                  setShowNewTreatmentDialog(false,)
                }}
              >
                Criar Tratamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
