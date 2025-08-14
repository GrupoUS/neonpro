'use client'

import { useState } from 'react'
import { 
  Shield, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  FileText,
  Database,
  Lock,
  Unlock,
  Settings,
  Trash2,
  Edit,
  Plus,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Audit Interfaces
interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: string
  action: string
  resource: string
  resourceId?: string
  details: string
  ip: string
  userAgent: string
  result: 'success' | 'failure' | 'warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'authentication' | 'data_access' | 'data_modification' | 'system' | 'security'
  compliance: string[]
  metadata?: any
}

interface SecurityEvent {
  id: string
  timestamp: string
  type: 'failed_login' | 'suspicious_activity' | 'unauthorized_access' | 'data_breach' | 'system_anomaly'
  userId?: string
  userName?: string
  ip: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  assignedTo?: string
}

interface ComplianceReport {
  id: string
  type: 'LGPD' | 'ANVISA' | 'CFM' | 'GENERAL'
  period: string
  generatedAt: string
  status: 'draft' | 'final' | 'submitted'
  findings: number
  violations: number
  recommendations: number
  score: number
}

// Action Categories
const actionCategories = [
  { id: 'authentication', name: 'Autenticação', icon: Lock, color: 'bg-blue-500' },
  { id: 'data_access', name: 'Acesso a Dados', icon: Eye, color: 'bg-green-500' },
  { id: 'data_modification', name: 'Modificação', icon: Edit, color: 'bg-yellow-500' },
  { id: 'system', name: 'Sistema', icon: Settings, color: 'bg-purple-500' },
  { id: 'security', name: 'Segurança', icon: Shield, color: 'bg-red-500' }
]

// Result Status Badge
const ResultStatusBadge = ({ result }: { result: string }) => {
  const statusConfig = {
    success: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    failure: { color: 'bg-red-100 text-red-800', icon: XCircle },
    warning: { color: 'bg-amber-100 text-amber-800', icon: AlertTriangle }
  }
  
  const config = statusConfig[result as keyof typeof statusConfig] || statusConfig.warning
  const Icon = config.icon
  
  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {result.charAt(0).toUpperCase() + result.slice(1)}
    </Badge>
  )
}

// Severity Badge
const SeverityBadge = ({ severity }: { severity: string }) => {
  const severityConfig = {
    low: { color: 'bg-gray-100 text-gray-800', label: 'Baixa' },
    medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Média' },
    high: { color: 'bg-orange-100 text-orange-800', label: 'Alta' },
    critical: { color: 'bg-red-100 text-red-800', label: 'Crítica' }
  }
  
  const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.low
  
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  )
}

