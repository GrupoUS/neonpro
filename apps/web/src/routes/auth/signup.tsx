import { createFileRoute, redirect } from '@tanstack/react-router';

export const _Route = createFileRoute('/auth/signup')({
  loader: () => {
    throw redirect({ to: '/' });
  },
});
