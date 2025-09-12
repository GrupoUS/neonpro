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
          <AuthForm />
        </div>
      </div>
    </BeamsBackground>
  );
}
