import { GovernanceDashboard } from '@/components/governance/GovernanceDashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/governance')({
  component: () => <GovernanceDashboard />,
});
