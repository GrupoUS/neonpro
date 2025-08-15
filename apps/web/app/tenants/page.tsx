import TenantList from '@/components/TenantList';

export default function TenantsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-6xl">
            Gestão de Tenants
          </h1>
          <p className="mt-6 text-gray-600 text-lg leading-8">
            Gerencie todas as clínicas e estabelecimentos da plataforma NeonPro
          </p>
        </div>

        <div className="mt-12">
          <h2 className="mb-6 font-bold text-2xl text-gray-900">
            Tenants Ativos
          </h2>
          <TenantList />
        </div>
      </div>
    </div>
  );
}
