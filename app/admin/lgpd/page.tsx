'use client'

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle, 
  Activity, 
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'

// LGPD Components
import { LGPDDashboard } from '@/components/admin/lgpd/LGPDDashboard'
import { ConsentManagementPanel } from '@/components/admin/lgpd/ConsentManagementPanel'
import { DataSubjectRightsPanel } from '@/components/admin/lgpd/DataSubjectRightsPanel'
import { ComplianceAssessmentPanel } from '@/components/admin/lgpd/ComplianceAssessmentPanel'
import { BreachManagementPanel } from '@/components/admin/lgpd/BreachManagementPanel'
import { AuditTrailPanel } from '@/components/admin/lgpd/AuditTrailPanel'

// Hooks
import { useLGPDDashboard } from '@/hooks/useLGPD'

function LGPDPageContent() {
  const { 
    metrics, 
    isLoading: metricsLoading, 
    error: metricsError 
  } = useLGPDDashboard()

  if (metricsError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados LGPD: {metricsError.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            LGPD Compliance Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Centro de conformidade com a Lei Geral de Proteção de Dados
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <CheckCircle className="h-3 w-3 mr-1" />
          Sistema Ativo
        </Badge>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics?.compliance_percentage || 0}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Nível de conformidade atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consentimentos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics?.active_consents || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Consentimentos válidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics?.pending_requests || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Aguardando processamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidentes Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics?.active_breaches || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="consent" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Consentimentos
          </TabsTrigger>
          <TabsTrigger value="rights" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Direitos
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Avaliações
          </TabsTrigger>
          <TabsTrigger value="breach" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Incidentes
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Conformidade LGPD</CardTitle>
              <CardDescription>
                Visão geral do status de conformidade e métricas principais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LGPDDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Consentimentos</CardTitle>
              <CardDescription>
                Controle e monitoramento de consentimentos dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConsentManagementPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Direitos dos Titulares de Dados</CardTitle>
              <CardDescription>
                Processamento de solicitações de acesso, retificação, exclusão e portabilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataSubjectRightsPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avaliações de Conformidade</CardTitle>
              <CardDescription>
                Execução e monitoramento de avaliações de conformidade LGPD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComplianceAssessmentPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breach" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Incidentes</CardTitle>
              <CardDescription>
                Relatório e acompanhamento de violações de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BreachManagementPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Auditoria</CardTitle>
              <CardDescription>
                Registro completo de atividades e eventos do sistema LGPD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditTrailPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function LGPDAdminPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LGPDPageContent />
    </Suspense>
  )
}