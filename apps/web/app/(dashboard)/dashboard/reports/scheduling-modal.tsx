'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Mail,
  Users,
  Settings,
  CheckCircle,
  AlertTriangle,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types for scheduling
type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type ScheduleStatus = 'active' | 'paused' | 'error';
type DeliveryMethod = 'email' | 'download' | 'both';

interface ScheduleConfig {
  id: string;
  reportId: string;
  reportName: string;
  frequency: ScheduleFrequency;
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  recipients: string[];
  format: 'pdf' | 'excel' | 'both';
  deliveryMethod: DeliveryMethod;
  status: ScheduleStatus;
  nextRun: string;
  lastRun?: string;
  lgpdCompliant: boolean;
  retentionDays: number;
}

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportName: string;
  onScheduleCreated: (schedule: ScheduleConfig) => void;
}

// Mock existing schedules
const existingSchedules: ScheduleConfig[] = [
  {
    id: 'sched-001',
    reportId: 'lgpd-compliance',
    reportName: 'Relatório de Conformidade LGPD',
    frequency: 'monthly',
    time: '08:00',
    dayOfMonth: 1,
    recipients: ['compliance@neonpro.com.br', 'admin@neonpro.com.br'],
    format: 'pdf',
    deliveryMethod: 'email',
    status: 'active',
    nextRun: '2024-02-01T08:00:00Z',
    lastRun: '2024-01-01T08:00:00Z',
    lgpdCompliant: true,
    retentionDays: 90,
  },
  {
    id: 'sched-002',
    reportId: 'revenue-analysis',
    reportName: 'Análise de Receita',
    frequency: 'weekly',
    time: '09:00',
    dayOfWeek: 1, // Monday
    recipients: ['financeiro@neonpro.com.br'],
    format: 'excel',
    deliveryMethod: 'both',
    status: 'active',
    nextRun: '2024-01-29T09:00:00Z',
    lastRun: '2024-01-22T09:00:00Z',
    lgpdCompliant: true,
    retentionDays: 30,
  },
];

