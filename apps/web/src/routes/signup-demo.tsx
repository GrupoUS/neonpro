import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/signup-demo')({
  loader: () => {
    throw redirect({ to: '/' });
  },
});
