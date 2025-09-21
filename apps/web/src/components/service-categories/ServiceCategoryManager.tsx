/**
 * Service Category Manager Component
 * Manages service categories with CRUD operations and drag-and-drop reordering
 */

import {
  useDeleteServiceCategory,
  useInitializeDefaultCategories,
  useServiceCategories,
} from '@/hooks/useServiceCategories';
import type { ServiceCategory } from '@/types/service-categories';
import { cn } from '@neonpro/ui';
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
  Edit,
  GripVertical,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Tag,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { ServiceCategoryForm } from './ServiceCategoryForm';
import { ServiceCategoryStats } from './ServiceCategoryStats';

interface ServiceCategoryManagerProps {
  clinicId: string;
  className?: string;
}

export function ServiceCategoryManager({
  clinicId,
  className,
}: ServiceCategoryManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  // Hooks
  const {
    data: categories,
    isLoading,
    error,
  } = useServiceCategories({
    clinic_id: clinicId,
    search: searchQuery || undefined,
  });

  const deleteCategory = useDeleteServiceCategory();
  const initializeDefaults = useInitializeDefaultCategories();

  // Filter categories based on search
  const filteredCategories = categories?.filter(
    category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
      || category.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  ) || [];

  const handleDeleteCategory = async (_category: [a-zA-Z][a-zA-Z]*) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a categoria "${category.name}"?`,
      )
    ) {
      try {
        await deleteCategory.mutateAsync(category.id);
      } catch (_error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleInitializeDefaults = async () => {
    if (
      window.confirm(
        'Isso criará as categorias padrão para sua clínica. Continuar?',
      )
    ) {
      try {
        await initializeDefaults.mutateAsync(clinicId);
      } catch (_error) {
        console.error('Error initializing default categories:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Tag className='h-5 w-5' />
            Categorias de Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse space-y-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='h-16 bg-muted rounded'></div>
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
            <Tag className='h-5 w-5' />
            Categorias de Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <p className='text-muted-foreground'>
              Erro ao carregar categorias: {error.message}
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
              <Tag className='h-5 w-5' />
              Categorias de Serviços
            </CardTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              Organize seus serviços por categoria para melhor gestão
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
                  <DialogTitle>Estatísticas das Categorias</DialogTitle>
                  <DialogDescription>
                    Visualize o desempenho das suas categorias de serviços
                  </DialogDescription>
                </DialogHeader>
                <ServiceCategoryStats clinicId={clinicId} />
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size='sm'>
                  <Plus className='h-4 w-4 mr-2' />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Categoria</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova categoria para organizar seus serviços
                  </DialogDescription>
                </DialogHeader>
                <ServiceCategoryForm
                  clinicId={clinicId}
                  onSuccess={() => setShowCreateDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Search and Actions */}
          <div className='flex items-center justify-between gap-4'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                placeholder='Buscar categorias...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            {(!categories || categories.length === 0) && (
              <Button
                variant='outline'
                onClick={handleInitializeDefaults}
                disabled={initializeDefaults.isPending}
              >
                <Settings className='h-4 w-4 mr-2' />
                {initializeDefaults.isPending
                  ? 'Criando...'
                  : 'Criar Categorias Padrão'}
              </Button>
            )}
          </div>

          {/* Categories List */}
          {filteredCategories.length === 0
            ? (
              <div className='text-center py-12'>
                <Tag className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-medium mb-2'>
                  {searchQuery
                    ? 'Nenhuma categoria encontrada'
                    : 'Nenhuma categoria criada'}
                </h3>
                <p className='text-muted-foreground mb-4'>
                  {searchQuery
                    ? 'Tente ajustar sua busca ou criar uma nova categoria'
                    : 'Comece criando categorias para organizar seus serviços'}
                </p>
                {!searchQuery && (
                  <div className='flex gap-2 justify-center'>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className='h-4 w-4 mr-2' />
                      Criar Primeira Categoria
                    </Button>
                    <Button
                      variant='outline'
                      onClick={handleInitializeDefaults}
                      disabled={initializeDefaults.isPending}
                    >
                      <Settings className='h-4 w-4 mr-2' />
                      Usar Categorias Padrão
                    </Button>
                  </div>
                )}
              </div>
            )
            : (
              <div className='grid gap-3'>
                {filteredCategories.map(category => (
                  <Card
                    key={category.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <GripVertical className='h-4 w-4 text-muted-foreground cursor-grab' />
                          <div
                            className='w-4 h-4 rounded-full border-2 border-white shadow-sm'
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <h4 className='font-medium'>{category.name}</h4>
                            {category.description && (
                              <p className='text-sm text-muted-foreground'>
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          <Badge
                            variant={category.is_active ? 'default' : 'secondary'}
                          >
                            {category.is_active ? 'Ativa' : 'Inativa'}
                          </Badge>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => setEditingCategory(category)}
                              >
                                <Edit className='h-4 w-4 mr-2' />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteCategory(category)}
                                className='text-destructive'
                                disabled={deleteCategory.isPending}
                              >
                                <Trash2 className='h-4 w-4 mr-2' />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={() => setEditingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Atualize as informações da categoria
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <ServiceCategoryForm
              category={editingCategory}
              clinicId={clinicId}
              onSuccess={() => setEditingCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
