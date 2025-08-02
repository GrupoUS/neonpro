'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  Info,
  Cpu,
  Database,
  Shield,
  Palette,
  Bell,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  HardDrive,
  Network,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VisionSettings {
  // Analysis Settings
  defaultAccuracyThreshold: number;
  maxProcessingTime: number;
  autoSaveResults: boolean;
  enableRealTimePreview: boolean;
  imageQualityThreshold: number;
  
  // Performance Settings
  maxConcurrentAnalyses: number;
  enableGpuAcceleration: boolean;
  memoryLimit: number;
  cacheSize: number;
  
  // Security Settings
  enableDataEncryption: boolean;
  requirePatientConsent: boolean;
  dataRetentionDays: number;
  enableAuditLog: boolean;
  
  // UI Settings
  theme: 'light' | 'dark' | 'auto';
  language: string;
  enableAnimations: boolean;
  compactMode: boolean;
  
  // Notification Settings
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  notifyOnCompletion: boolean;
  notifyOnErrors: boolean;
  
  // Export Settings
  defaultExportFormat: string;
  includeMetadata: boolean;
  compressImages: boolean;
  watermarkImages: boolean;
}

interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  gpuUsage?: number;
  status: 'healthy' | 'warning' | 'critical';
}

export default function VisionSettingsPage() {
  const [settings, setSettings] = useState<VisionSettings>({
    // Analysis Settings
    defaultAccuracyThreshold: 95,
    maxProcessingTime: 30000,
    autoSaveResults: true,
    enableRealTimePreview: true,
    imageQualityThreshold: 80,
    
    // Performance Settings
    maxConcurrentAnalyses: 3,
    enableGpuAcceleration: true,
    memoryLimit: 4096,
    cacheSize: 1024,
    
    // Security Settings
    enableDataEncryption: true,
    requirePatientConsent: true,
    dataRetentionDays: 365,
    enableAuditLog: true,
    
    // UI Settings
    theme: 'auto',
    language: 'pt-BR',
    enableAnimations: true,
    compactMode: false,
    
    // Notification Settings
    enableEmailNotifications: true,
    enablePushNotifications: false,
    notifyOnCompletion: true,
    notifyOnErrors: true,
    
    // Export Settings
    defaultExportFormat: 'pdf',
    includeMetadata: true,
    compressImages: true,
    watermarkImages: false
  });
  
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    networkLatency: 12,
    gpuUsage: 34,
    status: 'healthy'
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Monitor system health
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate system health updates
      setSystemHealth(prev => ({
        ...prev,
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        networkLatency: Math.max(0, prev.networkLatency + (Math.random() - 0.5) * 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateSetting = <K extends keyof VisionSettings>(
    key: K, 
    value: VisionSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would save to your backend
      console.log('Saving settings:', settings);
      
      setHasUnsavedChanges(false);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    // Reset to default values
    setSettings({
      defaultAccuracyThreshold: 95,
      maxProcessingTime: 30000,
      autoSaveResults: true,
      enableRealTimePreview: true,
      imageQualityThreshold: 80,
      maxConcurrentAnalyses: 3,
      enableGpuAcceleration: true,
      memoryLimit: 4096,
      cacheSize: 1024,
      enableDataEncryption: true,
      requirePatientConsent: true,
      dataRetentionDays: 365,
      enableAuditLog: true,
      theme: 'auto',
      language: 'pt-BR',
      enableAnimations: true,
      compactMode: false,
      enableEmailNotifications: true,
      enablePushNotifications: false,
      notifyOnCompletion: true,
      notifyOnErrors: true,
      defaultExportFormat: 'pdf',
      includeMetadata: true,
      compressImages: true,
      watermarkImages: false
    });
    setHasUnsavedChanges(true);
    toast.info('Configurações restauradas para os valores padrão');
  };

  const getHealthStatus = (usage: number) => {
    if (usage < 60) return { color: 'text-green-600', bg: 'bg-green-100', status: 'Bom' };
    if (usage < 80) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'Atenção' };
    return { color: 'text-red-600', bg: 'bg-red-100', status: 'Crítico' };
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
            <p className="text-gray-600">
              Configure parâmetros e preferências do sistema de visão computacional
            </p>
          </div>
        </div>
        
        {/* Save/Reset Actions */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSaveSettings}
            disabled={!hasUnsavedChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleResetSettings}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
          
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Alterações não salvas
            </Badge>
          )}
        </div>
      </div>

      {/* System Health Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">CPU</span>
                <Cpu className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all",
                      getHealthStatus(systemHealth.cpuUsage).color.replace('text-', 'bg-')
                    )}
                    style={{ width: `${systemHealth.cpuUsage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">
                  {systemHealth.cpuUsage.toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Memória</span>
                <Database className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all",
                      getHealthStatus(systemHealth.memoryUsage).color.replace('text-', 'bg-')
                    )}
                    style={{ width: `${systemHealth.memoryUsage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">
                  {systemHealth.memoryUsage.toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Disco</span>
                <HardDrive className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all",
                      getHealthStatus(systemHealth.diskUsage).color.replace('text-', 'bg-')
                    )}
                    style={{ width: `${systemHealth.diskUsage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">
                  {systemHealth.diskUsage.toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Rede</span>
                <Network className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Latência:</span>
                <span className="text-sm font-semibold">
                  {systemHealth.networkLatency.toFixed(0)}ms
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="export">Exportação</TabsTrigger>
        </TabsList>

        {/* Analysis Settings */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Análise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="accuracy-threshold">Limite de Precisão Padrão (%)</Label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.defaultAccuracyThreshold]}
                      onValueChange={([value]) => updateSetting('defaultAccuracyThreshold', value)}
                      max={100}
                      min={50}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>50%</span>
                      <span className="font-semibold">{settings.defaultAccuracyThreshold}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="processing-time">Tempo Máximo de Processamento (ms)</Label>
                  <Input
                    id="processing-time"
                    type="number"
                    value={settings.maxProcessingTime}
                    onChange={(e) => updateSetting('maxProcessingTime', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="image-quality">Limite de Qualidade da Imagem (%)</Label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.imageQualityThreshold]}
                      onValueChange={([value]) => updateSetting('imageQualityThreshold', value)}
                      max={100}
                      min={30}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>30%</span>
                      <span className="font-semibold">{settings.imageQualityThreshold}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save">Salvar Resultados Automaticamente</Label>
                    <p className="text-sm text-gray-600">Salva automaticamente os resultados após cada análise</p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={settings.autoSaveResults}
                    onCheckedChange={(checked) => updateSetting('autoSaveResults', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="real-time-preview">Preview em Tempo Real</Label>
                    <p className="text-sm text-gray-600">Mostra preview das análises durante o processamento</p>
                  </div>
                  <Switch
                    id="real-time-preview"
                    checked={settings.enableRealTimePreview}
                    onCheckedChange={(checked) => updateSetting('enableRealTimePreview', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="concurrent-analyses">Análises Simultâneas Máximas</Label>
                  <Select 
                    value={settings.maxConcurrentAnalyses.toString()} 
                    onValueChange={(value) => updateSetting('maxConcurrentAnalyses', parseInt(value))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 análise</SelectItem>
                      <SelectItem value="2">2 análises</SelectItem>
                      <SelectItem value="3">3 análises</SelectItem>
                      <SelectItem value="4">4 análises</SelectItem>
                      <SelectItem value="5">5 análises</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="memory-limit">Limite de Memória (MB)</Label>
                  <Input
                    id="memory-limit"
                    type="number"
                    value={settings.memoryLimit}
                    onChange={(e) => updateSetting('memoryLimit', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cache-size">Tamanho do Cache (MB)</Label>
                  <Input
                    id="cache-size"
                    type="number"
                    value={settings.cacheSize}
                    onChange={(e) => updateSetting('cacheSize', parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gpu-acceleration">Aceleração por GPU</Label>
                    <p className="text-sm text-gray-600">Usa GPU para acelerar o processamento de imagens</p>
                  </div>
                  <Switch
                    id="gpu-acceleration"
                    checked={settings.enableGpuAcceleration}
                    onCheckedChange={(checked) => updateSetting('enableGpuAcceleration', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="retention-days">Retenção de Dados (dias)</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => updateSetting('dataRetentionDays', parseInt(e.target.value))}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dados serão automaticamente removidos após este período
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-encryption">Criptografia de Dados</Label>
                    <p className="text-sm text-gray-600">Criptografa dados sensíveis em repouso e em trânsito</p>
                  </div>
                  <Switch
                    id="data-encryption"
                    checked={settings.enableDataEncryption}
                    onCheckedChange={(checked) => updateSetting('enableDataEncryption', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="patient-consent">Consentimento do Paciente Obrigatório</Label>
                    <p className="text-sm text-gray-600">Requer consentimento explícito antes de processar dados</p>
                  </div>
                  <Switch
                    id="patient-consent"
                    checked={settings.requirePatientConsent}
                    onCheckedChange={(checked) => updateSetting('requirePatientConsent', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audit-log">Log de Auditoria</Label>
                    <p className="text-sm text-gray-600">Registra todas as ações do sistema para auditoria</p>
                  </div>
                  <Switch
                    id="audit-log"
                    checked={settings.enableAuditLog}
                    onCheckedChange={(checked) => updateSetting('enableAuditLog', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interface Settings */}
        <TabsContent value="interface">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Configurações de Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <Select 
                    value={settings.theme} 
                    onValueChange={(value: 'light' | 'dark' | 'auto') => updateSetting('theme', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="animations">Animações</Label>
                    <p className="text-sm text-gray-600">Habilita animações e transições na interface</p>
                  </div>
                  <Switch
                    id="animations"
                    checked={settings.enableAnimations}
                    onCheckedChange={(checked) => updateSetting('enableAnimations', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-mode">Modo Compacto</Label>
                    <p className="text-sm text-gray-600">Reduz espaçamentos para mostrar mais informações</p>
                  </div>
                  <Switch
                    id="compact-mode"
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Notificações por Email</Label>
                    <p className="text-sm text-gray-600">Recebe notificações importantes por email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.enableEmailNotifications}
                    onCheckedChange={(checked) => updateSetting('enableEmailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Notificações Push</Label>
                    <p className="text-sm text-gray-600">Recebe notificações push no navegador</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.enablePushNotifications}
                    onCheckedChange={(checked) => updateSetting('enablePushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notify-completion">Notificar ao Completar Análise</Label>
                    <p className="text-sm text-gray-600">Notifica quando uma análise é concluída</p>
                  </div>
                  <Switch
                    id="notify-completion"
                    checked={settings.notifyOnCompletion}
                    onCheckedChange={(checked) => updateSetting('notifyOnCompletion', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notify-errors">Notificar Erros</Label>
                    <p className="text-sm text-gray-600">Notifica quando ocorrem erros no sistema</p>
                  </div>
                  <Switch
                    id="notify-errors"
                    checked={settings.notifyOnErrors}
                    onCheckedChange={(checked) => updateSetting('notifyOnErrors', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Settings */}
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Configurações de Exportação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="export-format">Formato Padrão de Exportação</Label>
                  <Select 
                    value={settings.defaultExportFormat} 
                    onValueChange={(value) => updateSetting('defaultExportFormat', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-metadata">Incluir Metadados</Label>
                    <p className="text-sm text-gray-600">Inclui informações técnicas nos arquivos exportados</p>
                  </div>
                  <Switch
                    id="include-metadata"
                    checked={settings.includeMetadata}
                    onCheckedChange={(checked) => updateSetting('includeMetadata', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compress-images">Comprimir Imagens</Label>
                    <p className="text-sm text-gray-600">Reduz o tamanho dos arquivos de imagem exportados</p>
                  </div>
                  <Switch
                    id="compress-images"
                    checked={settings.compressImages}
                    onCheckedChange={(checked) => updateSetting('compressImages', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="watermark-images">Marca d'água nas Imagens</Label>
                    <p className="text-sm text-gray-600">Adiciona marca d'água nas imagens exportadas</p>
                  </div>
                  <Switch
                    id="watermark-images"
                    checked={settings.watermarkImages}
                    onCheckedChange={(checked) => updateSetting('watermarkImages', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Advanced Settings Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="font-medium">Configurações Avançadas</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
          
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Atenção</h4>
                    <p className="text-sm text-yellow-700">
                      As configurações avançadas podem afetar significativamente o desempenho do sistema. 
                      Altere apenas se souber o que está fazendo.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="debug-mode">Modo Debug</Label>
                  <p className="text-xs text-gray-500">Habilita logs detalhados para depuração</p>
                </div>
                
                <div>
                  <Label htmlFor="experimental-features">Recursos Experimentais</Label>
                  <p className="text-xs text-gray-500">Habilita recursos em desenvolvimento</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}