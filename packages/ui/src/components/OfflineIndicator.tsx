import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Cloud,
  CloudOff,
  RefreshCw,
  Shield,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '../utils/cn';
import { Badge } from './Badge';
import { Button } from './Button';

export type ConnectionStatus =
  | 'online'
  | 'offline'
  | 'unstable'
  | 'reconnecting'
  | 'error';

export type OfflineCapability = 'full' | 'limited' | 'emergency_only' | 'none';

export interface OfflineData {
  /** Number of items pending sync */
  pendingSync: number;
  /** Last successful sync timestamp */
  lastSync?: Date;
  /** Offline storage usage in MB */
  storageUsed: number;
  /** Maximum offline storage in MB */
  storageLimit: number;
  /** Critical data that needs immediate sync */
  criticalPendingCount: number;
  /** Emergency data that's always available offline */
  emergencyDataAvailable: boolean;
}

export interface SystemHealth {
  /** Database connection status */
  database: ConnectionStatus;
  /** Cloud services status */
  cloudServices: ConnectionStatus;
  /** Backup systems status */
  backupSystems: ConnectionStatus;
  /** Last health check timestamp */
  lastHealthCheck: Date;
  /** Any ongoing maintenance */
  maintenanceMode: boolean;
}

export interface OfflineIndicatorProps {
  /**
   * Current network connection status
   */
  connectionStatus: ConnectionStatus;
  /**
   * What capabilities are available offline
   */
  offlineCapability: OfflineCapability;
  /**
   * Offline data statistics
   */
  offlineData?: OfflineData;
  /**
   * System health information
   */
  systemHealth?: SystemHealth;
  /**
   * Show detailed status information
   */
  showDetails?: boolean;
  /**
   * Position of the indicator
   */
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'inline';
  /**
   * Size of the indicator
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Callback when user requests manual sync
   */
  onManualSync?: () => void;
  /**
   * Callback when user requests offline mode toggle
   */
  onToggleOfflineMode?: () => void;
  /**
   * Callback when user wants to view system status
   */
  onViewSystemStatus?: () => void;
  /**
   * Show emergency mode information
   */
  showEmergencyMode?: boolean;
  /**
   * Constitutional healthcare resilience information
   */
  constitutionalInfo?: {
    emergencyProtocols: boolean;
    patientSafetyMaintained: boolean;
    dataIntegritySecured: boolean;
    complianceContinuity: boolean;
  };
  /**
   * Additional CSS classes
   */
  className?: string;
}

const connectionStatusInfo = {
  online: {
    label: 'Online',
    description: 'Sistema conectado e funcionando normalmente',
    icon: Wifi,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    variant: 'confirmed' as const,
  },
  offline: {
    label: 'Offline',
    description: 'Sistema em modo offline - funcionalidades limitadas',
    icon: WifiOff,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    variant: 'urgent' as const,
  },
  unstable: {
    label: 'Instável',
    description: 'Conexão instável - pode afetar sincronização',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    variant: 'medium' as const,
  },
  reconnecting: {
    label: 'Reconectando',
    description: 'Tentando restabelecer conexão',
    icon: RefreshCw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    variant: 'processing' as const,
  },
  error: {
    label: 'Erro',
    description: 'Erro de conexão - verificar rede',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    variant: 'urgent' as const,
  },
};

const offlineCapabilityInfo = {
  full: {
    label: 'Total',
    description: 'Todas as funcionalidades disponíveis offline',
    color: 'text-green-600',
  },
  limited: {
    label: 'Limitado',
    description: 'Funcionalidades básicas disponíveis offline',
    color: 'text-yellow-600',
  },
  emergency_only: {
    label: 'Emergência',
    description: 'Apenas funcionalidades críticas de emergência',
    color: 'text-orange-600',
  },
  none: {
    label: 'Nenhum',
    description: 'Requer conexão para funcionamento',
    color: 'text-red-600',
  },
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) {
    return '0 MB';
  }
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

