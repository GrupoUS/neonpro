import { AuthForm } from '@/components/auth/AuthForm';
import { createFileRoute } from '@tanstack/react-router';

export const _Route = createFileRoute('/')({
  component: LoginLanding,
});

function LoginLanding() {
  return (
    <div className='min-h-full h-full flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <AuthForm defaultMode='sign-in' onSuccessRedirectTo='/dashboard' />
      </div>
    </div>
  );
}
