import AppShellWithSidebar from '@/components/layout/AppShellWithSidebar';
import { createRootRoute as createRootRouteLocal } from '@tanstack/react-router';

export const Route = createRootRouteLocal({
  component: AppShellWithSidebar,
});