const formatLastSync = (date?: Date): string => {
  if (!date) {
    return 'Nunca';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) {
    return 'Agora mesmo';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}min atrás`;
  }
  if (diffHours < 24) {
    return `${diffHours}h atrás`;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const SystemHealthIndicator: React.FC<{
  systemHealth: SystemHealth;
  onViewSystemStatus?: () => void;
}> = ({ systemHealth, onViewSystemStatus }) => {
  const healthItems = [
    { label: 'Banco de Dados', status: systemHealth.database, icon: Shield },
    {
      label: 'Serviços Cloud',
      status: systemHealth.cloudServices,
      icon: Cloud,
    },
    {
      label: 'Sistemas Backup',
      status: systemHealth.backupSystems,
      icon: CheckCircle,
    },
  ];

  const overallHealth = healthItems.every((item) => item.status === 'online')
    ? 'online'
    : (healthItems.some((item) => item.status === 'error')
    ? 'error'
    : 'unstable');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Saúde do Sistema</h4>
        <Badge size="sm" variant={connectionStatusInfo[overallHealth].variant}>
          {connectionStatusInfo[overallHealth].label}
        </Badge>
      </div>

      <div className="space-y-2">
        {healthItems.map((item) => {
          const Icon = item.icon;
          const status = connectionStatusInfo[item.status];

          return (
            <div
              className="flex items-center justify-between text-sm"
              key={item.label}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn('h-4 w-4', status.color)} />
                <span>{item.label}</span>
              </div>
              <Badge size="sm" variant={status.variant}>
                {status.label}
              </Badge>
            </div>
          );
        })}
      </div>

      {systemHealth.maintenanceMode && (
        <div className="flex items-center gap-2 rounded border border-blue-200 bg-blue-50 p-2 text-blue-800 text-sm">
          <Clock className="h-4 w-4" />
          <span>Modo de manutenção ativo</span>
        </div>
      )}

      <div className="text-muted-foreground text-xs">
        Última verificação: {formatLastSync(systemHealth.lastHealthCheck)}
      </div>

      {onViewSystemStatus && (
        <Button
          className="w-full"
          onClick={onViewSystemStatus}
          size="sm"
          variant="outline"
        >
          Ver Status Completo
        </Button>
      )}
    </div>
  );
};

const ConstitutionalResilienceInfo: React.FC<{
  constitutionalInfo: {
    emergencyProtocols: boolean;
    patientSafetyMaintained: boolean;
    dataIntegritySecured: boolean;
    complianceContinuity: boolean;
  };
}> = ({ constitutionalInfo }) => {
  const items = [
    {
      key: 'emergencyProtocols',
      label: 'Protocolos de Emergência',
      description: 'Acesso a dados críticos garantido',
    },
    {
      key: 'patientSafetyMaintained',
      label: 'Segurança do Paciente',
      description: 'Continuidade dos cuidados assegurada',
    },
    {
      key: 'dataIntegritySecured',
      label: 'Integridade dos Dados',
      description: 'Dados protegidos e sincronizados',
    },
    {
      key: 'complianceContinuity',
      label: 'Conformidade LGPD',
      description: 'Compliance mantido em modo offline',
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 font-medium text-sm">
        <Shield className="h-4 w-4 text-blue-600" />
        Resiliência Constitucional Healthcare
      </h4>

      <div className="space-y-2">
        {items.map((item) => {
          const isActive = constitutionalInfo[item.key as keyof typeof constitutionalInfo];

          return (
            <div className="flex items-start gap-3" key={item.key}>
              <div
                className={cn(
                  'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full',
                  isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700',
                )}
              >
                {isActive
                  ? <CheckCircle className="h-3 w-3" />
                  : <AlertTriangle className="h-3 w-3" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-muted-foreground text-xs">
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const OfflineIndicator = React.forwardRef<
  HTMLDivElement,
  OfflineIndicatorProps
>(
  (
    {
      connectionStatus,
      offlineCapability,
      offlineData,
      systemHealth,
      showDetails = false,
      position = 'inline',
      size = 'md',
      onManualSync,
      onToggleOfflineMode,
      onViewSystemStatus,
      showEmergencyMode = false,
      constitutionalInfo,
      className,
      ...props
    },
    ref,
  ) => {
    const [expanded, setExpanded] = React.useState(false);
    const statusInfo = connectionStatusInfo[connectionStatus];
    const capabilityInfo = offlineCapabilityInfo[offlineCapability];

    const positionClasses = {
      'top-left': 'fixed top-4 left-4 z-50',
      'top-right': 'fixed top-4 right-4 z-50',
      'bottom-left': 'fixed bottom-4 left-4 z-50',
      'bottom-right': 'fixed bottom-4 right-4 z-50',
      inline: '',
    };

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const StatusIcon = statusInfo.icon;

    // Compact indicator for fixed positions
    if (position !== 'inline' && !expanded) {
      return (
        <div
          className={cn(
            'cursor-pointer rounded-lg border p-2 shadow-lg transition-all hover:shadow-xl',
            statusInfo.bgColor,
            statusInfo.borderColor,
            positionClasses[position],
            className,
          )}
          onClick={() => setExpanded(true)}
          ref={ref}
          {...props}
          aria-expanded={false}
          aria-label={`Status da conexão: ${statusInfo.label}. Clique para expandir`}
          role="button"
        >
          <div className="flex items-center gap-2">
            <StatusIcon className={cn('h-4 w-4', statusInfo.color)} />
            {offlineData && offlineData.pendingSync > 0 && (
              <Badge size="sm" variant="medium">
                {offlineData.pendingSync}
              </Badge>
            )}
          </div>
        </div>
      );
    }

    // Expanded view
    return (
      <div
        className={cn(
          'rounded-lg border bg-card p-4 text-card-foreground shadow-lg',
          position !== 'inline' && positionClasses[position],
          className,
        )}
        ref={ref}
        {...props}
        aria-labelledby="offline-indicator-title"
        role="region"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                statusInfo.bgColor,
              )}
            >
              <StatusIcon className={cn('h-4 w-4', statusInfo.color)} />
            </div>
            <div>
              <h3
                className={cn('font-semibold', sizeClasses[size])}
                id="offline-indicator-title"
              >
                {statusInfo.label}
              </h3>
              <p className="text-muted-foreground text-sm">
                {statusInfo.description}
              </p>
            </div>
          </div>

          {position !== 'inline' && (
            <Button
              className="h-6 w-6"
              onClick={() => setExpanded(false)}
              size="icon"
              variant="ghost"
            >
              <CloudOff className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Offline Capability */}
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 font-medium text-sm">Capacidade Offline</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm">{capabilityInfo.description}</span>
              <Badge
                size="sm"
                variant={offlineCapability === 'full'
                  ? 'confirmed'
                  : offlineCapability === 'limited'
                  ? 'medium'
                  : offlineCapability === 'emergency_only'
                  ? 'high'
                  : 'urgent'}
              >
                {capabilityInfo.label}
              </Badge>
            </div>
          </div>

          {/* Offline Data Stats */}
          {offlineData && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Dados Offline</h4>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Pendente sync:</span>
                  <div className="font-medium">
                    {offlineData.pendingSync} itens
                    {offlineData.criticalPendingCount > 0 && (
                      <Badge className="ml-2" size="sm" variant="urgent">
                        {offlineData.criticalPendingCount} críticos
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Última sync:</span>
                  <div className="font-medium">
                    {formatLastSync(offlineData.lastSync)}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Armazenamento:</span>
                  <div className="font-medium">
                    {formatBytes(offlineData.storageUsed)} / {formatBytes(offlineData.storageLimit)}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">
                    Dados emergência:
                  </span>
                  <div className="flex items-center gap-1">
                    {offlineData.emergencyDataAvailable
                      ? <CheckCircle className="h-4 w-4 text-green-600" />
                      : <AlertTriangle className="h-4 w-4 text-red-600" />}
                    <span className="text-sm">
                      {offlineData.emergencyDataAvailable
                        ? 'Disponível'
                        : 'Indisponível'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Health */}
          {systemHealth && showDetails && (
            <SystemHealthIndicator
              onViewSystemStatus={onViewSystemStatus}
              systemHealth={systemHealth}
            />
          )}

          {/* Constitutional Resilience */}
          {constitutionalInfo && showEmergencyMode && (
            <ConstitutionalResilienceInfo
              constitutionalInfo={constitutionalInfo}
            />
          )}

          {/* Emergency Mode Information */}
          {showEmergencyMode && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="flex items-start gap-3">
                <Zap className="mt-0.5 h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-900 text-sm">
                    Modo de Emergência Médica
                  </h4>
                  <p className="mt-1 text-orange-700 text-sm">
                    Funcionalidades críticas mantidas para garantir continuidade dos cuidados. Dados
                    de emergência acessíveis mesmo offline.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 border-t pt-2">
            {onManualSync && offlineData && offlineData.pendingSync > 0 && (
              <Button
                disabled={connectionStatus === 'offline'}
                onClick={onManualSync}
                size="sm"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Sincronizar
              </Button>
            )}

            {onToggleOfflineMode && (
              <Button onClick={onToggleOfflineMode} size="sm" variant="outline">
                {connectionStatus === 'offline'
                  ? (
                    <>
                      <Wifi className="mr-2 h-4 w-4" />
                      Tentar Reconectar
                    </>
                  )
                  : (
                    <>
                      <WifiOff className="mr-2 h-4 w-4" />
                      Modo Offline
                    </>
                  )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

OfflineIndicator.displayName = 'OfflineIndicator';
