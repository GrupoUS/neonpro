'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  User, 
  Mail, 
  MessageSquare, 
  BarChart3, 
  Share2, 
  AlertTriangle,
  Download,
  Trash2,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface ConsentPreference {
  id: string
  title: string
  description: string
  enabled: boolean
  required: boolean
  category: 'essential' | 'communication' | 'analytics' | 'marketing'
}

interface DataRequest {
  id: string
  type: 'access' | 'portability' | 'deletion' | 'correction'
  status: 'pending' | 'processing' | 'completed'
  requestDate: string
  completionDate?: string
  description: string
}

const consentPreferences: ConsentPreference[] = [
  {
    id: '1',
    title: 'Processamento de Dados Médicos',
    description: 'Autoriza o processamento dos seus dados de saúde para prestação de cuidados médicos, diagnósticos e tratamentos.',
    enabled: true,
    required: true,
    category: 'essential'
  },
  {
    id: '2',
    title: 'Comunicações sobre Consultas',
    description: 'Permite o envio de lembretes de consultas, resultados de exames e orientações médicas via SMS, email ou WhatsApp.',
    enabled: true,
    required: false,
    category: 'communication'
  },
  {
    id: '3',
    title: 'Pesquisas de Satisfação',
    description: 'Autoriza o contato para pesquisas de qualidade e satisfação sobre os serviços prestados.',
    enabled: false,
    required: false,
    category: 'communication'
  },
  {
    id: '4',
    title: 'Análises e Estatísticas',
    description: 'Permite o uso anonimizado dos seus dados para análises estatísticas e melhoria dos serviços médicos.',
    enabled: true,
    required: false,
    category: 'analytics'
  },
  {
    id: '5',
    title: 'Campanhas Educativas',
    description: 'Autoriza o recebimento de materiais educativos sobre prevenção, saúde e bem-estar.',
    enabled: false,
    required: false,
    category: 'marketing'
  },
  {
    id: '6',
    title: 'Compartilhamento entre Profissionais',
    description: 'Permite o compartilhamento dos seus dados entre profissionais da clínica para coordenação do cuidado.',
    enabled: true,
    required: false,
    category: 'essential'
  }
]

const mockDataRequests: DataRequest[] = [
  {
    id: '1',
    type: 'access',
    status: 'completed',
    requestDate: '2024-07-10',
    completionDate: '2024-07-12',
    description: 'Solicitação de cópia dos dados pessoais'
  },
  {
    id: '2',
    type: 'portability',
    status: 'processing',
    requestDate: '2024-07-20',
    description: 'Exportação de histórico médico completo'
  }
]

const categoryLabels = {
  essential: 'Essencial',
  communication: 'Comunicação',
  analytics: 'Análises',
  marketing: 'Marketing'
}

const requestTypeLabels = {
  access: 'Acesso aos Dados',
  portability: 'Portabilidade',
  deletion: 'Exclusão',
  correction: 'Correção'
}

const statusLabels = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído'
}

