import { AuthForm } from '@/components/auth/AuthForm';
import { BeamsBackground } from '@/components/ui/beams-background';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <BeamsBackground>
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <div className='flex flex-col items-center gap-4 mb-6'>
            <img
              src='/brand/simboloneonpro.png'
              alt='NeonPro'
              className='h-14 w-14 rounded-md object-contain'
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/neonpro-favicon.svg';
              }}
            />
            <h1 className='text-xl font-semibold text-foreground'>NeonPro</h1>
          </div>
          <AuthForm />
        </div>
      </div>
    </BeamsBackground>
  );
}
