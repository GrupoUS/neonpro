/**
 * Service Template Manager Component
 * Manages service templates and packages with CRUD operations
 */

import {
  useDeleteServiceTemplate,
  useDuplicateServiceTemplate,
  useServiceTemplatesWithItems,
  useToggleTemplateActive,
  useToggleTemplateFeatured,
} from '@/hooks/useServiceTemplates';
import { cn } from '@/lib/utils';
import {
  getTemplateTypeConfig,
  SERVICE_TEMPLATE_TYPES,
  type ServiceTemplateType,
} from '@/types/service-templates';
import type { ServiceTemplateWithItems } from '@/types/service-templates';
import { Button } from '@neonpro/ui';
import { Card } from '@neonpro/ui';
import { Badge } from '@neonpro/ui';
import { Input } from '@neonpro/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@neonpro/ui';
import { Select } from '@neonpro/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@neonpro/ui';
import {
  BarChart3,
  Copy,
  Edit,
  Eye,
  EyeOff,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface ServiceTemplateManagerProps {
  clinicId: string;
  className?: string;
}

export function ServiceTemplateManager({
  clinicId,
  className,
}: ServiceTemplateManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ServiceTemplateType | 'all'>(
    'all',
  );
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  // Hooks
  const {
    data: templates,
    isLoading,
    error,
  } = useServiceTemplatesWithItems(clinicId);

  const deleteTemplate = useDeleteServiceTemplate();
  const toggleFeatured = useToggleTemplateFeatured();
  const toggleActive = useToggleTemplateActive();
  const duplicateTemplate = useDuplicateServiceTemplate();

  // Filter templates based on search and filters
  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase())
      || template.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || template.template_type === typeFilter;

    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'active' && template.is_active)
      || (statusFilter === 'inactive' && !template.is_active);

    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const handleDeleteTemplate = async (_template: any) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o template "${template.name}"?`,
      )
    ) {
      try {
        await deleteTemplate.mutateAsync(template.id);
      } catch (_error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleToggleFeatured = async (_template: any) => {
    try {
      await toggleFeatured.mutateAsync({
        id: template.id,
        isFeatured: template.is_featured,
      });
    } catch (_error) {
      console.error('Error toggling featured:', error);
    }
  };

  const handleToggleActive = async (_template: any) => {
    try {
      await toggleActive.mutateAsync({
        id: template.id,
        isActive: template.is_active,
      });
    } catch (_error) {
      console.error('Error toggling active:', error);
    }
  };

  const handleDuplicate = async (_template: any) => {
    const newName = `${template.name} (Cópia)`;
    try {
      await duplicateTemplate.mutateAsync({
        template_id: template.id,
        new_name: newName,
        clinic_id: clinicId,
      });
    } catch (_error) {
      console.error('Error duplicating template:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Templates de Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse space-y-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='h-20 bg-muted rounded'></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Templates de Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <p className='text-muted-foreground'>
              Erro ao carregar templates: {error.message}
            </p>
            <Button
              variant='outline'
              className='mt-4'
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Package className='h-5 w-5' />
              Templates de Serviços
            </CardTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              Gerencie templates e pacotes de serviços pré-configurados
            </p>
          </div>
          <div className='flex gap-2'>
            <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm'>
                  <BarChart3 className='h-4 w-4 mr-2' />
                  Estatísticas
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-4xl'>
                <DialogHeader>
                  <DialogTitle>Estatísticas dos Templates</DialogTitle>
                  <DialogDescription>
                    Visualize o desempenho dos seus templates de serviços
                  </DialogDescription>
                </DialogHeader>
                {/* Stats component would go here */}
                <div className='p-4 text-center text-muted-foreground'>
                  Estatísticas em desenvolvimento
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size='sm'>
                  <Plus className='h-4 w-4 mr-2' />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Template</DialogTitle>
                  <DialogDescription>
                    Crie um template de serviço ou pacote
                  </DialogDescription>
                </DialogHeader>
                {/* Template form would go here */}
                <div className='p-4 text-center text-muted-foreground'>
                  Formulário em desenvolvimento
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Filters */}
          <div className='flex items-center gap-4 flex-wrap'>
            <div className='relative flex-1 min-w-[200px]'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                placeholder='Buscar templates...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            <Select
              value={typeFilter}
              onValueChange={value => setTypeFilter(value as any)}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Tipo de template' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos os tipos</SelectItem>
                {Object.entries(SERVICE_TEMPLATE_TYPES).map(
                  ([type, config]) => (
                    <SelectItem key={type} value={type}>
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{ backgroundColor: config.color }}
                        />
                        {config.label}
                      </div>
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={value => setStatusFilter(value as any)}
            >
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos</SelectItem>
                <SelectItem value='active'>Ativos</SelectItem>
                <SelectItem value='inactive'>Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates List */}
          {filteredTemplates.length === 0
            ? (
              <div className='text-center py-12'>
                <Package className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-medium mb-2'>
                  {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Nenhum template encontrado'
                    : 'Nenhum template criado'}
                </h3>
                <p className='text-muted-foreground mb-4'>
                  {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Tente ajustar os filtros ou criar um novo template'
                    : 'Comece criando templates para agilizar o agendamento'}
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className='h-4 w-4 mr-2' />
                  Criar Primeiro Template
                </Button>
              </div>
            )
            : (
              <div className='grid gap-4'>
                {filteredTemplates.map(template => {
                  const typeConfig = getTemplateTypeConfig(
                    template.template_type,
                  );

                  return (
                    <Card
                      key={template.id}
                      className='hover:shadow-md transition-shadow'
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-start gap-4 flex-1'>
                            <div
                              className='w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold'
                              style={{ backgroundColor: typeConfig.color }}
                            >
                              {template.name.charAt(0).toUpperCase()}
                            </div>

                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <h4 className='font-medium'>{template.name}</h4>
                                {template.is_featured && (
                                  <Star className='h-4 w-4 text-yellow-500 fill-current' />
                                )}
                                {!template.is_active && <Badge variant='secondary'>Inativo</Badge>}
                              </div>

                              {template.description && (
                                <p className='text-sm text-muted-foreground mb-2'>
                                  {template.description}
                                </p>
                              )}

                              <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                <span>
                                  <Badge
                                    variant='outline'
                                    style={{ borderColor: typeConfig.color }}
                                  >
                                    {typeConfig.label}
                                  </Badge>
                                </span>
                                <span>
                                  R$ {template.calculated_price.toFixed(2)}
                                </span>
                                <span>
                                  {template.default_duration_minutes} min
                                </span>
                                <span>{template.items.length} serviços</span>
                                {template.usage_count > 0 && (
                                  <span>{template.usage_count} usos</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleToggleFeatured(template)}
                              >
                                {template.is_featured
                                  ? (
                                    <>
                                      <StarOff className='h-4 w-4 mr-2' />
                                      Remover Destaque
                                    </>
                                  )
                                  : (
                                    <>
                                      <Star className='h-4 w-4 mr-2' />
                                      Destacar
                                    </>
                                  )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(template)}
                              >
                                {template.is_active
                                  ? (
                                    <>
                                      <EyeOff className='h-4 w-4 mr-2' />
                                      Desativar
                                    </>
                                  )
                                  : (
                                    <>
                                      <Eye className='h-4 w-4 mr-2' />
                                      Ativar
                                    </>
                                  )}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className='h-4 w-4 mr-2' />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(template)}
                              >
                                <Copy className='h-4 w-4 mr-2' />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteTemplate(template)}
                                className='text-destructive'
                                disabled={deleteTemplate.isPending}
                              >
                                <Trash2 className='h-4 w-4 mr-2' />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
