import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { Badge } from '@neonpro/ui';
import { createFileRoute } from '@tanstack/react-router';
import {
  Activity,
  Calendar,
  DollarSign,
  Palette,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

/**
 * Bento Grid Test Page
 * Showcases the NeonPro Bento Grid component with aesthetic clinic content
 */
function BentoGridTestPage() {
  return (
    <div className='min-h-full h-full bg-background'>
      {/* Header */}
      <div className='bg-gradient-to-r from-[#294359] to-[#AC9469] text-white py-8'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center gap-3 mb-4'>
            <h1 className='text-4xl font-bold'>Kokonut UI Bento Grid</h1>
            <Badge className='bg-white/20 text-white border-white/30'>
              Enhanced
            </Badge>
          </div>
          <p className='text-white/80 text-lg'>
            Grade responsiva com animações avançadas e design system integrado
          </p>
        </div>
      </div>

      {/* Main Demo */}
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-[#294359] mb-4'>Demo Kokonut UI Enhanced</h2>
            <p className='text-muted-foreground mb-6'>
              Grade com animações avançadas do Kokonut UI, ícones integrados e variantes de design.
            </p>
          </div>
          <BentoGrid className='mx-auto max-w-5xl' useKokonutUI={true} density='comfortable'>
            <BentoGridItem
              title='AI Chat Estético'
              description='Atendimento inteligente para procedimentos estéticos'
              icon={<Sparkles className='w-5 h-5' />}
              variant='primary'
              size='lg'
              enhanced={true}
              elevation='md'
              emphasis='brand'
            />
            <BentoGridItem
              title='Agendamentos'
              description='Gestão inteligente de horários'
              icon={<Calendar className='w-5 h-5' />}
              variant='secondary'
              size='md'
              enhanced={true}
            />
            <BentoGridItem
              title='Pacientes'
              description='Base completa de clientes'
              icon={<Users className='w-5 h-5' />}
              variant='accent'
              size='md'
              enhanced={true}
            />
            <BentoGridItem
              title='Relatórios'
              description='Analytics e insights'
              icon={<TrendingUp className='w-5 h-5' />}
              variant='default'
              size='sm'
              enhanced={true}
            />
            <BentoGridItem
              title='Receita'
              description='Controle financeiro'
              icon={<DollarSign className='w-5 h-5' />}
              variant='primary'
              size='sm'
              enhanced={true}
            />
            <BentoGridItem
              title='Atividades'
              description='Timeline de ações'
              icon={<Activity className='w-5 h-5' />}
              variant='default'
              size='md'
              enhanced={true}
              kokonutContent={
                <div className='mt-4 space-y-2'>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <span>3 consultas hoje</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <span>5 agendamentos</span>
                  </div>
                </div>
              }
            />
          </BentoGrid>
        </div>
      </section>

      {/* Simple Demo */}
      <section className='py-12 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-[#294359] mb-4'>Versão Legacy (Fallback)</h2>
            <p className='text-muted-foreground mb-6'>
              Grade com animações reduzidas para dispositivos com prefer-reduced-motion ou feature
              flag desabilitada.
            </p>
          </div>
          <BentoGrid className='mx-auto max-w-4xl' useKokonutUI={false} density='compact'>
            <BentoGridItem
              title='Simples'
              description='Versão compacta sem animações'
              icon={<Zap className='w-5 h-5' />}
              enhanced={false}
            />
            <BentoGridItem
              title='Rápido'
              description='Performance otimizada'
              icon={<Palette className='w-5 h-5' />}
              enhanced={false}
            />
            <BentoGridItem
              title='Acessível'
              description='WCAG 2.1 AA compliant'
              icon={<Users className='w-5 h-5' />}
              enhanced={false}
            />
          </BentoGrid>
        </div>
      </section>

      {/* Technical Details */}
      <section className='py-12'>
        <div className='container mx-auto px-4 max-w-4xl'>
          <h2 className='text-2xl font-bold text-[#294359] mb-6'>Detalhes Técnicos</h2>

          <div className='grid md:grid-cols-2 gap-6'>
            <div className='bg-card p-6 rounded-lg border'>
              <h3 className='text-lg font-semibold mb-4 text-[#294359]'>
                Características Kokonut UI
              </h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>• Design responsivo com Framer Motion</li>
                <li>• Animações avançadas (hover, spring physics)</li>
                <li>• Feature flag para rollout gradual</li>
                <li>• Acessibilidade WCAG 2.1 AA aprimorada</li>
                <li>• Suporte completo a reduced-motion</li>
                <li>• Densidade controlável (comfortable/compact)</li>
                <li>• Elevação e ênfase customizáveis</li>
                <li>• Ícones integrados com Lucide React</li>
              </ul>
            </div>

            <div className='bg-card p-6 rounded-lg border'>
              <h3 className='text-lg font-semibold mb-4 text-[#294359]'>Variantes</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>
                  • <strong>Default:</strong> Fundo claro padrão
                </li>
                <li>
                  • <strong>Primary:</strong> Gradiente azul escuro (#112031 → #294359)
                </li>
                <li>
                  • <strong>Secondary:</strong> Gradiente dourado (#AC9469 → #B4AC9C)
                </li>
                <li>
                  • <strong>Accent:</strong> Gradiente misto (#294359 → #AC9469)
                </li>
              </ul>
            </div>

            <div className='bg-card p-6 rounded-lg border'>
              <h3 className='text-lg font-semibold mb-4 text-[#294359]'>Tamanhos</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>
                  • <strong>sm:</strong> 1 coluna, altura mínima 200px
                </li>
                <li>
                  • <strong>md:</strong> 2 colunas, altura mínima 250px
                </li>
                <li>
                  • <strong>lg:</strong> 3 colunas, altura mínima 300px
                </li>
                <li>
                  • <strong>xl:</strong> 4 colunas, altura mínima 400px
                </li>
              </ul>
            </div>

            <div className='bg-card p-6 rounded-lg border'>
              <h3 className='text-lg font-semibold mb-4 text-[#294359]'>Uso Kokonut UI</h3>
              <div className='text-sm text-muted-foreground space-y-3'>
                <div>
                  <p className='mb-2 font-medium'>Importação:</p>
                  <code className='block bg-gray-100 p-2 rounded text-xs font-mono'>
                    import {`{BentoGrid, BentoGridItem}`} from '@/components/ui/bento-grid'
                  </code>
                </div>
                <div>
                  <p className='mb-2 font-medium'>Exemplo de uso:</p>
                  <code className='block bg-gray-100 p-2 rounded text-xs font-mono whitespace-pre'>
                    {`<BentoGrid useKokonutUI={true} density="comfortable">
  <BentoGridItem 
    title="Título" 
    description="Descrição"
    icon={<Icon />}
    variant="primary"
    enhanced={true}
    elevation="md"
  />
</BentoGrid>`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-[#294359] text-white py-8'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-white/80'>
            Componente Bento Grid - NeonPro Clínica Estética Platform
          </p>
          <p className='text-white/60 text-sm mt-2'>
            Desenvolvido com shadcn/ui, Tailwind CSS e React
          </p>
        </div>
      </footer>
    </div>
  );
}

export const Route = createFileRoute('/__tests/bento-grid-test')({
  component: BentoGridTestPage,
});
