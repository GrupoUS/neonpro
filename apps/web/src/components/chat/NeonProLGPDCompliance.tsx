/**
 * NeonPro LGPD Compliance Components
 *
 * Comprehensive LGPD compliance system for chat interactions
 * Features:
 * - Data masking and anonymization
 * - Consent management
 * - Audit trail logging
 * - Data access controls
 * - Compliance reporting
 */

import React, { useCallback, useState } from 'react'
import { Alert, AlertDescription } from '../ui/alert'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge.js'
import { Button } from '../ui/button.js'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js'
import { Input } from '../ui/input.js'
import { Label } from '../ui/label.js'
// Removed unused Select imports
import {
  Shield,
  CheckCircle,
  Download,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Shield,
  Unlock,
  UserCheck,
} from 'lucide-react'

// Types
interface ConsentRecord {
  id: string
  userId: string
  patientId?: string
  consentType: 'data_processing' | 'marketing' | 'sharing' | 'storage'
  purpose: string
  scope: string[]
  grantedAt: Date
  expiresAt?: Date
  revokedAt?: Date
  ipAddress: string
  userAgent: string
  version: string
}

interface AuditLog {
  id: string
  timestamp: Date
  userId: string
  action: string
  resource: string
  details: Record<string, any>
  ipAddress: string
  complianceLevel: 'standard' | 'enhanced' | 'restricted'
  outcome: 'success' | 'failure' | 'blocked'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface DataSubject {
  id: string
  name: string
  contact: string
  contactType: 'email' | 'phone'
  dataCategories: string[]
  retentionPolicy: {
    duration: number // days
    automaticDeletion: boolean
  }
  consentRecords: ConsentRecord[]
  accessRequests: Array<{
    id: string
    requestedAt: Date
    fulfilledAt?: Date
    status: 'pending' | 'fulfilled' | 'denied'
    purpose: string
  }>
}

interface ComplianceMetrics {
  totalConsents: number
  activeConsents: number
  expiredConsents: number
  auditEvents: number
  complianceScore: number
  dataRetentionScore: number
  accessRequestScore: number
  riskLevel: 'low' | 'medium' | 'high'
}

interface LGPDComplianceProps {
  clinicId: string
  userId: string
  userRole: 'admin' | 'aesthetician' | 'coordinator' | 'receptionist'
  onComplianceAction?: (action: string, data: any) => void
}

// Mock data for demonstration
const mockDataSubjects: DataSubject[] = [
  {
    id: 'patient-1',
    name: 'Ana Silva Santos',
    contact: 'ana.santos@email.com',
    contactType: 'email',
    dataCategories: ['personal', 'medical', 'financial', 'treatment'],
    retentionPolicy: {
      duration: 3650, // 10 years
      automaticDeletion: true,
    },
    consentRecords: [
      {
        id: 'consent-1',
        userId: 'user-1',
        patientId: 'patient-1',
        consentType: 'data_processing',
        purpose: 'Tratamento médico e agendamento de consultas',
        scope: ['personal_data', 'medical_data'],
        grantedAt: new Date('2024-01-15'),
        expiresAt: new Date('2027-01-15'),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Web App)',
        version: '1.0',
      },
    ],
    accessRequests: [],
  },
]

