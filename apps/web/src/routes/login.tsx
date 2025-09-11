import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
  loader: () => {
    throw redirect({ to: '/' });
  },
});
