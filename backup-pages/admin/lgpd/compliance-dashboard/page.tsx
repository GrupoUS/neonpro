/**
 * LGPD Compliance Dashboard Page
 * 
 * Admin page for real-time LGPD compliance monitoring, violation management,
 * and compliance assessment in healthcare environment.
 */

import { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import ComplianceMonitoringDashboard from '@/components/lgpd/ComplianceMonitoringDashboard'
import { Shield, Activity, Database, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard LGPD - Monitoramento de Conformidade | NeonPro',
  description: 'Monitoramento em tempo real da conformidade LGPD para dados de saúde e proteção de pacientes.',
  keywords: [
    'LGPD',
    'conformidade',
    'proteção de dados',
    'saúde',
    'monitoramento',
    'violations',
    'auditoria',
    'privacidade'
  ]
}

// Loading component for dashboard
function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Compliance overview stats component
function ComplianceOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Proteção LGPD</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Ativa</div>
          <p className="text-xs text-muted-foreground">
            Monitoramento em tempo real
          </p>
          <Badge variant="secondary" className="mt-2">
            Conformidade Médica
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dados Protegidos</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">100%</div>
          <p className="text-xs text-muted-foreground">
            Criptografia end-to-end
          </p>
          <Badge variant="default" className="mt-2">
            PCI DSS + LGPD
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Auditoria</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Contínua</div>
          <p className="text-xs text-muted-foreground">
            Trilha completa de acesso
          </p>
          <Badge variant="outline" className="mt-2">
            ANVISA Compliant
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Segurança</CardTitle>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">Máxima</div>
          <p className="text-xs text-muted-foreground">
            Zero-trust architecture
          </p>
          <Badge variant="default" className="mt-2">
            Saúde Digital
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ComplianceDashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard LGPD - Conformidade
            </h1>
            <p className="text-muted-foreground">
              Monitoramento em tempo real da proteção de dados pessoais em ambiente médico
            </p>
          </div>
        </div>
        
        {/* Compliance status badges */}
        <div className="flex items-center space-x-2 pt-2">
          <Badge variant="default" className="bg-green-600">
            ✓ LGPD Compliant
          </Badge>
          <Badge variant="outline">
            ✓ ANVISA Medical Software
          </Badge>
          <Badge variant="outline">
            ✓ PCI DSS Level 1
          </Badge>
          <Badge variant="outline">
            ✓ ISO 27001
          </Badge>
        </div>
      </div>

      {/* Compliance Overview */}
      <ComplianceOverview />

      {/* Main Dashboard */}
      <Suspense fallback={<DashboardLoading />}>
        <ComplianceMonitoringDashboard className="space-y-6" />
      </Suspense>

      {/* Footer Information */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Proteção de Dados em Saúde</span>
          </CardTitle>
          <CardDescription>
            Informações sobre conformidade e proteção de dados pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Conformidade LGPD</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Consentimento explícito para todos os dados coletados</li>
                <li>• Direito de acesso, retificação e exclusão garantidos</li>
                <li>• Pseudonimização e criptografia de dados sensíveis</li>
                <li>• Auditoria completa de acesso e modificações</li>
                <li>• Minimização e proporcionalidade na coleta</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Proteção Médica</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sigilo médico garantido por design</li>
                <li>• Compartilhamento controlado entre profissionais</li>
                <li>• Backup seguro e recuperação de desastres</li>
                <li>• Conformidade com regulamentações ANVISA</li>
                <li>• Proteção contra vazamentos e acessos não autorizados</li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>Nota:</strong> Este sistema foi desenvolvido em conformidade com a Lei Geral de Proteção de Dados (LGPD) 
              e regulamentações específicas para software médico da ANVISA. Todos os dados são tratados com o mais alto 
              nível de segurança e privacidade.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}