export const NeonProLGPDCompliance: React.FC<LGPDComplianceProps> = ({
  clinicId: _clinicId,
  userId,
  userRole: _userRole,
  onComplianceAction,
}) => {
  const [showSensitiveData, setShowSensitiveData] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<DataSubject | null>(null)
  const [consentForm, setConsentForm] = useState({
    purpose: '',
    scope: [] as string[],
    duration: 365,
  })
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [metrics, setMetrics] = useState<ComplianceMetrics>(calculateComplianceMetrics())

  // Calculate compliance metrics
  const calculateComplianceMetrics = useCallback((): ComplianceMetrics => {
    const totalConsents = mockDataSubjects.reduce(
      (sum, subject) => sum + subject.consentRecords.length,
      0,
    )

    const activeConsents = mockDataSubjects.reduce(
      (sum, subject) =>
        sum +
        subject.consentRecords.filter(c =>
          !c.revokedAt && (!c.expiresAt || c.expiresAt > new Date())
        ).length,
      0,
    )

    const expiredConsents = mockDataSubjects.reduce(
      (sum, subject) =>
        sum + subject.consentRecords.filter(c => c.expiresAt && c.expiresAt <= new Date()).length,
      0,
    )

    const complianceScore = Math.min(100, (activeConsents / Math.max(totalConsents, 1)) * 100)
    const dataRetentionScore = 95 // Mock score
    const accessRequestScore = 100 // Mock score

    const riskLevel: 'low' | 'medium' | 'high' = complianceScore >= 90
      ? 'low'
      : complianceScore >= 70
      ? 'medium'
      : 'high'

    return {
      totalConsents,
      activeConsents,
      expiredConsents,
      auditEvents: auditLogs.length,
      complianceScore,
      dataRetentionScore,
      accessRequestScore,
      riskLevel,
    }
  }, [auditLogs.length])

  // Mask sensitive data
  const maskSensitiveData = useCallback((data: string, dataType: string): string => {
    if (showSensitiveData) return data

    switch (dataType) {
      case 'email':
        const [username, domain] = data.split('@')
        return `${username.substring(0, 2)}***@${domain}`

      case 'phone':
        return data.replace(/\d(?=\d{3})/g, '*')

      case 'name':
        return `${data.split(' ')[0]} ${'*'.repeat(data.split(' ').length - 1)}`

      case 'cpf':
        return `***.${data.slice(3, 7)}.**`

      default:
        return data.replace(/./g, '*')
    }
  }, [showSensitiveData])

  // Log audit event
  const logAuditEvent = useCallback((
    action: string,
    resource: string,
    details: Record<string, any>,
    outcome: 'success' | 'failure' | 'blocked' = 'success',
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low',
  ) => {
    const auditEvent: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
      userId,
      action,
      resource,
      details,
      ipAddress: '127.0.0.1', // In real implementation, get from request
      complianceLevel: details.complianceLevel || 'standard',
      outcome,
      riskLevel,
    }

    setAuditLogs(prev => [...prev, auditEvent])
    setMetrics(calculateComplianceMetrics())

    onComplianceAction?.('audit_log', auditEvent)
  }, [userId, onComplianceAction, calculateComplianceMetrics])

  // Handle consent grant
  const handleGrantConsent = useCallback(async () => {
    if (!selectedSubject || !consentForm.purpose || consentForm.scope.length === 0) {
      return
    }

    try {
      logAuditEvent('consent_granted', 'data_consent', {
        patientId: selectedSubject.id,
        purpose: consentForm.purpose,
        scope: consentForm.scope,
        duration: consentForm.duration,
      })

      // In real implementation, this would save to database
      const newConsent: ConsentRecord = {
        id: `consent-${Date.now()}`,
        userId,
        patientId: selectedSubject.id,
        consentType: 'data_processing',
        purpose: consentForm.purpose,
        scope: consentForm.scope,
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + consentForm.duration * 24 * 60 * 60 * 1000),
        ipAddress: '127.0.0.1',
        userAgent: 'NeonPro Web App',
        version: '1.0',
      }

      selectedSubject.consentRecords.push(newConsent)
      setConsentForm({ purpose: '', scope: [], duration: 365 })

      // Update metrics
      setMetrics(calculateComplianceMetrics())
    } catch (error) {
      logAuditEvent(
        'consent_failed',
        'data_consent',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'failure',
        'medium',
      )
    }
  }, [selectedSubject, consentForm, userId, logAuditEvent, calculateComplianceMetrics])

  // Handle data access request
  const handleDataAccessRequest = useCallback(async (subjectId: string, purpose: string) => {
    try {
      logAuditEvent('data_access_requested', 'patient_data', {
        patientId: subjectId,
        purpose,
      })

      const subject = mockDataSubjects.find(s => s.id === subjectId)
      if (subject) {
        const accessRequest = {
          id: `access-${Date.now()}`,
          requestedAt: new Date(),
          fulfilledAt: new Date(),
          status: 'fulfilled' as const,
          purpose,
        }

        subject.accessRequests.push(accessRequest)
      }
    } catch (error) {
      logAuditEvent(
        'data_access_failed',
        'patient_data',
        {
          patientId: subjectId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'failure',
        'high',
      )
    }
  }, [logAuditEvent])

  // Handle data export
  const handleDataExport = useCallback(async (subjectId: string) => {
    try {
      logAuditEvent('data_exported', 'patient_data', {
        patientId: subjectId,
        format: 'json',
        compressed: true,
      })

      const subject = mockDataSubjects.find(s => s.id === subjectId)
      if (subject) {
        const exportData = {
          patient: {
            id: subject.id,
            name: maskSensitiveData(subject.name, 'name'),
            contact: maskSensitiveData(subject.contact, subject.contactType),
            dataCategories: subject.dataCategories,
          },
          consents: subject.consentRecords.map(consent => ({
            id: consent.id,
            type: consent.consentType,
            purpose: consent.purpose,
            grantedAt: consent.grantedAt.toISOString(),
            expiresAt: consent.expiresAt?.toISOString(),
          })),
          exportedAt: new Date().toISOString(),
          exportedBy: userId,
          version: '1.0',
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `lgpd-export-${subjectId}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      logAuditEvent(
        'data_export_failed',
        'patient_data',
        {
          patientId: subjectId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'failure',
        'high',
      )
    }
  }, [userId, logAuditEvent, maskSensitiveData])

  // Handle data deletion
  const _handleDataDeletion = useCallback(async (subjectId: string) => {
    try {
      logAuditEvent(
        'data_deletion_requested',
        'patient_data',
        {
          patientId: subjectId,
          reason: 'user_request',
        },
        'success',
        'high',
      )

      // In real implementation, this would trigger anonymization process
      const subject = mockDataSubjects.find(s => s.id === subjectId)
      if (subject) {
        subject.name = 'REDACTED'
        subject.contact = 'REDACTED'
        subject.consentRecords = []
      }
    } catch (error) {
      logAuditEvent(
        'data_deletion_failed',
        'patient_data',
        {
          patientId: subjectId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'failure',
        'critical',
      )
    }
  }, [logAuditEvent])

  // Get risk level color
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'critical':
        return 'bg-red-200 text-red-900'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className='space-y-6'>
      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            LGPD Compliance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {metrics.complianceScore.toFixed(1)}%
              </div>
              <div className='text-sm text-gray-600'>Score Compliance</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>{metrics.activeConsents}</div>
              <div className='text-sm text-gray-600'>Consentimentos Ativos</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>{metrics.auditEvents}</div>
              <div className='text-sm text-gray-600'>Eventos de Auditoria</div>
            </div>
            <div className='text-center'>
              <Badge className={getRiskLevelColor(metrics.riskLevel)}>
                {metrics.riskLevel === 'low'
                  ? 'Baixo Risco'
                  : metrics.riskLevel === 'medium'
                  ? 'Médio Risco'
                  : 'Alto Risco'}
              </Badge>
              <div className='text-sm text-gray-600 mt-1'>Nível de Risco</div>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {showSensitiveData
                ? <Unlock className='h-4 w-4 text-yellow-600' />
                : <Lock className='h-4 w-4 text-green-600' />}
              <span className='text-sm'>
                Dados sensíveis {showSensitiveData ? 'visíveis' : 'mascarados'}
              </span>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowSensitiveData(!showSensitiveData)}
            >
              {showSensitiveData
                ? <EyeOff className='h-4 w-4 mr-2' />
                : <Eye className='h-4 w-4 mr-2' />}
              {showSensitiveData ? 'Ocultar Dados' : 'Mostrar Dados'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Subjects Management */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <UserCheck className='h-4 w-4' />
            Gestão de Titulares de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {mockDataSubjects.map(subject => (
              <div key={subject.id} className='border rounded-lg p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <div>
                    <h3 className='font-medium'>
                      {maskSensitiveData(subject.name, 'name')}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      {maskSensitiveData(subject.contact, subject.contactType)}
                    </p>
                    <div className='flex gap-2 mt-1'>
                      {subject.dataCategories.map(category => (
                        <Badge key={category} variant='outline' className='text-xs'>
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setSelectedSubject(subject)}
                    >
                      Gerenciar
                    </Button>
                  </div>
                </div>

                {/* Consent Records */}
                <div className='mt-3'>
                  <h4 className='text-sm font-medium mb-2'>
                    Consentimentos ({subject.consentRecords.length})
                  </h4>
                  {subject.consentRecords.map(consent => (
                    <div key={consent.id} className='bg-gray-50 p-2 rounded text-xs'>
                      <div className='flex justify-between'>
                        <span className='font-medium'>{consent.consentType}</span>
                        <Badge
                          variant={!consent.revokedAt &&
                              (!consent.expiresAt || consent.expiresAt > new Date())
                            ? 'default'
                            : 'secondary'}
                          className='text-xs'
                        >
                          {!consent.revokedAt &&
                              (!consent.expiresAt || consent.expiresAt > new Date())
                            ? 'Ativo'
                            : 'Expirado'}
                        </Badge>
                      </div>
                      <p className='text-gray-600 mt-1'>{consent.purpose}</p>
                      <p className='text-gray-500'>
                        Concedido em {consent.grantedAt.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consent Management */}
      {selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Gerenciar Consentimento - {maskSensitiveData(selectedSubject.name, 'name')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='purpose'>Finalidade do Tratamento</Label>
              <Textarea
                id='purpose'
                value={consentForm.purpose}
                onChange={e => setConsentForm(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder='Descreva a finalidade do tratamento de dados...'
                rows={3}
              />
            </div>

            <div>
              <Label>Escopo dos Dados</Label>
              <div className='grid grid-cols-2 gap-2 mt-2'>
                {[
                  'personal_data',
                  'medical_data',
                  'financial_data',
                  'contact_data',
                  'treatment_data',
                ].map(scope => (
                  <label key={scope} className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={consentForm.scope.includes(scope)}
                      onChange={e => {
                        if (e.target.checked) {
                          setConsentForm(prev => ({
                            ...prev,
                            scope: [...prev.scope, scope],
                          }))
                        } else {
                          setConsentForm(prev => ({
                            ...prev,
                            scope: prev.scope.filter(s => s !== scope),
                          }))
                        }
                      }}
                    />
                    <span className='text-sm'>
                      {scope === 'personal_data'
                        ? 'Dados Pessoais'
                        : scope === 'medical_data'
                        ? 'Dados Médicos'
                        : scope === 'financial_data'
                        ? 'Dados Financeiros'
                        : scope === 'contact_data'
                        ? 'Dados de Contato'
                        : scope === 'treatment_data'
                        ? 'Dados de Tratamento'
                        : scope}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor='duration'>Duração (dias)</Label>
              <Input
                id='duration'
                type='number'
                value={consentForm.duration}
                onChange={e =>
                  setConsentForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                min='1'
                max='3650'
              />
            </div>

            <div className='flex gap-2'>
              <Button onClick={handleGrantConsent}>
                <CheckCircle className='h-4 w-4 mr-2' />
                Conceder Consentimento
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  handleDataAccessRequest(selectedSubject.id, 'Access request for compliance')}
              >
                <Eye className='h-4 w-4 mr-2' />
                Solicitar Acesso
              </Button>
              <Button
                variant='outline'
                onClick={() => handleDataExport(selectedSubject.id)}
              >
                <Download className='h-4 w-4 mr-2' />
                Exportar Dados
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Audit className='h-4 w-4' />
            Log de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 max-h-96 overflow-y-auto'>
            {auditLogs.length === 0
              ? (
                <p className='text-gray-500 text-center py-4'>
                  Nenhum evento de auditoria registrado
                </p>
              )
              : (
                auditLogs.slice(-20).reverse().map(log => (
                  <div key={log.id} className='flex items-center gap-3 p-3 border rounded'>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        log.outcome === 'success'
                          ? 'bg-green-500'
                          : log.outcome === 'failure'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                      }`}
                    />
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <span className='font-medium text-sm'>{log.action}</span>
                        <span className='text-xs text-gray-500'>
                          {log.timestamp.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className='text-xs text-gray-600'>{log.resource}</p>
                      <div className='flex gap-2 mt-1'>
                        <Badge variant='outline' className='text-xs'>
                          {log.complianceLevel}
                        </Badge>
                        <Badge className={`text-xs ${getRiskLevelColor(log.riskLevel)}`}>
                          {log.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Alert */}
      <Alert>
        <Shield className='h-4 w-4' />
        <AlertDescription>
          <strong>LGPD Compliance:</strong>{' '}
          Este sistema está em conformidade com a Lei Geral de Proteção de Dados (Lei nº
          13.709/2018). Todas as operações com dados pessoais são registradas, monitoradas e
          protegidas conforme as exigências legais.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default NeonProLGPDCompliance
