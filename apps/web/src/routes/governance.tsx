import { GovernanceDashboard } from '@/components/governance/GovernanceDashboard';
import { useAuth } from '@/hooks/useAuth';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/governance')({
  beforeLoad: async () => {
    // Add authentication check if needed
    // For now, we'll allow access to authenticated users
  },
  component: GovernancePage,
});

function GovernancePage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return <GovernanceDashboard />;
}
