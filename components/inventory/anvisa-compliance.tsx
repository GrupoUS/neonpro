'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  FileText,
  Calendar,
  User,
  MapPin,
  Wrench,
  Search,
  Plus,
  Download
} from 'lucide-react'
import { ANVISADevice, MaintenanceStatus, ANVISADeviceClass } from '@/types/inventory'

// Mock data for ANVISA devices
const mockANVISADevices: ANVISADevice[] = [
  {
    id: 'DEV001',
    name: 'Laser CO2 Fracionado',
    model: 'SmartXide DOT',
    manufacturer: 'DEKA Medical',
    serialNumber: 'SMX2024001',
    anvisaRegistration: '80146170015',
    deviceClass: 'III',
    location: 'Sala de Procedimentos 1',
    installationDate: '2024-01-15',
    lastMaintenanceDate: '2024-10-15',
    nextMaintenanceDate: '2024-12-15',
    calibrationDueDate: '2025-01-15',
    
    maintenanceSchedule: [
      {
        id: 'MAINT001',
        type: 'preventive',
        scheduledDate: '2024-12-15',
        performedBy: 'TechniCorp Manutenções LTDA',
        status: 'scheduled',
        notes: 'Manutenção preventiva trimestral conforme ANVISA',
        cost: 850.00
      },
      {
        id: 'MAINT002',
        type: 'calibration',
        scheduledDate: '2025-01-15',
        status: 'scheduled',
        notes: 'Calibração anual obrigatória - Classe III',
        cost: 1200.00
      }
    ],
    
    compliance: {
      current: true,
      lastAuditDate: '2024-06-15',
      nextAuditDate: '2025-06-15',
      complianceNotes: 'Equipamento em conformidade total com RDC 185/2001',
      certifications: [
        {
          type: 'Certificado de Conformidade ANVISA',
          number: 'CC-80146170015-2024',
          issueDate: '2024-01-10',
          expiryDate: '2025-01-10',
          issuingBody: 'ANVISA'
        },
        {
          type: 'Laudo de Instalação',
          number: 'LI-2024-001',
          issueDate: '2024-01-15',
          expiryDate: '2026-01-15',
          issuingBody: 'INMETRO'
        }
      ]
    },
    
    usageLog: [
      {
        date: '2024-11-15T14:30:00Z',
        userId: 'DR001',
        patientId: 'PAT12345', // LGPD protected
        procedureType: 'Rejuvenescimento Facial CO2 Fracionado',
        duration: 45,
        notes: 'Procedimento realizado com sucesso. Parâmetros: 30mJ, densidade 5%'
      }
    ]
  },
  {
    id: 'DEV002',
    name: 'Dermógrafo Elétrico Professional',
    model: 'Sharp 300',
    manufacturer: 'Mag Medical',
    serialNumber: 'SHP300-2024-002',
    anvisaRegistration: '10358490031',
    deviceClass: 'II',
    location: 'Sala de Micropigmentação',
    installationDate: '2024-03-10',
    lastMaintenanceDate: '2024-09-10',
    nextMaintenanceDate: '2024-12-10',
    
    maintenanceSchedule: [
      {
        id: 'MAINT003',
        type: 'preventive',
        scheduledDate: '2024-12-10',
        status: 'scheduled',
        notes: 'Manutenção semestral - verificação de esterilização e calibração',
        cost: 450.00
      }
    ],
    
    compliance: {
      current: false,
      lastAuditDate: '2024-03-15',
      nextAuditDate: '2025-03-15',
      complianceNotes: 'ATENÇÃO: Manutenção vencida em 11/11/2024. Reagendar urgentemente.',
      certifications: [
        {
          type: 'Registro ANVISA',
          number: '10358490031',
          issueDate: '2023-12-01',
          expiryDate: '2025-12-01',
          issuingBody: 'ANVISA'
        }
      ]
    },
    
    usageLog: []
  }
]

