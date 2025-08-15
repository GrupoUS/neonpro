'use client';

import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  CheckCircle,
  Clock,
  Cloud,
  Database,
  HardDrive,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatBytes, formatDate } from '@/lib/utils';

// Types
interface StorageProvider {
  id: string;
  name: string;
  type: 'LOCAL' | 'S3' | 'AZURE' | 'GCS' | 'FTP';
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  total_capacity?: number;
  used_capacity?: number;
  available_capacity?: number;
  connection_status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  last_sync?: Date;
  config?: Record<string, any>;
}

interface StorageMetrics {
  total_backups: number;
  total_size: number;
  used_percentage: number;
  growth_rate_mb_per_day: number;
  oldest_backup?: Date;
  newest_backup?: Date;
  compression_ratio: number;
  redundancy_level: number;
}

interface StorageHealth {
  overall_status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  issues: Array<{
    type: 'CAPACITY' | 'CONNECTION' | 'PERFORMANCE' | 'SECURITY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    recommendation?: string;
  }>;
  last_check: Date;
}

interface BackupDistribution {
  provider_id: string;
  provider_name: string;
  backup_count: number;
  total_size: number;
  percentage: number;
}

const StorageMonitor: React.FC = () => {
  const [providers, setProviders] = useState<StorageProvider[]>([]);
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);
  const [health, setHealth] = useState<StorageHealth | null>(null);
  const [distribution, setDistribution] = useState<BackupDistribution[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStorageData();
  }, [loadStorageData]);

  const loadStorageData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProviders(),
        loadMetrics(),
        loadHealth(),
        loadDistribution(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados de armazenamento:', error);
      toast.error('Erro ao carregar dados de armazenamento');
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    const response = await fetch('/api/backup/storage/providers');
    if (response.ok) {
      const data = await response.json();
      setProviders(data.data || []);
    }
  };

  const loadMetrics = async () => {
    const response = await fetch('/api/backup/metrics/storage');
    if (response.ok) {
      const data = await response.json();
      setMetrics(data.data);
    }
  };

  const loadHealth = async () => {
    const response = await fetch('/api/backup/storage/health');
    if (response.ok) {
      const data = await response.json();
      setHealth(data.data);
    }
  };

  const loadDistribution = async () => {
    const response = await fetch('/api/backup/metrics/distribution');
    if (response.ok) {
      const data = await response.json();
      setDistribution(data.data || []);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStorageData();
    setRefreshing(false);
    toast.success('Dados atualizados com sucesso');
  };

  const handleTestConnection = async (providerId: string) => {
    try {
      const response = await fetch(
        `/api/backup/storage/providers/${providerId}/test`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        toast.success('Conexão testada com sucesso');
        loadProviders();
      } else {
        toast.error('Falha no teste de conexão');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast.error('Erro ao testar conexão');
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'LOCAL':
        return <HardDrive className="h-5 w-5" />;
      case 'S3':
      case 'AZURE':
      case 'GCS':
        return <Cloud className="h-5 w-5" />;
      case 'FTP':
        return <Database className="h-5 w-5" />;
      default:
        return <Archive className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'CONNECTED':
      case 'HEALTHY':
        return 'text-green-500';
      case 'WARNING':
        return 'text-yellow-500';
      case 'INACTIVE':
      case 'DISCONNECTED':
      case 'ERROR':
      case 'CRITICAL':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'MEDIUM':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'LOW':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredProviders = selectedProvider
    ? providers.filter((p) => p.id === selectedProvider)
    : providers;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="py-8 text-center">
          <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin" />
          <p>Carregando dados de armazenamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Monitor de Armazenamento</h2>
          <p className="text-muted-foreground">
            Monitore o uso e saúde dos sistemas de armazenamento
          </p>
        </div>
        <div className="flex space-x-2">
          <Select onValueChange={setSelectedProvider} value={selectedProvider}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os provedores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os provedores</SelectItem>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={refreshing} onClick={handleRefresh}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Status Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    health.overall_status === 'HEALTHY'
                      ? 'bg-green-500'
                      : health.overall_status === 'WARNING'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                />
                <span className="font-medium">
                  {health.overall_status === 'HEALTHY'
                    ? 'Saudável'
                    : health.overall_status === 'WARNING'
                      ? 'Atenção'
                      : 'Crítico'}
                </span>
              </div>
              <span className="text-muted-foreground text-sm">
                Última verificação: {formatDate(new Date(health.last_check))}
              </span>
            </div>

            {health.issues.length > 0 && (
              <div className="space-y-2">
                {health.issues.map((issue, index) => (
                  <Alert
                    className={
                      issue.severity === 'CRITICAL' || issue.severity === 'HIGH'
                        ? 'border-red-200 bg-red-50'
                        : issue.severity === 'MEDIUM'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-blue-200 bg-blue-50'
                    }
                    key={index}
                  >
                    <div className="flex items-start space-x-2">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <AlertDescription>
                          <strong>{issue.type}:</strong> {issue.message}
                          {issue.recommendation && (
                            <div className="mt-1 text-sm">
                              <strong>Recomendação:</strong>{' '}
                              {issue.recommendation}
                            </div>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Métricas Gerais */}
      {metrics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-2xl">{metrics.total_backups}</p>
                  <p className="text-muted-foreground text-sm">
                    Total de Backups
                  </p>
                </div>
                <Archive className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-2xl">
                    {formatBytes(metrics.total_size)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Espaço Utilizado
                  </p>
                </div>
                <HardDrive className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-2xl">
                    {metrics.used_percentage.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Capacidade Usada
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-2xl">
                    {formatBytes(metrics.growth_rate_mb_per_day * 1024 * 1024)}
                    /dia
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Taxa de Crescimento
                  </p>
                </div>
                {metrics.growth_rate_mb_per_day > 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribuição por Provedor */}
      {distribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Distribuição por Provedor
            </CardTitle>
            <CardDescription>
              Como os backups estão distribuídos entre os provedores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {distribution.map((item) => (
                <div className="space-y-2" key={item.provider_id}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.provider_name}</span>
                    <div className="text-muted-foreground text-sm">
                      {item.backup_count} backups •{' '}
                      {formatBytes(item.total_size)}
                    </div>
                  </div>
                  <Progress className="h-2" value={item.percentage} />
                  <div className="text-muted-foreground text-xs">
                    {item.percentage.toFixed(1)}% do total
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provedores */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredProviders.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getProviderIcon(provider.type)}
                  <span>{provider.name}</span>
                  <Badge variant="outline">{provider.type}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-2 w-2 rounded-full ${getStatusColor(provider.status)}`}
                  />
                  <span
                    className={`text-sm ${getStatusColor(provider.status)}`}
                  >
                    {provider.status}
                  </span>
                </div>
              </CardTitle>
              <CardDescription>
                {provider.connection_status === 'CONNECTED' ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Conectado
                  </span>
                ) : provider.connection_status === 'ERROR' ? (
                  <span className="flex items-center text-red-600">
                    <AlertTriangle className="mr-1 h-4 w-4" />
                    Erro de conexão
                  </span>
                ) : (
                  <span className="flex items-center text-gray-600">
                    <Clock className="mr-1 h-4 w-4" />
                    Desconectado
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Capacidade */}
                {provider.total_capacity && (
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>Capacidade</span>
                      <span>
                        {formatBytes(provider.used_capacity || 0)} /{' '}
                        {formatBytes(provider.total_capacity)}
                      </span>
                    </div>
                    <Progress
                      className="h-2"
                      value={
                        ((provider.used_capacity || 0) /
                          provider.total_capacity) *
                        100
                      }
                    />
                    <div className="mt-1 text-muted-foreground text-xs">
                      {formatBytes(provider.available_capacity || 0)} disponível
                    </div>
                  </div>
                )}

                {/* Última sincronização */}
                {provider.last_sync && (
                  <div className="flex justify-between text-sm">
                    <span>Última sync:</span>
                    <span className="text-muted-foreground">
                      {formatDate(new Date(provider.last_sync))}
                    </span>
                  </div>
                )}

                {/* Ações */}
                <div className="flex space-x-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleTestConnection(provider.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Testar Conexão
                  </Button>
                  {provider.config && (
                    <Button size="sm" variant="outline">
                      <Shield className="mr-2 h-4 w-4" />
                      Configurar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {providers.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Cloud className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum provedor de armazenamento configurado
            </p>
            <Button className="mt-4">Configurar Provedor</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StorageMonitor;
