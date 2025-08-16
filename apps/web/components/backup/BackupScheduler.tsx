'use client';

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  HardDrive,
  Pause,
  Plus,
  Settings,
  Shield,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatTime } from '@/lib/utils';

// Types
type BackupConfig = {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  type: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'DATABASE' | 'FILES';
  schedule_frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  schedule_time?: string;
  schedule_cron?: string;
  last_backup?: Date;
  next_backup?: Date;
  status: 'ACTIVE' | 'PAUSED' | 'ERROR';
  storage_provider: 'LOCAL' | 'S3' | 'GCS' | 'AZURE';
  retention_daily: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: Date;
};

type NewBackupConfig = {
  name: string;
  description?: string;
  enabled: boolean;
  type: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'DATABASE' | 'FILES';
  schedule_frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  schedule_time?: string;
  schedule_cron?: string;
  storage_provider: 'LOCAL' | 'S3' | 'GCS' | 'AZURE';
  retention_daily: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  notification_email?: string;
};

const BackupScheduler: React.FC = () => {
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newConfig, setNewConfig] = useState<NewBackupConfig>({
    name: '',
    description: '',
    enabled: true,
    type: 'FULL',
    schedule_frequency: 'DAILY',
    schedule_time: '02:00',
    storage_provider: 'LOCAL',
    retention_daily: 30,
    priority: 'MEDIUM',
    notification_email: '',
  });

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/backup/configs');
      if (response.ok) {
        const data = await response.json();
        setConfigs(data.data || []);
      } else {
        toast.error('Erro ao carregar configurações de backup');
      }
    } catch (_error) {
      toast.error('Erro ao carregar configurações de backup');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = async () => {
    try {
      const response = await fetch('/api/backup/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });

      if (response.ok) {
        toast.success('Configuração de backup criada com sucesso');
        setShowNewDialog(false);
        setNewConfig({
          name: '',
          description: '',
          enabled: true,
          type: 'FULL',
          schedule_frequency: 'DAILY',
          schedule_time: '02:00',
          storage_provider: 'LOCAL',
          retention_daily: 30,
          priority: 'MEDIUM',
          notification_email: '',
        });
        loadConfigs();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao criar configuração');
      }
    } catch (_error) {
      toast.error('Erro ao criar configuração de backup');
    }
  };

  const handleToggleConfig = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/backup/configs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        toast.success(
          `Configuração ${enabled ? 'ativada' : 'desativada'} com sucesso`,
        );
        loadConfigs();
      } else {
        toast.error('Erro ao atualizar configuração');
      }
    } catch (_error) {
      toast.error('Erro ao atualizar configuração');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PAUSED':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DATABASE':
        return <Database className="h-4 w-4" />;
      case 'FILES':
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'secondary';
      case 'MEDIUM':
        return 'outline';
      case 'LOW':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Agendador de Backup</h2>
          <p className="text-muted-foreground">
            Configure e gerencie agendamentos automáticos de backup
          </p>
        </div>
        <Dialog onOpenChange={setShowNewDialog} open={showNewDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Configuração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Configuração de Backup</DialogTitle>
              <DialogDescription>
                Configure um novo agendamento automático de backup
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  onChange={(e) =>
                    setNewConfig({ ...newConfig, name: e.target.value })
                  }
                  placeholder="Ex: Backup Diário Completo"
                  value={newConfig.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Backup</Label>
                <Select
                  onValueChange={(value: any) =>
                    setNewConfig({ ...newConfig, type: value })
                  }
                  value={newConfig.type}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL">Completo</SelectItem>
                    <SelectItem value="INCREMENTAL">Incremental</SelectItem>
                    <SelectItem value="DIFFERENTIAL">Diferencial</SelectItem>
                    <SelectItem value="DATABASE">Banco de Dados</SelectItem>
                    <SelectItem value="FILES">Arquivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência</Label>
                <Select
                  onValueChange={(value: any) =>
                    setNewConfig({ ...newConfig, schedule_frequency: value })
                  }
                  value={newConfig.schedule_frequency}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOURLY">A cada hora</SelectItem>
                    <SelectItem value="DAILY">Diário</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="CUSTOM">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  onChange={(e) =>
                    setNewConfig({
                      ...newConfig,
                      schedule_time: e.target.value,
                    })
                  }
                  type="time"
                  value={newConfig.schedule_time}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Armazenamento</Label>
                <Select
                  onValueChange={(value: any) =>
                    setNewConfig({ ...newConfig, storage_provider: value })
                  }
                  value={newConfig.storage_provider}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOCAL">Local</SelectItem>
                    <SelectItem value="S3">AWS S3</SelectItem>
                    <SelectItem value="GCS">Google Cloud</SelectItem>
                    <SelectItem value="AZURE">Azure Blob</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retention">Retenção (dias)</Label>
                <Input
                  id="retention"
                  max="365"
                  min="1"
                  onChange={(e) =>
                    setNewConfig({
                      ...newConfig,
                      retention_daily: Number.parseInt(e.target.value, 10),
                    })
                  }
                  type="number"
                  value={newConfig.retention_daily}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  onChange={(e) =>
                    setNewConfig({ ...newConfig, description: e.target.value })
                  }
                  placeholder="Descrição opcional da configuração..."
                  value={newConfig.description}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowNewDialog(false)} variant="outline">
                Cancelar
              </Button>
              <Button onClick={handleCreateConfig}>Criar Configuração</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <p>Carregando configurações...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Backup</CardTitle>
            <CardDescription>
              {configs.length} configuração(ões) de backup ativa(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {configs.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma configuração de backup encontrada
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Frequência</TableHead>
                    <TableHead>Próximo Backup</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(config.type)}
                          <div>
                            <div className="font-medium">{config.name}</div>
                            {config.description && (
                              <div className="text-muted-foreground text-sm">
                                {config.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{config.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {config.schedule_frequency}
                        {config.schedule_time && (
                          <div className="text-muted-foreground text-sm">
                            às {config.schedule_time}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {config.next_backup ? (
                          <div className="text-sm">
                            {formatDate(new Date(config.next_backup))}
                            <div className="text-muted-foreground">
                              {formatTime(new Date(config.next_backup))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(config.status)}
                          <span className="text-sm">{config.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getPriorityColor(config.priority) as any}
                        >
                          {config.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) =>
                              handleToggleConfig(config.id, checked)
                            }
                          />
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BackupScheduler;
