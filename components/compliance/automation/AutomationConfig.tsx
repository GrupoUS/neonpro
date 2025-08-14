'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Clock, 
  Bell, 
  Shield, 
  Database,
  Users,
  FileText,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AutomationConfig {
  enabled: boolean;
  schedules: {
    fullAutomation: {
      enabled: boolean;
      cron: string;
      timezone: string;
    };
    consentManagement: {
      enabled: boolean;
      cron: string;
    };
    dataSubjectRights: {
      enabled: boolean;
      cron: string;
    };
    auditReporting: {
      enabled: boolean;
      cron: string;
    };
    anonymization: {
      enabled: boolean;
      cron: string;
    };
  };
  notifications: {
    email: {
      enabled: boolean;
      recipients: string[];
      events: string[];
    };
    webhook: {
      enabled: boolean;
      url: string;
      events: string[];
    };
  };
  limits: {
    maxConcurrentJobs: number;
    jobTimeout: number;
    retryAttempts: number;
    batchSize: number;
  };
  features: {
    autoConsentManagement: boolean;
    autoDataSubjectRights: boolean;
    autoAuditReporting: boolean;
    autoAnonymization: boolean;
    realTimeMonitoring: boolean;
    smartAlerts: boolean;
  };
}

const defaultConfig: AutomationConfig = {
  enabled: false,
  schedules: {
    fullAutomation: {
      enabled: false,
      cron: '0 2 * * *',
      timezone: 'America/Sao_Paulo'
    },
    consentManagement: {
      enabled: false,
      cron: '0 */6 * * *'
    },
    dataSubjectRights: {
      enabled: false,
      cron: '0 */4 * * *'
    },
    auditReporting: {
      enabled: false,
      cron: '0 1 * * 0'
    },
    anonymization: {
      enabled: false,
      cron: '0 3 * * 0'
    }
  },
  notifications: {
    email: {
      enabled: false,
      recipients: [],
      events: []
    },
    webhook: {
      enabled: false,
      url: '',
      events: []
    }
  },
  limits: {
    maxConcurrentJobs: 3,
    jobTimeout: 3600,
    retryAttempts: 3,
    batchSize: 100
  },
  features: {
    autoConsentManagement: false,
    autoDataSubjectRights: false,
    autoAuditReporting: false,
    autoAnonymization: false,
    realTimeMonitoring: false,
    smartAlerts: false
  }
};

