import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/components/auth/LoginForm';

export const Route = createFileRoute('/signup')({
  component: Signup,
});

function Signup() {
  return <LoginForm />;
}
