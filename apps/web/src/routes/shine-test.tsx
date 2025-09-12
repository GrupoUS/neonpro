import { createFileRoute } from '@tanstack/react-router';
import { ShineBorder } from '../components/magicui/shine-border';

export const Route = createFileRoute('/shine-test')({
  component: ShineTestPage,
});

function ShineTestPage() {
  return (
    <div className='container mx-auto p-8 space-y-8'>
      <div className='text-center space-y-4'>
        <h1 className='text-4xl font-bold'>MagicUI Shine Border Test</h1>
        <p className='text-lg text-muted-foreground'>
          Teste oficial do componente Shine Border do MagicUI instalado via shadcn CLI
        </p>
      </div>

      {/* Teste 1: Shine Border dourado NeonPro com rotação 360° */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>
          Teste 1: Shine Border Dourado NeonPro com Rotação 360°
        </h2>
        <div className='relative h-[300px] w-full overflow-hidden rounded-lg'>
          <ShineBorder
            className='size-full'
            borderWidth={3}
            duration={6}
            shineColor='#AC9469'
          />
          <div className='relative z-10 flex h-full items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg'>
            <div className='text-center'>
              <h3 className='text-xl font-semibold'>Dourado NeonPro Original</h3>
              <p className='text-muted-foreground'>Animação de rotação contínua 360 graus</p>
              <p className='text-sm text-yellow-600 mt-2'>
                ✨ Cor dourada elegante com rotação suave
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Teste 2: Shine Border multicolor */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Teste 2: Shine Border Multicolor</h2>
        <div className='relative h-[300px] w-full overflow-hidden rounded-lg'>
          <ShineBorder
            className='size-full'
            borderWidth={3}
            duration={12}
            shineColor={['#112031', '#294359', '#AC9469', '#B4AC9C']}
          />
          <div className='relative z-10 flex h-full items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg'>
            <div className='text-center'>
              <h3 className='text-xl font-semibold'>Paleta NeonPro</h3>
              <p className='text-muted-foreground'>Cores da clínica estética</p>
            </div>
          </div>
        </div>
      </section>

      {/* Teste 3: Shine Border com velocidade rápida */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Teste 3: Shine Border Rápido</h2>
        <div className='relative h-[200px] w-full max-w-md mx-auto overflow-hidden rounded-lg'>
          <ShineBorder
            className='size-full'
            borderWidth={3}
            duration={4}
            shineColor={['#AC9469', '#294359']}
          />
          <div className='relative z-10 flex h-full items-center justify-center bg-card/80 backdrop-blur-sm rounded-lg'>
            <div className='text-center p-6'>
              <h3 className='text-lg font-semibold'>Animação Rápida</h3>
              <p className='text-sm text-muted-foreground'>4 segundos por ciclo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Teste 4: Shine Border fino */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Teste 4: Shine Border Fino</h2>
        <div className='relative h-[200px] w-full max-w-md mx-auto overflow-hidden rounded-lg'>
          <ShineBorder
            className='size-full'
            borderWidth={1}
            duration={10}
            shineColor='#AC9469'
          />
          <div className='relative z-10 flex h-full items-center justify-center bg-card/80 backdrop-blur-sm rounded-lg'>
            <div className='text-center p-6'>
              <h3 className='text-lg font-semibold'>Borda Fina</h3>
              <p className='text-sm text-muted-foreground'>1px de espessura</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparação com nossa implementação */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Comparação: MagicUI vs Nossa Implementação</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* MagicUI Oficial */}
          <div className='space-y-2'>
            <h3 className='text-lg font-medium'>MagicUI Oficial</h3>
            <div className='relative h-[200px] overflow-hidden rounded-lg'>
              <ShineBorder
                className='size-full'
                borderWidth={2}
                duration={8}
                shineColor='#AC9469'
              />
              <div className='relative z-10 flex h-full items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg'>
                <span className='text-sm font-medium'>Componente Oficial</span>
              </div>
            </div>
          </div>

          {/* Nossa implementação customizada */}
          <div className='space-y-2'>
            <h3 className='text-lg font-medium'>Nossa Implementação</h3>
            <div className='relative h-[200px] overflow-hidden rounded-lg bg-card/50 backdrop-blur-sm border'>
              <div className='flex h-full items-center justify-center'>
                <span className='text-sm font-medium'>Implementação Customizada</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testes de Props */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Teste de Props Avançado</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Borda espessa */}
          <div className='space-y-2'>
            <h4 className='text-sm font-medium'>Borda Espessa (5px)</h4>
            <div className='relative h-[150px] overflow-hidden rounded-lg'>
              <ShineBorder
                className='size-full'
                borderWidth={5}
                duration={6}
                shineColor='#294359'
              />
              <div className='relative z-10 flex h-full items-center justify-center bg-card/70 backdrop-blur-sm rounded-lg'>
                <span className='text-xs'>5px</span>
              </div>
            </div>
          </div>

          {/* Duração lenta */}
          <div className='space-y-2'>
            <h4 className='text-sm font-medium'>Duração Lenta (20s)</h4>
            <div className='relative h-[150px] overflow-hidden rounded-lg'>
              <ShineBorder
                className='size-full'
                borderWidth={2}
                duration={20}
                shineColor='#AC9469'
              />
              <div className='relative z-10 flex h-full items-center justify-center bg-card/70 backdrop-blur-sm rounded-lg'>
                <span className='text-xs'>20s</span>
              </div>
            </div>
          </div>

          {/* Gradiente complexo */}
          <div className='space-y-2'>
            <h4 className='text-sm font-medium'>Gradiente Complexo</h4>
            <div className='relative h-[150px] overflow-hidden rounded-lg'>
              <ShineBorder
                className='size-full'
                borderWidth={3}
                duration={8}
                shineColor={['#112031', '#294359', '#AC9469', '#B4AC9C', '#D2D0C8']}
              />
              <div className='relative z-10 flex h-full items-center justify-center bg-card/70 backdrop-blur-sm rounded-lg'>
                <span className='text-xs'>5 cores</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
