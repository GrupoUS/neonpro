'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
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
  Play, 
  Plus, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download, 
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Shield
} from 'lucide-react'
import { useComplianceAssessment } from '@/hooks/useLGPD'
import { ComplianceAssessment } from '@/types/lgpd'

interface ComplianceAssessmentPanelProps {
  className?: string
}

export function ComplianceAssessmentPanel({ className }: ComplianceAssessmentPanelProps) {
  const {
    assessments,
    isLoading,
    error,
    createAssessment,
    runAutomatedAssessment,
    exportAssessments,
    refreshData
  } = useComplianceAssessment()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedAssessment, setSelectedAssessment] = useState<ComplianceAssessment | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isRunningAutomated, setIsRunningAutomated] = useState(false)
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    description: '',
    type: 'manual' as 'manual' | 'automated'
  })

  // Filtrar avaliações
  const filteredAssessments = assessments?.filter(assessment => {
    const matchesSearch = 
      assessment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter
    const matchesType = typeFilter === 'all' || assessment.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  }) || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
      case 'in_progress':
        return <Badge variant="default"><RefreshCw className="h-3 w-3 mr-1" />Em Execução</Badge>
      case 'completed':
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Concluída</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Falhou</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge variant="default" className="bg-green-600">Excelente</Badge>
    if (score >= 70) return <Badge variant="secondary" className="bg-yellow-600">Bom</Badge>
    if (score >= 50) return <Badge variant="secondary" className="bg-orange-600">Regular</Badge>
    return <Badge variant="destructive">Crítico</Badge>
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const handleCreateAssessment = async () => {
    try {
      await createAssessment(newAssessment)
      setIsCreateOpen(false)
      setNewAssessment({ name: '', description: '', type: 'manual' })
    } catch (error) {
      console.error('Erro ao criar avaliação:', error)
    }
  }

  const handleRunAutomatedAssessment = async () => {
    setIsRunningAutomated(true)
    try {
      await runAutomatedAssessment()
    } catch (error) {
      console.error('Erro ao executar avaliação automatizada:', error)
    } finally {
      setIsRunningAutomated(false)
    }
  }

  // Calcular estatísticas
  const stats = {
    total: assessments?.length || 0,
    completed: assessments?.filter(a => a.status === 'completed').length || 0,
    pending: assessments?.filter(a => a.status === 'pending').length || 0,
    averageScore: assessments?.length ? 
      Math.round(assessments.reduce((sum, a) => sum + (a.score || 0), 0) / assessments.length) : 0
  }

  const latestAssessment = assessments?.find(a => a.status === 'completed')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando avaliações...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar avaliações: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Avaliações de Conformidade</h3>
          <p className="text-muted-foreground">
            Execute e monitore avaliações de conformidade LGPD
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRunAutomatedAssessment}
            disabled={isRunningAutomated}
          >
            {isRunningAutomated ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Executar Avaliação Automatizada
          </Button>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportAssessments}>
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
                <p className="text-sm text-muted-foreground">Total de Avaliações</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pontuação Média</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Última avaliação */}
      {latestAssessment && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Última Avaliação de Conformidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Pontuação Geral</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-3xl font-bold ${getScoreColor(latestAssessment.score || 0)}`}>
                    {latestAssessment.score}%
                  </span>
                  {getScoreBadge(latestAssessment.score || 0)}
                </div>
                <Progress value={latestAssessment.score} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  Executada em {new Date(latestAssessment.completed_at || '').toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Áreas Avaliadas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Consentimentos</span>
                    <Badge variant="outline">95%</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Direitos dos Titulares</span>
                    <Badge variant="outline">88%</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Segurança de Dados</span>
                    <Badge variant="outline">92%</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Documentação</span>
                    <Badge variant="outline">85%</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Recomendações</h4>
                <div className="space-y-2">
                  {latestAssessment.recommendations?.slice(0, 3).map((rec, index) => (
                    <div key={index} className="text-sm bg-muted p-2 rounded">
                      {rec}
                    </div>
                  )) || (
                    <div className="text-sm text-muted-foreground">
                      Nenhuma recomendação específica
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessments">Avaliações</TabsTrigger>
          <TabsTrigger value="create">Nova Avaliação</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          {/* Filtros */}
          <Card>
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
                      placeholder="Nome ou descrição..."
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
                      <SelectItem value="in_progress">Em Execução</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automated">Automatizada</SelectItem>
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

          {/* Tabela de avaliações */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Avaliações ({filteredAssessments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Concluída em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assessment.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {assessment.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={assessment.type === 'automated' ? 'default' : 'outline'}>
                          {assessment.type === 'automated' ? 'Automatizada' : 'Manual'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                      <TableCell>
                        {assessment.score !== null ? (
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${getScoreColor(assessment.score)}`}>
                              {assessment.score}%
                            </span>
                            {getScoreBadge(assessment.score)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {assessment.completed_at ? (
                          new Date(assessment.completed_at).toLocaleDateString('pt-BR')
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Ver Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{assessment.name}</DialogTitle>
                              <DialogDescription>
                                {assessment.description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Informações gerais */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Tipo</Label>
                                  <p className="text-sm">
                                    {assessment.type === 'automated' ? 'Automatizada' : 'Manual'}
                                  </p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">{getStatusBadge(assessment.status)}</div>
                                </div>
                                <div>
                                  <Label>Criada em</Label>
                                  <p className="text-sm">
                                    {new Date(assessment.created_at).toLocaleString('pt-BR')}
                                  </p>
                                </div>
                                {assessment.completed_at && (
                                  <div>
                                    <Label>Concluída em</Label>
                                    <p className="text-sm">
                                      {new Date(assessment.completed_at).toLocaleString('pt-BR')}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Pontuação */}
                              {assessment.score !== null && (
                                <div>
                                  <Label>Pontuação de Conformidade</Label>
                                  <div className="mt-2">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`text-2xl font-bold ${getScoreColor(assessment.score)}`}>
                                        {assessment.score}%
                                      </span>
                                      {getScoreBadge(assessment.score)}
                                    </div>
                                    <Progress value={assessment.score} className="mb-2" />
                                  </div>
                                </div>
                              )}
                              
                              {/* Recomendações */}
                              {assessment.recommendations && assessment.recommendations.length > 0 && (
                                <div>
                                  <Label>Recomendações</Label>
                                  <div className="mt-2 space-y-2">
                                    {assessment.recommendations.map((rec, index) => (
                                      <div key={index} className="text-sm bg-muted p-3 rounded">
                                        {rec}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Resultados detalhados */}
                              {assessment.results && (
                                <div>
                                  <Label>Resultados Detalhados</Label>
                                  <div className="mt-2">
                                    <pre className="text-sm bg-muted p-3 rounded overflow-auto max-h-40">
                                      {JSON.stringify(assessment.results, null, 2)}
                                    </pre>
                                  </div>
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
              
              {filteredAssessments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma avaliação encontrada
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Avaliação</CardTitle>
              <CardDescription>
                Configure uma nova avaliação de conformidade LGPD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Avaliação</Label>
                <Input
                  id="name"
                  value={newAssessment.name}
                  onChange={(e) => setNewAssessment({ ...newAssessment, name: e.target.value })}
                  placeholder="Ex: Avaliação Trimestral Q1 2024"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newAssessment.description}
                  onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
                  placeholder="Descreva o objetivo e escopo desta avaliação..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo de Avaliação</Label>
                <Select 
                  value={newAssessment.type} 
                  onValueChange={(value: 'manual' | 'automated') => 
                    setNewAssessment({ ...newAssessment, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automated">Automatizada</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {newAssessment.type === 'automated' 
                    ? 'Avaliação executada automaticamente pelo sistema'
                    : 'Avaliação que requer intervenção manual'
                  }
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateAssessment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Avaliação
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setNewAssessment({ name: '', description: '', type: 'manual' })}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
