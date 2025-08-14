'use client'

import { useState } from 'react'
import { 
  Search, 
  Plus, 
  FileText, 
  Stethoscope, 
  Heart, 
  Shield, 
  Calendar, 
  Clock, 
  User,
  ChevronRight,
  Filter,
  Download,
  Eye
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

// FHIR R4 Compliant Interfaces
interface FHIRPatient {
  resourceType: "Patient"
  id: string
  identifier: Array<{
    system: string // CPF, RG, CNS
    value: string
  }>
  name: Array<{
    family: string
    given: string[]
  }>
  telecom: Array<{
    system: "phone" | "email"
    value: string
  }>
  birthDate: string // YYYY-MM-DD
  address: Array<{
    line: string[]
    city: string
    state: string
    postalCode: string
  }>
}

interface FHIREncounter {
  resourceType: "Encounter"
  id: string
  status: "planned" | "in-progress" | "finished"
  class: {
    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode"
    code: "AMB" | "EMER" | "IMP" // Ambulatory, Emergency, Inpatient
  }
  subject: {
    reference: string // "Patient/[id]"
  }
  period: {
    start: string // ISO datetime
    end?: string
  }
}

interface MedicalRecord {
  id: string
  patient: FHIRPatient
  encounter: FHIREncounter
  physician: {
    name: string
    crm: string
    specialty: string
  }
  chiefComplaint: string
  status: 'draft' | 'active' | 'pending-signature' | 'signed' | 'completed'
  lastModified: string
  complianceScore: number
  digitalSignature?: {
    signed: boolean
    timestamp?: string
    certificate?: string
  }
}

// Healthcare Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
    active: { color: 'bg-blue-100 text-blue-800', icon: Heart },
    'pending-signature': { color: 'bg-amber-100 text-amber-800', icon: Clock },
    signed: { color: 'bg-green-100 text-green-800', icon: Shield },
    completed: { color: 'bg-emerald-100 text-emerald-800', icon: Shield }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  const Icon = config.icon
  
  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </Badge>
  )
}

