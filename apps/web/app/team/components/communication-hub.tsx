'use client';

import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Heart,
  MessageCircle,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Send,
  Shield,
  Star,
  Stethoscope,
  User,
  Users,
  Video,
  X,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

import type {
  TeamMessage,
  PatientHandoff,
  CommunicationPriority,
  HealthcareProfessional,
} from '@/types/team-coordination';// Mock team messages with Brazilian healthcare context
const mockTeamMessages: TeamMessage[] = [
  {
    id: 'msg-001',
    senderId: 'prof-001', // Dra. Maria Silva
    recipientIds: ['prof-002', 'prof-003'],
    channelId: null,
    subject: 'Paciente João Silva - Intercorrência Cardiológica',
    content: 'Paciente apresentou episódio de arritmia às 14:30. ECG realizado, solicitando avaliação de emergência. Medicação antiarrítmica administrada conforme protocolo.',
    priority: 'high',
    messageType: 'handoff',
    patientId: 'patient-001',
    treatmentId: 'treat-001',
    attachments: [],
    status: 'delivered',
    readBy: {
      'prof-002': new Date('2024-08-21T14:45:00'),
    },
    isEmergency: false,
    requiresAcknowledgment: true,
    acknowledgedBy: ['prof-002'],
    retentionDate: new Date('2029-08-21'),
    containsPersonalData: true,
    createdAt: new Date('2024-08-21T14:35:00'),
    updatedAt: new Date('2024-08-21T14:35:00'),
    editedAt: null,
    isDeleted: false,
  },
  {
    id: 'msg-002',
    senderId: 'prof-002', // Dr. Roberto Oliveira
    recipientIds: ['team-emergency'],
    channelId: 'emergency-channel',
    subject: '🚨 CÓDIGO AZUL - Trauma Bay 1',
    content: 'Ativação imediata equipe de trauma. Paciente politraumatizado chegando via SAMU. ETA: 5 minutos. Preparar sala cirúrgica e banco de sangue.',
    priority: 'emergency',
    messageType: 'alert',
    patientId: null,
    treatmentId: null,
    attachments: [],
    status: 'delivered',
    readBy: {},
    isEmergency: true,
    requiresAcknowledgment: true,
    acknowledgedBy: [],
    retentionDate: new Date('2029-08-21'),
    containsPersonalData: false,
    createdAt: new Date('2024-08-21T15:20:00'),
    updatedAt: new Date('2024-08-21T15:20:00'),
    editedAt: null,
    isDeleted: false,
  },
  {
    id: 'msg-003',
    senderId: 'prof-003', // Enf. Ana Paula
    recipientIds: ['prof-001'],
    channelId: null,
    subject: 'UTI - Relatório de Plantão',
    content: 'Passagem de plantão UTI:\n• Leito 05: Paciente estável, VM com PEEP 8, FiO2 40%\n• Leito 06: Pós-operatório, extubado às 13h, sem intercorrências\n• Leito 07: Paciente crítico, família orientada sobre prognóstico',
    priority: 'normal',
    messageType: 'handoff',
    patientId: null,
    treatmentId: null,
    attachments: [],
    status: 'read',
    readBy: {
      'prof-001': new Date('2024-08-21T16:10:00'),
    },
    isEmergency: false,
    requiresAcknowledgment: false,
    acknowledgedBy: [],
    retentionDate: new Date('2029-08-21'),
    containsPersonalData: true,
    createdAt: new Date('2024-08-21T16:00:00'),
    updatedAt: new Date('2024-08-21T16:00:00'),
    editedAt: null,
    isDeleted: false,
  },
  {
    id: 'msg-004',
    senderId: 'admin-001',
    recipientIds: ['all-staff'],
    channelId: 'general-announcements',
    subject: 'Lembrete: Treinamento LGPD Obrigatório',
    content: 'Lembrete para todos os profissionais: Treinamento sobre novas diretrizes LGPD na área da saúde é obrigatório. Prazo final: 30/08/2024. Acesse o portal de treinamento.',
    priority: 'low',
    messageType: 'text',
    patientId: null,
    treatmentId: null,
    attachments: [],
    status: 'sent',
    readBy: {},
    isEmergency: false,
    requiresAcknowledgment: true,
    acknowledgedBy: [],
    retentionDate: new Date('2025-08-21'),
    containsPersonalData: false,
    createdAt: new Date('2024-08-21T09:00:00'),
    updatedAt: new Date('2024-08-21T09:00:00'),
    editedAt: null,
    isDeleted: false,
  },
];// Mock patient handoff data
const mockPatientHandoffs: PatientHandoff[] = [
  {
    id: 'handoff-001',
    patientId: 'patient-001',
    fromProfessionalId: 'prof-001', // Dra. Maria Silva
    toProfessionalId: 'prof-002', // Dr. Roberto Oliveira
    handoffType: 'transfer',
    currentCondition: 'Paciente estável após episódio de arritmia. Ritmo sinusal restabelecido.',
    vitalSigns: {
      pa: '130/80 mmHg',
      fc: '78 bpm',
      fr: '16 irpm',
      temp: '36.5°C',
      spo2: '98%',
    },
    activeMedications: [
      'Amiodarona 200mg 12/12h',
      'AAS 100mg 1x/dia',
      'Atorvastatina 40mg à noite',
      'Enalapril 10mg 12/12h',
    ],
    allergies: ['Penicilina', 'Contrastes iodados'],
    recentProcedures: [
      'ECG - 21/08/2024 14:30',
      'Ecocardiograma - 20/08/2024',
      'Cateterismo cardíaco - 18/08/2024',
    ],
    careInstructions: 'Manter monitorização cardíaca contínua. Atentar para sinais de nova arritmia. Dieta hipossódica rigorosa. Repouso relativo no leito.',
    specialRequirements: [
      'Acesso venoso calibroso mantido',
      'Desfibrilador próximo ao leito',
      'Comunicar qualquer alteração do ritmo',
    ],
    riskFactors: [
      'Histórico de IAM prévio',
      'Diabetes mellitus',
      'Dislipidemia',
      'Tabagismo (cessou há 2 anos)',
    ],
    followUpRequired: [
      'Reavaliação cardiológica em 24h',
      'Controle de eletrólitos em 6h',
      'ECG de controle em 4h',
    ],
    status: 'acknowledged',
    acknowledgedAt: new Date('2024-08-21T14:50:00'),
    completedAt: null,
    notes: 'Família orientada sobre quadro. Paciente colaborativo.',
    createdAt: new Date('2024-08-21T14:35:00'),
    updatedAt: new Date('2024-08-21T14:50:00'),
    priority: 'high',
  },
  {
    id: 'handoff-002',
    patientId: 'patient-uti-001',
    fromProfessionalId: 'prof-003', // Enf. Ana Paula
    toProfessionalId: 'prof-004', // Próximo enfermeiro
    handoffType: 'shift_change',
    currentCondition: 'Paciente crítico em VM, sedado e em uso de drogas vasoativas.',
    vitalSigns: {
      pa: '90/60 mmHg (com noradrenalina)',
      fc: '110 bpm',
      fr: '20 irpm (VM)',
      temp: '37.8°C',
      spo2: '94%',
    },
    activeMedications: [
      'Noradrenalina 0.3 mcg/kg/min',
      'Midazolam 5mg/h',
      'Fentanil 100mcg/h',
      'Omeprazol 40mg EV 12/12h',
    ],
    allergies: ['Não conhecidas'],
    recentProcedures: [
      'Intubação orotraqueal - 20/08/2024',
      'Cateter venoso central - 20/08/2024',
      'Sonda vesical de demora - 20/08/2024',
    ],
    careInstructions: 'Manter sedação conforme escala RASS -2 a -3. Controlar PAM > 65mmHg. Aspiração TQT conforme necessário.',
    specialRequirements: [
      'Controle rigoroso de débito urinário',
      'Mudança de decúbito a cada 2h',
      'Higiene oral com clorexidina 12/12h',
    ],
    riskFactors: [
      'Choque séptico',
      'Insuficiência respiratória aguda',
      'Lesão renal aguda',
    ],
    followUpRequired: [
      'Gasometria arterial em 4h',
      'Raio-X tórax pela manhã',
      'Culturas pendentes - aguardar resultado',
    ],
    status: 'pending',
    acknowledgedAt: null,
    completedAt: null,
    notes: 'Família presente, muito ansiosa. Necessita suporte emocional.',
    createdAt: new Date('2024-08-21T16:00:00'),
    updatedAt: new Date('2024-08-21T16:00:00'),
    priority: 'high',
  },
];// Mock staff data for communication
const mockStaffForComms = [
  { id: 'prof-001', name: 'Dra. Maria Silva', role: 'Cardiologista', avatar: 'MS' },
  { id: 'prof-002', name: 'Dr. Roberto Oliveira', role: 'Emergencista', avatar: 'RO' },
  { id: 'prof-003', name: 'Enf. Ana Paula', role: 'Enfermeira UTI', avatar: 'AP' },
  { id: 'prof-004', name: 'Enf. Carlos Lima', role: 'Enfermeiro', avatar: 'CL' },
  { id: 'admin-001', name: 'Administração', role: 'Sistema', avatar: 'AD' },
];

