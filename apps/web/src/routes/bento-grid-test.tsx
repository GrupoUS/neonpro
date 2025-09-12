import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { createFileRoute } from '@tanstack/react-router';
// Demo-only components removed; using core components only

/**
 * Bento Grid Test Page
 * Showcases the NeonPro Bento Grid component with aesthetic clinic content
 */
function BentoGridTestPage() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='bg-gradient-to-r from-[#294359] to-[#AC9469] text-white py-8'>
        <div className='container mx-auto px-4'>
          <h1 className='text-4xl font-bold mb-2'>Bento Grid Component</h1>
          <p className='text-white/80 text-lg'>
            Componente de grade responsivo para showcases de funcionalidades da NeonPro
          </p>
        </div>
      </div>

      {/* Main Demo */}
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-[#294359] mb-4'>Demo Completo</h2>
            <p className='text-muted-foreground mb-6'>
              Grade completa com todas as funcionalidades da plataforma NeonPro, incluindo animações
              suaves e design responsivo.
            </p>
          </div>
          <BentoGrid className='mx-auto max-w-5xl'>
            <BentoGridItem title='AI Chat' description='Atendimento estético com IA' />
            <BentoGridItem title='Agendamentos' description='Gestão de horários' />
            <BentoGridItem title='Clientes' description='Dados e consentimentos' />
            <BentoGridItem title='Relatórios' description='Resultados e insights' />
          </BentoGrid>
        </div>
      </section>

      {/* Simple Demo */}
      <section className='py-12 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-[#294359] mb-4'>Versão Simplificada</h2>
            <p className='text-muted-foreground mb-6'>
              Grade simplificada para seções menores ou telas móveis.
            </p>
          </div>
          <BentoGrid className='mx-auto max-w-4xl'>
            <BentoGridItem title='Simples' description='Versão compacta do grid' />
            <BentoGridItem title='Rápido' description='Animações suaves' />
            <BentoGridItem title='Acessível' description='WCAG 2.1 AA' />
          </BentoGrid>
        </div>
      </section>

      {/* Technical Details */}
      <section className='py-12'>
        <div className='container mx-auto px-4 max-w-4xl'>
          <h2 className='text-2xl font-bold text-[#294359] mb-6'>Detalhes Técnicos</h2>

          <div className='grid md:grid-cols-2 gap-6'>
            <div className='bg-card p-6 rounded-lg border'>
              <h3 className='text-lg font-semibold mb-4 text-[#294359]'>Características</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>• Design responsivo (mobile-first)</li>
                <li>• Animações suaves apenas nos cards</li>
                <li>• Cores da marca NeonPro</li>
                <li>• Acessibilidade WCAG 2.1 AA</li>
                <li>• Suporte a teclado e screen readers</li>
                <li>• Redução de movimento (prefers-reduced-motion)</li>
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
              <h3 className='text-lg font-semibold mb-4 text-[#294359]'>Uso</h3>
              <div className='text-sm text-muted-foreground'>
                <p className='mb-2'>Importação:</p>
                <code className='block bg-gray-100 p-2 rounded text-xs'>
                  import {`{BentoGrid, BentoGridItem}`} from '@/components/ui/bento-grid'
                </code>
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

export const Route = createFileRoute('/bento-grid-test')({
  component: BentoGridTestPage,
});
