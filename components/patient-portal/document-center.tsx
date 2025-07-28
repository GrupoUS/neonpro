"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Download, 
  FileText, 
  Calendar, 
  CreditCard,
  Search,
  Filter,
  Eye,
  Shield,
  Clock,
  User,
  Building,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import LoadingSpinner from "@/components/ui/loading-spinner"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Tipos de documentos brasileiros para clínicas estéticas
interface PatientDocument {
  id: string
  title: string
  type: 'receipt' | 'medical_report' | 'consent_form' | 'prescription' | 'invoice' | 'certificate'
  category: 'financial' | 'medical' | 'legal' | 'administrative'
  date: Date
  size: string
  format: 'PDF' | 'JPG' | 'PNG' | 'DOC'
  status: 'ready' | 'processing' | 'signed' | 'pending_signature'
  doctor?: string
  treatment?: string
  amount?: number
  encrypted: boolean
  accessCount: number
  expiryDate?: Date
  requiresPassword?: boolean
  lgpdCompliant: boolean
}

// Dados simulados de documentos do paciente
const mockDocuments: PatientDocument[] = [
  {
    id: '1',
    title: 'Recibo de Pagamento - Botox',
    type: 'receipt',
    category: 'financial',
    date: new Date('2024-01-15'),
    size: '245 KB',
    format: 'PDF',
    status: 'ready',
    treatment: 'Aplicação de Botox',
    amount: 1250.00,
    encrypted: true,
    accessCount: 3,
    lgpdCompliant: true
  },
  {
    id: '2',
    title: 'Relatório Médico - Preenchimento Facial',
    type: 'medical_report',
    category: 'medical',
    date: new Date('2024-01-10'),
    size: '1.2 MB',
    format: 'PDF',
    status: 'signed',
    doctor: 'Dra. Marina Silva',
    treatment: 'Preenchimento com Ácido Hialurônico',
    encrypted: true,
    accessCount: 1,
    expiryDate: new Date('2025-01-10'),
    lgpdCompliant: true
  },
  {
    id: '3',
    title: 'Termo de Consentimento - Peeling',
    type: 'consent_form',
    category: 'legal',
    date: new Date('2024-01-08'),
    size: '180 KB',
    format: 'PDF',
    status: 'signed',
    treatment: 'Peeling Químico',
    encrypted: true,
    accessCount: 2,
    lgpdCompliant: true
  },
  {
    id: '4',
    title: 'Fatura - Janeiro 2024',
    type: 'invoice',
    category: 'financial',
    date: new Date('2024-01-05'),
    size: '320 KB',
    format: 'PDF',
    status: 'ready',
    amount: 2850.00,
    encrypted: true,
    accessCount: 5,
    lgpdCompliant: true
  },
  {
    id: '5',
    title: 'Certificado de Conclusão - Tratamento',
    type: 'certificate',
    category: 'administrative',
    date: new Date('2023-12-20'),
    size: '95 KB',
    format: 'PDF',
    status: 'ready',
    treatment: 'Protocolo Anti-Idade Completo',
    encrypted: true,
    accessCount: 1,
    lgpdCompliant: true
  }
]export default function DocumentCenter() {
  const [documents, setDocuments] = useState<PatientDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    // Simular carregamento de documentos
    const timer = setTimeout(() => {
      setDocuments(mockDocuments)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filtrar documentos baseado nos critérios de busca
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || doc.type === filterType
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  // Simular download de documento
  const handleDownload = async (document: PatientDocument) => {
    setDownloading(document.id)
    
    // Simular processo de download seguro
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Incrementar contador de acesso (compliance LGPD)
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, accessCount: doc.accessCount + 1 }
          : doc
      )
    )
    
    setDownloading(null)
    // Em implementação real, iniciar download aqui
    console.log(`Downloading document: ${document.title}`)
  }

  // Simular visualização de documento
  const handlePreview = (document: PatientDocument) => {
    // Em implementação real, abrir preview seguro
    console.log(`Previewing document: ${document.title}`)
  }

  // Ícone baseado no tipo de documento
  const getDocumentIcon = (type: PatientDocument['type']) => {
    switch (type) {
      case 'receipt': return <CreditCard className="h-5 w-5 text-green-600" />
      case 'medical_report': return <FileText className="h-5 w-5 text-blue-600" />
      case 'consent_form': return <Shield className="h-5 w-5 text-purple-600" />
      case 'prescription': return <FileText className="h-5 w-5 text-orange-600" />
      case 'invoice': return <CreditCard className="h-5 w-5 text-red-600" />
      case 'certificate': return <FileText className="h-5 w-5 text-indigo-600" />
      default: return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  // Badge de status do documento
  const getStatusBadge = (status: PatientDocument['status']) => {
    switch (status) {
      case 'ready':
        return <Badge variant="outline" className="text-green-700 border-green-300">Disponível</Badge>
      case 'processing':
        return <Badge variant="outline" className="text-yellow-700 border-yellow-300">Processando</Badge>
      case 'signed':
        return <Badge variant="outline" className="text-blue-700 border-blue-300">Assinado</Badge>
      case 'pending_signature':
        return <Badge variant="outline" className="text-orange-700 border-orange-300">Aguardando Assinatura</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Carregando seus documentos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Central de Documentos</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Acesse com segurança todos os seus documentos médicos e financeiros. 
          Todos os downloads são registrados para conformidade com a LGPD.
        </p>
        
        {/* Informações de Segurança LGPD */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="text-gray-700 font-medium mb-1">Segurança e Privacidade</p>
              <ul className="text-gray-600 space-y-1">
                <li>• Todos os documentos são criptografados</li>
                <li>• Acessos são registrados conforme LGPD</li>
                <li>• Documentos médicos têm prazo de validade</li>
                <li>• Você pode solicitar exclusão de dados a qualquer momento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>      {/* Filtros e Busca */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtrar Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, tratamento ou médico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Tipo */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="receipt">Recibos</SelectItem>
                <SelectItem value="medical_report">Relatórios Médicos</SelectItem>
                <SelectItem value="consent_form">Termos de Consentimento</SelectItem>
                <SelectItem value="prescription">Prescrições</SelectItem>
                <SelectItem value="invoice">Faturas</SelectItem>
                <SelectItem value="certificate">Certificados</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por Categoria */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
                <SelectItem value="medical">Médico</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="administrative">Administrativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
              <p className="text-gray-600 text-center">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                  ? "Tente ajustar os filtros de busca."
                  : "Você ainda não possui documentos disponíveis."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Informações do Documento */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      {getDocumentIcon(document.type)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{document.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(document.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {document.format} • {document.size}
                          </div>
                          {document.doctor && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {document.doctor}
                            </div>
                          )}
                          {document.amount && (
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-4 w-4" />
                              R$ {document.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badges e Informações Adicionais */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {getStatusBadge(document.status)}
                      {document.encrypted && (
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          <Shield className="h-3 w-3 mr-1" />
                          Criptografado
                        </Badge>
                      )}
                      {document.lgpdCompliant && (
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          LGPD
                        </Badge>
                      )}
                      {document.expiryDate && (
                        <Badge variant="outline" className="text-orange-700 border-orange-300">
                          <Clock className="h-3 w-3 mr-1" />
                          Expira em {format(document.expiryDate, "dd/MM/yyyy")}
                        </Badge>
                      )}
                    </div>                    {/* Informações de Acesso LGPD */}
                    <div className="text-xs text-gray-500 mb-4">
                      Acessado {document.accessCount} {document.accessCount === 1 ? 'vez' : 'vezes'} • 
                      Último acesso registrado conforme LGPD
                    </div>

                    {/* Tratamento Relacionado */}
                    {document.treatment && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-700">Tratamento:</span>
                          <span className="text-gray-600">{document.treatment}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Visualizar */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreview(document)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>

                    {/* Download */}
                    <Button 
                      size="sm"
                      onClick={() => handleDownload(document)}
                      disabled={downloading === document.id || document.status === 'processing'}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {downloading === document.id ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Baixando...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Avisos Especiais */}
                {document.requiresPassword && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800 mb-1">Documento Protegido</p>
                        <p className="text-yellow-700">
                          Este documento requer senha para acesso. A senha foi enviada por SMS/email.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {document.expiryDate && document.expiryDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-800 mb-1">Documento Expirando</p>
                        <p className="text-orange-700">
                          Este documento expira em breve. Faça o download se necessário.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Informações Adicionais LGPD */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Seus Direitos LGPD</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p className="font-medium mb-1">Acesso aos Dados</p>
                  <p>Você pode acessar todos os seus documentos a qualquer momento.</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Correção de Dados</p>
                  <p>Solicite correção de informações incorretas em seus documentos.</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Exclusão de Dados</p>
                  <p>Solicite a exclusão de documentos quando permitido por lei.</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Portabilidade</p>
                  <p>Solicite o envio de seus dados para outro prestador de serviços.</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-700">
                  Para exercer seus direitos LGPD, entre em contato através da página de configurações 
                  ou envie um email para privacidade@neonpro.com.br
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}