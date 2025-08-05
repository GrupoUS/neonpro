/**
 * Device Management Component
 * Story 1.4: Session Management & Security
 *
 * Comprehensive device management interface for tracking,
 * monitoring, and controlling user devices and sessions.
 */

"use client";

import React, { useState, useMemo } from "react";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  Smartphone,
  Monitor,
  Tablet,
  MoreHorizontal,
  Search,
  Shield,
  ShieldCheck,
  ShieldX,
  MapPin,
  Clock,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  Trash2,
  RefreshCw,
} from "lucide-react";
import type { SessionDevice, DeviceStatus, DeviceTrustLevel } from "@/types/session";
import type { useDeviceManagement } from "@/hooks/useSession";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";

// ============================================================================
// INTERFACES
// ============================================================================

interface DeviceManagementProps {
  devices: SessionDevice[];
  onDeviceAction: (deviceId: string, action: string) => Promise<void>;
}

interface DeviceFilters {
  search: string;
  status: DeviceStatus | "all";
  trustLevel: DeviceTrustLevel | "all";
  deviceType: string | "all";
  lastSeen: "all" | "1h" | "24h" | "7d" | "30d";
}

interface DeviceDetailsModalProps {
  device: SessionDevice | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (deviceId: string, action: string) => Promise<void>;
}

// ============================================================================
// DEVICE DETAILS MODAL
// ============================================================================