// Medical Statistics Card Component
const MedicalStatCard = ({ 
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

// Medical Timeline Component
const MedicalTimeline = ({ records }: { records: MedicalRecord[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Timeline Médico
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {records.slice(0, 5).map((record, index) => (
          <div key={record.id} className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              {index < 4 && <div className="w-px h-8 bg-gray-200 ml-1 mt-1"></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {record.patient.name[0].given[0]} {record.patient.name[0].family}
                </p>
                <StatusBadge status={record.status} />
              </div>
              <p className="text-sm text-gray-600">{record.chiefComplaint}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(record.lastModified).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// Mock FHIR-compliant data
const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'enc-001',
    patient: {
      resourceType: "Patient",
      id: "pat-001",
      identifier: [
        { system: "CPF", value: "123.456.789-00" },
        { system: "CNS", value: "123456789012345" }
      ],
      name: [{ family: "Silva", given: ["João", "Carlos"] }],
      telecom: [
        { system: "phone", value: "+55 11 99999-1234" },
        { system: "email", value: "joao.silva@email.com" }
      ],
      birthDate: "1985-03-15",
      address: [{
        line: ["Rua das Flores, 123"],
        city: "São Paulo",
        state: "SP",
        postalCode: "01234-567"
      }]
    },
    encounter: {
      resourceType: "Encounter",
      id: "enc-001",
      status: "finished",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "AMB"
      },
      subject: { reference: "Patient/pat-001" },
      period: {
        start: "2025-01-10T09:00:00.000Z",
        end: "2025-01-10T09:30:00.000Z"
      }
    },
    physician: {
      name: "Dr. Maria Santos",
      crm: "CRM/SP 123456",
      specialty: "Clínica Geral"
    },
    chiefComplaint: "Dor abdominal recorrente",
    status: 'signed',
    lastModified: "2025-01-10T09:30:00.000Z",
    complianceScore: 98,
    digitalSignature: {
      signed: true,
      timestamp: "2025-01-10T09:35:00.000Z",
      certificate: "ICP-Brasil A3"
    }
  },
  {
    id: 'enc-002',
    patient: {
      resourceType: "Patient",
      id: "pat-002",
      identifier: [
        { system: "CPF", value: "987.654.321-00" },
        { system: "CNS", value: "987654321098765" }
      ],
      name: [{ family: "Santos", given: ["Ana", "Paula"] }],
      telecom: [
        { system: "phone", value: "+55 11 98888-5678" },
        { system: "email", value: "ana.santos@email.com" }
      ],
      birthDate: "1992-07-22",
      address: [{
        line: ["Av. Paulista, 1000"],
        city: "São Paulo",
        state: "SP",
        postalCode: "01310-100"
      }]
    },
    encounter: {
      resourceType: "Encounter",
      id: "enc-002",
      status: "finished",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "AMB"
      },
      subject: { reference: "Patient/pat-002" },
      period: {
        start: "2025-01-12T14:00:00.000Z",
        end: "2025-01-12T14:45:00.000Z"
      }
    },
    physician: {
      name: "Dr. Carlos Oliveira",
      crm: "CRM/SP 789012",
      specialty: "Dermatologia"
    },
    chiefComplaint: "Check-up preventivo",
    status: 'pending-signature',
    lastModified: "2025-01-12T14:45:00.000Z",
    complianceScore: 95
  }
]

export default function ProntuariosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Filter records based on search and status
  const filteredRecords = mockMedicalRecords.filter(record => {
    const matchesSearch = 
      record.patient.name[0].given[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient.name[0].family.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const totalRecords = mockMedicalRecords.length
  const activeRecords = mockMedicalRecords.filter(r => r.status === 'active').length
  const pendingSignature = mockMedicalRecords.filter(r => r.status === 'pending-signature').length
  const avgCompliance = mockMedicalRecords.reduce((acc, r) => acc + r.complianceScore, 0) / mockMedicalRecords.length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Healthcare Header */}
      <header className="bg-blue-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Stethoscope className="w-8 h-8" />
                Sistema de Prontuários Eletrônicos
              </h1>
              <p className="text-blue-100 mt-1">
                FHIR R4 Compliant • CFM Certified • LGPD Compliant
              </p>
            </div>
            <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
              <Plus className="w-4 h-4 mr-2" />
              Novo Prontuário
            </Button>
          </div>
        </div>
      </header>

      {/* Medical Statistics */}
      <div className="max-w-7xl mx-auto p-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MedicalStatCard
            title="Prontuários Totais"
            value={totalRecords}
            icon={FileText}
            trend="+12% este mês"
            color="bg-blue-600"
          />
          <MedicalStatCard
            title="Prontuários Ativos"
            value={activeRecords}
            icon={Heart}
            trend="+5% esta semana"
            color="bg-green-600"
          />
          <MedicalStatCard
            title="Pendentes Assinatura"
            value={pendingSignature}
            icon={Clock}
            color="bg-amber-600"
          />
          <MedicalStatCard
            title="Compliance Score"
            value={`${avgCompliance.toFixed(1)}%`}
            icon={Shield}
            trend="Excelente"
            color="bg-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Records Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Prontuários Médicos
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por paciente ou queixa principal..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Queixa Principal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Última Modificação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {record.patient.name[0].given[0]} {record.patient.name[0].family}
                              </p>
                              <p className="text-sm text-gray-500">
                                CPF: {record.patient.identifier.find(i => i.system === 'CPF')?.value}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.physician.name}</p>
                            <p className="text-sm text-gray-500">{record.physician.crm}</p>
                          </div>
                        </TableCell>
                        <TableCell>{record.chiefComplaint}</TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              record.complianceScore >= 95 ? 'bg-green-500' :
                              record.complianceScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            {record.complianceScore}%
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(record.lastModified).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Medical Timeline */}
          <div>
            <MedicalTimeline records={mockMedicalRecords} />
          </div>
        </div>
      </div>

      {/* Healthcare Compliance Footer */}
      <footer className="bg-white border-t p-6 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              CFM Certified
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">
              ANVISA Compliant
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              LGPD Compliant
            </Badge>
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              FHIR R4
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Sistema homologado para uso em estabelecimentos de saúde
          </p>
        </div>
      </footer>
    </div>
  )
}