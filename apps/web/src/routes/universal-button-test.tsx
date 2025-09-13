import { UniversalButton } from '@/components/ui/universal-button';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/universal-button-test')({
  component: UniversalButtonTest,
});

function UniversalButtonTest() {
  return (
    <div className='min-h-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-4xl font-bold text-center mb-2 text-slate-800 dark:text-slate-200'>
          Universal Button Test (NeonPro Colors)
        </h1>
        <p className='text-center text-slate-600 dark:text-slate-400 mb-12'>
          Test all button styles: KokonutUI Gradient, CultUI Neumorph, Aceternity Border Gradient,
          and MagicUI Shine
        </p>

        {/* Basic Test Section */}
        <div className='grid md:grid-cols-2 gap-8 mb-12'>
          {/* Standard Variants */}
          <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg'>
            <h3 className='text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200'>
              Standard Variants (NeonPro Colors)
            </h3>
            <div className='space-y-4'>
              <UniversalButton
                variant='default'
                className='w-full'
              >
                Default (Deep Green)
              </UniversalButton>
              <UniversalButton
                variant='secondary'
                size='sm'
                className='w-full'
              >
                Secondary Small (Beige)
              </UniversalButton>
              <UniversalButton
                variant='outline'
                size='lg'
                className='w-full'
              >
                Outline Large (Gold Border)
              </UniversalButton>
            </div>
          </div>

          {/* Effects Testing */}
          <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg'>
            <h3 className='text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200'>
              Effects Testing
            </h3>
            <div className='space-y-4'>
              <UniversalButton
                enableHoverBorder
                variant='outline'
                className='w-full'
                hoverBorderDuration={2}
              >
                Hover Border Effect
              </UniversalButton>
              <UniversalButton
                enableShineBorder
                variant='default'
                className='w-full'
                shineDuration={3}
              >
                Shine Border Effect
              </UniversalButton>
              <UniversalButton
                enableHoverBorder
                enableShineBorder
                variant='secondary'
                className='w-full'
                shineDuration={4}
                hoverBorderDuration={2}
              >
                Combined Effects
              </UniversalButton>
            </div>
          </div>
        </div>

        {/* Gradient Effects Section */}
        <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-12'>
          <h2 className='text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200'>
            Gradient Effects (NeonPro Palette)
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <UniversalButton
              variant='gradient-primary'
              className='h-14'
            >
              Primary Gradient
            </UniversalButton>

            <UniversalButton
              variant='gradient-secondary'
              className='h-14'
            >
              Secondary Gradient
            </UniversalButton>

            <UniversalButton
              variant='gradient-gold'
              className='h-14'
            >
              Gold Gradient
            </UniversalButton>

            <UniversalButton
              variant='gradient-neon'
              className='h-14'
            >
              NeonPro Gradient
            </UniversalButton>
          </div>
        </div>

        {/* Neumorph Effects Section */}
        <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-12'>
          <h2 className='text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200'>
            Neumorph Effects (Smaller Radius)
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <UniversalButton
              variant='neumorph'
              className='h-14'
              neumorphIntensity='light'
            >
              Neumorph Light
            </UniversalButton>

            <UniversalButton
              variant='neumorph-primary'
              className='h-14'
              neumorphIntensity='medium'
            >
              Neumorph Primary
            </UniversalButton>

            <UniversalButton
              variant='neumorph-gold'
              className='h-14'
              neumorphIntensity='strong'
            >
              Neumorph Gold
            </UniversalButton>
          </div>
        </div>

        {/* Custom Effects */}
        <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-12'>
          <h2 className='text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200'>
            Custom Effects (Fixed Animations)
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <UniversalButton
              variant='default'
              gradientFrom='#AC9469'
              gradientTo='#294359'
              enableHoverBorder
              className='h-14'
              hoverBorderDuration={2}
            >
              Custom Gradient + Hover Border
            </UniversalButton>

            <UniversalButton
              enableShineBorder
              shineColor='#AC9469'
              variant='outline'
              className='h-14'
              shineDuration={2}
            >
              Custom Gold Shine
            </UniversalButton>
          </div>
        </div>

        {/* Combined Advanced Effects */}
        <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-12'>
          <h2 className='text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200'>
            Ultimate Combinations
          </h2>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <UniversalButton
              enableHoverBorder
              enableShineBorder
              variant='gradient-neon'
              className='h-16 text-lg'
              hoverBorderDuration={3}
              shineDuration={4}
              shineColor='#AC9469'
            >
              All Effects Combined
            </UniversalButton>

            <UniversalButton
              variant='neumorph-gold'
              enableShineBorder
              className='h-16 text-lg'
              shineDuration={3}
              shineColor='#294359'
              neumorphIntensity='medium'
            >
              Neumorph + Shine
            </UniversalButton>
          </div>
        </div>

        {/* Loading States */}
        <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg'>
          <h2 className='text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200'>
            Loading States
          </h2>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <UniversalButton
                loading={true}
                variant='default'
                className='h-12'
              >
                Loading Default
              </UniversalButton>

              <UniversalButton
                loading={true}
                loadingText='Processing...'
                variant='gradient-gold'
                className='h-12'
              >
                Custom Loading Text
              </UniversalButton>

              <UniversalButton
                enableHoverBorder
                loading={true}
                variant='outline'
                className='h-12'
              >
                Loading with Border
              </UniversalButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
