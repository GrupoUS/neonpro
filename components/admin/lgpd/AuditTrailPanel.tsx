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
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  RefreshCw,
  Calendar,
  Clock,
  User,
  Activity,
  Shield,
  FileText,
  Database,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  BarChart3,
  TrendingUp
} from 'lucide-react'
import { useAuditTrail } from '@/hooks/useLGPD'
import { AuditEvent } from '@/types/lgpd'

interface AuditTrailPanelProps {
  className?: string
}

export function AuditTrailPanel({ className }: AuditTrailPanelProps) {
  const {
    events,
    isLoading,
    error,
    exportAuditTrail,
    refreshData
  } = useAuditTrail()

  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('7d')
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null)

  // Filtrar eventos
  const filteredEvents = events?.filter(event => {
    const matchesSearch = 
      event.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === 'all' || event.action === actionFilter
    const matchesEntity = entityFilter === 'all' || event.entity_type === entityFilter
    const matchesUser = userFilter === 'all' || event.user_id === userFilter
    
    // Filtro de data
    const eventDate = new Date(event.timestamp)
    const now = new Date()
    let matchesDate = true
    
    switch (dateRange) {
      case '1d':
        matchesDate = (now.getTime() - eventDate.getTime()) <= 24 * 60 * 60 * 1000
        break
      case '7d':
        matchesDate = (now.getTime() - eventDate.getTime()) <= 7 * 24 * 60 * 60 * 1000
        break
      case '30d':
        matchesDate = (now.getTime() - eventDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
        break
      case '90d':
        matchesDate = (now.getTime() - eventDate.getTime()) <= 90 * 24 * 60 * 60 * 1000
        break
    }
    
    return matchesSearch && matchesAction && matchesEntity && matchesUser && matchesDate
  }) || []

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Criar</Badge>
      case 'read':
      case 'view':
        return <Badge variant="outline"><Eye className="h-3 w-3 mr-1" />Visualizar</Badge>
      case 'update':
      case 'edit':
        return <Badge variant="secondary"><Settings className="h-3 w-3 mr-1" />Atualizar</Badge>
      case 'delete':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Excluir</Badge>
      case 'export':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700"><Download className="h-3 w-3 mr-1" />Exportar</Badge>
      case 'login':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><User className="h-3 w-3 mr-1" />Login</Badge>
      case 'logout':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700"><User className="h-3 w-3 mr-1" />Logout</Badge>
      case 'consent_given':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Consentimento</Badge>
      case 'consent_withdrawn':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Retirada</Badge>
      case 'data_request':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700"><FileText className="h-3 w-3 mr-1" />Solicitação</Badge>
      case 'breach_reported':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Violação</Badge>
      default:
        return <Badge variant="secondary"><Activity className="h-3 w-3 mr-1" />{action}</Badge>
    }
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'user':
        return <User className="h-4 w-4" />
      case 'consent':
        return <Shield className="h-4 w-4" />
      case 'data_request':
        return <FileText className="h-4 w-4" />
      case 'breach_incident':
        return <AlertTriangle className="h-4 w-4" />
      case 'assessment':
        return <BarChart3 className="h-4 w-4" />
      case 'system':
        return <Database className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Calcular estatísticas
  const stats = {
    total: events?.length || 0,
    today: events?.filter(e => {
      const eventDate = new Date(e.timestamp)
      const today = new Date()
      return eventDate.toDateString() === today.toDateString()
    }).length || 0,
    thisWeek: events?.filter(e => {
      const eventDate = new Date(e.timestamp)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return eventDate >= weekAgo
    }).length || 0,
    uniqueUsers: new Set(events?.map(e => e.user_id).filter(Boolean)).size || 0
  }

  // Obter listas únicas para filtros
  const uniqueActions = [...new Set(events?.map(e => e.action).filter(Boolean))] || []
  const uniqueEntities = [...new Set(events?.map(e => e.entity_type).filter(Boolean))] || []
  const uniqueUsers = [...new Set(events?.map(e => e.user_id).filter(Boolean))] || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando trilha de auditoria...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar trilha de auditoria: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Trilha de Auditoria LGPD</h3>
          <p className="text-muted-foreground">
            Monitore todas as atividades relacionadas à conformidade LGPD
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportAuditTrail}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Únicos</p>
                <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
              </div>
              <User className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Ação, entidade, usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="action">Ação</Label>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as ações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {uniqueActions.map(action => (
                        <SelectItem key={action} value={action}>{action}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="entity">Entidade</Label>
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as entidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {uniqueEntities.map(entity => (
                        <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="user">Usuário</Label>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os usuários" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueUsers.map(user => (
                        <SelectItem key={user} value={user}>{user}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date">Período</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">Último dia</SelectItem>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                      <SelectItem value="90d">Últimos 90 dias</SelectItem>
                      <SelectItem value="all">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('')
                      setActionFilter('all')
                      setEntityFilter('all')
                      setUserFilter('all')
                      setDateRange('7d')
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de eventos */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Auditoria ({filteredEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">
                              {new Date(event.timestamp).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(event.action)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEntityIcon(event.entity_type)}
                          <span className="text-sm">{event.entity_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{event.user_id || 'Sistema'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate" title={event.details}>
                            {event.details}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground font-mono">
                          {event.ip_address || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {getActionBadge(event.action)}
                                Detalhes do Evento
                              </DialogTitle>
                              <DialogDescription>
                                {new Date(event.timestamp).toLocaleString('pt-BR')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Ação</Label>
                                  <p className="text-sm font-medium">{event.action}</p>
                                </div>
                                <div>
                                  <Label>Tipo de Entidade</Label>
                                  <p className="text-sm">{event.entity_type}</p>
                                </div>
                                <div>
                                  <Label>ID da Entidade</Label>
                                  <p className="text-sm font-mono">{event.entity_id || '-'}</p>
                                </div>
                                <div>
                                  <Label>Usuário</Label>
                                  <p className="text-sm">{event.user_id || 'Sistema'}</p>
                                </div>
                                <div>
                                  <Label>Endereço IP</Label>
                                  <p className="text-sm font-mono">{event.ip_address || '-'}</p>
                                </div>
                                <div>
                                  <Label>User Agent</Label>
                                  <p className="text-sm truncate" title={event.user_agent}>
                                    {event.user_agent || '-'}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Detalhes</Label>
                                <p className="text-sm bg-muted p-3 rounded mt-1">
                                  {event.details}
                                </p>
                              </div>
                              
                              {event.metadata && (
                                <div>
                                  <Label>Metadados</Label>
                                  <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto max-h-40">
                                    {JSON.stringify(event.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum evento encontrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ações mais frequentes */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Mais Frequentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    events?.reduce((acc, event) => {
                      acc[event.action] = (acc[event.action] || 0) + 1
                      return acc
                    }, {} as Record<string, number>) || {}
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([action, count]) => (
                      <div key={action} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getActionBadge(action)}
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
            
            {/* Entidades mais acessadas */}
            <Card>
              <CardHeader>
                <CardTitle>Entidades Mais Acessadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    events?.reduce((acc, event) => {
                      acc[event.entity_type] = (acc[event.entity_type] || 0) + 1
                      return acc
                    }, {} as Record<string, number>) || {}
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([entity, count]) => (
                      <div key={entity} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getEntityIcon(entity)}
                          <span className="text-sm">{entity}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
            
            {/* Usuários mais ativos */}
            <Card>
              <CardHeader>
                <CardTitle>Usuários Mais Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    events?.reduce((acc, event) => {
                      const user = event.user_id || 'Sistema'
                      acc[user] = (acc[user] || 0) + 1
                      return acc
                    }, {} as Record<string, number>) || {}
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([user, count]) => (
                      <div key={user} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
            
            {/* Atividade por período */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Últimas 24h</span>
                    <Badge variant="outline">
                      {events?.filter(e => {
                        const eventDate = new Date(e.timestamp)
                        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                        return eventDate >= dayAgo
                      }).length || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Últimos 7 dias</span>
                    <Badge variant="outline">
                      {events?.filter(e => {
                        const eventDate = new Date(e.timestamp)
                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        return eventDate >= weekAgo
                      }).length || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Últimos 30 dias</span>
                    <Badge variant="outline">
                      {events?.filter(e => {
                        const eventDate = new Date(e.timestamp)
                        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        return eventDate >= monthAgo
                      }).length || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}