import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/components/auth/LoginForm';

export const Route = createFileRoute('/signup-demo')({
  component: SignupDemoPage,
});

function SignupDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
