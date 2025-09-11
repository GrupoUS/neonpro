/**
 * 404 Not Found Route
 * 
 * TanStack Router route for handling 404 errors
 */

import { createFileRoute } from '@tanstack/react-router';
import { NotFoundPage } from '@/components/error-pages/NotFoundPage';

export const Route = createFileRoute('/404')({
  component: NotFoundPage,
});

export default Route;
