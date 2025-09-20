import { GovernanceDashboard } from '@/components/organisms/governance/GovernanceDashboard';
import { getCurrentSession } from '@/integrations/supabase/client';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/governance')({
  beforeLoad: async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw redirect({
        to: '/',
        search: { redirect: '/governance' },
      });
    }
    return { session };
  },
  component: GovernancePage,
});

function GovernancePage() {
  return <GovernanceDashboard />;
}
