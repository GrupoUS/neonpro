'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Template,
  Plus,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  Search,
  Phone,
  Mail,
  MessageCircle,
  MessageSquare,
  Clock,
  User,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  useTemplates, 
  useCreateTemplate, 
  useUpdateTemplate, 
  useDeleteTemplate,
  useDuplicateTemplate 
} from '@/app/hooks/use-communication'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { MessageTemplate, CreateTemplateRequest, UpdateTemplateRequest } from '@/app/lib/types/communication'

interface TemplateManagerProps {
  onTemplateSelect?: (template: MessageTemplate) => void
  selectionMode?: boolean
  className?: string
}

const templateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  subject: z.string().optional(),
  body: z.string().min(1, 'Conteúdo é obrigatório'),
  variables: z.array(z.string()).default([]),
  default_channel: z.enum(['sms', 'email', 'whatsapp', 'system']).optional(),
  is_active: z.boolean().default(true)
})

type TemplateFormData = z.infer<typeof templateSchema>

export function TemplateManager({ 
  onTemplateSelect, 
  selectionMode = false,
  className 
}: TemplateManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null)
  const [newVariableName, setNewVariableName] = useState('')

  // Form for create/edit
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      variables: [],
      is_active: true
    }
  })

  const watchedVariables = watch('variables') || []

  // Query filters
  const filters = {
    page: currentPage.toString(),
    limit: '20',
    sort: 'name',
    order: 'asc' as const,
    ...(searchQuery && { search: searchQuery }),
    ...(categoryFilter !== 'all' && { category: categoryFilter }),
    ...(activeFilter !== 'all' && { active: activeFilter === 'active' ? 'true' : 'false' })
  }

  // Hooks
  const templatesQuery = useTemplates(filters)
  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()
  const deleteTemplate = useDeleteTemplate()
  const duplicateTemplate = useDuplicateTemplate()

  // Handle form submission
  const onSubmit = useCallback(async (data: TemplateFormData) => {
    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          data: data as UpdateTemplateRequest
        })
        setEditingTemplate(null)
      } else {
        await createTemplate.mutateAsync(data as CreateTemplateRequest)
        setIsCreateDialogOpen(false)
      }
      reset()
    } catch (error) {
      console.error('Failed to save template:', error)
    }
  }, [editingTemplate, updateTemplate, createTemplate, reset])

  // Handle edit
  const handleEdit = useCallback((template: MessageTemplate) => {
    setEditingTemplate(template)
    reset({
      name: template.name,
      category: template.category,
      subject: template.subject || '',
      body: template.body,
      variables: template.variables || [],
      default_channel: template.default_channel,
      is_active: template.is_active
    })
  }, [reset])

  // Handle delete
  const handleDelete = useCallback(async (templateId: string) => {
    try {
      await deleteTemplate.mutateAsync(templateId)
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }, [deleteTemplate])

  // Handle duplicate
  const handleDuplicate = useCallback(async (template: MessageTemplate) => {
    const newName = `${template.name} (Cópia)`
    try {
      await duplicateTemplate.mutateAsync({ id: template.id, name: newName })
    } catch (error) {
      console.error('Failed to duplicate template:', error)
    }
  }, [duplicateTemplate])

  // Handle variable management
  const addVariable = useCallback(() => {
    if (newVariableName.trim() && !watchedVariables.includes(newVariableName.trim())) {
      setValue('variables', [...watchedVariables, newVariableName.trim()])
      setNewVariableName('')
    }
  }, [newVariableName, watchedVariables, setValue])

  const removeVariable = useCallback((variable: string) => {
    setValue('variables', watchedVariables.filter(v => v !== variable))
  }, [watchedVariables, setValue])

  // Get channel icon
  const getChannelIcon = (channel?: string) => {
    switch (channel) {
      case 'sms': return <Phone className="h-3 w-3" />
      case 'email': return <Mail className="h-3 w-3" />
      case 'whatsapp': return <MessageCircle className="h-3 w-3" />
      case 'system': return <MessageSquare className="h-3 w-3" />
      default: return null
    }
  }

  // Get categories for filter
  const categories = Array.from(new Set(
    templatesQuery.data?.data.templates?.map(t => t.category) || []
  ))

  const templates = templatesQuery.data?.data.templates || []
  const pagination = templatesQuery.data?.data.pagination

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Template className="h-5 w-5" />
            {selectionMode ? 'Selecionar Template' : 'Gerenciar Templates'}
          </CardTitle>
          
          {!selectionMode && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => reset()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {templatesQuery.isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Template className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum template encontrado</p>
            </div>
          ) : (
            <div className="divide-y">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    selectionMode ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => selectionMode && onTemplateSelect?.(template)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{template.name}</h4>
                        <Badge variant="outline">{template.category}</Badge>
                        {template.default_channel && (
                          <div className="flex items-center gap-1">
                            {getChannelIcon(template.default_channel)}
                            <span className="text-xs text-muted-foreground">
                              {template.default_channel.toUpperCase()}
                            </span>
                          </div>
                        )}
                        {!template.is_active && (
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {template.body}
                      </p>
                      
                      {template.variables && template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {template.variables.map(variable => (
                            <Badge key={variable} variant="secondary" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {template.created_by?.name || 'Sistema'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(template.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {!selectionMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o template "{template.name}"?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(template.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.pages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_prev}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_next}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={isCreateDialogOpen || !!editingTemplate} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setEditingTemplate(null)
            reset()
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? 'Faça as alterações necessárias no template'
                : 'Crie um novo template de mensagem para reutilizar'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  {...register('name')}
                  placeholder="Nome do template"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Input
                  {...register('category')}
                  placeholder="Ex: Lembrete, Confirmação, Marketing"
                />
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="default_channel">Canal padrão</Label>
                <Select
                  value={watch('default_channel') || ''}
                  onValueChange={(value) => setValue('default_channel', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-7">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  id="is_active"
                  className="rounded"
                />
                <Label htmlFor="is_active">Template ativo</Label>
              </div>
            </div>

            {watch('default_channel') === 'email' && (
              <div>
                <Label htmlFor="subject">Assunto (Email)</Label>
                <Input
                  {...register('subject')}
                  placeholder="Assunto do email"
                />
              </div>
            )}

            <div>
              <Label htmlFor="body">Conteúdo *</Label>
              <Textarea
                {...register('body')}
                placeholder="Digite o conteúdo do template..."
                rows={6}
                className="resize-none"
              />
              {errors.body && (
                <p className="text-sm text-destructive mt-1">{errors.body.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Use variáveis com {'{{'} e {'}}'}  para personalização
              </p>
            </div>

            {/* Variables */}
            <div>
              <Label>Variáveis</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nome da variável"
                    value={newVariableName}
                    onChange={(e) => setNewVariableName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                  />
                  <Button type="button" onClick={addVariable} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {watchedVariables.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {watchedVariables.map(variable => (
                      <Badge key={variable} variant="secondary" className="gap-1">
                        {variable}
                        <button
                          type="button"
                          onClick={() => removeVariable(variable)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setEditingTemplate(null)
                  reset()
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createTemplate.isPending || updateTemplate.isPending}
              >
                {(createTemplate.isPending || updateTemplate.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingTemplate ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visualizar Template</DialogTitle>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome</Label>
                  <p className="text-sm font-medium">{previewTemplate.name}</p>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <p className="text-sm">{previewTemplate.category}</p>
                </div>
              </div>
              
              {previewTemplate.subject && (
                <div>
                  <Label>Assunto</Label>
                  <p className="text-sm">{previewTemplate.subject}</p>
                </div>
              )}
              
              <div>
                <Label>Conteúdo</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{previewTemplate.body}</p>
                </div>
              </div>
              
              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <div>
                  <Label>Variáveis</Label>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.variables.map(variable => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Fechar
            </Button>
            {previewTemplate && onTemplateSelect && (
              <Button onClick={() => {
                onTemplateSelect(previewTemplate)
                setPreviewTemplate(null)
              }}>
                Usar Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
