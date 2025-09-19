import { PricingRulesManager } from '@/components/pricing-rules/PricingRulesManager';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/financial/pricing-rules')({
  component: PricingRulesPage,
});

function PricingRulesPage() {
  return (
    <div className='container mx-auto py-6'>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Regras de Preços</h1>
          <p className='text-muted-foreground'>
            Configure regras dinâmicas de preços para serviços e profissionais
          </p>
        </div>

        <PricingRulesManager />
      </div>
    </div>
  );
}
