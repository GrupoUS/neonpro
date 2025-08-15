'use client';

import {
  AlertCircle,
  Building2,
  ExternalLink,
  Package,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  sku?: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
  products?: Product[];
  stats: {
    total_products: number;
    total_users: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: Tenant[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  error?: string;
  message?: string;
}

interface TenantListProps {
  includeProducts?: boolean;
  limit?: number;
}

export default function TenantList({
  includeProducts = false,
  limit = 10,
}: TenantListProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        include_products: includeProducts.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/tenants?${params}`);
      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      setTenants(data.data);
      setRetryCount(0);
    } catch (err) {
      console.error('Erro ao carregar tenants:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    fetchTenants();
  };

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const getSubscriptionBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trial':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'default';
      case 'pro':
        return 'secondary';
      case 'basic':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl tracking-tight">Tenants</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl tracking-tight">Tenants</h2>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Erro ao carregar tenants: {error}</span>
            <Button onClick={handleRetry} size="sm" variant="outline">
              Tentar novamente {retryCount > 0 && `(${retryCount})`}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">
            {tenants.length} tenant{tenants.length !== 1 ? 's' : ''} encontrado
            {tenants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={fetchTenants} variant="outline">
          Atualizar
        </Button>
      </div>

      {tenants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">
              Nenhum tenant encontrado
            </h3>
            <p className="text-center text-muted-foreground">
              Não há tenants cadastrados no sistema ainda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <Card className="transition-shadow hover:shadow-lg" key={tenant.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {tenant.logo_url && (
                        <img
                          alt={`${tenant.name} logo`}
                          className="h-6 w-6 rounded"
                          src={tenant.logo_url}
                        />
                      )}
                      {tenant.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      @{tenant.slug}
                    </CardDescription>
                  </div>
                  {tenant.website_url && (
                    <Button asChild size="sm" variant="ghost">
                      <a
                        href={tenant.website_url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tenant.description && (
                  <p className="line-clamp-2 text-muted-foreground text-sm">
                    {tenant.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={getPlanBadgeVariant(tenant.subscription_plan)}
                  >
                    {tenant.subscription_plan}
                  </Badge>
                  <Badge
                    variant={getSubscriptionBadgeVariant(
                      tenant.subscription_status
                    )}
                  >
                    {tenant.subscription_status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-muted-foreground text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {tenant.stats.total_users} usuário
                    {tenant.stats.total_users !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {tenant.stats.total_products} produto
                    {tenant.stats.total_products !== 1 ? 's' : ''}
                  </div>
                </div>

                {includeProducts &&
                  tenant.products &&
                  tenant.products.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Produtos:</h4>
                      <div className="space-y-1">
                        {tenant.products.slice(0, 3).map((product) => (
                          <div
                            className="flex items-center justify-between text-xs"
                            key={product.id}
                          >
                            <span className="truncate">{product.name}</span>
                            <span className="text-muted-foreground">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: product.currency,
                              }).format(product.price)}
                            </span>
                          </div>
                        ))}
                        {tenant.products.length > 3 && (
                          <p className="text-muted-foreground text-xs">
                            +{tenant.products.length - 3} mais
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                <div className="text-muted-foreground text-xs">
                  Criado em{' '}
                  {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
