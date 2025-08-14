'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  RefreshCw,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react'
import { useDataSubjectRights } from '@/hooks/useLGPD'
import { DataSubjectRequest } from '@/types/lgpd'

interface DataSubjectRightsPanelProps {
  className?: string
}

export function DataSubjectRightsPanel({ className }: DataSubjectRightsPanelProps) {
  const {
    requests,
    isLoading,
    error,
    updateRequest,
    processRequest,
    exportRequests,
    refreshData
  } = useDataSubjectRights()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<DataSubjectRequest | null>(null)
  const [isProcessingOpen, setIsProcessingOpen] = useState(false)
  const [processingData, setProcessingData] = useState({
    status: '',
    response: '',
    admin_notes: ''
  })

  // Filtrar solicitações
  const filteredRequests = requests?.filter(request => {
    const matchesSearch = 
      request.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.request_type?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesType = typeFilter === 'all' || request.request_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  }) || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
      case 'in_progress':
        return <Badge variant="default"><RefreshCw className="h-3 w-3 mr-1" />Em Processamento</Badge>
      case 'completed':
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Concluída</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeitada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      'access': 'Acesso',
      'rectification': 'Retificação',
      'erasure': 'Exclusão',
      'portability': 'Portabilidade',
      'restriction': 'Restrição',
      'objection': 'Oposição'
    }
    
    return (
      <Badge variant="outline">
        {typeLabels[type as keyof typeof typeLabels] || type}
      </Badge>
    )
  }

  const getPriorityColor = (createdAt: string) => {
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceCreated > 15) return 'text-red-600'
    if (daysSinceCreated > 10) return 'text-yellow-600'
    return 'text-green-600'
  }

  const handleProcessRequest = async () => {
    if (!selectedRequest) return
    
    try {
      await processRequest(selectedRequest.id, processingData)
      setIsProcessingOpen(false)
      setSelectedRequest(null)
      setProcessingData({ status: '', response: '', admin_notes: '' })
    } catch (error) {
      console.error('Erro ao processar solicitação:', error)
    }
  }

  const openProcessingDialog = (request: DataSubjectRequest) => {
    setSelectedRequest(request)
    setProcessingData({
      status: request.status,
      response: request.response || '',
      admin_notes: request.admin_notes || ''
    })
    setIsProcessingOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando solicitações...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar solicitações: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Direitos dos Titulares de Dados</h3>
          <p className="text-muted-foreground">
            Gerencie solicitações de acesso, retificação, exclusão e outros direitos LGPD
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportRequests}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">
                  {requests?.filter(r => r.status === 'pending').length || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Processamento</p>
                <p className="text-2xl font-bold">
                  {requests?.filter(r => r.status === 'in_progress').length || 0}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">
                  {requests?.filter(r => r.status === 'completed').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">2.3d</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Email ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Processamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Tipo de Solicitação</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="access">Acesso</SelectItem>
                  <SelectItem value="rectification">Retificação</SelectItem>
                  <SelectItem value="erasure">Exclusão</SelectItem>
                  <SelectItem value="portability">Portabilidade</SelectItem>
                  <SelectItem value="restriction">Restrição</SelectItem>
                  <SelectItem value="objection">Oposição</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setTypeFilter('all')
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de solicitações */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data da Solicitação</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => {
                const daysSinceCreated = Math.floor(
                  (Date.now() - new Date(request.created_at).getTime()) / (1000 * 60 * 60 * 24)
                )
                const daysRemaining = 15 - daysSinceCreated
                
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.user_email}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {request.user_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(request.request_type)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className={getPriorityColor(request.created_at)}>
                        {daysRemaining > 0 ? (
                          `${daysRemaining} dias restantes`
                        ) : (
                          <span className="font-semibold">Vencido há {Math.abs(daysRemaining)} dias</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={daysRemaining <= 0 ? "destructive" : daysRemaining <= 5 ? "secondary" : "outline"}
                      >
                        {daysRemaining <= 0 ? 'Crítica' : daysRemaining <= 5 ? 'Alta' : 'Normal'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes da Solicitação</DialogTitle>
                              <DialogDescription>
                                {getTypeBadge(request.request_type)} - {getStatusBadge(request.status)}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Usuário</Label>
                                  <p className="text-sm">{request.user_email}</p>
                                </div>
                                <div>
                                  <Label>Data da Solicitação</Label>
                                  <p className="text-sm">
                                    {new Date(request.created_at).toLocaleString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Descrição</Label>
                                <p className="text-sm bg-muted p-3 rounded">
                                  {request.description || 'Nenhuma descrição fornecida'}
                                </p>
                              </div>
                              
                              {request.response && (
                                <div>
                                  <Label>Resposta</Label>
                                  <p className="text-sm bg-muted p-3 rounded">
                                    {request.response}
                                  </p>
                                </div>
                              )}
                              
                              {request.admin_notes && (
                                <div>
                                  <Label>Notas Administrativas</Label>
                                  <p className="text-sm bg-muted p-3 rounded">
                                    {request.admin_notes}
                                  </p>
                                </div>
                              )}
                              
                              {request.processed_at && (
                                <div>
                                  <Label>Processado em</Label>
                                  <p className="text-sm">
                                    {new Date(request.processed_at).toLocaleString('pt-BR')}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {(request.status === 'pending' || request.status === 'in_progress') && (
                          <Button
                            size="sm"
                            onClick={() => openProcessingDialog(request)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Processar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma solicitação encontrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de processamento */}
      <Dialog open={isProcessingOpen} onOpenChange={setIsProcessingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Processar Solicitação</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <span>
                  {getTypeBadge(selectedRequest.request_type)} de {selectedRequest.user_email}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label>Solicitação Original</Label>
                <p className="text-sm bg-muted p-3 rounded">
                  {selectedRequest.description || 'Nenhuma descrição fornecida'}
                </p>
              </div>
              
              <div>
                <Label htmlFor="status">Novo Status</Label>
                <Select 
                  value={processingData.status} 
                  onValueChange={(value) => setProcessingData({ ...processingData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">Em Processamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="rejected">Rejeitada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="response">Resposta ao Usuário</Label>
                <Textarea
                  id="response"
                  value={processingData.response}
                  onChange={(e) => setProcessingData({ ...processingData, response: e.target.value })}
                  placeholder="Resposta que será enviada ao usuário..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="admin_notes">Notas Administrativas (Internas)</Label>
                <Textarea
                  id="admin_notes"
                  value={processingData.admin_notes}
                  onChange={(e) => setProcessingData({ ...processingData, admin_notes: e.target.value })}
                  placeholder="Notas internas sobre o processamento..."
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessingOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleProcessRequest}>
              Processar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}