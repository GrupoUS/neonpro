'use client';

import {
  AlertTriangle,
  Bell,
  Clock,
  Database,
  FileText,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface AutomationConfig {
  id: string;
  enabled: boolean;
  schedules: {
    full_automation: {
      enabled: boolean;
      cron_expression: string;
      timezone: string;
    };
    consent_management: {
      enabled: boolean;
      cron_expression: string;
      timezone: string;
    };
    data_subject_rights: {
      enabled: boolean;
      cron_expression: string;
      timezone: string;
    };
  };
  features: {
    consent_management: boolean;
    data_subject_rights_processing: boolean;
    audit_reporting: boolean;
    real_time_monitoring: boolean;
    intelligent_alerts: boolean;
  };
  notifications: {
    email_enabled: boolean;
    sms_enabled: boolean;
    webhook_enabled: boolean;
    slack_enabled: boolean;
  };
  limits: {
    max_daily_executions: number;
    max_concurrent_processes: number;
    timeout_minutes: number;
  };
}

const defaultConfig: AutomationConfig = {
  id: '',
  enabled: false,
  schedules: {
    full_automation: {
      enabled: false,
      cron_expression: '0 2 * * *',
      timezone: 'America/Sao_Paulo',
    },
    consent_management: {
      enabled: false,
      cron_expression: '0 */6 * * *',
      timezone: 'America/Sao_Paulo',
    },
    data_subject_rights: {
      enabled: false,
      cron_expression: '0 */4 * * *',
      timezone: 'America/Sao_Paulo',
    },
  },
  features: {
    consent_management: false,
    data_subject_rights_processing: false,
    audit_reporting: false,
    real_time_monitoring: false,
    intelligent_alerts: false,
  },
  notifications: {
    email_enabled: true,
    sms_enabled: false,
    webhook_enabled: false,
    slack_enabled: false,
  },
  limits: {
    max_daily_executions: 100,
    max_concurrent_processes: 5,
    timeout_minutes: 30,
  },
};

export default function AutomationConfig() {
  const [config, setConfig] = useState<AutomationConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance/automation/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config || defaultConfig);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a configuração de automação.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/compliance/automation/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Configuração de automação salva com sucesso.',
        });
      } else {
        throw new Error('Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a configuração de automação.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path: string, value: any) => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configuração de Automação LGPD
          </h1>
          <p className="text-muted-foreground">
            Configure as automações de conformidade com a Lei Geral de Proteção
            de Dados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={config.enabled ? 'default' : 'secondary'}>
            {config.enabled ? 'Ativo' : 'Inativo'}
          </Badge>
          <Button onClick={saveConfig} disabled={saving}>
            {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Salvar Configuração
          </Button>
        </div>
      </div>

      {!config.enabled && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            A automação LGPD está desabilitada. Habilite para começar a usar as
            funcionalidades de conformidade automática.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="schedules">Agendamentos</TabsTrigger>
          <TabsTrigger value="features">Recursos</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="limits">Limites</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configure as opções básicas da automação LGPD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={config.enabled}
                  onCheckedChange={(checked) =>
                    updateConfig('enabled', checked)
                  }
                />
                <Label htmlFor="enabled">Habilitar Automação LGPD</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Quando habilitada, a automação LGPD executará as tarefas
                configuradas automaticamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Automação Completa
                </CardTitle>
                <CardDescription>
                  Execução completa de todas as automações LGPD
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="full-automation-enabled"
                    checked={config.schedules.full_automation.enabled}
                    onCheckedChange={(checked) =>
                      updateConfig('schedules.full_automation.enabled', checked)
                    }
                  />
                  <Label htmlFor="full-automation-enabled">Habilitar</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full-automation-cron">Expressão Cron</Label>
                    <Input
                      id="full-automation-cron"
                      value={config.schedules.full_automation.cron_expression}
                      onChange={(e) =>
                        updateConfig(
                          'schedules.full_automation.cron_expression',
                          e.target.value,
                        )
                      }
                      placeholder="0 2 * * *"
                    />
                  </div>
                  <div>
                    <Label htmlFor="full-automation-timezone">
                      Fuso Horário
                    </Label>
                    <Select
                      value={config.schedules.full_automation.timezone}
                      onValueChange={(value) =>
                        updateConfig(
                          'schedules.full_automation.timezone',
                          value,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">
                          America/São Paulo
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          America/New York
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          Europe/London
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestão de Consentimento</CardTitle>
                <CardDescription>
                  Automação para gestão de consentimentos LGPD
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="consent-enabled"
                    checked={config.schedules.consent_management.enabled}
                    onCheckedChange={(checked) =>
                      updateConfig(
                        'schedules.consent_management.enabled',
                        checked,
                      )
                    }
                  />
                  <Label htmlFor="consent-enabled">Habilitar</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="consent-cron">Expressão Cron</Label>
                    <Input
                      id="consent-cron"
                      value={
                        config.schedules.consent_management.cron_expression
                      }
                      onChange={(e) =>
                        updateConfig(
                          'schedules.consent_management.cron_expression',
                          e.target.value,
                        )
                      }
                      placeholder="0 */6 * * *"
                    />
                  </div>
                  <div>
                    <Label htmlFor="consent-timezone">Fuso Horário</Label>
                    <Select
                      value={config.schedules.consent_management.timezone}
                      onValueChange={(value) =>
                        updateConfig(
                          'schedules.consent_management.timezone',
                          value,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">
                          America/São Paulo
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          America/New York
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          Europe/London
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Direitos do Titular</CardTitle>
                <CardDescription>
                  Automação para processamento de direitos do titular dos dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="rights-enabled"
                    checked={config.schedules.data_subject_rights.enabled}
                    onCheckedChange={(checked) =>
                      updateConfig(
                        'schedules.data_subject_rights.enabled',
                        checked,
                      )
                    }
                  />
                  <Label htmlFor="rights-enabled">Habilitar</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rights-cron">Expressão Cron</Label>
                    <Input
                      id="rights-cron"
                      value={
                        config.schedules.data_subject_rights.cron_expression
                      }
                      onChange={(e) =>
                        updateConfig(
                          'schedules.data_subject_rights.cron_expression',
                          e.target.value,
                        )
                      }
                      placeholder="0 */4 * * *"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rights-timezone">Fuso Horário</Label>
                    <Select
                      value={config.schedules.data_subject_rights.timezone}
                      onValueChange={(value) =>
                        updateConfig(
                          'schedules.data_subject_rights.timezone',
                          value,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">
                          America/São Paulo
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          America/New York
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          Europe/London
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Recursos Disponíveis
              </CardTitle>
              <CardDescription>
                Configure quais recursos da automação LGPD devem estar ativos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="consent-management"
                    checked={config.features.consent_management}
                    onCheckedChange={(checked) =>
                      updateConfig('features.consent_management', checked)
                    }
                  />
                  <Label htmlFor="consent-management">
                    Gestão de Consentimento
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="data-subject-rights"
                    checked={config.features.data_subject_rights_processing}
                    onCheckedChange={(checked) =>
                      updateConfig(
                        'features.data_subject_rights_processing',
                        checked,
                      )
                    }
                  />
                  <Label htmlFor="data-subject-rights">
                    Processamento de Direitos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="audit-reporting"
                    checked={config.features.audit_reporting}
                    onCheckedChange={(checked) =>
                      updateConfig('features.audit_reporting', checked)
                    }
                  />
                  <Label htmlFor="audit-reporting">
                    Relatórios de Auditoria
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="real-time-monitoring"
                    checked={config.features.real_time_monitoring}
                    onCheckedChange={(checked) =>
                      updateConfig('features.real_time_monitoring', checked)
                    }
                  />
                  <Label htmlFor="real-time-monitoring">
                    Monitoramento em Tempo Real
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="intelligent-alerts"
                    checked={config.features.intelligent_alerts}
                    onCheckedChange={(checked) =>
                      updateConfig('features.intelligent_alerts', checked)
                    }
                  />
                  <Label htmlFor="intelligent-alerts">
                    Alertas Inteligentes
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificação
              </CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações da automação
                LGPD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-notifications"
                    checked={config.notifications.email_enabled}
                    onCheckedChange={(checked) =>
                      updateConfig('notifications.email_enabled', checked)
                    }
                  />
                  <Label htmlFor="email-notifications">
                    Notificações por Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sms-notifications"
                    checked={config.notifications.sms_enabled}
                    onCheckedChange={(checked) =>
                      updateConfig('notifications.sms_enabled', checked)
                    }
                  />
                  <Label htmlFor="sms-notifications">
                    Notificações por SMS
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="webhook-notifications"
                    checked={config.notifications.webhook_enabled}
                    onCheckedChange={(checked) =>
                      updateConfig('notifications.webhook_enabled', checked)
                    }
                  />
                  <Label htmlFor="webhook-notifications">Webhooks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="slack-notifications"
                    checked={config.notifications.slack_enabled}
                    onCheckedChange={(checked) =>
                      updateConfig('notifications.slack_enabled', checked)
                    }
                  />
                  <Label htmlFor="slack-notifications">
                    Notificações Slack
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Limites e Performance
              </CardTitle>
              <CardDescription>
                Configure os limites de execução para otimizar a performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max-daily-executions">
                    Máximo de Execuções Diárias
                  </Label>
                  <Input
                    id="max-daily-executions"
                    type="number"
                    value={config.limits.max_daily_executions}
                    onChange={(e) =>
                      updateConfig(
                        'limits.max_daily_executions',
                        parseInt(e.target.value),
                      )
                    }
                    min="1"
                    max="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="max-concurrent-processes">
                    Processos Simultâneos
                  </Label>
                  <Input
                    id="max-concurrent-processes"
                    type="number"
                    value={config.limits.max_concurrent_processes}
                    onChange={(e) =>
                      updateConfig(
                        'limits.max_concurrent_processes',
                        parseInt(e.target.value),
                      )
                    }
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <Label htmlFor="timeout-minutes">Timeout (minutos)</Label>
                  <Input
                    id="timeout-minutes"
                    type="number"
                    value={config.limits.timeout_minutes}
                    onChange={(e) =>
                      updateConfig(
                        'limits.timeout_minutes',
                        parseInt(e.target.value),
                      )
                    }
                    min="5"
                    max="120"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
