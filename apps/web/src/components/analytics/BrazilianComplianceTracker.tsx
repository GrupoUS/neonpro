'use client'

/**
 * BrazilianComplianceTracker - Brazilian Healthcare Compliance Intelligence
 *
 * Comprehensive compliance tracking system for Brazilian healthcare regulations
 * including CFM, ANVISA, LGPD, ANS, and SUS integration with real-time monitoring.
 *
 * @version 1.0.0
 * @author NeonPro Healthcare AI Team
 */

import { Alert, AlertDescription, } from '@/components/ui/alert'
import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card'
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
import type {
  BrazilianHealthcareIntelligence,
  BrazilianRegion,
  BrazilianState,
  ComplianceViolation,
} from '@/types/analytics'
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Flag,
  Heart,
  Lock,
  Pill,
  RefreshCw,
  Shield,
  Stethoscope,
  Target,
} from 'lucide-react'
import React, { useCallback, useMemo, useState, } from 'react'

// ====== MOCK COMPLIANCE DATA ======
const mockComplianceData: BrazilianHealthcareIntelligence = {
  clinicId: 'clinic-sp-001',
  region: 'sudeste',
  lastUpdated: new Date(),
  compliance: {
    cfmCompliance: {
      overallScore: 94,
      licenseValidation: 98,
      professionalEthics: 92,
      continuingEducation: 89,
      patientSafety: 96,
      lastAudit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000,),
      nextAudit: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000,),
      violations: [
        {
          id: 'cfm-001',
          type: 'professional_ethics',
          severity: 'minor',
          description: 'Atualização de educação continuada em atraso para 1 profissional',
          regulatoryFramework: 'CFM',
          detectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000,),
          responsiblePerson: 'Dr. João Silva',
          penaltyRisk: 15,
          evidenceFiles: ['certificate_pending.pdf',],
        },
      ],
    },
    anvisaCompliance: {
      overallScore: 91,
      controlledSubstances: 95,
      sanitaryLicense: 88,
      equipmentValidation: 89,
      adverseEventReporting: 93,
      lastInspection: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000,),
      nextInspection: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000,),
      violations: [],
    },
    lgpdCompliance: {
      overallScore: 87,
      dataProcessing: 89,
      consentManagement: 84,
      dataSubjectRights: 90,
      securityMeasures: 85,
      incidentResponse: 88,
      lastAssessment: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000,),
      nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000,),
      violations: [
        {
          id: 'lgpd-001',
          type: 'data_protection',
          severity: 'minor',
          description:
            'Política de retenção de dados necessita atualização para novos procedimentos',
          regulatoryFramework: 'LGPD',
          detectedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000,),
          responsiblePerson: 'Ana Santos - DPO',
          penaltyRisk: 25,
          evidenceFiles: ['retention_policy_v2.pdf',],
        },
      ],
    },
    susIntegration: {
      connected: true,
      dataExchangeActive: true,
      lastSyncDate: new Date(Date.now() - 2 * 60 * 60 * 1000,),
      integrationHealth: 94,
      pendingUpdates: 3,
      errorCount: 1,
      performanceMetrics: {
        averageResponseTime: 1200,
        successRate: 98.5,
        dataAccuracy: 99.2,
        uptime: 99.8,
      },
    },
    ansConnectivity: {
      connected: true,
      lastVerification: new Date(Date.now() - 4 * 60 * 60 * 1000,),
      beneficiaryValidation: 97,
      coverageVerification: 95,
      authorizationProcessing: 92,
      networkStatus: 'active',
    },
  },
  demographics: {
    populationHealth: {
      regionalHealthIndex: 78,
      commonConditions: ['Hipertensão', 'Diabetes', 'Obesidade', 'Ansiedade',],
      ageDistribution: { '18-30': 25, '31-45': 35, '46-60': 28, '60+': 12, },
      socioeconomicProfile: 'middle_upper',
      healthLiteracy: 72,
    },
    regionalTrends: {
      aestheticProcedures: { trend: 'increasing', growth: 15.2, },
      preventiveCare: { trend: 'stable', growth: 2.1, },
      emergencyVisits: { trend: 'decreasing', growth: -8.5, },
      patientSatisfaction: { trend: 'increasing', growth: 7.3, },
    },
    culturalFactors: {
      treatmentPreferences: [
        'Minimally invasive procedures',
        'Natural results',
        'Quick recovery',
      ],
      communicationStyle: 'Direct with emotional support',
      familyInvolvement: 'High',
      religiousConsiderations: 'Moderate',
    },
    socioeconomicIndicators: {
      averageIncome: 8500,
      insuranceCoverage: 85,
      healthcareAccess: 'Good',
      digitalLiteracy: 78,
    },
    epidemiologicalData: {
      prevalentConditions: [
        { condition: 'Acne/Manchas', prevalence: 45, trend: 'stable', },
        {
          condition: 'Envelhecimento facial',
          prevalence: 38,
          trend: 'increasing',
        },
        { condition: 'Celulite/Flacidez', prevalence: 52, trend: 'increasing', },
        { condition: 'Calvície/Alopecia', prevalence: 28, trend: 'increasing', },
      ],
      seasonalPatterns: [
        {
          period: 'Verão',
          procedures: ['Depilação laser', 'Tratamentos corporais',],
        },
        { period: 'Inverno', procedures: ['Peelings', 'Tratamentos faciais',], },
      ],
    },
  },
  benchmarking: {
    regionalBenchmarks: {
      averageComplianceScore: 89,
      topPerformers: ['Clinic A', 'Clinic B', 'Clinic C',],
      industryStandards: {
        cfmScore: 92,
        anvisaScore: 88,
        lgpdScore: 85,
        overallScore: 88,
      },
    },
    nationalAverages: {
      cfmCompliance: 87,
      anvisaCompliance: 84,
      lgpdCompliance: 81,
      overallCompliance: 84,
    },
    peerComparison: {
      ranking: 12,
      totalClinics: 156,
      percentile: 92,
      competitiveAdvantage: [
        'High LGPD compliance',
        'Excellence in patient safety',
        'Strong professional ethics',
      ],
    },
    performanceRanking: {
      stateRanking: 5,
      regionalRanking: 8,
      nationalRanking: 43,
      improvement: 'Moved up 7 positions this quarter',
    },
  },
  regulations: {
    activeRegulations: [
      {
        id: 'cfm-res-2217',
        title: 'Resolução CFM nº 2.217/2018',
        category: 'Ética Médica',
        effectiveDate: new Date('2018-09-27',),
        lastUpdate: new Date('2023-06-15',),
        complianceStatus: 'compliant',
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000,),
      },
      {
        id: 'anvisa-rdc-302',
        title: 'RDC ANVISA nº 302/2005',
        category: 'Serviços de Saúde',
        effectiveDate: new Date('2005-10-13',),
        lastUpdate: new Date('2022-11-10',),
        complianceStatus: 'compliant',
        nextReview: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000,),
      },
    ],
    complianceRequirements: [
      {
        id: 'req-001',
        title: 'Certificação de Profissionais',
        category: 'CFM',
        priority: 'high',
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000,),
        status: 'in_progress',
        completionRate: 75,
      },
      {
        id: 'req-002',
        title: 'Atualização LGPD - Consentimento',
        category: 'LGPD',
        priority: 'medium',
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000,),
        status: 'pending',
        completionRate: 30,
      },
    ],
    auditSchedule: [
      {
        id: 'audit-001',
        type: 'CFM',
        scheduledDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000,),
        auditor: 'Conselho Regional de Medicina de São Paulo',
        scope: 'Ética profissional e qualidade assistencial',
        preparationStatus: 'scheduled',
      },
    ],
    violationRisks: [
      {
        category: 'LGPD',
        riskLevel: 'medium',
        probability: 0.25,
        potentialPenalty: 50_000,
        mitigationActions: [
          'Atualizar política de dados',
          'Treinar equipe',
          'Implementar novos controles',
        ],
      },
    ],
  },
}

