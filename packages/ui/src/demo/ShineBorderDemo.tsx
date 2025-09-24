import { ShineBorder } from '../components/magicui'

export function ShineBorderDemo() {
  return (
    <div className='flex flex-col gap-8 p-8'>
      <h1 className='text-2xl font-bold'>ShineBorder Component Demo</h1>

      {/* Basic Example */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Basic Example</h2>
        <ShineBorder className='w-64 h-32'>
          <div className='text-center'>
            <h3 className='font-medium'>Basic Shine Border</h3>
            <p className='text-sm text-gray-600'>Default settings</p>
          </div>
        </ShineBorder>
      </div>

      {/* Different Themes */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Different Themes</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <ShineBorder theme='gold' className='w-40 h-24'>
            <span className='text-sm font-medium'>Gold</span>
          </ShineBorder>
          <ShineBorder theme='silver' className='w-40 h-24'>
            <span className='text-sm font-medium'>Silver</span>
          </ShineBorder>
          <ShineBorder theme='blue' className='w-40 h-24'>
            <span className='text-sm font-medium'>Blue</span>
          </ShineBorder>
          <ShineBorder theme='neonpro-primary' className='w-40 h-24'>
            <span className='text-sm font-medium'>NeonPro</span>
          </ShineBorder>
        </div>
      </div>

      {/* Different Patterns */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Different Patterns</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <ShineBorder pattern='linear' className='w-48 h-32'>
            <div className='text-center'>
              <h3 className='font-medium'>Linear</h3>
              <p className='text-sm text-gray-600'>Horizontal sweep</p>
            </div>
          </ShineBorder>
          <ShineBorder pattern='wave' className='w-48 h-32'>
            <div className='text-center'>
              <h3 className='font-medium'>Wave</h3>
              <p className='text-sm text-gray-600'>Diagonal wave</p>
            </div>
          </ShineBorder>
          <ShineBorder pattern='orbital' className='w-48 h-32'>
            <div className='text-center'>
              <h3 className='font-medium'>Orbital</h3>
              <p className='text-sm text-gray-600'>Rotating effect</p>
            </div>
          </ShineBorder>
        </div>
      </div>

      {/* NeonPro Aesthetic Clinic Examples */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>
          NeonPro Aesthetic Clinic Examples
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <ShineBorder
            theme='aesthetic-gold'
            pattern='wave'
            intensity='vibrant'
            duration={8}
            className='w-full h-40 bg-gradient-to-br from-amber-50 to-orange-50'
          >
            <div className='text-center p-4'>
              <h3 className='text-lg font-bold text-amber-800'>
                Tratamento Premium
              </h3>
              <p className='text-sm text-amber-700'>
                Realce sua beleza natural
              </p>
              <div className='mt-2 text-2xl font-bold text-amber-900'>
                R$ 299
              </div>
            </div>
          </ShineBorder>

          <ShineBorder
            theme='beauty-rainbow'
            pattern='orbital'
            intensity='normal'
            speed='slow'
            className='w-full h-40 bg-gradient-to-br from-pink-50 to-purple-50'
          >
            <div className='text-center p-4'>
              <h3 className='text-lg font-bold text-purple-800'>
                Pacote Completo
              </h3>
              <p className='text-sm text-purple-700'>Cuidado total da pele</p>
              <div className='mt-2 text-2xl font-bold text-purple-900'>
                R$ 599
              </div>
            </div>
          </ShineBorder>
        </div>
      </div>
    </div>
  )
}

export default ShineBorderDemo
