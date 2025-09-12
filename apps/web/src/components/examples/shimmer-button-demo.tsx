import { Button } from '@/components/atoms/button';
// ShimmerButton not present; demo disabled
// import { ShimmerButton } from '@/components/ui/shimmer-button';

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
          {/* ShimmerButton examples temporarily disabled until component exists */}
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

          {/* Shimmer demo placeholder until component exists */}
          <Button variant='outline' disabled>
            Shimmer (demo)
          </Button>
        </div>
      </div>

      {/* Casos de uso específicos */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-foreground'>Casos de Uso</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-muted-foreground'>Call-to-Action Principal</h4>
            {/* Shimmer demo placeholder until component exists */}
            <Button size='lg' className='w-full' disabled>
              Agendar Agora (demo)
            </Button>
          </div>

          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-muted-foreground'>Ação Especial</h4>
            {/* Shimmer demo placeholder until component exists */}
            <Button className='w-full' disabled>
              Procedimento Premium (demo)
            </Button>
          </div>

          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-muted-foreground'>Botão Compacto</h4>
            {/* Shimmer demo placeholder until component exists */}
            <Button size='sm' className='w-full' disabled>
              Confirmar (demo)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
