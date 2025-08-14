'use client'

import { useState } from 'react'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Palette, 
  Database,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  Check,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

// Configuration Interfaces
interface SystemConfig {
  general: {
    clinicName: string
    cnpj: string
    email: string
    phone: string
    address: string
    timezone: string
    language: string
    currency: string
  }
  business: {
    workingHours: {
      monday: { start: string, end: string, enabled: boolean }
      tuesday: { start: string, end: string, enabled: boolean }
      wednesday: { start: string, end: string, enabled: boolean }
      thursday: { start: string, end: string, enabled: boolean }
      friday: { start: string, end: string, enabled: boolean }
      saturday: { start: string, end: string, enabled: boolean }
      sunday: { start: string, end: string, enabled: boolean }
    }
    appointmentDuration: number
    maxAdvanceBooking: number
    cancellationPolicy: number
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    appointmentReminders: boolean
    reminderHours: number
    promotionalEmails: boolean
    systemAlerts: boolean
  }
  security: {
    passwordMinLength: number
    sessionTimeout: number
    maxLoginAttempts: number
    twoFactorAuth: boolean
    auditLogs: boolean
    dataEncryption: boolean
  }
  integrations: {
    emailService: string
    smsProvider: string
    paymentGateway: string
    backupService: string
    analyticsService: string
  }
}

