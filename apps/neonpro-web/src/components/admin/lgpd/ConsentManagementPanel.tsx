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
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { useConsentManagement } from '@/hooks/useLGPD'
import { ConsentPurpose, UserConsent } from '@/types/lgpd'

interface ConsentManagementPanelProps {
  className?: string
}

export function ConsentManagementPanel({ className }: ConsentManagementPanelProps) {
  const {
    consents,
    purposes,
    isLoading,
    error,
    createPurpose,
    updatePurpose,
    deletePurpose,
    updateConsent,
    withdrawConsent,
    exportConsents,
    refreshData
  } = useConsentManagement()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [purposeFilter, setPurposeFilter] = useState<string>('all')
  const [isCreatePurposeOpen, setIsCreatePurposeOpen] = useState(false)
  const [editingPurpose, setEditingPurpose] = useState<ConsentPurpose | null>(null)
  const [newPurpose, setNewPurpose] = useState({
    name: '',
    description: '',
    required: false,
    retention_period: 365
  })

  // Filtrar consentimentos
  const filteredConsents = consents?.filter(consent => {
    const matchesSearch = 
      consent.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.purpose_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || consent.status === statusFilter
    const matchesPurpose = purposeFilter === 'all' || consent.purpose_id === purposeFilter
    
    return matchesSearch && matchesStatus && matchesPurpose
  }) || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>
      case 'expired':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Expirado</Badge>
      case 'withdrawn':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Retirado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleCreatePurpose = async () => {
    try {
      await createPurpose(newPurpose)
      setIsCreatePurposeOpen(false)
      setNewPurpose({ name: '', description: '', required: false, retention_period: 365 })
    } catch (error) {
      console.error('Erro ao criar finalidade:', error)
    }
  }

  const handleUpdatePurpose = async () => {
    if (!editingPurpose) return
    
    try {
      await updatePurpose(editingPurpose.id, editingPurpose)
      setEditingPurpose(null)
    } catch (error) {
      console.error('Erro ao atualizar finalidade:', error)
    }
  }

  const handleWithdrawConsent = async (consentId: string) => {
    try {
      await withdrawConsent(consentId)
    } catch (error) {
      console.error('Erro ao retirar consentimento:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando consentimentos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar consentimentos: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Gerenciamento de Consentimentos</h3>
          <p className="text-muted-foreground">
            Gerencie finalidades e consentimentos dos usuários
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportConsents}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="consents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="purposes">Finalidades</TabsTrigger>
        </TabsList>

        <TabsContent value="consents" className="space-y-4">
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
                      placeholder="Email ou finalidade..."
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
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                      <SelectItem value="withdrawn">Retirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="purpose">Finalidade</Label>
                  <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as finalidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {purposes?.map((purpose) => (
                        <SelectItem key={purpose.id} value={purpose.id}>
                          {purpose.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setPurposeFilter('all')
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de consentimentos */}
          <Card>
            <CardHeader>
              <CardTitle>Consentimentos ({filteredConsents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Finalidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Consentimento</TableHead>
                    <TableHead>Expiração</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsents.map((consent) => (
                    <TableRow key={consent.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{consent.user_email}</div>
                          <div className="text-sm text-muted-foreground">
                            IP: {consent.ip_address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{consent.purpose_name}</div>
                          {consent.purpose_required && (
                            <Badge variant="outline" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(consent.status)}</TableCell>
                      <TableCell>
                        {new Date(consent.granted_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {consent.expires_at ? (
                          <div className={`${
                            new Date(consent.expires_at) < new Date() 
                              ? 'text-red-600' 
                              : new Date(consent.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}>
                            {new Date(consent.expires_at).toLocaleDateString('pt-BR')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sem expiração</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          v{consent.version}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {consent.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWithdrawConsent(consent.id)}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Retirar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredConsents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum consentimento encontrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purposes" className="space-y-4">
          {/* Header das finalidades */}
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium">Finalidades de Consentimento</h4>
            <Dialog open={isCreatePurposeOpen} onOpenChange={setIsCreatePurposeOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Finalidade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Finalidade</DialogTitle>
                  <DialogDescription>
                    Defina uma nova finalidade para coleta de consentimentos
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={newPurpose.name}
                      onChange={(e) => setNewPurpose({ ...newPurpose, name: e.target.value })}
                      placeholder="Ex: Marketing por email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newPurpose.description}
                      onChange={(e) => setNewPurpose({ ...newPurpose, description: e.target.value })}
                      placeholder="Descreva como os dados serão utilizados..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="retention">Período de Retenção (dias)</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={newPurpose.retention_period}
                      onChange={(e) => setNewPurpose({ ...newPurpose, retention_period: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="required"
                      checked={newPurpose.required}
                      onCheckedChange={(checked) => setNewPurpose({ ...newPurpose, required: !!checked })}
                    />
                    <Label htmlFor="required">Consentimento obrigatório</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreatePurposeOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreatePurpose}>
                    Criar Finalidade
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de finalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purposes?.map((purpose) => (
              <Card key={purpose.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{purpose.name}</CardTitle>
                      <CardDescription>{purpose.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPurpose(purpose)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePurpose(purpose.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant={purpose.active ? "default" : "secondary"}>
                        {purpose.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Obrigatório:</span>
                      <Badge variant={purpose.required ? "default" : "outline"}>
                        {purpose.required ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Retenção:</span>
                      <span>{purpose.retention_period} dias</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Versão:</span>
                      <Badge variant="outline">v{purpose.version}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dialog de edição */}
          <Dialog open={!!editingPurpose} onOpenChange={() => setEditingPurpose(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Finalidade</DialogTitle>
                <DialogDescription>
                  Modifique os detalhes da finalidade
                </DialogDescription>
              </DialogHeader>
              {editingPurpose && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Nome</Label>
                    <Input
                      id="edit-name"
                      value={editingPurpose.name}
                      onChange={(e) => setEditingPurpose({ ...editingPurpose, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={editingPurpose.description}
                      onChange={(e) => setEditingPurpose({ ...editingPurpose, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-retention">Período de Retenção (dias)</Label>
                    <Input
                      id="edit-retention"
                      type="number"
                      value={editingPurpose.retention_period}
                      onChange={(e) => setEditingPurpose({ ...editingPurpose, retention_period: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-required"
                      checked={editingPurpose.required}
                      onCheckedChange={(checked) => setEditingPurpose({ ...editingPurpose, required: !!checked })}
                    />
                    <Label htmlFor="edit-required">Consentimento obrigatório</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-active"
                      checked={editingPurpose.active}
                      onCheckedChange={(checked) => setEditingPurpose({ ...editingPurpose, active: !!checked })}
                    />
                    <Label htmlFor="edit-active">Finalidade ativa</Label>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingPurpose(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdatePurpose}>
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}