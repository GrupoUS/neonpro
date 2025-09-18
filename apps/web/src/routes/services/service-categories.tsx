/**
 * Service Categories Management Page
 * Allows clinic staff to manage service categories
 */

import { ServiceCategoryManager } from '@/components/service-categories/ServiceCategoryManager';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@neonpro/ui';
import { Button } from '@neonpro/ui';
import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

function ServiceCategoriesPage() {
  const { profile } = useAuth();

  // Loading state removed since useAuth doesn't have isLoading

  if (!profile) {
    return (
      <div className='container mx-auto py-8'>
        <Card>
          <CardContent className='p-8 text-center'>
            <AlertTriangle className='h-12 w-12 text-amber-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>Acesso Restrito</h2>
            <p className='text-muted-foreground mb-4'>
              Você precisa estar logado para acessar o gerenciamento de categorias.
            </p>
            <Button asChild>
              <Link to='/login'>Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile.clinicId) {
    return (
      <div className='container mx-auto py-8'>
        <Card>
          <CardContent className='p-8 text-center'>
            <AlertTriangle className='h-12 w-12 text-amber-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>Clínica Não Encontrada</h2>
            <p className='text-muted-foreground mb-4'>
              Não foi possível identificar sua clínica. Entre em contato com o suporte.
            </p>
            <Button variant='outline' asChild>
              <Link to='/dashboard'>Voltar ao Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <Button variant='ghost' size='sm' asChild>
                <Link to='/services'>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Voltar aos Serviços
                </Link>
              </Button>
            </div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Categorias de Serviços
            </h1>
            <p className='text-muted-foreground'>
              Organize seus serviços em categorias para melhor gestão e navegação
            </p>
          </div>
        </div>

        {/* Service Category Manager */}
        <ServiceCategoryManager clinicId={profile.clinicId} />

        {/* Help Section */}
        <Card>
          <CardContent className='p-6'>
            <h3 className='font-semibold mb-3'>Como usar as categorias de serviços</h3>
            <div className='grid md:grid-cols-2 gap-4 text-sm text-muted-foreground'>
              <div>
                <h4 className='font-medium text-foreground mb-2'>Organização</h4>
                <ul className='space-y-1'>
                  <li>• Agrupe serviços similares em categorias</li>
                  <li>• Use nomes descritivos e claros</li>
                  <li>• Mantenha uma hierarquia lógica</li>
                </ul>
              </div>
              <div>
                <h4 className='font-medium text-foreground mb-2'>Personalização</h4>
                <ul className='space-y-1'>
                  <li>• Escolha cores que representem cada categoria</li>
                  <li>• Ordene por prioridade ou frequência de uso</li>
                  <li>• Desative categorias não utilizadas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className='flex justify-center'>
          <Button variant='outline' asChild>
            <Link to='/services'>
              Gerenciar Serviços
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/services/service-categories')({
  component: ServiceCategoriesPage,
});