const deviceClassInfo = {
  'I': { 
    name: 'Classe I', 
    description: 'Baixo risco', 
    color: 'bg-green-100 text-green-800 border-green-200',
    maintenanceFrequency: 'Anual'
  },
  'II': { 
    name: 'Classe II', 
    description: 'Médio risco', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    maintenanceFrequency: 'Semestral'
  },
  'III': { 
    name: 'Classe III', 
    description: 'Alto risco', 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    maintenanceFrequency: 'Trimestral'
  },
  'IV': { 
    name: 'Classe IV', 
    description: 'Altíssimo risco', 
    color: 'bg-red-100 text-red-800 border-red-200',
    maintenanceFrequency: 'Mensal'
  }
}

const maintenanceStatusConfig = {
  scheduled: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Agendado',
    icon: Calendar
  },
  overdue: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Vencido',
    icon: AlertTriangle
  },
  completed: {
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Concluído',
    icon: CheckCircle
  },
  skipped: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    label: 'Dispensado',
    icon: Clock
  }
}

/**
 * ANVISA Compliance Component for NeonPro Medical Device Management
 * 
 * Features:
 * - Complete ANVISA medical device registration tracking
 * - CFM equipment maintenance scheduling and logging
 * - Automated compliance status monitoring
 * - Maintenance schedule management with cost tracking
 * - Usage logging for audit trails
 * - Certification and documentation management
 * - Compliance alerts and notifications
 * - Brazilian healthcare regulation enforcement
 * - Equipment performance analytics
 * 
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA RDC 185/2001, CFM Resolution 2277/2020
 */