export default function AutomationConfig() {
  const [config, setConfig] = useState<AutomationConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance/automation/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar configuração',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/compliance/automation/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setHasChanges(false);
        toast({
          title: 'Sucesso',
          description: 'Configuração salva com sucesso'
        });
      } else {
        throw new Error('Falha ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar configuração',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      setHasChanges(true);
      return newConfig;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuração da Automação</h1>
          <p className="text-muted-foreground">
            Configure os parâmetros da automação LGPD
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="text-yellow-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Alterações não salvas
            </Badge>
          )}
          <Button
            onClick={saveConfig}
            disabled={saving || !hasChanges}
          >
            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
      {/* Configuração Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuração Geral
          </CardTitle>
          <CardDescription>
            Configurações principais da automação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="automation-enabled" className="text-base font-medium">
                Habilitar Automação
              </Label>
              <p className="text-sm text-muted-foreground">
                Ativa ou desativa todo o sistema de automação
              </p>
            </div>
            <Switch
              id="automation-enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => updateConfig('enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Configuração */}
      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedules">Agendamentos</TabsTrigger>
          <TabsTrigger value="features">Recursos</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="limits">Limites</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Agendamentos
              </CardTitle>
              <CardDescription>
                Configure quando cada processo deve ser executado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Automação Completa */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Automação Completa</Label>
                  <Switch
                    checked={config.schedules.fullAutomation.enabled}
                    onCheckedChange={(checked) => 
                      updateConfig('schedules.fullAutomation.enabled', checked)
                    }
                  />
                </div>
                {config.schedules.fullAutomation.enabled && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="full-cron">Expressão Cron</Label>
                      <Input
                        id="full-cron"
                        value={config.schedules.fullAutomation.cron}
                        onChange={(e) => 
                          updateConfig('schedules.fullAutomation.cron', e.target.value)
                        }
                        placeholder="0 2 * * *"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Diariamente às 02:00
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Fuso Horário</Label>
                      <Select
                        value={config.schedules.fullAutomation.timezone}
                        onValueChange={(value) => 
                          updateConfig('schedules.fullAutomation.timezone', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                          <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                          <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Gestão de Consentimentos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Gestão de Consentimentos</Label>
                    <p className="text-sm text-muted-foreground">
                      Verificação e atualização de consentimentos
                    </p>
                  </div>
                  <Switch
                    checked={config.schedules.consentManagement.enabled}
                    onCheckedChange={(checked) => 
                      updateConfig('schedules.consentManagement.enabled', checked)
                    }
                  />
                </div>
                {config.schedules.consentManagement.enabled && (
                  <div>
                    <Label htmlFor="consent-cron">Expressão Cron</Label>
                    <Input
                      id="consent-cron"
                      value={config.schedules.consentManagement.cron}
                      onChange={(e) => 
                        updateConfig('schedules.consentManagement.cron', e.target.value)
                      }
                      placeholder="0 */6 * * *"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      A cada 6 horas
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Direitos dos Titulares */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Direitos dos Titulares</Label>
                    <p className="text-sm text-muted-foreground">
                      Processamento de solicitações de direitos
                    </p>
                  </div>
                  <Switch
                    checked={config.schedules.dataSubjectRights.enabled}
                    onCheckedChange={(checked) => 
                      updateConfig('schedules.dataSubjectRights.enabled', checked)
                    }
                  />
                </div>
                {config.schedules.dataSubjectRights.enabled && (
                  <div>
                    <Label htmlFor="rights-cron">Expressão Cron</Label>
                    <Input
                      id="rights-cron"
                      value={config.schedules.dataSubjectRights.cron}
                      onChange={(e) => 
                        updateConfig('schedules.dataSubjectRights.cron', e.target.value)
                      }
                      placeholder="0 */4 * * *"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      A cada 4 horas
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Recursos da Automação
              </CardTitle>
              <CardDescription>
                Habilite ou desabilite recursos específicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Gestão Automática de Consentimentos</Label>
                    <p className="text-sm text-muted-foreground">
                      Verificação e renovação automática de consentimentos
                    </p>
                  </div>
                  <Switch
                    checked={config.features.autoConsentManagement}
                    onCheckedChange={(checked) => 
                      updateConfig('features.autoConsentManagement', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Processamento de Direitos dos Titulares</Label>
                    <p className="text-sm text-muted-foreground">
                      Processamento automático de solicitações de direitos
                    </p>
                  </div>
                  <Switch
                    checked={config.features.autoDataSubjectRights}
                    onCheckedChange={(checked) => 
                      updateConfig('features.autoDataSubjectRights', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Relatórios de Auditoria Automáticos</Label>
                    <p className="text-sm text-muted-foreground">
                      Geração automática de relatórios de conformidade
                    </p>
                  </div>
                  <Switch
                    checked={config.features.autoAuditReporting}
                    onCheckedChange={(checked) => 
                      updateConfig('features.autoAuditReporting', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Anonimização Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Anonimização automática de dados antigos
                    </p>
                  </div>
                  <Switch
                    checked={config.features.autoAnonymization}
                    onCheckedChange={(checked) => 
                      updateConfig('features.autoAnonymization', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Monitoramento em Tempo Real</Label>
                    <p className="text-sm text-muted-foreground">
                      Monitoramento contínuo de conformidade
                    </p>
                  </div>
                  <Switch
                    checked={config.features.realTimeMonitoring}
                    onCheckedChange={(checked) => 
                      updateConfig('features.realTimeMonitoring', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Alertas Inteligentes</Label>
                    <p className="text-sm text-muted-foreground">
                      Sistema de alertas baseado em IA
                    </p>
                  </div>
                  <Switch
                    checked={config.features.smartAlerts}
                    onCheckedChange={(checked) => 
                      updateConfig('features.smartAlerts', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Notificações por Email</Label>
                  <Switch
                    checked={config.notifications.email.enabled}
                    onCheckedChange={(checked) => 
                      updateConfig('notifications.email.enabled', checked)
                    }
                  />
                </div>
                {config.notifications.email.enabled && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email-recipients">Destinatários</Label>
                      <Textarea
                        id="email-recipients"
                        value={config.notifications.email.recipients.join('\n')}
                        onChange={(e) => 
                          updateConfig('notifications.email.recipients', 
                            e.target.value.split('\n').filter(email => email.trim()))
                        }
                        placeholder="admin@clinica.com\nresponsavel@clinica.com"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Um email por linha
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Webhook */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Webhook</Label>
                  <Switch
                    checked={config.notifications.webhook.enabled}
                    onCheckedChange={(checked) => 
                      updateConfig('notifications.webhook.enabled', checked)
                    }
                  />
                </div>
                {config.notifications.webhook.enabled && (
                  <div>
                    <Label htmlFor="webhook-url">URL do Webhook</Label>
                    <Input
                      id="webhook-url"
                      value={config.notifications.webhook.url}
                      onChange={(e) => 
                        updateConfig('notifications.webhook.url', e.target.value)
                      }
                      placeholder="https://api.exemplo.com/webhook"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Limites e Performance
              </CardTitle>
              <CardDescription>
                Configure limites de execução e performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="max-jobs">Máximo de Jobs Simultâneos</Label>
                  <Input
                    id="max-jobs"
                    type="number"
                    min="1"
                    max="10"
                    value={config.limits.maxConcurrentJobs}
                    onChange={(e) => 
                      updateConfig('limits.maxConcurrentJobs', parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Número máximo de processos executando simultaneamente
                  </p>
                </div>

                <div>
                  <Label htmlFor="job-timeout">Timeout de Job (segundos)</Label>
                  <Input
                    id="job-timeout"
                    type="number"
                    min="300"
                    max="7200"
                    value={config.limits.jobTimeout}
                    onChange={(e) => 
                      updateConfig('limits.jobTimeout', parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tempo limite para execução de cada job
                  </p>
                </div>

                <div>
                  <Label htmlFor="retry-attempts">Tentativas de Retry</Label>
                  <Input
                    id="retry-attempts"
                    type="number"
                    min="0"
                    max="5"
                    value={config.limits.retryAttempts}
                    onChange={(e) => 
                      updateConfig('limits.retryAttempts', parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Número de tentativas em caso de falha
                  </p>
                </div>

                <div>
                  <Label htmlFor="batch-size">Tamanho do Lote</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    min="10"
                    max="1000"
                    value={config.limits.batchSize}
                    onChange={(e) => 
                      updateConfig('limits.batchSize', parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Número de registros processados por lote
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}