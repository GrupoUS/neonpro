/**
 * Service Management Page
 * Comprehensive service management with CRUD operations
 */

import { createFileRoute } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  SmoothDrawer,
  SmoothDrawerContent,
  SmoothDrawerDescription,
  SmoothDrawerHeader,
  SmoothDrawerTitle,
} from '@neonpro/ui';

import { ServiceForm } from '@/components/services/ServiceForm';
import { ServicesDataTable } from '@/components/services/ServicesDataTable';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteService, useServices } from '@/hooks/useServices';
import type { Service } from '@/types/service';
import { toast } from 'sonner';
function ServicesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  // Get clinic ID from user profile - consistent with other pages
  const clinicId = profile?.clinicId || profile?.tenantId || user?.user_metadata?.clinic_id;

  // Fetch services data - must be called before any early returns to maintain hooks order
  const { data: servicesResponse, isLoading, error } = useServices({
    clinic_id: clinicId || '',
    is_active: true,
  });

  // Delete service mutation - must be before early returns
  const deleteServiceMutation = useDeleteService();

  // Extract services array from response
  const services = servicesResponse?.data || [];

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className='container mx-auto py-8'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              <span className='ml-2 text-muted-foreground'>Carregando...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If clinicId is missing, show error and prevent data fetch
  if (!clinicId) {
    return (
      <div className='container mx-auto py-8'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-lg font-semibold text-amber-600'>Clínica não configurada</p>
              <p className='mt-2 text-sm text-muted-foreground'>
                Você precisa estar associado a uma clínica para gerenciar serviços.
              </p>
              <Button
                variant='outline'
                onClick={() => window.location.href = '/settings'}
                className='mt-4'
              >
                Ir para Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = (service: Service) => {
    setEditingService(service);
  };

  const handleDelete = async (service: Service) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${service.name}"?`)) {
      try {
        await deleteServiceMutation.mutateAsync(service.id);
        toast.success('Serviço excluído com sucesso!');
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Erro ao excluir serviço. Tente novamente.');
      }
    }
  };

  const handleFormSuccess = () => {
    setEditingService(null);
    setIsCreateDrawerOpen(false);
    toast.success(editingService ? 'Serviço atualizado!' : 'Serviço criado!');
  };

  if (error) {
    return (
      <div className='container mx-auto py-8'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center text-destructive'>
              Erro ao carregar serviços: {(error as Error)?.message || 'Erro desconhecido'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Serviços</h1>
          <p className='text-muted-foreground'>
            Gerencie os serviços oferecidos pela sua clínica
          </p>
        </div>
        <Button onClick={() => setIsCreateDrawerOpen(true)} className='gap-2'>
          <Plus className='h-4 w-4' />
          Novo Serviço
        </Button>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>
            {services.length} serviço{services.length !== 1 ? 's' : ''}{' '}
            cadastrado{services.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServicesDataTable
            data={services}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Create Service Drawer */}
      <SmoothDrawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
        <SmoothDrawerContent>
          <SmoothDrawerHeader>
            <SmoothDrawerTitle>Criar Novo Serviço</SmoothDrawerTitle>
            <SmoothDrawerDescription>
              Preencha as informações do novo serviço
            </SmoothDrawerDescription>
          </SmoothDrawerHeader>
          <ServiceForm
            onSuccess={handleFormSuccess}
            clinicId={clinicId}
          />
        </SmoothDrawerContent>
      </SmoothDrawer>

      {/* Edit Service Drawer */}
      <SmoothDrawer open={!!editingService} onOpenChange={() => setEditingService(null)}>
        <SmoothDrawerContent>
          <SmoothDrawerHeader>
            <SmoothDrawerTitle>Editar Serviço</SmoothDrawerTitle>
            <SmoothDrawerDescription>
              Atualize as informações do serviço
            </SmoothDrawerDescription>
          </SmoothDrawerHeader>
          {editingService && (
            <ServiceForm
              service={editingService}
              onSuccess={handleFormSuccess}
              clinicId={clinicId}
            />
          )}
        </SmoothDrawerContent>
      </SmoothDrawer>
    </div>
  );
}

export const Route = createFileRoute('/services')({
  component: ServicesPage,
});