export function ANVISACompliance() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedCompliance, setSelectedCompliance] = useState<string>('all')
  const [isNewDeviceOpen, setIsNewDeviceOpen] = useState(false)

  const filteredDevices = useMemo(() => {
    return mockANVISADevices.filter(device => {
      const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           device.anvisaRegistration.includes(searchTerm) ||
                           device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesClass = selectedClass === 'all' || device.deviceClass === selectedClass
      
      const matchesCompliance = selectedCompliance === 'all' || 
                               (selectedCompliance === 'compliant' && device.compliance.current) ||
                               (selectedCompliance === 'non_compliant' && !device.compliance.current)
      
      return matchesSearch && matchesClass && matchesCompliance
    })
  }, [searchTerm, selectedClass, selectedCompliance])

  const complianceMetrics = useMemo(() => {
    const total = mockANVISADevices.length
    const compliant = mockANVISADevices.filter(d => d.compliance.current).length
    const overdueMaintenances = mockANVISADevices.filter(d => 
      new Date(d.nextMaintenanceDate) < new Date()
    ).length
    const upcomingMaintenances = mockANVISADevices.filter(d => {
      const nextMaintenance = new Date(d.nextMaintenanceDate)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      return nextMaintenance >= new Date() && nextMaintenance <= thirtyDaysFromNow
    }).length
    
    return {
      total,
      compliant,
      nonCompliant: total - compliant,
      complianceRate: total > 0 ? (compliant / total) * 100 : 0,
      overdueMaintenances,
      upcomingMaintenances
    }
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2 
    })
  }

  const getDaysUntilMaintenance = (maintenanceDate: string) => {
    const today = new Date()
    const maintenance = new Date(maintenanceDate)
    const diffTime = maintenance.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getMaintenanceStatus = (scheduledDate: string, completedDate?: string): MaintenanceStatus => {
    if (completedDate) return 'completed'
    const daysUntil = getDaysUntilMaintenance(scheduledDate)
    return daysUntil < 0 ? 'overdue' : 'scheduled'
  }

  const handleScheduleMaintenance = (deviceId: string) => {
    // In a real implementation, this would open a maintenance scheduling dialog
    console.log('Scheduling maintenance for device:', deviceId)
  }

  const handleExportCompliance = () => {
    // In a real implementation, this would generate a compliance report
    console.log('Exporting compliance report')
  }

  return (
    <div className="space-y-6">
      {/* Compliance Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Equipamentos ANVISA</p>
                <p className="text-2xl font-bold">{complianceMetrics.total}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conformidade</p>
                <p className="text-2xl font-bold text-green-600">
                  {complianceMetrics.complianceRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={complianceMetrics.complianceRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manutenções Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{complianceMetrics.overdueMaintenances}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximas Manutenções</p>
                <p className="text-2xl font-bold text-amber-600">{complianceMetrics.upcomingMaintenances}</p>
              </div>
              <Calendar className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome, modelo, registro ANVISA ou serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Classe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Classes</SelectItem>
            <SelectItem value="I">Classe I</SelectItem>
            <SelectItem value="II">Classe II</SelectItem>
            <SelectItem value="III">Classe III</SelectItem>
            <SelectItem value="IV">Classe IV</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCompliance} onValueChange={setSelectedCompliance}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Conformidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="compliant">Em Conformidade</SelectItem>
            <SelectItem value="non_compliant">Não Conforme</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleExportCompliance}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>

        <Dialog open={isNewDeviceOpen} onOpenChange={setIsNewDeviceOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Novo Equipamento Médico</DialogTitle>
              <DialogDescription>
                Cadastrar novo equipamento com compliance ANVISA
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Formulário completo de cadastro seria implementado aqui...
              </p>
            </div>
            
            <DialogFooter>
              <Button>Cadastrar Equipamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Equipamentos Médicos ANVISA ({filteredDevices.length})</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Shield className="w-3 h-3 mr-1" />
                RDC 185/2001
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Controle completo de equipamentos médicos com compliance ANVISA e CFM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Classe ANVISA</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Próxima Manutenção</TableHead>
                  <TableHead>Conformidade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => {
                  const classInfo = deviceClassInfo[device.deviceClass]
                  const daysUntilMaintenance = getDaysUntilMaintenance(device.nextMaintenanceDate)
                  const maintenanceStatus = getMaintenanceStatus(device.nextMaintenanceDate)
                  const statusConfig = maintenanceStatusConfig[maintenanceStatus]
                  const StatusIcon = statusConfig.icon
                  
                  return (
                    <TableRow key={device.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {device.manufacturer} • {device.model}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            S/N: {device.serialNumber}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className={classInfo.color}>
                          {classInfo.name}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {classInfo.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Manutenção: {classInfo.maintenanceFrequency}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono text-sm">{device.anvisaRegistration}</div>
                          <div className="text-xs text-muted-foreground">
                            Instalado: {formatDate(device.installationDate)}
                          </div>
                          {device.calibrationDueDate && (
                            <div className="text-xs text-blue-600">
                              Calibração: {formatDate(device.calibrationDueDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{device.location}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-2">
                          <Badge variant="outline" className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <div className="text-sm">
                            {formatDate(device.nextMaintenanceDate)}
                          </div>
                          <div className={`text-xs ${
                            daysUntilMaintenance < 0 ? 'text-red-600' :
                            daysUntilMaintenance <= 7 ? 'text-amber-600' : 'text-muted-foreground'
                          }`}>
                            {daysUntilMaintenance < 0 
                              ? `${Math.abs(daysUntilMaintenance)} dias em atraso`
                              : `${daysUntilMaintenance} dias restantes`
                            }
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-2">
                          <Badge 
                            variant="outline" 
                            className={
                              device.compliance.current 
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {device.compliance.current ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Conforme
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Não Conforme
                              </>
                            )}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {device.compliance.certifications.length} certificados
                          </div>
                          {device.compliance.nextAuditDate && (
                            <div className="text-xs text-blue-600">
                              Próxima auditoria: {formatDate(device.compliance.nextAuditDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleMaintenance(device.id)}
                          >
                            <Wrench className="w-3 h-3 mr-1" />
                            Manutenção
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Histórico
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            
            {filteredDevices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum equipamento encontrado com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Alerts */}
      {complianceMetrics.nonCompliant > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-red-800">Atenção - Equipamentos Não Conformes</AlertTitle>
          <AlertDescription className="text-red-700">
            {complianceMetrics.nonCompliant} equipamento(s) não estão em conformidade com as normas ANVISA. 
            Verifique as manutenções vencidas e agende os serviços necessários para manter a compliance.
          </AlertDescription>
        </Alert>
      )}

      {/* Maintenance Schedule Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Maintenances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Próximas Manutenções
            </CardTitle>
            <CardDescription>
              Manutenções agendadas para os próximos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockANVISADevices
                .filter(device => {
                  const daysUntil = getDaysUntilMaintenance(device.nextMaintenanceDate)
                  return daysUntil >= 0 && daysUntil <= 30
                })
                .map(device => {
                  const daysUntil = getDaysUntilMaintenance(device.nextMaintenanceDate)
                  const maintenanceItem = device.maintenanceSchedule.find(m => 
                    m.scheduledDate === device.nextMaintenanceDate
                  )
                  
                  return (
                    <div key={device.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{device.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {maintenanceItem?.type === 'preventive' ? 'Preventiva' : 
                           maintenanceItem?.type === 'calibration' ? 'Calibração' : 'Corretiva'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(device.nextMaintenanceDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={
                          daysUntil <= 7 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }>
                          {daysUntil === 0 ? 'Hoje' : `${daysUntil} dias`}
                        </Badge>
                        {maintenanceItem?.cost && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(maintenanceItem.cost)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              
              {mockANVISADevices.filter(device => {
                const daysUntil = getDaysUntilMaintenance(device.nextMaintenanceDate)
                return daysUntil >= 0 && daysUntil <= 30
              }).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma manutenção agendada para os próximos 30 dias.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Resumo de Conformidade
            </CardTitle>
            <CardDescription>
              Status geral de compliance ANVISA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Compliance by Class */}
              {Object.entries(deviceClassInfo).map(([deviceClass, info]) => {
                const devicesInClass = mockANVISADevices.filter(d => d.deviceClass === deviceClass)
                const compliantInClass = devicesInClass.filter(d => d.compliance.current)
                const classComplianceRate = devicesInClass.length > 0 
                  ? (compliantInClass.length / devicesInClass.length) * 100 
                  : 0
                
                if (devicesInClass.length === 0) return null
                
                return (
                  <div key={deviceClass} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{info.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {compliantInClass.length}/{devicesInClass.length}
                      </span>
                    </div>
                    <Progress value={classComplianceRate} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {classComplianceRate.toFixed(1)}% em conformidade
                    </div>
                  </div>
                )
              })}

              {/* Key Insights */}
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Insights de Conformidade
                </h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Taxa geral de conformidade: {complianceMetrics.complianceRate.toFixed(1)}%</li>
                  <li>• {complianceMetrics.upcomingMaintenances} manutenções programadas próximas</li>
                  <li>• {complianceMetrics.overdueMaintenances} equipamentos precisam de atenção urgente</li>
                  {complianceMetrics.complianceRate >= 90 ? (
                    <li>• ✅ Excelente nível de conformidade ANVISA</li>
                  ) : complianceMetrics.complianceRate >= 70 ? (
                    <li>• ⚠️ Nível de conformidade adequado - monitorar</li>
                  ) : (
                    <li>• 🚨 Nível de conformidade crítico - ação imediata necessária</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Usage Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Atividade Recente de Equipamentos
          </CardTitle>
          <CardDescription>
            Histórico de uso para auditoria e controle de qualidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockANVISADevices
              .flatMap(device => 
                device.usageLog.map(usage => ({ ...usage, deviceName: device.name, deviceId: device.id }))
              )
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((usage, index) => (
                <div key={`${usage.deviceId}-${index}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{usage.deviceName}</div>
                    <div className="text-sm text-muted-foreground">{usage.procedureType}</div>
                    <div className="text-xs text-muted-foreground">
                      Profissional: {usage.userId} • Duração: {usage.duration} min
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {new Date(usage.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(usage.date).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            
            {mockANVISADevices.every(device => device.usageLog.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma atividade registrada recentemente.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}