export default function SchedulingModal({ 
  isOpen, 
  onClose, 
  reportId, 
  reportName, 
  onScheduleCreated 
}: SchedulingModalProps) {
  const [frequency, setFrequency] = useState<ScheduleFrequency>('monthly');
  const [time, setTime] = useState('08:00');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [format, setFormat] = useState<'pdf' | 'excel' | 'both'>('pdf');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('email');
  const [lgpdCompliant, setLgpdCompliant] = useState(true);
  const [retentionDays, setRetentionDays] = useState(30);
  const [activeTab, setActiveTab] = useState('create');

  if (!isOpen) return null;

  const handleAddRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const handleRemoveRecipient = (index: number) => {
    const newRecipients = recipients.filter((_, i) => i !== index);
    setRecipients(newRecipients);
  };

  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const handleCreateSchedule = () => {
    const newSchedule: ScheduleConfig = {
      id: `sched-${Date.now()}`,
      reportId,
      reportName,
      frequency,
      time,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      recipients: recipients.filter(email => email.trim() !== ''),
      format,
      deliveryMethod,
      status: 'active',
      nextRun: calculateNextRun(),
      lgpdCompliant,
      retentionDays,
    };

    onScheduleCreated(newSchedule);
    onClose();
  };

  const calculateNextRun = (): string => {
    const now = new Date();
    const nextRun = new Date();
    
    // Set time
    const [hours, minutes] = time.split(':').map(Number);
    nextRun.setHours(hours, minutes, 0, 0);
    
    // Adjust date based on frequency
    switch (frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + (7 - nextRun.getDay() + dayOfWeek) % 7);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;
      case 'monthly':
        nextRun.setDate(dayOfMonth);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
      case 'quarterly':
        nextRun.setDate(1);
        nextRun.setMonth(Math.ceil((nextRun.getMonth() + 1) / 3) * 3 - 3);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 3);
        }
        break;
      case 'yearly':
        nextRun.setMonth(0, 1);
        if (nextRun <= now) {
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
        break;
    }
    
    return nextRun.toISOString();
  };

  const getStatusBadge = (status: ScheduleStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-400 border-green-400">Ativo</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-400">Pausado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  const formatNextRun = (nextRun: string) => {
    return new Date(nextRun).toLocaleString('pt-BR');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Agendamento de Relatórios</h2>
            <p className="text-sm text-slate-400">
              Automatize a geração e distribuição de: <strong>{reportName}</strong>
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="create">Criar Agendamento</TabsTrigger>
              <TabsTrigger value="existing">Agendamentos Existentes</TabsTrigger>
            </TabsList>

            {/* Create Schedule Tab */}
            <TabsContent value="create" className="space-y-6">
              {/* Frequency Selection */}
              <div className="space-y-4">
                <Label className="text-white font-medium">Frequência</Label>
                <Select value={frequency} onValueChange={(value: ScheduleFrequency) => setFrequency(value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time and Date Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-medium">Horário</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                {frequency === 'weekly' && (
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Dia da Semana</Label>
                    <Select value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(Number(value))}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="1">Segunda-feira</SelectItem>
                        <SelectItem value="2">Terça-feira</SelectItem>
                        <SelectItem value="3">Quarta-feira</SelectItem>
                        <SelectItem value="4">Quinta-feira</SelectItem>
                        <SelectItem value="5">Sexta-feira</SelectItem>
                        <SelectItem value="6">Sábado</SelectItem>
                        <SelectItem value="0">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {frequency === 'monthly' && (
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Dia do Mês</Label>
                    <Select value={dayOfMonth.toString()} onValueChange={(value) => setDayOfMonth(Number(value))}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={day.toString()}>
                            Dia {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Recipients */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-medium">Destinatários</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddRecipient}
                    className="border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {recipients.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={email}
                        onChange={(e) => handleRecipientChange(index, e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white flex-1"
                      />
                      {recipients.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveRecipient(index)}
                          className="border-slate-700 text-slate-300 hover:bg-slate-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Format and Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-medium">Formato</Label>
                  <Select value={format} onValueChange={(value: 'pdf' | 'excel' | 'both') => setFormat(value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="pdf">PDF apenas</SelectItem>
                      <SelectItem value="excel">Excel apenas</SelectItem>
                      <SelectItem value="both">PDF e Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium">Método de Entrega</Label>
                  <Select value={deliveryMethod} onValueChange={(value: DeliveryMethod) => setDeliveryMethod(value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="email">Email apenas</SelectItem>
                      <SelectItem value="download">Download apenas</SelectItem>
                      <SelectItem value="both">Email e Download</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* LGPD Compliance */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">Conformidade LGPD</p>
                      <p className="text-sm text-slate-400">
                        Aplicar políticas de retenção e anonimização
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={lgpdCompliant}
                    onCheckedChange={setLgpdCompliant}
                  />
                </div>

                {lgpdCompliant && (
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Retenção (dias)</Label>
                    <Select value={retentionDays.toString()} onValueChange={(value) => setRetentionDays(Number(value))}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="7">7 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                        <SelectItem value="180">180 dias</SelectItem>
                        <SelectItem value="365">1 ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* LGPD Notice */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Aviso LGPD:</strong> Este agendamento processará dados pessoais. 
                  Certifique-se de que existe base legal adequada e consentimento dos titulares 
                  para o compartilhamento automático dos relatórios.
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateSchedule}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Criar Agendamento
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-700 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
              </div>
            </TabsContent>

            {/* Existing Schedules Tab */}
            <TabsContent value="existing" className="space-y-4">
              {existingSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{schedule.reportName}</h4>
                      <p className="text-sm text-slate-400 capitalize">
                        {schedule.frequency} às {schedule.time}
                      </p>
                    </div>
                    {getStatusBadge(schedule.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Próxima execução</p>
                      <p className="text-white">{formatNextRun(schedule.nextRun)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Destinatários</p>
                      <p className="text-white">{schedule.recipients.length} pessoa(s)</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Formato</p>
                      <p className="text-white uppercase">{schedule.format}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">LGPD</p>
                      <p className="text-white">
                        {schedule.lgpdCompliant ? 
                          <CheckCircle className="h-4 w-4 text-green-400 inline" /> : 
                          <AlertTriangle className="h-4 w-4 text-yellow-400 inline" />
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-700">
                      <Settings className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-700">
                      {schedule.status === 'active' ? 'Pausar' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}