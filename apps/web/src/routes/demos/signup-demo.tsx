import { createFileRoute, redirect } from '@tanstack/react-router';

export const _Route = createFileRoute('/demos/signup-demo')({
  loader: () => {
    throw redirect({ to: '/' });
  },
});
