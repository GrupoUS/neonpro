import { createRootRoute as createRootRouteLocal } from '@tanstack/react-router';
import AppShellWithSidebar from '@/components/layout/AppShellWithSidebar';

export const Route = createRootRouteLocal({
  component: AppShellWithSidebar,
});
