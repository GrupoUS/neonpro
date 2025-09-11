import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/ui/shimmer-button';

/**
 * Demonstração do ShimmerButton
 *
 * Este componente mostra diferentes usos do botão shimmer
 * comparado com outros variants do Button para referência visual.
 */
export function ShimmerButtonDemo() {
  return (
    <div className='space-y-6 p-8'>
      <div className='space-y-4'>
        <h2 className='text-2xl font-semibold text-foreground'>
          Demonstração ShimmerButton
        </h2>
        <p className='text-muted-foreground'>
          Botão com efeito shimmer usando as cores do sistema NeonPro
        </p>
      </div>

      {/* Shimmer Buttons */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-foreground'>Shimmer Buttons</h3>
        <div className='flex flex-wrap gap-4'>
          <ShimmerButton size='sm'>
            Pequeno
          </ShimmerButton>

          <ShimmerButton>
            Padrão
          </ShimmerButton>

          <ShimmerButton size='lg'>
            Agendar Consulta
          </ShimmerButton>
        </div>
      </div>

      {/* Comparação com outros variants */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-foreground'>Comparação com outros Buttons</h3>
        <div className='flex flex-wrap gap-4'>
          <Button variant='default'>
            Default
          </Button>

          <Button variant='secondary'>
            Secondary
          </Button>

          <Button variant='outline'>
            Outline
          </Button>

          <ShimmerButton>
            Shimmer
          </ShimmerButton>
        </div>
      </div>

      {/* Casos de uso específicos */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-foreground'>Casos de Uso</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-muted-foreground'>Call-to-Action Principal</h4>
            <ShimmerButton size='lg' className='w-full'>
              Agendar Agora
            </ShimmerButton>
          </div>

          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-muted-foreground'>Ação Especial</h4>
            <ShimmerButton className='w-full'>
              Procedimento Premium
            </ShimmerButton>
          </div>

          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-muted-foreground'>Botão Compacto</h4>
            <ShimmerButton size='sm' className='w-full'>
              Confirmar
            </ShimmerButton>
          </div>
        </div>
      </div>
    </div>
  );
}
