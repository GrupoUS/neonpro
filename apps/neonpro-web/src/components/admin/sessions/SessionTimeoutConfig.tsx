/**
 * Session Timeout Configuration Interface
 * Story 1.4 - Task 1: Session timeout configuration interface for admins
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Clock, Shield, Users, Settings, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { UserRole } from '@/types/auth';
import { SessionTimeoutConfig } from '@/lib/auth/intelligent-session-timeout';
import { toast } from 'sonner';

interface SessionTimeoutConfigProps {
  onConfigUpdate?: (role: UserRole, config: SessionTimeoutConfig) => void;
}

interface ConfigFormData {
  defaultTimeoutMinutes: number;
  maxTimeoutMinutes: number;
  warningThresholds: number[];
  activityExtensionMinutes: number;
  gracePeriodMinutes: number;
  autoExtendEnabled: boolean;
}

const DEFAULT_CONFIGS: Record<UserRole, ConfigFormData> = {
  owner: {
    defaultTimeoutMinutes: 60,
    maxTimeoutMinutes: 480,
    warningThresholds: [15, 5, 1],
    activityExtensionMinutes: 30,
    gracePeriodMinutes: 5,
    autoExtendEnabled: true
  },
  manager: {
    defaultTimeoutMinutes: 45,
    maxTimeoutMinutes: 240,
    warningThresholds: [10, 5, 1],
    activityExtensionMinutes: 20,
    gracePeriodMinutes: 3,
    autoExtendEnabled: true
  },
  staff: {
    defaultTimeoutMinutes: 30,
    maxTimeoutMinutes: 120,
    warningThresholds: [10, 5, 1],
    activityExtensionMinutes: 15,
    gracePeriodMinutes: 2,
    autoExtendEnabled: true
  },
  patient: {
    defaultTimeoutMinutes: 20,
    maxTimeoutMinutes: 60,
    warningThresholds: [5, 2, 1],
    activityExtensionMinutes: 10,
    gracePeriodMinutes: 1,
    autoExtendEnabled: false
  }
};

const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Proprietário',
  manager: 'Gerente',
  staff: 'Funcionário',
  patient: 'Paciente'
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  owner: 'Acesso completo ao sistema com sessões de longa duração',
  manager: 'Acesso gerencial com sessões moderadas',
  staff: 'Acesso operacional com sessões padrão',
  patient: 'Acesso limitado com sessões de curta duração'
};

export default function SessionTimeoutConfig({ onConfigUpdate }: SessionTimeoutConfigProps) {
  const [configs, setConfigs] = useState<Record<UserRole, ConfigFormData>>(DEFAULT_CONFIGS);
  const [activeRole, setActiveRole] = useState<UserRole>('staff');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCurrentConfigs();
  }, []);

  const loadCurrentConfigs = async () => {
    try {
      setIsLoading(true);
      // Load current configurations from the intelligent session timeout system
      // This would typically fetch from your backend/database
      const response = await fetch('/api/admin/session-timeout-configs');
      if (response.ok) {
        const data = await response.json();
        setConfigs(data.configs || DEFAULT_CONFIGS);
      }
    } catch (error) {
      console.error('Failed to load session timeout configs:', error);
      toast.error('Falha ao carregar configurações de timeout');
    } finally {
      setIsLoading(false);
    }
  };

  const validateConfig = (role: UserRole, config: ConfigFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (config.defaultTimeoutMinutes <= 0) {
      errors.defaultTimeout = 'Timeout padrão deve ser maior que 0';
    }

    if (config.maxTimeoutMinutes <= config.defaultTimeoutMinutes) {
      errors.maxTimeout = 'Timeout máximo deve ser maior que o timeout padrão';
    }

    if (config.activityExtensionMinutes <= 0) {
      errors.activityExtension = 'Extensão por atividade deve ser maior que 0';
    }

    if (config.gracePeriodMinutes <= 0) {
      errors.gracePeriod = 'Período de graça deve ser maior que 0';
    }

    if (config.warningThresholds.some(threshold => threshold <= 0)) {
      errors.warningThresholds = 'Todos os avisos devem ser maiores que 0';
    }

    if (config.warningThresholds.some(threshold => threshold >= config.defaultTimeoutMinutes)) {
      errors.warningThresholds = 'Avisos devem ser menores que o timeout padrão';
    }

    // Role-specific validations
    if (role === 'patient' && config.defaultTimeoutMinutes > 30) {
      errors.patientTimeout = 'Pacientes não devem ter sessões superiores a 30 minutos';
    }

    if (role === 'owner' && config.maxTimeoutMinutes < 240) {
      errors.ownerTimeout = 'Proprietários devem ter pelo menos 4 horas de timeout máximo';
    }

    return errors;
  };

  const handleConfigChange = (role: UserRole, field: keyof ConfigFormData, value: any) => {
    const newConfigs = {
      ...configs,
      [role]: {
        ...configs[role],
        [field]: value
      }
    };

    setConfigs(newConfigs);
    setHasChanges(true);

    // Validate the updated config
    const errors = validateConfig(role, newConfigs[role]);
    setValidationErrors(errors);
  };

  const handleWarningThresholdChange = (role: UserRole, index: number, value: number) => {
    const newThresholds = [...configs[role].warningThresholds];
    newThresholds[index] = value;
    handleConfigChange(role, 'warningThresholds', newThresholds);
  };

  const addWarningThreshold = (role: UserRole) => {
    const newThresholds = [...configs[role].warningThresholds, 5];
    handleConfigChange(role, 'warningThresholds', newThresholds);
  };

  const removeWarningThreshold = (role: UserRole, index: number) => {
    const newThresholds = configs[role].warningThresholds.filter((_, i) => i !== index);
    handleConfigChange(role, 'warningThresholds', newThresholds);
  };

  const saveConfigs = async () => {
    try {
      setIsLoading(true);

      // Validate all configs
      const allErrors: Record<string, string> = {};
      Object.entries(configs).forEach(([role, config]) => {
        const errors = validateConfig(role as UserRole, config);
        Object.assign(allErrors, errors);
      });

      if (Object.keys(allErrors).length > 0) {
        setValidationErrors(allErrors);
        toast.error('Corrija os erros de validação antes de salvar');
        return;
      }

      // Save configurations
      const response = await fetch('/api/admin/session-timeout-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ configs })
      });

      if (!response.ok) {
        throw new Error('Failed to save configurations');
      }

      // Notify parent component
      Object.entries(configs).forEach(([role, config]) => {
        const sessionConfig: SessionTimeoutConfig = {
          role: role as UserRole,
          defaultTimeoutMinutes: config.defaultTimeoutMinutes,
          maxTimeoutMinutes: config.maxTimeoutMinutes,
          warningThresholds: config.warningThresholds,
          activityExtensionMinutes: config.activityExtensionMinutes,
          gracePeriodMinutes: config.gracePeriodMinutes
        };
        onConfigUpdate?.(role as UserRole, sessionConfig);
      });

      setHasChanges(false);
      setValidationErrors({});
      toast.success('Configurações de timeout salvas com sucesso');

    } catch (error) {
      console.error('Failed to save session timeout configs:', error);
      toast.error('Falha ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    setConfigs(DEFAULT_CONFIGS);
    setHasChanges(true);
    setValidationErrors({});
    toast.info('Configurações resetadas para os valores padrão');
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const getRoleSecurityLevel = (role: UserRole): { level: string; color: string } => {
    switch (role) {
      case 'owner':
        return { level: 'Máxima', color: 'bg-red-100 text-red-800' };
      case 'manager':
        return { level: 'Alta', color: 'bg-orange-100 text-orange-800' };
      case 'staff':
        return { level: 'Média', color: 'bg-yellow-100 text-yellow-800' };
      case 'patient':
        return { level: 'Restrita', color: 'bg-green-100 text-green-800' };
      default:
        return { level: 'Padrão', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuração de Timeout de Sessão</h2>
          <p className="text-muted-foreground">
            Configure os tempos limite de sessão por função de usuário
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button
            onClick={saveConfigs}
            disabled={isLoading || !hasChanges || Object.keys(validationErrors).length > 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>

      {Object.keys(validationErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Existem erros de validação que precisam ser corrigidos antes de salvar.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as UserRole)}>
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(ROLE_LABELS).map(([role, label]) => {
            const securityLevel = getRoleSecurityLevel(role as UserRole);
            return (
              <TabsTrigger key={role} value={role} className="flex flex-col gap-1">
                <span>{label}</span>
                <Badge className={`text-xs ${securityLevel.color}`}>
                  {securityLevel.level}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(configs).map(([role, config]) => (
          <TabsContent key={role} value={role}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {ROLE_LABELS[role as UserRole]}
                </CardTitle>
                <CardDescription>
                  {ROLE_DESCRIPTIONS[role as UserRole]}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Timeout Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${role}-default-timeout`}>
                      Timeout Padrão (minutos)
                    </Label>
                    <Input
                      id={`${role}-default-timeout`}
                      type="number"
                      min="1"
                      value={config.defaultTimeoutMinutes}
                      onChange={(e) => handleConfigChange(
                        role as UserRole,
                        'defaultTimeoutMinutes',
                        parseInt(e.target.value) || 0
                      )}
                      className={validationErrors.defaultTimeout ? 'border-red-500' : ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Duração: {formatDuration(config.defaultTimeoutMinutes)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${role}-max-timeout`}>
                      Timeout Máximo (minutos)
                    </Label>
                    <Input
                      id={`${role}-max-timeout`}
                      type="number"
                      min="1"
                      value={config.maxTimeoutMinutes}
                      onChange={(e) => handleConfigChange(
                        role as UserRole,
                        'maxTimeoutMinutes',
                        parseInt(e.target.value) || 0
                      )}
                      className={validationErrors.maxTimeout ? 'border-red-500' : ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Duração: {formatDuration(config.maxTimeoutMinutes)}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Activity Extension Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${role}-activity-extension`}>
                      Extensão por Atividade (minutos)
                    </Label>
                    <Input
                      id={`${role}-activity-extension`}
                      type="number"
                      min="1"
                      value={config.activityExtensionMinutes}
                      onChange={(e) => handleConfigChange(
                        role as UserRole,
                        'activityExtensionMinutes',
                        parseInt(e.target.value) || 0
                      )}
                      className={validationErrors.activityExtension ? 'border-red-500' : ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Tempo adicionado quando há atividade do usuário
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${role}-grace-period`}>
                      Período de Graça (minutos)
                    </Label>
                    <Input
                      id={`${role}-grace-period`}
                      type="number"
                      min="1"
                      value={config.gracePeriodMinutes}
                      onChange={(e) => handleConfigChange(
                        role as UserRole,
                        'gracePeriodMinutes',
                        parseInt(e.target.value) || 0
                      )}
                      className={validationErrors.gracePeriod ? 'border-red-500' : ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Tempo extra antes do logout forçado
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Warning Thresholds */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Avisos de Timeout (minutos antes do logout)</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addWarningThreshold(role as UserRole)}
                    >
                      Adicionar Aviso
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {config.warningThresholds.map((threshold, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={threshold}
                          onChange={(e) => handleWarningThresholdChange(
                            role as UserRole,
                            index,
                            parseInt(e.target.value) || 0
                          )}
                          className={validationErrors.warningThresholds ? 'border-red-500' : ''}
                        />
                        {config.warningThresholds.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeWarningThreshold(role as UserRole, index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {validationErrors.warningThresholds && (
                    <p className="text-sm text-red-500">{validationErrors.warningThresholds}</p>
                  )}
                </div>

                <Separator />

                {/* Auto Extension Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Extensão Automática por Atividade</Label>
                    <p className="text-sm text-muted-foreground">
                      Estender automaticamente a sessão quando o usuário está ativo
                    </p>
                  </div>
                  <Switch
                    checked={config.autoExtendEnabled}
                    onCheckedChange={(checked) => handleConfigChange(
                      role as UserRole,
                      'autoExtendEnabled',
                      checked
                    )}
                  />
                </div>

                {/* Configuration Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Resumo da Configuração
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Timeout padrão: {formatDuration(config.defaultTimeoutMinutes)}</div>
                    <div>Timeout máximo: {formatDuration(config.maxTimeoutMinutes)}</div>
                    <div>Extensão por atividade: {formatDuration(config.activityExtensionMinutes)}</div>
                    <div>Período de graça: {formatDuration(config.gracePeriodMinutes)}</div>
                    <div>Avisos: {config.warningThresholds.join(', ')} min</div>
                    <div>Auto-extensão: {config.autoExtendEnabled ? 'Ativada' : 'Desativada'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
