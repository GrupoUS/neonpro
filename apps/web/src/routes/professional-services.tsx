/**
 * Professional Services Management Page
 * Allows clinic staff to manage professional-service assignments
 */

import { ProfessionalServiceManager } from '@/components/professional-services/ProfessionalServiceManager';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@neonpro/ui';
import { Button } from '@neonpro/ui';
import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

function ProfessionalServicesPage() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className='container mx-auto py-8'>
        <Card>
          <CardContent className='p-8 text-center'>
            <AlertTriangle className='h-12 w-12 text-amber-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>Acesso Restrito</h2>
            <p className='text-muted-foreground mb-4'>
              Você precisa estar logado para acessar o gerenciamento de atribuições.
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
              Atribuições Profissional-Serviço
            </h1>
            <p className='text-muted-foreground'>
              Gerencie quais profissionais podem realizar cada serviço da clínica
            </p>
          </div>
        </div>

        {/* Professional Service Manager */}
        <ProfessionalServiceManager clinicId={profile.clinicId} />

        {/* Help Section */}
        <Card>
          <CardContent className='p-6'>
            <h3 className='font-semibold mb-3'>Como gerenciar atribuições profissional-serviço</h3>
            <div className='grid md:grid-cols-2 gap-4 text-sm text-muted-foreground'>
              <div>
                <h4 className='font-medium text-foreground mb-2'>Atribuições</h4>
                <ul className='space-y-1'>
                  <li>• Atribua serviços específicos a cada profissional</li>
                  <li>• Defina níveis de proficiência para cada atribuição</li>
                  <li>• Configure profissionais principais para cada serviço</li>
                </ul>
              </div>
              <div>
                <h4 className='font-medium text-foreground mb-2'>Níveis de Proficiência</h4>
                <ul className='space-y-1'>
                  <li>
                    • <span className='font-medium'>Iniciante:</span>{' '}
                    Conhecimento básico, requer supervisão
                  </li>
                  <li>
                    • <span className='font-medium'>Intermediário:</span> Trabalha independentemente
                  </li>
                  <li>
                    • <span className='font-medium'>Avançado:</span>{' '}
                    Pode treinar outros profissionais
                  </li>
                  <li>
                    • <span className='font-medium'>Especialista:</span> Referência na área
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className='flex justify-center gap-4'>
          <Button variant='outline' asChild>
            <Link to='/services'>
              Gerenciar Serviços
            </Link>
          </Button>
          <Button variant='outline' asChild>
            <Link to='/service-categories'>
              Categorias de Serviços
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/professional-services')({
  component: ProfessionalServicesPage,
});