const brazilianStates: {
  code: BrazilianState
  name: string
  region: BrazilianRegion
}[] = [
  { code: 'SP', name: 'São Paulo', region: 'sudeste', },
  { code: 'RJ', name: 'Rio de Janeiro', region: 'sudeste', },
  { code: 'MG', name: 'Minas Gerais', region: 'sudeste', },
  { code: 'ES', name: 'Espírito Santo', region: 'sudeste', },
  { code: 'PR', name: 'Paraná', region: 'sul', },
  { code: 'SC', name: 'Santa Catarina', region: 'sul', },
  { code: 'RS', name: 'Rio Grande do Sul', region: 'sul', },
  { code: 'BA', name: 'Bahia', region: 'nordeste', },
  { code: 'PE', name: 'Pernambuco', region: 'nordeste', },
  { code: 'CE', name: 'Ceará', region: 'nordeste', },
]

interface BrazilianComplianceTrackerProps {
  clinicId: string
  region?: BrazilianRegion
  autoRefresh?: boolean
  refreshInterval?: number
}

export default function BrazilianComplianceTracker({
  clinicId,
  region,
  autoRefresh = true,
  refreshInterval = 300, // 5 minutes
}: BrazilianComplianceTrackerProps,) {
  // ====== STATE MANAGEMENT ======
  const [complianceData, setComplianceData,] = useState<BrazilianHealthcareIntelligence>(
    mockComplianceData,
  )
  const [selectedRegulation, setSelectedRegulation,] = useState<string>('all',)
  const [activeTab, setActiveTab,] = useState('overview',)
  const [isLoading, setIsLoading,] = useState(false,)
  const [lastRefresh, setLastRefresh,] = useState(new Date(),)

  // ====== DATA HANDLERS ======
  const handleRefreshCompliance = useCallback(async () => {
    setIsLoading(true,)
    try {
      // Simulate API call for compliance data refresh
      await new Promise((resolve,) => setTimeout(resolve, 2000,))
      setLastRefresh(new Date(),)
      // In real implementation, fetch fresh compliance data
    } catch (error) {
      console.error('Failed to refresh compliance data:', error,)
    } finally {
      setIsLoading(false,)
    }
  }, [],)

  const handleExportReport = useCallback(
    (type: 'cfm' | 'anvisa' | 'lgpd' | 'complete',) => {
      const reportData = {
        clinic: clinicId,
        type,
        data: complianceData,
        exportedAt: new Date(),
      }

      const blob = new Blob([JSON.stringify(reportData, null, 2,),], {
        type: 'application/json',
      },)
      const url = URL.createObjectURL(blob,)
      const a = document.createElement('a',)
      a.href = url
      a.download = `compliance-report-${type}-${new Date().toISOString().split('T',)[0]}.json`
      a.click()
      URL.revokeObjectURL(url,)
    },
    [clinicId, complianceData,],
  )

  // ====== AUTO REFRESH ======
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) {
      return
    }

    const interval = setInterval(() => {
      handleRefreshCompliance()
    }, refreshInterval * 1000,)

    return () => clearInterval(interval,)
  }, [autoRefresh, refreshInterval, handleRefreshCompliance,],)

  // ====== COMPUTED VALUES ======
  const overallComplianceScore = useMemo(() => {
    const scores = [
      complianceData.compliance.cfmCompliance.overallScore,
      complianceData.compliance.anvisaCompliance.overallScore,
      complianceData.compliance.lgpdCompliance.overallScore,
    ]
    return Math.round(
      scores.reduce((sum, score,) => sum + score, 0,) / scores.length,
    )
  }, [complianceData.compliance,],)

  const complianceStatus = useMemo(() => {
    if (overallComplianceScore >= 95) {
      return {
        label: 'Excelente',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      }
    }
    if (overallComplianceScore >= 90) {
      return {
        label: 'Muito Bom',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      }
    }
    if (overallComplianceScore >= 80) {
      return {
        label: 'Bom',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
      }
    }
    return {
      label: 'Requer Atenção',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    }
  }, [overallComplianceScore,],)

  const totalViolations = useMemo(
    () =>
      complianceData.compliance.cfmCompliance.violations.length
      + complianceData.compliance.anvisaCompliance.violations.length
      + complianceData.compliance.lgpdCompliance.violations.length,
    [complianceData.compliance,],
  )

  const upcomingDeadlines = useMemo(
    () =>
      complianceData.regulations.complianceRequirements
        .filter(
          (req,) =>
            new Date(req.dueDate,).getTime() - Date.now()
              < 30 * 24 * 60 * 60 * 1000,
        ) // Next 30 days
        .sort(
          (a, b,) => new Date(a.dueDate,).getTime() - new Date(b.dueDate,).getTime(),
        ),
    [complianceData.regulations.complianceRequirements,],
  )

  const regionName = useMemo(() => {
    const regionNames = {
      norte: 'Norte',
      nordeste: 'Nordeste',
      'centro-oeste': 'Centro-Oeste',
      sudeste: 'Sudeste',
      sul: 'Sul',
      'distrito-federal': 'Distrito Federal',
    }
    return regionNames[complianceData.region]
  }, [complianceData.region,],)

  // ====== RENDER COMPONENTS ======
  const renderComplianceCard = (
    title: string,
    score: number,
    icon: React.ElementType,
    color: string,
    details: { label: string; value: number }[],
    violations: ComplianceViolation[],
  ) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'p-2 rounded-full',
                `bg-${color}-100 text-${color}-600`,
              )}
            >
              {React.createElement(icon, { className: 'h-5 w-5', },)}
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge
            variant={score >= 95
              ? 'default'
              : score >= 90
              ? 'secondary'
              : score >= 80
              ? 'outline'
              : 'destructive'}
          >
            {score >= 95
              ? 'Excelente'
              : score >= 90
              ? 'Muito Bom'
              : score >= 80
              ? 'Bom'
              : 'Crítico'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className={cn('text-4xl font-bold', `text-${color}-600`,)}>
              {score}%
            </div>
            <div className="text-sm text-muted-foreground">
              Score de Compliance
            </div>
            <Progress value={score} className="mt-2 h-3" />
          </div>

          <div className="space-y-2">
            {details.map((detail, index,) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {detail.label}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{detail.value}%</span>
                  <div className="w-16">
                    <Progress value={detail.value} className="h-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {violations.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {violations.length} violação{violations.length > 1 ? 'ões' : ''}{' '}
                detectada{violations.length > 1 ? 's' : ''}
              </AlertDescription>
            </Alert>
          )}

          <Button variant="outline" size="sm" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Ver Relatório Detalhado
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderViolationCard = (violation: ComplianceViolation,) => (
    <Card
      key={violation.id}
      className={cn(
        'border-l-4',
        violation.severity === 'critical'
          ? 'border-l-red-500 bg-red-50'
          : violation.severity === 'major'
          ? 'border-l-orange-500 bg-orange-50'
          : 'border-l-yellow-500 bg-yellow-50',
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle
              className={cn(
                'h-4 w-4',
                violation.severity === 'critical'
                  ? 'text-red-600'
                  : violation.severity === 'major'
                  ? 'text-orange-600'
                  : 'text-yellow-600',
              )}
            />
            <Badge
              variant={violation.severity === 'critical'
                ? 'destructive'
                : violation.severity === 'major'
                ? 'secondary'
                : 'outline'}
            >
              {violation.regulatoryFramework}
            </Badge>
          </div>
          <div className="text-right">
            <div
              className={cn(
                'text-sm font-medium',
                violation.penaltyRisk > 70
                  ? 'text-red-600'
                  : violation.penaltyRisk > 40
                  ? 'text-yellow-600'
                  : 'text-green-600',
              )}
            >
              Risco: {violation.penaltyRisk}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm font-medium">{violation.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Responsável:</span>
              <div className="font-medium">{violation.responsiblePerson}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Detectado:</span>
              <div className="font-medium">
                {new Date(violation.detectedAt,).toLocaleDateString('pt-BR',)}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button size="sm" variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              Ver Evidências
            </Button>
            <Button size="sm" variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Marcar como Resolvido
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderBenchmarkCard = (
    title: string,
    current: number,
    benchmark: number,
    position?: number,
  ) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold">{current}%</div>
              <div className="text-xs text-muted-foreground">Seu Score</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-muted-foreground">
                {benchmark}%
              </div>
              <div className="text-xs text-muted-foreground">
                Média Regional
              </div>
            </div>
          </div>

          <Progress
            value={(current / Math.max(current, benchmark,)) * 100}
            className="h-2"
          />

          <div className="flex justify-between items-center text-sm">
            <span
              className={cn(
                'font-medium',
                current > benchmark ? 'text-green-600' : 'text-red-600',
              )}
            >
              {current > benchmark ? '+' : ''}
              {current - benchmark} pts vs. média
            </span>
            {position && <Badge variant="outline">#{position}</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // ====== MAIN RENDER ======
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
            <Flag className="h-8 w-8 text-green-600" />
            <span>Compliance Brasileiro</span>
          </h1>
          <p className="text-muted-foreground">
            Sistema inteligente de compliance para regulamentações brasileiras de saúde
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            value={selectedRegulation}
            onValueChange={setSelectedRegulation}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar regulamentação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="cfm">CFM</SelectItem>
              <SelectItem value="anvisa">ANVISA</SelectItem>
              <SelectItem value="lgpd">LGPD</SelectItem>
              <SelectItem value="ans">ANS</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshCompliance}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin',)}
            />
            Atualizar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportReport('complete',)}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overall Compliance Status */}
      <Card
        className={cn(
          'relative overflow-hidden',
          complianceStatus.bgColor,
          'border-l-4 border-l-green-500',
        )}
      >
        <CardContent className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Shield className={cn('h-8 w-8', complianceStatus.color,)} />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  Score Geral: {overallComplianceScore}%
                </div>
                <div className="text-muted-foreground">
                  Status: {complianceStatus.label}
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Região: {regionName}</div>
              <div>
                Última atualização: {lastRefresh.toLocaleTimeString('pt-BR',)}
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {totalViolations}
                </div>
                <div className="text-xs text-muted-foreground">
                  Violações Ativas
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {upcomingDeadlines.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Prazos (30 dias)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  #{complianceData.benchmarking.peerComparison.ranking}
                </div>
                <div className="text-xs text-muted-foreground">
                  Ranking Regional
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Alerts */}
      {totalViolations > 0 && (
        <Alert className="border-l-4 border-l-red-500">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex justify-between items-center">
              <span>
                <strong>
                  {totalViolations} violação{totalViolations > 1 ? 'ões' : ''} de compliance
                </strong>{' '}
                requer{totalViolations === 1 ? '' : 'em'} atenção imediata
              </span>
              <Button size="sm" variant="destructive">
                Revisar Agora
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Compliance Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="cfm" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>CFM</span>
          </TabsTrigger>
          <TabsTrigger value="anvisa" className="flex items-center space-x-2">
            <Pill className="h-4 w-4" />
            <span>ANVISA</span>
          </TabsTrigger>
          <TabsTrigger value="lgpd" className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>LGPD</span>
          </TabsTrigger>
          <TabsTrigger
            value="benchmarks"
            className="flex items-center space-x-2"
          >
            <Target className="h-4 w-4" />
            <span>Benchmarks</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Compliance Scores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderComplianceCard(
              'CFM - Conselho Federal de Medicina',
              complianceData.compliance.cfmCompliance.overallScore,
              Stethoscope,
              'green',
              [
                {
                  label: 'Validação CRM',
                  value: complianceData.compliance.cfmCompliance.licenseValidation,
                },
                {
                  label: 'Ética Profissional',
                  value: complianceData.compliance.cfmCompliance.professionalEthics,
                },
                {
                  label: 'Educação Continuada',
                  value: complianceData.compliance.cfmCompliance.continuingEducation,
                },
                {
                  label: 'Segurança do Paciente',
                  value: complianceData.compliance.cfmCompliance.patientSafety,
                },
              ],
              complianceData.compliance.cfmCompliance.violations,
            )}

            {renderComplianceCard(
              'ANVISA - Vigilância Sanitária',
              complianceData.compliance.anvisaCompliance.overallScore,
              Pill,
              'blue',
              [
                {
                  label: 'Substâncias Controladas',
                  value: complianceData.compliance.anvisaCompliance
                    .controlledSubstances,
                },
                {
                  label: 'Licença Sanitária',
                  value: complianceData.compliance.anvisaCompliance.sanitaryLicense,
                },
                {
                  label: 'Validação Equipamentos',
                  value: complianceData.compliance.anvisaCompliance
                    .equipmentValidation,
                },
                {
                  label: 'Relatório Eventos Adversos',
                  value: complianceData.compliance.anvisaCompliance
                    .adverseEventReporting,
                },
              ],
              complianceData.compliance.anvisaCompliance.violations,
            )}

            {renderComplianceCard(
              'LGPD - Lei Geral de Proteção de Dados',
              complianceData.compliance.lgpdCompliance.overallScore,
              Lock,
              'purple',
              [
                {
                  label: 'Processamento Dados',
                  value: complianceData.compliance.lgpdCompliance.dataProcessing,
                },
                {
                  label: 'Gestão Consentimento',
                  value: complianceData.compliance.lgpdCompliance.consentManagement,
                },
                {
                  label: 'Direitos do Titular',
                  value: complianceData.compliance.lgpdCompliance.dataSubjectRights,
                },
                {
                  label: 'Medidas Segurança',
                  value: complianceData.compliance.lgpdCompliance.securityMeasures,
                },
              ],
              complianceData.compliance.lgpdCompliance.violations,
            )}
          </div>

          {/* Integration Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span>Integração SUS</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status da Conexão</span>
                    <Badge
                      variant={complianceData.compliance.susIntegration.connected
                        ? 'default'
                        : 'destructive'}
                    >
                      {complianceData.compliance.susIntegration.connected
                        ? 'Conectado'
                        : 'Desconectado'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Health Score</span>
                    <span className="font-medium">
                      {complianceData.compliance.susIntegration
                        .integrationHealth}
                      %
                    </span>
                  </div>
                  <Progress
                    value={complianceData.compliance.susIntegration.integrationHealth}
                    className="h-2"
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">
                        {complianceData.compliance.susIntegration
                          .pendingUpdates}
                      </div>
                      <div className="text-muted-foreground">Pendências</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">
                        {complianceData.compliance.susIntegration.errorCount}
                      </div>
                      <div className="text-muted-foreground">Erros</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <span>Conectividade ANS</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status da Rede</span>
                    <Badge variant="default">
                      {complianceData.compliance.ansConnectivity
                          .networkStatus === 'active'
                        ? 'Ativa'
                        : 'Inativa'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Validação Beneficiário</span>
                      <span className="font-medium">
                        {complianceData.compliance.ansConnectivity
                          .beneficiaryValidation}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Verificação Cobertura</span>
                      <span className="font-medium">
                        {complianceData.compliance.ansConnectivity
                          .coverageVerification}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Processamento Autorização</span>
                      <span className="font-medium">
                        {complianceData.compliance.ansConnectivity
                          .authorizationProcessing}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                  <span>Próximos Prazos de Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingDeadlines.map((req, index,) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{req.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {req.category} • Vencimento:{' '}
                          {new Date(req.dueDate,).toLocaleDateString('pt-BR',)}
                        </div>
                        <Progress
                          value={req.completionRate}
                          className="mt-2 h-2"
                        />
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={req.priority === 'high'
                            ? 'destructive'
                            : req.priority === 'medium'
                            ? 'secondary'
                            : 'outline'}
                        >
                          {req.priority === 'high'
                            ? 'Alta'
                            : req.priority === 'medium'
                            ? 'Média'
                            : 'Baixa'}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {Math.ceil(
                            (new Date(req.dueDate,).getTime() - Date.now())
                              / (24 * 60 * 60 * 1000),
                          )} dias
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cfm" className="space-y-6">
          <div className="text-center py-12">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">
              Detalhes CFM em Desenvolvimento
            </h3>
            <p className="text-muted-foreground">
              Detalhamento específico de compliance CFM será implementado na próxima fase
            </p>
          </div>
        </TabsContent>

        <TabsContent value="anvisa" className="space-y-6">
          <div className="text-center py-12">
            <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">
              Detalhes ANVISA em Desenvolvimento
            </h3>
            <p className="text-muted-foreground">
              Detalhamento específico de compliance ANVISA será implementado na próxima fase
            </p>
          </div>
        </TabsContent>

        <TabsContent value="lgpd" className="space-y-6">
          <div className="text-center py-12">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">
              Detalhes LGPD em Desenvolvimento
            </h3>
            <p className="text-muted-foreground">
              Detalhamento específico de compliance LGPD será implementado na próxima fase
            </p>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderBenchmarkCard(
              'CFM Score',
              complianceData.compliance.cfmCompliance.overallScore,
              complianceData.benchmarking.nationalAverages.cfmCompliance,
              complianceData.benchmarking.peerComparison.ranking,
            )}
            {renderBenchmarkCard(
              'ANVISA Score',
              complianceData.compliance.anvisaCompliance.overallScore,
              complianceData.benchmarking.nationalAverages.anvisaCompliance,
            )}
            {renderBenchmarkCard(
              'LGPD Score',
              complianceData.compliance.lgpdCompliance.overallScore,
              complianceData.benchmarking.nationalAverages.lgpdCompliance,
            )}
            {renderBenchmarkCard(
              'Score Geral',
              overallComplianceScore,
              complianceData.benchmarking.nationalAverages.overallCompliance,
              complianceData.benchmarking.performanceRanking.nationalRanking,
            )}
          </div>

          {/* Regional Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Regional - {regionName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    #
                    {complianceData.benchmarking.performanceRanking
                      .regionalRanking}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ranking Regional
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {complianceData.benchmarking.peerComparison.percentile}º
                  </div>
                  <div className="text-sm text-muted-foreground">Percentil</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {complianceData.benchmarking.peerComparison.totalClinics}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total de Clínicas
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Vantagens Competitivas</h4>
                <div className="space-y-2">
                  {complianceData.benchmarking.peerComparison.competitiveAdvantage.map(
                    (advantage, index,) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{advantage}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Violations Section */}
      {totalViolations > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Violações Ativas de Compliance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                ...complianceData.compliance.cfmCompliance.violations,
                ...complianceData.compliance.anvisaCompliance.violations,
                ...complianceData.compliance.lgpdCompliance.violations,
              ].map(renderViolationCard,)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