// Helper functions for message status and priority
const getPriorityInfo = (priority: CommunicationPriority) => {
  switch (priority) {
    case 'emergency':
      return { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle, label: 'EMERGÊNCIA' };
    case 'urgent':
      return { color: 'text-orange-600', bg: 'bg-orange-100', icon: Bell, label: 'Urgente' };
    case 'high':
      return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Star, label: 'Alta' };
    case 'normal':
      return { color: 'text-blue-600', bg: 'bg-blue-100', icon: MessageCircle, label: 'Normal' };
    case 'low':
      return { color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock, label: 'Baixa' };
    default:
      return { color: 'text-gray-600', bg: 'bg-gray-100', icon: MessageCircle, label: 'Normal' };
  }
};

const getMessageTypeIcon = (type: string) => {
  switch (type) {
    case 'handoff':
      return ArrowRight;
    case 'alert':
      return AlertTriangle;
    case 'voice':
      return Phone;
    case 'file':
      return FileText;
    default:
      return MessageCircle;
  }
};

const getHandoffStatusInfo = (status: string) => {
  switch (status) {
    case 'pending':
      return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock, label: 'Pendente' };
    case 'acknowledged':
      return { color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle2, label: 'Confirmado' };
    case 'completed':
      return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2, label: 'Concluído' };
    default:
      return { color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock, label: 'Indefinido' };
  }
};

