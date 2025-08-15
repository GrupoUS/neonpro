import TenantList from '@/components/TenantList'

export default function TenantsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Gestão de Tenants
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Gerencie todas as clínicas e estabelecimentos da plataforma NeonPro
          </p>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tenants Ativos
          </h2>
          <TenantList />
        </div>
      </div>
    </div>
  )
}