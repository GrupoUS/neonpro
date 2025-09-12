import { TestShadcnSetup } from '@/components/test-shadcn-setup';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/shadcn-test')({
  component: ShadcnTestPage,
});

function ShadcnTestPage() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto py-8'>
        <TestShadcnSetup />
      </div>
    </div>
  );
}