interface CommunicationHubProps {
  emergencyMode?: boolean;
}

export function CommunicationHub({ emergencyMode = false }: CommunicationHubProps) {
  const [activeTab, setActiveTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<CommunicationPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<TeamMessage | null>(null);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    priority: 'normal' as CommunicationPriority,
    recipients: [] as string[],
    isEmergency: false,
    requiresAcknowledgment: false,
  });  // Filter messages
  const filteredMessages = useMemo(() => {
    return mockTeamMessages.filter((message) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const staff = mockStaffForComms.find(s => s.id === message.senderId);
        const matchesSearch = 
          message.subject.toLowerCase().includes(searchLower) ||
          message.content.toLowerCase().includes(searchLower) ||
          staff?.name.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && message.priority !== priorityFilter) return false;

      // Type filter
      if (typeFilter !== 'all' && message.messageType !== typeFilter) return false;

      // Unread filter
      if (showUnreadOnly && message.status === 'read') return false;

      return true;
    });
  }, [searchQuery, priorityFilter, typeFilter, showUnreadOnly]);

  // Get staff member info
  const getStaffInfo = (id: string) => {
    return mockStaffForComms.find(staff => staff.id === id) || 
           { id, name: 'Profissional', role: 'Indefinido', avatar: 'PR' };
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Central de Comunicação</h2>
          <p className="text-muted-foreground">
            Hub de comunicação em tempo real e gestão de handoffs
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Notificações
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nova Mensagem
          </Button>
          {emergencyMode && (
            <Button variant="destructive" size="sm">
              <Shield className="mr-2 h-4 w-4" />
              Alerta Emergência
            </Button>
          )}
        </div>
      </div>

      {/* Emergency Banner */}
      {emergencyMode && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <p className="text-red-800 font-medium">
                Modo de Emergência Ativo - Comunicações Prioritárias
              </p>
              <p className="text-red-700 text-sm">
                Mensagens de emergência têm prioridade automática e notificação imediata
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Communication Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages" className="text-sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            Mensagens ({filteredMessages.length})
          </TabsTrigger>
          <TabsTrigger value="handoffs" className="text-sm">
            <ArrowRight className="mr-2 h-4 w-4" />
            Handoffs ({mockPatientHandoffs.length})
          </TabsTrigger>
          <TabsTrigger value="emergency" className="text-sm">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Protocolos
          </TabsTrigger>
        </TabsList>        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros de Comunicação</CardTitle>
              <CardDescription>
                Busque mensagens por remetente, assunto ou conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* Search Input */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar mensagens..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      aria-label="Buscar mensagens"
                    />
                  </div>
                </div>

                {/* Priority Filter */}
                <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as CommunicationPriority | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Prioridades</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="handoff">Handoff</SelectItem>
                    <SelectItem value="alert">Alerta</SelectItem>
                    <SelectItem value="voice">Voz</SelectItem>
                    <SelectItem value="file">Arquivo</SelectItem>
                  </SelectContent>
                </Select>

                {/* Quick Filters */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant={showUnreadOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    className="text-xs"
                  >
                    <Filter className="mr-1 h-3 w-3" />
                    Não Lidas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>          {/* Messages List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mensagens da Equipe</CardTitle>
              <CardDescription>
                Comunicação em tempo real com compliance LGPD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredMessages.map((message) => {
                  const senderInfo = getStaffInfo(message.senderId);
                  const priorityInfo = getPriorityInfo(message.priority);
                  const PriorityIcon = priorityInfo.icon;
                  const TypeIcon = getMessageTypeIcon(message.messageType);
                  const isUnread = message.status !== 'read';
                  
                  return (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                        isUnread ? 'bg-blue-50 border-blue-200' : 'bg-background border-border'
                      } ${
                        message.isEmergency ? 'ring-2 ring-red-300 border-red-400' : ''
                      }`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Sender Avatar */}
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" alt={senderInfo.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                            {senderInfo.avatar}
                          </AvatarFallback>
                        </Avatar>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-foreground truncate">
                                {senderInfo.name}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {senderInfo.role}
                              </Badge>
                              {message.isEmergency && (
                                <Badge variant="destructive" className="text-xs animate-pulse">
                                  EMERGÊNCIA
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <TypeIcon className="h-3 w-3" />
                              <span>{message.createdAt.toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`p-1 rounded ${priorityInfo.bg}`}>
                              <PriorityIcon className={`h-3 w-3 ${priorityInfo.color}`} />
                            </div>
                            <h3 className={`text-sm font-medium truncate ${
                              isUnread ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {message.subject}
                            </h3>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.content}
                          </p>

                          {/* Message Metadata */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                              {message.patientId && (
                                <div className="flex items-center space-x-1">
                                  <Stethoscope className="h-3 w-3" />
                                  <span>Paciente ID: {message.patientId}</span>
                                </div>
                              )}
                              {message.containsPersonalData && (
                                <div className="flex items-center space-x-1">
                                  <Shield className="h-3 w-3 text-yellow-600" />
                                  <span>Dados Pessoais - LGPD</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              {message.requiresAcknowledgment && (
                                <Badge 
                                  variant={message.acknowledgedBy.length > 0 ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {message.acknowledgedBy.length > 0 ? '✓ Confirmado' : 'Aguarda Confirmação'}
                                </Badge>
                              )}
                              {isUnread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Responder
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Encaminhar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Star className="mr-2 h-4 w-4" />
                              Marcar como Importante
                            </DropdownMenuItem>
                            {message.requiresAcknowledgment && !message.acknowledgedBy.includes('current-user') && (
                              <DropdownMenuItem>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirmar Leitura
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State */}
                {filteredMessages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      Nenhuma mensagem encontrada
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Tente ajustar os filtros ou inicie uma nova conversa
                    </p>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Mensagem
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>        {/* Handoffs Tab */}
        <TabsContent value="handoffs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Handoffs de Pacientes</CardTitle>
              <CardDescription>
                Transferências de responsabilidade entre profissionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPatientHandoffs.map((handoff) => {
                  const fromStaff = getStaffInfo(handoff.fromProfessionalId);
                  const toStaff = getStaffInfo(handoff.toProfessionalId);
                  const statusInfo = getHandoffStatusInfo(handoff.status);
                  const StatusIcon = statusInfo.icon;
                  const priorityInfo = getPriorityInfo(handoff.priority);
                  
                  return (
                    <Card key={handoff.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="" alt={fromStaff.name} />
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                  {fromStaff.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="" alt={toStaff.name} />
                                <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                                  {toStaff.avatar}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {fromStaff.name} → {toStaff.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {fromStaff.role} → {toStaff.role}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge className={`${priorityInfo.bg} ${priorityInfo.color} border-0`}>
                              {priorityInfo.label}
                            </Badge>
                            <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0`}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Patient Info */}
                        <div className="bg-blue-50 rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              Paciente ID: {handoff.patientId}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {handoff.handoffType === 'transfer' ? 'Transferência' : 
                               handoff.handoffType === 'shift_change' ? 'Troca de Plantão' : 
                               handoff.handoffType === 'discharge' ? 'Alta' : 'Consulta'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {handoff.currentCondition}
                          </p>
                        </div>

                        {/* Vital Signs */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {Object.entries(handoff.vitalSigns).map(([key, value]) => (
                            <div key={key} className="text-center p-2 bg-gray-50 rounded">
                              <div className="text-xs text-muted-foreground uppercase font-medium">
                                {key === 'pa' ? 'PA' : 
                                 key === 'fc' ? 'FC' : 
                                 key === 'fr' ? 'FR' : 
                                 key === 'temp' ? 'T°' : 'SpO₂'}
                              </div>
                              <div className="text-sm font-medium mt-1">{value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Medications */}
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center">
                            <Heart className="mr-2 h-4 w-4 text-red-500" />
                            Medicações Ativas
                          </h5>
                          <div className="space-y-1">
                            {handoff.activeMedications.map((med, idx) => (
                              <div key={idx} className="text-sm bg-yellow-50 px-2 py-1 rounded">
                                {med}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Allergies */}
                        {handoff.allergies.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2 flex items-center text-red-600">
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Alergias
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {handoff.allergies.map((allergy, idx) => (
                                <Badge key={idx} variant="destructive" className="text-xs">
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Care Instructions */}
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-blue-500" />
                            Instruções de Cuidado
                          </h5>
                          <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                            {handoff.careInstructions}
                          </p>
                        </div>

                        {/* Follow-up Required */}
                        {handoff.followUpRequired.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2 flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-orange-500" />
                              Acompanhamento Necessário
                            </h5>
                            <div className="space-y-1">
                              {handoff.followUpRequired.map((item, idx) => (
                                <div key={idx} className="text-sm flex items-center">
                                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-2" />
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {handoff.notes && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Observações</h5>
                            <p className="text-sm text-muted-foreground italic">
                              "{handoff.notes}"
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-xs text-muted-foreground">
                            Criado em: {handoff.createdAt.toLocaleString('pt-BR')}
                            {handoff.acknowledgedAt && (
                              <span className="ml-3">
                                Confirmado em: {handoff.acknowledgedAt.toLocaleString('pt-BR')}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {handoff.status === 'pending' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirmar Handoff
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <FileText className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Empty State */}
                {mockPatientHandoffs.length === 0 && (
                  <div className="text-center py-12">
                    <ArrowRight className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      Nenhum handoff pendente
                    </p>
                    <p className="text-muted-foreground">
                      Todos os handoffs foram processados com sucesso
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Protocols Tab */}
        <TabsContent value="emergency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-600">
                Protocolos de Emergência
              </CardTitle>
              <CardDescription>
                Comunicação e coordenação para situações críticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Emergency Alerts */}
                <Card className="border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center text-red-600">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Alertas de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      size="lg"
                    >
                      <Heart className="mr-2 h-5 w-5" />
                      Código Azul - Parada Cardiorrespiratória
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start bg-orange-600 hover:bg-orange-700"
                      size="lg"
                    >
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Código Amarelo - Emergência Interna
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                      size="lg"
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Código Rosa - Emergência Pediátrica
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start bg-gray-600 hover:bg-gray-700"
                      size="lg"
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Código Prata - Arma/Violência
                    </Button>
                  </CardContent>
                </Card>

                {/* Emergency Contacts */}
                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center text-blue-600">
                      <Phone className="mr-2 h-5 w-5" />
                      Contatos de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <div>
                          <p className="font-medium text-sm">SAMU</p>
                          <p className="text-xs text-muted-foreground">Emergência Médica</p>
                        </div>
                        <Button size="sm" variant="destructive">
                          <Phone className="mr-1 h-3 w-3" />
                          192
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div>
                          <p className="font-medium text-sm">Polícia Militar</p>
                          <p className="text-xs text-muted-foreground">Emergência Segurança</p>
                        </div>
                        <Button size="sm" variant="destructive">
                          <Phone className="mr-1 h-3 w-3" />
                          190
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                        <div>
                          <p className="font-medium text-sm">Bombeiros</p>
                          <p className="text-xs text-muted-foreground">Emergência Incêndio</p>
                        </div>
                        <Button size="sm" variant="destructive">
                          <Phone className="mr-1 h-3 w-3" />
                          193
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div>
                          <p className="font-medium text-sm">Central de Transplantes</p>
                          <p className="text-xs text-muted-foreground">Emergência Órgãos</p>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Phone className="mr-1 h-3 w-3" />
                          (11) 5574-5300
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Procedures */}
                <Card className="border-yellow-200 md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center text-yellow-600">
                      <FileText className="mr-2 h-5 w-5" />
                      Procedimentos de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">RCP (Ressuscitação Cardiopulmonar)</h4>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>1. Verificar responsividade e respiração</p>
                          <p>2. Posicionar vítima em superfície rígida</p>
                          <p>3. Compressões: 30 x 2 ventilações</p>
                          <p>4. Profundidade: 5-6cm, frequência: 100-120/min</p>
                          <p>5. Desfibrilação se disponível</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Manobra de Heimlich</h4>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>1. Posicionar-se atrás da vítima</p>
                          <p>2. Abraçar pelo abdome</p>
                          <p>3. Posicionar punho fechado acima do umbigo</p>
                          <p>4. Compressões rápidas para cima</p>
                          <p>5. Repetir até desobstruir via aérea</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Controle de Hemorragia</h4>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>1. Pressão direta no local do sangramento</p>
                          <p>2. Elevação do membro se possível</p>
                          <p>3. Compressa e bandagem compressiva</p>
                          <p>4. Pontos de pressão se necessário</p>
                          <p>5. Torniquete apenas em casos extremos</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Anafilaxia</h4>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>1. Adrenalina IM 0,5mg (coxa)</p>
                          <p>2. Posição supina, elevar MMII</p>
                          <p>3. O₂ suplementar alto fluxo</p>
                          <p>4. Acesso venoso + expansão</p>
                          <p>5. Corticoide + anti-histamínico</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Team Status */}
                <Card className="border-green-200 md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center text-green-600">
                      <Users className="mr-2 h-5 w-5" />
                      Status da Equipe de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">Médico de Plantão</p>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <p className="text-xs text-muted-foreground">Dr. Roberto Oliveira</p>
                        <p className="text-xs text-green-600">Disponível - UTI</p>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">Enfermeiro Responsável</p>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <p className="text-xs text-muted-foreground">Enf. Ana Paula</p>
                        <p className="text-xs text-green-600">Disponível - CC</p>
                      </div>
                      
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">Anestesista</p>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        </div>
                        <p className="text-xs text-muted-foreground">Dr. Carlos Mendes</p>
                        <p className="text-xs text-yellow-600">Em Cirurgia - CC2</p>
                      </div>
                      
                      <div className="p-3 bg-red-50 rounded border border-red-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">Cirurgião</p>
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                        <p className="text-xs text-muted-foreground">Dra. Luciana Santos</p>
                        <p className="text-xs text-red-600">Indisponível - Cirurgia</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Message Dialog */}
      <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Mensagem</DialogTitle>
            <DialogDescription>
              Enviar mensagem para equipe com compliance LGPD
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Recipients */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Destinatários
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar profissionais..." />
                </SelectTrigger>
                <SelectContent>
                  {mockStaffForComms.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} - {staff.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Prioridade
              </label>
              <Select 
                value={newMessage.priority} 
                onValueChange={(value) => setNewMessage(prev => ({ 
                  ...prev, 
                  priority: value as CommunicationPriority 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="emergency">Emergência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Assunto
              </label>
              <Input
                placeholder="Assunto da mensagem..."
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ 
                  ...prev, 
                  subject: e.target.value 
                }))}
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Mensagem
              </label>
              <Textarea
                placeholder="Digite sua mensagem..."
                rows={6}
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ 
                  ...prev, 
                  content: e.target.value 
                }))}
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={newMessage.isEmergency}
                  onChange={(e) => setNewMessage(prev => ({ 
                    ...prev, 
                    isEmergency: e.target.checked 
                  }))}
                  className="rounded"
                />
                <label htmlFor="emergency" className="text-sm">
                  Marcar como emergência
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="acknowledgment"
                  checked={newMessage.requiresAcknowledgment}
                  onChange={(e) => setNewMessage(prev => ({ 
                    ...prev, 
                    requiresAcknowledgment: e.target.checked 
                  }))}
                  className="rounded"
                />
                <label htmlFor="acknowledgment" className="text-sm">
                  Requer confirmação de leitura
                </label>
              </div>
            </div>

            {/* LGPD Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Aviso LGPD</p>
                  <p className="text-yellow-700">
                    Esta mensagem pode conter dados pessoais sensíveis. 
                    Certifique-se de que todos os destinatários têm autorização 
                    para acessar essas informações.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsComposeDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Send className="mr-2 h-4 w-4" />
              Enviar Mensagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}