// Configuration Section Component
const ConfigSection = ({ 
  title, 
  icon: Icon, 
  children, 
  description 
}: { 
  title: string
  icon: any
  children: React.ReactNode
  description?: string 
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      {children}
    </CardContent>
  </Card>
)

// Form Field Component
const FormField = ({ 
  label, 
  children, 
  description,
  required = false 
}: { 
  label: string
  children: React.ReactNode
  description?: string
  required?: boolean
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {children}
    {description && <p className="text-xs text-gray-500">{description}</p>}
  </div>
)

// Working Hours Component
const WorkingHoursConfig = ({ 
  workingHours, 
  onChange 
}: { 
  workingHours: any
  onChange: (day: string, field: string, value: any) => void 
}) => {
  const days = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ]

  return (
    <div className="space-y-4">
      {days.map(day => (
        <div key={day.key} className="flex items-center gap-4 p-3 border rounded-lg">
          <div className="w-32">
            <Label className="text-sm font-medium">{day.label}</Label>
          </div>
          <Switch
            checked={workingHours[day.key]?.enabled || false}
            onCheckedChange={(checked) => onChange(day.key, 'enabled', checked)}
          />
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={workingHours[day.key]?.start || '08:00'}
              onChange={(e) => onChange(day.key, 'start', e.target.value)}
              disabled={!workingHours[day.key]?.enabled}
              className="w-24"
            />
            <span className="text-gray-500">até</span>
            <Input
              type="time"
              value={workingHours[day.key]?.end || '18:00'}
              onChange={(e) => onChange(day.key, 'end', e.target.value)}
              disabled={!workingHours[day.key]?.enabled}
              className="w-24"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Backup Configuration Component
const BackupConfig = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Backup Diário</p>
              <p className="text-sm text-gray-500">Automático às 02:00</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Último Backup</p>
              <p className="text-sm text-gray-500">14/01/2025 02:15</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Sucesso</Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tamanho Total</p>
              <p className="text-sm text-gray-500">2.5 GB</p>
            </div>
            <Badge className="bg-gray-100 text-gray-800">Normal</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <div className="flex gap-3">
      <Button>
        <Download className="w-4 h-4 mr-2" />
        Backup Manual
      </Button>
      <Button variant="outline">
        <Upload className="w-4 h-4 mr-2" />
        Restaurar
      </Button>
      <Button variant="outline">
        <Settings className="w-4 h-4 mr-2" />
        Configurar
      </Button>
    </div>
  </div>
)

// Mock Configuration Data
const mockSystemConfig: SystemConfig = {
  general: {
    clinicName: 'Clínica NeonPro Estética',
    cnpj: '12.345.678/0001-90',
    email: 'contato@neonpro.com',
    phone: '+55 11 3456-7890',
    address: 'Rua Augusta, 123 - São Paulo/SP - 01234-567',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    currency: 'BRL'
  },
  business: {
    workingHours: {
      monday: { start: '08:00', end: '18:00', enabled: true },
      tuesday: { start: '08:00', end: '18:00', enabled: true },
      wednesday: { start: '08:00', end: '18:00', enabled: true },
      thursday: { start: '08:00', end: '18:00', enabled: true },
      friday: { start: '08:00', end: '17:00', enabled: true },
      saturday: { start: '08:00', end: '12:00', enabled: true },
      sunday: { start: '09:00', end: '15:00', enabled: false }
    },
    appointmentDuration: 60,
    maxAdvanceBooking: 90,
    cancellationPolicy: 24
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: true,
    appointmentReminders: true,
    reminderHours: 24,
    promotionalEmails: false,
    systemAlerts: true
  },
  security: {
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 3,
    twoFactorAuth: true,
    auditLogs: true,
    dataEncryption: true
  },
  integrations: {
    emailService: 'smtp',
    smsProvider: 'twilio',
    paymentGateway: 'stripe',
    backupService: 'aws',
    analyticsService: 'google'
  }
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<SystemConfig>(mockSystemConfig)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const handleConfigChange = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    setUnsavedChanges(true)
  }

  const handleWorkingHoursChange = (day: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      business: {
        ...prev.business,
        workingHours: {
          ...prev.business.workingHours,
          [day]: {
            ...prev.business.workingHours[day as keyof typeof prev.business.workingHours],
            [field]: value
          }
        }
      }
    }))
    setUnsavedChanges(true)
  }

  const handleSave = () => {
    // Save configuration logic
    setUnsavedChanges(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Configuration Header */}
      <header className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Configurações do Sistema
              </h1>
              <p className="text-gray-300 mt-1">
                Configuração geral • Segurança • Integrações • Backup
              </p>
            </div>
            <div className="flex gap-3">
              {unsavedChanges && (
                <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Alterações não salvas
                </Badge>
              )}
              <Button 
                variant="secondary" 
                className="bg-white text-gray-700 hover:bg-gray-100"
                disabled={!unsavedChanges}
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 -mt-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="business">Negócio</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>
          
          {/* General Tab */}
          <TabsContent value="general">
            <ConfigSection
              title="Informações Gerais"
              icon={User}
              description="Configurações básicas da clínica"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Nome da Clínica" required>
                  <Input
                    value={config.general.clinicName}
                    onChange={(e) => handleConfigChange('general', 'clinicName', e.target.value)}
                  />
                </FormField>
                
                <FormField label="CNPJ" required>
                  <Input
                    value={config.general.cnpj}
                    onChange={(e) => handleConfigChange('general', 'cnpj', e.target.value)}
                  />
                </FormField>
                
                <FormField label="E-mail Principal" required>
                  <Input
                    type="email"
                    value={config.general.email}
                    onChange={(e) => handleConfigChange('general', 'email', e.target.value)}
                  />
                </FormField>
                
                <FormField label="Telefone Principal" required>
                  <Input
                    value={config.general.phone}
                    onChange={(e) => handleConfigChange('general', 'phone', e.target.value)}
                  />
                </FormField>
              </div>
              
              <FormField label="Endereço Completo" required>
                <Textarea
                  value={config.general.address}
                  onChange={(e) => handleConfigChange('general', 'address', e.target.value)}
                  rows={3}
                />
              </FormField>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Fuso Horário">
                  <Select value={config.general.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                      <SelectItem value="America/Rio_Branco">Acre (UTC-5)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                
                <FormField label="Idioma">
                  <Select value={config.general.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                
                <FormField label="Moeda">
                  <Select value={config.general.currency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar (US$)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </ConfigSection>
          </TabsContent>
          
          {/* Business Tab */}
          <TabsContent value="business">
            <div className="space-y-6">
              <ConfigSection
                title="Horário de Funcionamento"
                icon={Clock}
                description="Defina os horários de atendimento da clínica"
              >
                <WorkingHoursConfig 
                  workingHours={config.business.workingHours}
                  onChange={handleWorkingHoursChange}
                />
              </ConfigSection>
              
              <ConfigSection
                title="Políticas de Agendamento"
                icon={Calendar}
                description="Configurações para agendamentos"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField 
                    label="Duração Padrão (minutos)"
                    description="Tempo padrão para consultas"
                  >
                    <Input
                      type="number"
                      value={config.business.appointmentDuration}
                      onChange={(e) => handleConfigChange('business', 'appointmentDuration', parseInt(e.target.value))}
                    />
                  </FormField>
                  
                  <FormField 
                    label="Agendamento Antecipado (dias)"
                    description="Máximo de dias para agendar"
                  >
                    <Input
                      type="number"
                      value={config.business.maxAdvanceBooking}
                      onChange={(e) => handleConfigChange('business', 'maxAdvanceBooking', parseInt(e.target.value))}
                    />
                  </FormField>
                  
                  <FormField 
                    label="Política de Cancelamento (horas)"
                    description="Antecedência mínima para cancelar"
                  >
                    <Input
                      type="number"
                      value={config.business.cancellationPolicy}
                      onChange={(e) => handleConfigChange('business', 'cancellationPolicy', parseInt(e.target.value))}
                    />
                  </FormField>
                </div>
              </ConfigSection>
            </div>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <ConfigSection
              title="Configurações de Notificação"
              icon={Bell}
              description="Gerencie notificações por e-mail e SMS"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Notificações por E-mail</Label>
                    <p className="text-sm text-gray-500">Enviar notificações via e-mail</p>
                  </div>
                  <Switch
                    checked={config.notifications.emailEnabled}
                    onCheckedChange={(checked) => handleConfigChange('notifications', 'emailEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Notificações por SMS</Label>
                    <p className="text-sm text-gray-500">Enviar notificações via SMS</p>
                  </div>
                  <Switch
                    checked={config.notifications.smsEnabled}
                    onCheckedChange={(checked) => handleConfigChange('notifications', 'smsEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Lembretes de Consulta</Label>
                    <p className="text-sm text-gray-500">Enviar lembretes automáticos</p>
                  </div>
                  <Switch
                    checked={config.notifications.appointmentReminders}
                    onCheckedChange={(checked) => handleConfigChange('notifications', 'appointmentReminders', checked)}
                  />
                </div>
                
                {config.notifications.appointmentReminders && (
                  <FormField label="Antecedência do Lembrete (horas)">
                    <Input
                      type="number"
                      value={config.notifications.reminderHours}
                      onChange={(e) => handleConfigChange('notifications', 'reminderHours', parseInt(e.target.value))}
                      className="w-32"
                    />
                  </FormField>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">E-mails Promocionais</Label>
                    <p className="text-sm text-gray-500">Campanhas de marketing</p>
                  </div>
                  <Switch
                    checked={config.notifications.promotionalEmails}
                    onCheckedChange={(checked) => handleConfigChange('notifications', 'promotionalEmails', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Alertas do Sistema</Label>
                    <p className="text-sm text-gray-500">Notificações técnicas importantes</p>
                  </div>
                  <Switch
                    checked={config.notifications.systemAlerts}
                    onCheckedChange={(checked) => handleConfigChange('notifications', 'systemAlerts', checked)}
                  />
                </div>
              </div>
            </ConfigSection>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <ConfigSection
              title="Configurações de Segurança"
              icon={Shield}
              description="Configurações de segurança e privacidade"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Tamanho Mínimo da Senha">
                  <Input
                    type="number"
                    value={config.security.passwordMinLength}
                    onChange={(e) => handleConfigChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </FormField>
                
                <FormField label="Timeout da Sessão (minutos)">
                  <Input
                    type="number"
                    value={config.security.sessionTimeout}
                    onChange={(e) => handleConfigChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </FormField>
                
                <FormField label="Máx. Tentativas de Login">
                  <Input
                    type="number"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) => handleConfigChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </FormField>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-gray-500">Segurança adicional para login</p>
                  </div>
                  <Switch
                    checked={config.security.twoFactorAuth}
                    onCheckedChange={(checked) => handleConfigChange('security', 'twoFactorAuth', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Log de Auditoria</Label>
                    <p className="text-sm text-gray-500">Registrar todas as ações do sistema</p>
                  </div>
                  <Switch
                    checked={config.security.auditLogs}
                    onCheckedChange={(checked) => handleConfigChange('security', 'auditLogs', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Criptografia de Dados</Label>
                    <p className="text-sm text-gray-500">Criptografar dados sensíveis</p>
                  </div>
                  <Switch
                    checked={config.security.dataEncryption}
                    onCheckedChange={(checked) => handleConfigChange('security', 'dataEncryption', checked)}
                  />
                </div>
              </div>
            </ConfigSection>
          </TabsContent>
          
          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <ConfigSection
              title="Integrações"
              icon={Globe}
              description="Configurações de serviços externos"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Serviço de E-mail">
                  <Select value={config.integrations.emailService}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                
                <FormField label="Provedor de SMS">
                  <Select value={config.integrations.smsProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="aws-sns">AWS SNS</SelectItem>
                      <SelectItem value="zenvia">Zenvia</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                
                <FormField label="Gateway de Pagamento">
                  <Select value={config.integrations.paymentGateway}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="pagseguro">PagSeguro</SelectItem>
                      <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                
                <FormField label="Serviço de Backup">
                  <Select value={config.integrations.backupService}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">AWS S3</SelectItem>
                      <SelectItem value="google">Google Drive</SelectItem>
                      <SelectItem value="azure">Azure Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </ConfigSection>
          </TabsContent>
          
          {/* Backup Tab */}
          <TabsContent value="backup">
            <ConfigSection
              title="Sistema de Backup"
              icon={Database}
              description="Configurações de backup e restauração"
            >
              <BackupConfig />
            </ConfigSection>
          </TabsContent>
        </Tabs>
      </div>

      {/* Configuration Footer */}
      <footer className="bg-white border-t p-6 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-600 border-green-600">
              Configuração Segura
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Backup Ativo
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              Integrado
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Última sincronização: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </footer>
    </div>
  )
}