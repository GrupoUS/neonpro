import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/signup')({
  loader: () => {
    throw redirect({ to: '/' });
  },
});
