import { LoginForm } from '@/components/auth/LoginForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/10 flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.05),transparent_50%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.05),transparent_50%)]' />

      <div className='w-full max-w-md relative z-10'>
        <div className='text-center mb-10'>
          <div className='mb-6'>
            <h1 className='text-5xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent mb-3'>
              NEON PRO
            </h1>
            <div className='w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full' />
          </div>
          <p className='text-xl text-muted-foreground font-medium'>
            Sistema para Clínicas de Estética
          </p>
          <p className='text-sm text-muted-foreground/80 mt-2'>
            Plataforma AI-First para profissionais brasileiros
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
