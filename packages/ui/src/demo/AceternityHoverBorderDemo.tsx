import { EnhancedShineBorder, HoverBorderGradient } from '../components/aceternity';

export function AceternityHoverBorderDemo() {
  return (
    <div className='flex flex-col gap-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen'>
      <h1 className='text-3xl font-bold text-center'>
        Aceternity Hover Border Gradient + NeonPro Shine Border
      </h1>

      {/* Pure Aceternity Hover Border Gradient */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>
          Pure Aceternity Hover Border Gradient
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <HoverBorderGradient theme='blue' duration={1.5}>
            <span className='font-medium'>Blue Theme</span>
          </HoverBorderGradient>

          <HoverBorderGradient theme='neonpro' duration={2} clockwise={false}>
            <span className='font-medium'>NeonPro Theme</span>
          </HoverBorderGradient>

          <HoverBorderGradient theme='aesthetic' duration={1}>
            <span className='font-medium'>Aesthetic Theme</span>
          </HoverBorderGradient>
        </div>
      </div>

      {/* Enhanced Shine Border (Combination) */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>
          Enhanced Shine Border (Shine + Hover Gradient)
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <EnhancedShineBorder
            enableShine={true}
            enableHoverGradient={true}
            pattern='wave'
            theme='gold'
            hoverGradientTheme='neonpro'
            className='h-32 flex items-center justify-center'
          >
            <div className='text-center'>
              <h3 className='font-bold text-amber-200'>Tratamento Premium</h3>
              <p className='text-sm text-amber-100'>Shine + Hover Gradient</p>
            </div>
          </EnhancedShineBorder>

          <EnhancedShineBorder
            enableShine={true}
            enableHoverGradient={true}
            pattern='orbital'
            theme='purple'
            hoverGradientTheme='purple'
            intensity='vibrant'
            speed='slow'
            className='h-32 flex items-center justify-center'
          >
            <div className='text-center'>
              <h3 className='font-bold text-purple-200'>Pacote Especial</h3>
              <p className='text-sm text-purple-100'>Purple Aesthetic</p>
            </div>
          </EnhancedShineBorder>
        </div>
      </div>

      {/* Aesthetic Clinic Examples */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>
          NeonPro Clínica Estética - Showcase
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Premium Treatment Card */}
          <HoverBorderGradient
            theme='neonpro'
            duration={2}
            as='div'
            className='!bg-gradient-to-br !from-amber-50 !to-orange-50 !text-amber-800 h-40'
          >
            <div className='text-center p-4'>
              <h3 className='text-lg font-bold text-amber-800'>
                Harmonização Facial
              </h3>
              <p className='text-sm text-amber-700'>
                Resultado natural e elegante
              </p>
              <div className='mt-2 text-2xl font-bold text-amber-900'>
                R$ 899
              </div>
              <button className='mt-2 px-4 py-1 bg-amber-700 text-white rounded-full text-xs hover:bg-amber-600 transition'>
                Agendar
              </button>
            </div>
          </HoverBorderGradient>

          {/* Advanced Treatment */}
          <EnhancedShineBorder
            enableShine={true}
            enableHoverGradient={true}
            pattern='pulse'
            theme='silver'
            hoverGradientTheme='aesthetic'
            as='div'
            className='!bg-gradient-to-br !from-purple-50 !to-pink-50 !text-purple-800 h-40'
          >
            <div className='text-center p-4'>
              <h3 className='text-lg font-bold text-purple-800'>
                Lifting Facial
              </h3>
              <p className='text-sm text-purple-700'>Tecnologia avançada</p>
              <div className='mt-2 text-2xl font-bold text-purple-900'>
                R$ 1.299
              </div>
              <button className='mt-2 px-4 py-1 bg-purple-700 text-white rounded-full text-xs hover:bg-purple-600 transition'>
                Consultar
              </button>
            </div>
          </EnhancedShineBorder>

          {/* Premium Package */}
          <HoverBorderGradient
            theme='green'
            duration={1.5}
            clockwise={false}
            as='div'
            className='!bg-gradient-to-br !from-green-50 !to-emerald-50 !text-green-800 h-40'
          >
            <div className='text-center p-4'>
              <h3 className='text-lg font-bold text-green-800'>
                Protocolo Completo
              </h3>
              <p className='text-sm text-green-700'>Rejuvenescimento total</p>
              <div className='mt-2 text-2xl font-bold text-green-900'>
                R$ 2.499
              </div>
              <button className='mt-2 px-4 py-1 bg-green-700 text-white rounded-full text-xs hover:bg-green-600 transition'>
                Conhecer
              </button>
            </div>
          </HoverBorderGradient>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>
          Interactive Demo - Hover Effects
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='p-6 bg-white rounded-lg shadow-lg'>
            <h3 className='text-lg font-semibold mb-4'>
              Aceternity Hover Border
            </h3>
            <HoverBorderGradient theme='blue' duration={1}>
              Hover me for gradient effect
            </HoverBorderGradient>
          </div>

          <div className='p-6 bg-white rounded-lg shadow-lg'>
            <h3 className='text-lg font-semibold mb-4'>Combined Effects</h3>
            <EnhancedShineBorder
              enableShine={true}
              enableHoverGradient={true}
              pattern='linear'
              theme='gold'
              hoverGradientTheme='neonpro'
              hoverOnly={true}
            >
              Hover for shine + gradient
            </EnhancedShineBorder>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AceternityHoverBorderDemo;