function DeviceDetailsModal({ device, isOpen, onClose, onAction }: DeviceDetailsModalProps) {
  if (!device) return null;

  const handleAction = async (action: string) => {
    await onAction(device.id, action);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getDeviceIcon(device.device_type)}
            <span>Detalhes do Dispositivo</span>
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas e ações disponíveis para este dispositivo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nome do Dispositivo
              </label>
              <p className="text-sm font-mono">{device.device_name || "Não informado"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo</label>
              <p className="text-sm">{device.device_type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Sistema Operacional
              </label>
              <p className="text-sm">{device.os || "Não informado"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Navegador</label>
              <p className="text-sm">{device.browser || "Não informado"}</p>
            </div>
          </div>

          {/* Status and Trust */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">{getStatusBadge(device.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nível de Confiança
              </label>
              <div className="mt-1">{getTrustLevelBadge(device.trust_level)}</div>
            </div>
          </div>

          {/* Location and Network */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Localização</label>
              <p className="text-sm">
                {device.location
                  ? `${device.location.city}, ${device.location.country}`
                  : "Não disponível"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">IP Address</label>
              <p className="text-sm font-mono">{device.ip_address}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Primeiro Acesso</label>
              <p className="text-sm">
                {format(new Date(device.first_seen), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Último Acesso</label>
              <p className="text-sm">
                {format(new Date(device.last_seen), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Fingerprint */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Device Fingerprint</label>
            <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
              {device.fingerprint}
            </p>
          </div>

          {/* Metadata */}
          {device.metadata && Object.keys(device.metadata).length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Metadados</label>
              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(device.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            {device.status === DeviceStatus.ACTIVE && (
              <Button variant="outline" size="sm" onClick={() => handleAction("block")}>
                <Ban className="h-4 w-4 mr-2" />
                Bloquear
              </Button>
            )}
            {device.status === DeviceStatus.BLOCKED && (
              <Button variant="outline" size="sm" onClick={() => handleAction("unblock")}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Desbloquear
              </Button>
            )}
            {device.trust_level !== DeviceTrustLevel.TRUSTED && (
              <Button variant="outline" size="sm" onClick={() => handleAction("trust")}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Confiar
              </Button>
            )}
            {device.trust_level === DeviceTrustLevel.TRUSTED && (
              <Button variant="outline" size="sm" onClick={() => handleAction("untrust")}>
                <ShieldX className="h-4 w-4 mr-2" />
                Remover Confiança
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="destructive" size="sm" onClick={() => handleAction("delete")}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getDeviceIcon(deviceType: string) {
  const type = deviceType.toLowerCase();
  if (type.includes("mobile") || type.includes("phone")) {
    return <Smartphone className="h-4 w-4" />;
  }
  if (type.includes("tablet")) {
    return <Tablet className="h-4 w-4" />;
  }
  return <Monitor className="h-4 w-4" />;
}

function getStatusBadge(status: DeviceStatus) {
  const config = {
    [DeviceStatus.ACTIVE]: {
      variant: "default" as const,
      color: "text-green-600",
      icon: CheckCircle,
    },
    [DeviceStatus.INACTIVE]: { variant: "secondary" as const, color: "text-gray-600", icon: Clock },
    [DeviceStatus.BLOCKED]: { variant: "destructive" as const, color: "text-red-600", icon: Ban },
    [DeviceStatus.SUSPICIOUS]: {
      variant: "destructive" as const,
      color: "text-orange-600",
      icon: AlertTriangle,
    },
  };

  const { variant, color, icon: Icon } = config[status] || config[DeviceStatus.INACTIVE];

  return (
    <Badge variant={variant} className={`${color} flex items-center space-x-1`}>
      <Icon className="h-3 w-3" />
      <span>{status}</span>
    </Badge>
  );
}

function getTrustLevelBadge(trustLevel: DeviceTrustLevel) {
  const config = {
    [DeviceTrustLevel.TRUSTED]: {
      variant: "default" as const,
      color: "text-green-600",
      icon: ShieldCheck,
    },
    [DeviceTrustLevel.UNKNOWN]: {
      variant: "secondary" as const,
      color: "text-gray-600",
      icon: Shield,
    },
    [DeviceTrustLevel.SUSPICIOUS]: {
      variant: "destructive" as const,
      color: "text-red-600",
      icon: ShieldX,
    },
  };

  const { variant, color, icon: Icon } = config[trustLevel] || config[DeviceTrustLevel.UNKNOWN];

  return (
    <Badge variant={variant} className={`${color} flex items-center space-x-1`}>
      <Icon className="h-3 w-3" />
      <span>{trustLevel}</span>
    </Badge>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DeviceManagement({ devices, onDeviceAction }: DeviceManagementProps) {
  const { refreshDevices, bulkAction } = useDeviceManagement();
  const [filters, setFilters] = useState<DeviceFilters>({
    search: "",
    status: "all",
    trustLevel: "all",
    deviceType: "all",
    lastSeen: "all",
  });
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<SessionDevice | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // ============================================================================
  // FILTERING AND SORTING
  // ============================================================================

  const filteredDevices = useMemo(() => {
    let filtered = [...devices];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (device) =>
          (device.device_name && device.device_name.toLowerCase().includes(searchLower)) ||
          device.device_type.toLowerCase().includes(searchLower) ||
          device.ip_address.toLowerCase().includes(searchLower) ||
          (device.os && device.os.toLowerCase().includes(searchLower)) ||
          (device.browser && device.browser.toLowerCase().includes(searchLower)),
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((device) => device.status === filters.status);
    }

    // Trust level filter
    if (filters.trustLevel !== "all") {
      filtered = filtered.filter((device) => device.trust_level === filters.trustLevel);
    }

    // Device type filter
    if (filters.deviceType !== "all") {
      filtered = filtered.filter((device) => device.device_type === filters.deviceType);
    }

    // Last seen filter
    if (filters.lastSeen !== "all") {
      const now = new Date();
      const cutoff = new Date();

      switch (filters.lastSeen) {
        case "1h":
          cutoff.setHours(now.getHours() - 1);
          break;
        case "24h":
          cutoff.setHours(now.getHours() - 24);
          break;
        case "7d":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "30d":
          cutoff.setDate(now.getDate() - 30);
          break;
      }

      filtered = filtered.filter((device) => new Date(device.last_seen) >= cutoff);
    }

    // Sort by last seen (most recent first)
    return filtered.sort(
      (a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime(),
    );
  }, [devices, filters]);

  // Get unique device types for filter
  const deviceTypes = useMemo(() => {
    const types = new Set(devices.map((device) => device.device_type));
    return Array.from(types);
  }, [devices]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleDeviceAction = async (deviceId: string, action: string) => {
    try {
      await onDeviceAction(deviceId, action);
      await refreshDevices();
    } catch (error) {
      console.error(`Failed to ${action} device:`, error);
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      await bulkAction(selectedDevices, action);
      setSelectedDevices([]);
      await refreshDevices();
    } catch (error) {
      console.error(`Failed to bulk ${action} devices:`, error);
    }
  };

  const handleViewDetails = (device: SessionDevice) => {
    setSelectedDevice(device);
    setIsDetailsModalOpen(true);
  };

  const handleRefresh = async () => {
    try {
      await refreshDevices();
    } catch (error) {
      console.error("Failed to refresh devices:", error);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Dispositivos</CardTitle>
              <CardDescription>
                Monitore e gerencie dispositivos conectados às sessões
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {selectedDevices.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("block")}>
                    <Ban className="h-4 w-4 mr-2" />
                    Bloquear Selecionados ({selectedDevices.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("trust")}>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Confiar Selecionados
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar dispositivos..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value as DeviceStatus | "all",
                }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.values(DeviceStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.trustLevel}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  trustLevel: value as DeviceTrustLevel | "all",
                }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Confiança" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.values(DeviceTrustLevel).map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.deviceType}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  deviceType: value,
                }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {deviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.lastSeen}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  lastSeen: value as DeviceFilters["lastSeen"],
                }))
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Atividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="1h">1 hora</SelectItem>
                <SelectItem value="24h">24 horas</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Devices Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={
                        selectedDevices.length === filteredDevices.length &&
                        filteredDevices.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDevices(filteredDevices.map((device) => device.id));
                        } else {
                          setSelectedDevices([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confiança</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum dispositivo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedDevices.includes(device.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDevices((prev) => [...prev, device.id]);
                            } else {
                              setSelectedDevices((prev) => prev.filter((id) => id !== device.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getDeviceIcon(device.device_type)}
                          <div>
                            <div className="font-medium">
                              {device.device_name || device.device_type}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {device.os} • {device.browser}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(device.status)}</TableCell>
                      <TableCell>{getTrustLevelBadge(device.trust_level)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {device.location
                              ? `${device.location.city}, ${device.location.country}`
                              : "Não disponível"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(device.last_seen), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(device)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {device.status === DeviceStatus.ACTIVE && (
                              <DropdownMenuItem
                                onClick={() => handleDeviceAction(device.id, "block")}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Bloquear
                              </DropdownMenuItem>
                            )}
                            {device.status === DeviceStatus.BLOCKED && (
                              <DropdownMenuItem
                                onClick={() => handleDeviceAction(device.id, "unblock")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Desbloquear
                              </DropdownMenuItem>
                            )}
                            {device.trust_level !== DeviceTrustLevel.TRUSTED && (
                              <DropdownMenuItem
                                onClick={() => handleDeviceAction(device.id, "trust")}
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Confiar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeviceAction(device.id, "delete")}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              Mostrando {filteredDevices.length} de {devices.length} dispositivos
            </span>
            <div className="flex items-center space-x-4">
              <span>
                {filteredDevices.filter((d) => d.status === DeviceStatus.ACTIVE).length} ativos
              </span>
              <span>
                {filteredDevices.filter((d) => d.trust_level === DeviceTrustLevel.TRUSTED).length}{" "}
                confiáveis
              </span>
              <span>
                {filteredDevices.filter((d) => d.status === DeviceStatus.BLOCKED).length} bloqueados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Details Modal */}
      <DeviceDetailsModal
        device={selectedDevice}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDevice(null);
        }}
        onAction={handleDeviceAction}
      />
    </>
  );
}
