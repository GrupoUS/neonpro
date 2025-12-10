/**
 * 404 Not Found Route
 *
 * TanStack Router route for handling 404 errors
 */

import { NotFoundPage } from '@/components/error-pages/NotFoundPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/404')({
  component: NotFoundPage,
});

export default Route;
