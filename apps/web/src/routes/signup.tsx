import { createFileRoute, useRouter } from '@tanstack/react-router';
import SignupFormDemo from '@/components/ui/signup-form-demo';

export const Route = createFileRoute('/signup')({
  component: Signup,
});

function Signup() {
  const router = useRouter();
  return (
    <SignupFormDemo navigate={(to) => router.navigate({ to })} />
  );
}