export function LgpdPreferences() {
  const [preferences, setPreferences] = useState<ConsentPreference[]>(consentPreferences)
  const [dataRequests, setDataRequests] = useState<DataRequest[]>(mockDataRequests)
  const [showDataExport, setShowDataExport] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  const handlePreferenceChange = (id: string, enabled: boolean) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, enabled } : pref
      )
    )
  }

  const handleDataRequest = (type: DataRequest['type']) => {
    const newRequest: DataRequest = {
      id: Date.now().toString(),
      type,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      description: getRequestDescription(type)
    }
    setDataRequests(prev => [newRequest, ...prev])
  }

  const getRequestDescription = (type: DataRequest['type']) => {
    switch (type) {
      case 'access':
        return 'Solicitação de acesso aos dados pessoais'
      case 'portability':
        return 'Solicitação de portabilidade dos dados'
      case 'deletion':
        return 'Solicitação de exclusão dos dados'
      case 'correction':
        return 'Solicitação de correção dos dados'
      default:
        return 'Solicitação de dados'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'essential':
        return Shield
      case 'communication':
        return MessageSquare
      case 'analytics':
        return BarChart3
      case 'marketing':
        return Mail
      default:
        return User
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'communication':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'analytics':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'marketing':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'access':
        return Eye
      case 'portability':
        return Download
      case 'deletion':
        return Trash2
      case 'correction':
        return User
      default:
        return User
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Preferências LGPD</h2>
        <p className="text-gray-600">Gerencie seus consentimentos e direitos de privacidade</p>
      </div>

      {/* LGPD Rights Information */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Seus Direitos LGPD:</strong> Você tem direito ao acesso, correção, portabilidade e exclusão dos seus dados pessoais, conforme Lei Geral de Proteção de Dados.
        </AlertDescription>
      </Alert>

      {/* Consent Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Consentimentos de Processamento</CardTitle>
          <CardDescription>
            Configure como seus dados podem ser utilizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(
              preferences.reduce((acc, pref) => {
                if (!acc[pref.category]) acc[pref.category] = []
                acc[pref.category].push(pref)
                return acc
              }, {} as Record<string, ConsentPreference[]>)
            ).map(([category, prefs]) => {
              const IconComponent = getCategoryIcon(category)
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-900">{categoryLabels[category as keyof typeof categoryLabels]}</h3>
                    <Badge className={getCategoryColor(category)}>
                      {prefs.filter(p => p.enabled).length}/{prefs.length}
                    </Badge>
                  </div>
                  <div className="space-y-3 ml-7">
                    {prefs.map((pref) => (
                      <div key={pref.id} className="flex items-start justify-between p-4 rounded-lg border bg-card">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{pref.title}</h4>
                            {pref.required && (
                              <Badge variant="secondary" className="text-xs">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{pref.description}</p>
                        </div>
                        <div className="ml-4">
                          <Switch
                            checked={pref.enabled}
                            onCheckedChange={(enabled) => handlePreferenceChange(pref.id, enabled)}
                            disabled={pref.required}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                </div>
              )
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <Button className="bg-primary hover:bg-primary/90">
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar Preferências
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Rights Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Exercer Direitos LGPD</CardTitle>
          <CardDescription>
            Solicite acesso, correção, portabilidade ou exclusão dos seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleDataRequest('access')}
            >
              <Eye className="h-6 w-6 text-primary" />
              <span className="font-medium">Acessar Dados</span>
              <span className="text-xs text-gray-500 text-center">Visualizar dados coletados</span>
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Download className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">Exportar Dados</span>
                  <span className="text-xs text-gray-500 text-center">Download dos seus dados</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exportar Dados Pessoais</DialogTitle>
                  <DialogDescription>
                    Solicite a exportação dos seus dados em formato portável
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <Download className="h-4 w-4" />
                    <AlertDescription>
                      O arquivo exportado será enviado para seu email em até 72 horas úteis.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={() => handleDataRequest('portability')}
                    className="w-full"
                  >
                    Solicitar Exportação
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleDataRequest('correction')}
            >
              <User className="h-6 w-6 text-green-600" />
              <span className="font-medium">Corrigir Dados</span>
              <span className="text-xs text-gray-500 text-center">Solicitar correções</span>
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-6 w-6 text-red-600" />
                  <span className="font-medium text-red-600">Excluir Conta</span>
                  <span className="text-xs text-gray-500 text-center">Remover todos os dados</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-600">Exclusão de Conta</DialogTitle>
                  <DialogDescription>
                    Esta ação é irreversível e removerá todos os seus dados
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Atenção:</strong> Dados médicos necessários por lei poderão ser mantidos pelo período legalmente exigido.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <Label htmlFor="delete-reason">Motivo da exclusão (opcional)</Label>
                    <Textarea
                      id="delete-reason"
                      placeholder="Conte-nos o motivo para nos ajudar a melhorar nossos serviços..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDataRequest('deletion')}
                      className="flex-1"
                    >
                      Confirmar Exclusão
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Data Requests History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Solicitações</CardTitle>
          <CardDescription>
            Acompanhe suas solicitações de dados LGPD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataRequests.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhuma solicitação encontrada</p>
                <p className="text-sm text-gray-400">
                  Suas solicitações LGPD aparecerão aqui
                </p>
              </div>
            ) : (
              dataRequests.map((request) => {
                const IconComponent = getRequestIcon(request.type)
                return (
                  <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {requestTypeLabels[request.type as keyof typeof requestTypeLabels]}
                          </p>
                          <Badge className={getStatusColor(request.status)}>
                            {statusLabels[request.status as keyof typeof statusLabels]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{request.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Solicitado em {new Date(request.requestDate).toLocaleDateString('pt-BR')}</span>
                          {request.completionDate && (
                            <span>Concluído em {new Date(request.completionDate).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {request.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
