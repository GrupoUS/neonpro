import { createFileRoute } from '@tanstack/react-router';
import { UniversalButton } from '../components/ui/universal-button';

export const Route = createFileRoute('/button-test')({
  component: ButtonTestPage,
});

function ButtonTestPage() {
  return (
    <div className='container mx-auto p-8 space-y-8'>
      <div className='text-center space-y-4'>
        <h1 className='text-4xl font-bold'>Button Test (Updated)</h1>
        <p className='text-lg text-muted-foreground'>
          Teste usando UniversalButton que funciona perfeitamente
        </p>
      </div>

      {/* Teste 1: UniversalButton com hover border */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Teste 1: UniversalButton com Hover Border</h2>
        <div className='flex flex-wrap gap-4 justify-center'>
          <UniversalButton
            variant='default'
            enableHoverBorder={true}
            hoverBorderDuration={2}
            hoverClockwise={true}
          >
            Hover Border (Clockwise)
          </UniversalButton>

          <UniversalButton
            variant='secondary'
            enableHoverBorder={true}
            hoverBorderDuration={1}
            hoverClockwise={false}
          >
            Hover Border (Counter)
          </UniversalButton>

          <UniversalButton
            variant='gradient-neon'
            enableShineBorder={true}
            shineDuration={3}
            shineColor='#AC9469'
          >
            NeonPro Shine
          </UniversalButton>
        </div>
      </section>

      {/* Teste 2: Gradient Buttons */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Teste 2: Gradient Effects</h2>
        <div className='flex flex-wrap gap-4 justify-center'>
          <UniversalButton variant='gradient-primary' effect='hover'>
            Gradient Primary
          </UniversalButton>

          <UniversalButton variant='gradient-gold' effect='bounce'>
            Gradient Gold
          </UniversalButton>

          <UniversalButton variant='gradient-neon' effect='hover'>
            NeonPro Gradient
          </UniversalButton>
        </div>
      </section>

      {/* Teste 3: Neumorph Buttons */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Teste 3: Neumorph Effects</h2>
        <div className='flex flex-wrap gap-4 justify-center'>
          <UniversalButton variant='neumorph' effect='neumorph'>
            Neumorph Default
          </UniversalButton>

          <UniversalButton variant='neumorph-primary' effect='neumorph'>
            Neumorph Primary
          </UniversalButton>

          <UniversalButton variant='neumorph-gold' effect='neumorph'>
            Neumorph Gold
          </UniversalButton>
        </div>
      </section>

      {/* Teste 4: Combinações */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Teste 4: Combinações Avançadas</h2>
        <div className='flex flex-wrap gap-4 justify-center'>
          <UniversalButton
            variant='gradient-neon'
            enableShineBorder={true}
            enableHoverBorder={true}
            effect='bounce'
            size='lg'
          >
            ALL EFFECTS! 🎉
          </UniversalButton>

          <UniversalButton
            variant='neumorph'
            enableHoverBorder={true}
            effect='neumorph'
            size='lg'
          >
            Neumorph + Border
          </UniversalButton>
        </div>
      </section>
    </div>
  );
}