// Audit Statistics Card
const AuditStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "bg-blue-600" 
}: {
  title: string
  value: string | number
  icon: any
  trend?: string
  color?: string
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Security Events Card
const SecurityEventsCard = ({ events }: { events: SecurityEvent[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        Eventos de Segurança Recentes
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {events.slice(0, 5).map(event => (
          <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              event.severity === 'critical' ? 'bg-red-500' :
              event.severity === 'high' ? 'bg-orange-500' :
              event.severity === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">{event.type.replace('_', ' ').toUpperCase()}</p>
                <SeverityBadge severity={event.severity} />
              </div>
              <p className="text-sm text-gray-700">{event.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>{event.ip}</span>
                <span>{new Date(event.timestamp).toLocaleString('pt-BR')}</span>
                {event.userName && <span>{event.userName}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// Compliance Reports Card
const ComplianceReportsCard = ({ reports }: { reports: ComplianceReport[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Relatórios de Conformidade
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {reports.map(report => (
          <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={`${
                  report.type === 'LGPD' ? 'text-purple-600 border-purple-600' :
                  report.type === 'ANVISA' ? 'text-green-600 border-green-600' :
                  report.type === 'CFM' ? 'text-blue-600 border-blue-600' :
                  'text-gray-600 border-gray-600'
                }`}>
                  {report.type}
                </Badge>
                <span className="text-sm font-medium">{report.period}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Score: {report.score}%</span>
                <span>{report.violations} violações</span>
                <span>{report.recommendations} recomendações</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// Mock Audit Data
const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-001',
    timestamp: '2025-01-14T10:30:00.000Z',
    userId: 'user-001',
    userName: 'Dra. Maria Santos',
    userRole: 'Médico',
    action: 'LOGIN_SUCCESS',
    resource: 'system',
    details: 'Successful login from desktop application',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    result: 'success',
    severity: 'low',
    category: 'authentication',
    compliance: ['LGPD', 'ISO27001'],
    metadata: { device: 'desktop', location: 'São Paulo, SP' }
  },
  {
    id: 'audit-002',
    timestamp: '2025-01-14T10:25:00.000Z',
    userId: 'user-001',
    userName: 'Dra. Maria Santos',
    userRole: 'Médico',
    action: 'PATIENT_RECORD_ACCESS',
    resource: 'patient_records',
    resourceId: 'patient-123',
    details: 'Accessed patient medical record for João Silva',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    result: 'success',
    severity: 'medium',
    category: 'data_access',
    compliance: ['LGPD', 'CFM'],
    metadata: { patientId: 'patient-123', recordType: 'medical' }
  },
  {
    id: 'audit-003',
    timestamp: '2025-01-14T10:20:00.000Z',
    userId: 'user-002',
    userName: 'Carlos Oliveira',
    userRole: 'Enfermeiro',
    action: 'PROCEDURE_EXECUTION',
    resource: 'procedures',
    resourceId: 'proc-456',
    details: 'Executed botox procedure for patient Ana Paula',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    result: 'success',
    severity: 'high',
    category: 'data_modification',
    compliance: ['ANVISA', 'CFM'],
    metadata: { procedureType: 'botox', duration: 45 }
  },
  {
    id: 'audit-004',
    timestamp: '2025-01-14T09:15:00.000Z',
    userId: 'unknown',
    userName: 'Unknown User',
    userRole: 'Unknown',
    action: 'LOGIN_FAILED',
    resource: 'system',
    details: 'Failed login attempt - invalid credentials',
    ip: '203.45.67.89',
    userAgent: 'Unknown',
    result: 'failure',
    severity: 'high',
    category: 'security',
    compliance: ['ISO27001'],
    metadata: { attempts: 3, blocked: true }
  }
]

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'sec-001',
    timestamp: '2025-01-14T09:15:00.000Z',
    type: 'failed_login',
    ip: '203.45.67.89',
    description: 'Multiple failed login attempts from external IP',
    severity: 'high',
    status: 'investigating',
    assignedTo: 'Security Team'
  },
  {
    id: 'sec-002',
    timestamp: '2025-01-13T22:30:00.000Z',
    type: 'suspicious_activity',
    userId: 'user-003',
    userName: 'Ana Ferreira',
    ip: '192.168.1.102',
    description: 'Unusual access pattern detected - late night database queries',
    severity: 'medium',
    status: 'resolved',
    assignedTo: 'IT Admin'
  },
  {
    id: 'sec-003',
    timestamp: '2025-01-12T15:45:00.000Z',
    type: 'system_anomaly',
    ip: 'internal',
    description: 'Unexpected system resource usage spike',
    severity: 'low',
    status: 'false_positive'
  }
]

const mockComplianceReports: ComplianceReport[] = [
  {
    id: 'comp-001',
    type: 'LGPD',
    period: 'Janeiro 2025',
    generatedAt: '2025-01-14T08:00:00.000Z',
    status: 'final',
    findings: 5,
    violations: 0,
    recommendations: 3,
    score: 98
  },
  {
    id: 'comp-002',
    type: 'ANVISA',
    period: 'Q4 2024',
    generatedAt: '2025-01-01T08:00:00.000Z',
    status: 'submitted',
    findings: 8,
    violations: 1,
    recommendations: 5,
    score: 92
  },
  {
    id: 'comp-003',
    type: 'CFM',
    period: 'Dezembro 2024',
    generatedAt: '2024-12-31T08:00:00.000Z',
    status: 'final',
    findings: 3,
    violations: 0,
    recommendations: 2,
    score: 96
  }
]

export default function AuditoriaPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('today')

  // Filter logs
  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity
    
    return matchesSearch && matchesCategory && matchesSeverity
  })

  // Calculate statistics
  const totalLogs = mockAuditLogs.length
  const successfulActions = mockAuditLogs.filter(log => log.result === 'success').length
  const securityEvents = mockSecurityEvents.length
  const openEvents = mockSecurityEvents.filter(event => event.status === 'open').length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Audit Header */}
      <header className="bg-gradient-to-r from-slate-700 to-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8" />
                Sistema de Auditoria
              </h1>
              <p className="text-slate-300 mt-1">
                Rastreamento completo • Conformidade regulatória • Segurança avançada
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Audit Statistics */}
      <div className="max-w-7xl mx-auto p-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AuditStatCard
            title="Total de Logs"
            value={totalLogs}
            icon={Activity}
            trend="+45 hoje"
            color="bg-blue-600"
          />
          <AuditStatCard
            title="Ações Bem-sucedidas"
            value={`${((successfulActions / totalLogs) * 100).toFixed(0)}%`}
            icon={CheckCircle}
            color="bg-green-600"
          />
          <AuditStatCard
            title="Eventos de Segurança"
            value={securityEvents}
            icon={AlertTriangle}
            trend={`${openEvents} em aberto`}
            color="bg-amber-600"
          />
          <AuditStatCard
            title="Score de Conformidade"
            value="95%"
            icon={Shield}
            trend="Excelente"
            color="bg-purple-600"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
            <TabsTrigger value="security">Eventos de Segurança</TabsTrigger>
            <TabsTrigger value="compliance">Conformidade</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>
          
          {/* Audit Logs Tab */}
          <TabsContent value="logs">
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {actionCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                    <SelectItem value="year">Este ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Logs Table */}
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Recurso</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Severidade</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map(log => {
                        const category = actionCategories.find(c => c.id === log.category)
                        const Icon = category?.icon || Activity
                        
                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">
                                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs">
                                    {log.userName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{log.userName}</p>
                                  <p className="text-xs text-gray-500">{log.userRole}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`${category?.color || 'bg-gray-500'} p-1 rounded`}>
                                  <Icon className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm">{log.action.replace('_', ' ')}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{log.resource}</span>
                              {log.resourceId && (
                                <p className="text-xs text-gray-500">ID: {log.resourceId}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <ResultStatusBadge result={log.result} />
                            </TableCell>
                            <TableCell>
                              <SeverityBadge severity={log.severity} />
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-mono">{log.ip}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Security Events Tab */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SecurityEventsCard events={mockSecurityEvents} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Segurança</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tentativas de Login Falhas (24h)</span>
                      <span className="font-medium text-red-600">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">IPs Bloqueados</span>
                      <span className="font-medium text-orange-600">2</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Eventos Críticos (7d)</span>
                      <span className="font-medium text-red-600">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taxa de Resolução</span>
                      <span className="font-medium text-green-600">95%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComplianceReportsCard reports={mockComplianceReports} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Status de Conformidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">LGPD</span>
                        <span className="text-sm text-green-600 font-medium">98%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">ANVISA</span>
                        <span className="text-sm text-blue-600 font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">CFM</span>
                        <span className="text-sm text-purple-600 font-medium">96%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">ISO 27001</span>
                        <span className="text-sm text-indigo-600 font-medium">94%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">Relatório Diário</h3>
                      <p className="text-sm text-gray-500">Atividades das últimas 24h</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-8 h-8 text-red-600" />
                    <div>
                      <h3 className="font-medium">Relatório de Segurança</h3>
                      <p className="text-sm text-gray-500">Eventos e anomalias</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-medium">Relatório de Conformidade</h3>
                      <p className="text-sm text-gray-500">LGPD, ANVISA, CFM</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Audit Footer */}
      <footer className="bg-white border-t p-6 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-600 border-green-600">
              Auditoria Ativa
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              ISO 27001
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              LGPD Compliant
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Logs retidos por 7 anos • Última auditoria: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </footer>
    </div>
  )
}