"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { useMemo, useState } from "react";

import type { CommunicationPriority, PatientHandoff, TeamMessage } from "@/types/team-coordination"; // Mock team messages with Brazilian healthcare context

const mockTeamMessages: TeamMessage[] = [
  {
    id: "msg-001",
    senderId: "prof-001", // Dra. Maria Silva
    recipientIds: ["prof-002", "prof-003"],
    channelId: undefined,
    subject: "Paciente João Silva - Intercorrência Cardiológica",
    content:
      "Paciente apresentou episódio de arritmia às 14:30. ECG realizado, solicitando avaliação de emergência. Medicação antiarrítmica administrada conforme protocolo.",
    priority: "high",
    messageType: "handoff",
    patientId: "patient-001",
    treatmentId: "treat-001",
    attachments: [],
    status: "delivered",
    readBy: {
      "prof-002": new Date("2024-08-21T14:45:00"),
    },
    isEmergency: false,
    requiresAcknowledgment: true,
    acknowledgedBy: ["prof-002"],
    retentionDate: new Date("2029-08-21"),
    containsPersonalData: true,
    createdAt: new Date("2024-08-21T14:35:00"),
    updatedAt: new Date("2024-08-21T14:35:00"),
    editedAt: undefined,
    isDeleted: false,
  },
  {
    id: "msg-002",
    senderId: "prof-002", // Dr. Roberto Oliveira
    recipientIds: ["team-emergency"],
    channelId: "emergency-channel",
    subject: "🚨 CÓDIGO AZUL - Trauma Bay 1",
    content:
      "Ativação imediata equipe de trauma. Paciente politraumatizado chegando via SAMU. ETA: 5 minutos. Preparar sala cirúrgica e banco de sangue.",
    priority: "emergency",
    messageType: "alert",
    patientId: undefined,
    treatmentId: undefined,
    attachments: [],
    status: "delivered",
    readBy: {},
    isEmergency: true,
    requiresAcknowledgment: true,
    acknowledgedBy: [],
    retentionDate: new Date("2029-08-21"),
    containsPersonalData: false,
    createdAt: new Date("2024-08-21T15:20:00"),
    updatedAt: new Date("2024-08-21T15:20:00"),
    editedAt: undefined,
    isDeleted: false,
  },
  {
    id: "msg-003",
    senderId: "prof-003", // Enf. Ana Paula
    recipientIds: ["prof-001"],
    channelId: undefined,
    subject: "UTI - Relatório de Plantão",
    content:
      "Passagem de plantão UTI:\n• Leito 05: Paciente estável, VM com PEEP 8, FiO2 40%\n• Leito 06: Pós-operatório, extubado às 13h, sem intercorrências\n• Leito 07: Paciente crítico, família orientada sobre prognóstico",
    priority: "normal",
    messageType: "handoff",
    patientId: undefined,
    treatmentId: undefined,
    attachments: [],
    status: "read",
    readBy: {
      "prof-001": new Date("2024-08-21T16:10:00"),
    },
    isEmergency: false,
    requiresAcknowledgment: false,
    acknowledgedBy: [],
    retentionDate: new Date("2029-08-21"),
    containsPersonalData: true,
    createdAt: new Date("2024-08-21T16:00:00"),
    updatedAt: new Date("2024-08-21T16:00:00"),
    editedAt: undefined,
    isDeleted: false,
  },
  {
    id: "msg-004",
    senderId: "admin-001",
    recipientIds: ["all-staff"],
    channelId: "general-announcements",
    subject: "Lembrete: Treinamento LGPD Obrigatório",
    content:
      "Lembrete para todos os profissionais: Treinamento sobre novas diretrizes LGPD na área da saúde é obrigatório. Prazo final: 30/08/2024. Acesse o portal de treinamento.",
    priority: "low",
    messageType: "text",
    patientId: undefined,
    treatmentId: undefined,
    attachments: [],
    status: "sent",
    readBy: {},
    isEmergency: false,
    requiresAcknowledgment: true,
    acknowledgedBy: [],
    retentionDate: new Date("2025-08-21"),
    containsPersonalData: false,
    createdAt: new Date("2024-08-21T09:00:00"),
    updatedAt: new Date("2024-08-21T09:00:00"),
    editedAt: undefined,
    isDeleted: false,
  },
]; // Mock patient handoff data
const mockPatientHandoffs: PatientHandoff[] = [
  {
    id: "handoff-001",
    patientId: "patient-001",
    fromProfessionalId: "prof-001", // Dra. Maria Silva
    toProfessionalId: "prof-002", // Dr. Roberto Oliveira
    handoffType: "transfer",
    currentCondition: "Paciente estável após episódio de arritmia. Ritmo sinusal restabelecido.",
    vitalSigns: {
      pa: "130/80 mmHg",
      fc: "78 bpm",
      fr: "16 irpm",
      temp: "36.5°C",
      spo2: "98%",
    },
    activeMedications: [
      "Amiodarona 200mg 12/12h",
      "AAS 100mg 1x/dia",
      "Atorvastatina 40mg à noite",
      "Enalapril 10mg 12/12h",
    ],
    allergies: ["Penicilina", "Contrastes iodados"],
    recentProcedures: [
      "ECG - 21/08/2024 14:30",
      "Ecocardiograma - 20/08/2024",
      "Cateterismo cardíaco - 18/08/2024",
    ],
    careInstructions:
      "Manter monitorização cardíaca contínua. Atentar para sinais de nova arritmia. Dieta hipossódica rigorosa. Repouso relativo no leito.",
    specialRequirements: [
      "Acesso venoso calibroso mantido",
      "Desfibrilador próximo ao leito",
      "Comunicar qualquer alteração do ritmo",
    ],
    riskFactors: [
      "Histórico de IAM prévio",
      "Diabetes mellitus",
      "Dislipidemia",
      "Tabagismo (cessou há 2 anos)",
    ],
    followUpRequired: [
      "Reavaliação cardiológica em 24h",
      "Controle de eletrólitos em 6h",
      "ECG de controle em 4h",
    ],
    status: "acknowledged",
    acknowledgedAt: new Date("2024-08-21T14:50:00"),
    completedAt: undefined,
    notes: "Família orientada sobre quadro. Paciente colaborativo.",
    createdAt: new Date("2024-08-21T14:35:00"),
    updatedAt: new Date("2024-08-21T14:50:00"),
    priority: "high",
  },
  {
    id: "handoff-002",
    patientId: "patient-uti-001",
    fromProfessionalId: "prof-003", // Enf. Ana Paula
    toProfessionalId: "prof-004", // Próximo enfermeiro
    handoffType: "shift_change",
    currentCondition: "Paciente crítico em VM, sedado e em uso de drogas vasoativas.",
    vitalSigns: {
      pa: "90/60 mmHg (com noradrenalina)",
      fc: "110 bpm",
      fr: "20 irpm (VM)",
      temp: "37.8°C",
      spo2: "94%",
    },
    activeMedications: [
      "Noradrenalina 0.3 mcg/kg/min",
      "Midazolam 5mg/h",
      "Fentanil 100mcg/h",
      "Omeprazol 40mg EV 12/12h",
    ],
    allergies: ["Não conhecidas"],
    recentProcedures: [
      "Intubação orotraqueal - 20/08/2024",
      "Cateter venoso central - 20/08/2024",
      "Sonda vesical de demora - 20/08/2024",
    ],
    careInstructions:
      "Manter sedação conforme escala RASS -2 a -3. Controlar PAM > 65mmHg. Aspiração TQT conforme necessário.",
    specialRequirements: [
      "Controle rigoroso de débito urinário",
      "Mudança de decúbito a cada 2h",
      "Higiene oral com clorexidina 12/12h",
    ],
    riskFactors: [
      "Choque séptico",
      "Insuficiência respiratória aguda",
      "Lesão renal aguda",
    ],
    followUpRequired: [
      "Gasometria arterial em 4h",
      "Raio-X tórax pela manhã",
      "Culturas pendentes - aguardar resultado",
    ],
    status: "pending",
    acknowledgedAt: undefined,
    completedAt: undefined,
    notes: "Família presente, muito ansiosa. Necessita suporte emocional.",
    createdAt: new Date("2024-08-21T16:00:00"),
    updatedAt: new Date("2024-08-21T16:00:00"),
    priority: "high",
  },
]; // Mock staff data for communication
const mockStaffForComms = [
  {
    id: "prof-001",
    name: "Dra. Maria Silva",
    role: "Cardiologista",
    avatar: "MS",
  },
  {
    id: "prof-002",
    name: "Dr. Roberto Oliveira",
    role: "Emergencista",
    avatar: "RO",
  },
  {
    id: "prof-003",
    name: "Enf. Ana Paula",
    role: "Enfermeira UTI",
    avatar: "AP",
  },
  {
    id: "prof-004",
    name: "Enf. Carlos Lima",
    role: "Enfermeiro",
    avatar: "CL",
  },
  { id: "admin-001", name: "Administração", role: "Sistema", avatar: "AD" },
];

// Helper functions for message status and priority
const getPriorityInfo = (priority: CommunicationPriority) => {
  switch (priority) {
    case "emergency": {
      return {
        color: "text-red-600",
        bg: "bg-red-100",
        icon: AlertTriangle,
        label: "EMERGÊNCIA",
      };
    }
    case "urgent": {
      return {
        color: "text-orange-600",
        bg: "bg-orange-100",
        icon: Bell,
        label: "Urgente",
      };
    }
    case "high": {
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        icon: Star,
        label: "Alta",
      };
    }
    case "normal": {
      return {
        color: "text-blue-600",
        bg: "bg-blue-100",
        icon: MessageCircle,
        label: "Normal",
      };
    }
    case "low": {
      return {
        color: "text-gray-600",
        bg: "bg-gray-100",
        icon: Clock,
        label: "Baixa",
      };
    }
    default: {
      return {
        color: "text-gray-600",
        bg: "bg-gray-100",
        icon: MessageCircle,
        label: "Normal",
      };
    }
  }
};

const getMessageTypeIcon = (type: string) => {
  switch (type) {
    case "handoff": {
      return ArrowRight;
    }
    case "alert": {
      return AlertTriangle;
    }
    case "voice": {
      return Phone;
    }
    case "file": {
      return FileText;
    }
    default: {
      return MessageCircle;
    }
  }
};

const getHandoffStatusInfo = (status: string) => {
  switch (status) {
    case "pending": {
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        icon: Clock,
        label: "Pendente",
      };
    }
    case "acknowledged": {
      return {
        color: "text-blue-600",
        bg: "bg-blue-100",
        icon: CheckCircle2,
        label: "Confirmado",
      };
    }
    case "completed": {
      return {
        color: "text-green-600",
        bg: "bg-green-100",
        icon: CheckCircle2,
        label: "Concluído",
      };
    }
    default: {
      return {
        color: "text-gray-600",
        bg: "bg-gray-100",
        icon: Clock,
        label: "Indefinido",
      };
    }
  }
};

interface CommunicationHubProps {
  emergencyMode?: boolean;
}

export function CommunicationHub({
  emergencyMode = false,
}: CommunicationHubProps) {
  const [activeTab, setActiveTab] = useState("messages");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<
    CommunicationPriority | "all"
  >("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  // const [_selectedMessage, setSelectedMessage] = useState<TeamMessage | null>(); // Commented out - not used
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: "",
    content: "",
    priority: "normal" as CommunicationPriority,
    recipients: [] as string[],
    isEmergency: false,
    requiresAcknowledgment: false,
  }); // Filter messages
  const filteredMessages = useMemo(() => {
    return mockTeamMessages.filter((message) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const staff = mockStaffForComms.find((s) => s.id === message.senderId);
        const matchesSearch = message.subject.toLowerCase().includes(searchLower)
          || message.content.toLowerCase().includes(searchLower)
          || staff?.name.toLowerCase().includes(searchLower);

        if (!matchesSearch) {
          return false;
        }
      }

      // Priority filter
      if (priorityFilter !== "all" && message.priority !== priorityFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && message.messageType !== typeFilter) {
        return false;
      }

      // Unread filter
      if (showUnreadOnly && message.status === "read") {
        return false;
      }

      return true;
    });
  }, [searchQuery, priorityFilter, typeFilter, showUnreadOnly]);

  // Get staff member info
  const getStaffInfo = (id: string) => {
    return (
      mockStaffForComms.find((staff) => staff.id === id) || {
        id,
        name: "Profissional",
        role: "Indefinido",
        avatar: "PR",
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h2 className="font-bold text-2xl">Central de Comunicação</h2>
          <p className="text-muted-foreground">
            Hub de comunicação em tempo real e gestão de handoffs
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Notificações
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova Mensagem
          </Button>
          {emergencyMode && (
            <Button size="sm" variant="destructive">
              <Shield className="mr-2 h-4 w-4" />
              Alerta Emergência
            </Button>
          )}
        </div>
      </div>

      {/* Emergency Banner */}
      {emergencyMode && (
        <div className="rounded-r-md border-red-500 border-l-4 bg-red-100 p-4">
          <div className="flex items-center">
            <AlertTriangle className="mr-3 h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-800">
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
      <Tabs
        className="space-y-6"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger className="text-sm" value="messages">
            <MessageCircle className="mr-2 h-4 w-4" />
            Mensagens ({filteredMessages.length})
          </TabsTrigger>
          <TabsTrigger className="text-sm" value="handoffs">
            <ArrowRight className="mr-2 h-4 w-4" />
            Handoffs ({mockPatientHandoffs.length})
          </TabsTrigger>
          <TabsTrigger className="text-sm" value="emergency">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Protocolos
          </TabsTrigger>
        </TabsList>{" "}
        {/* Messages Tab */}
        <TabsContent className="space-y-6" value="messages">
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
                    <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
                    <Input
                      aria-label="Buscar mensagens"
                      className="pl-10"
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar mensagens..."
                      value={searchQuery}
                    />
                  </div>
                </div>

                {/* Priority Filter */}
                <Select
                  onValueChange={(value) =>
                    setPriorityFilter(value as CommunicationPriority | "all")}
                  value={priorityFilter}
                >
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
                <Select onValueChange={setTypeFilter} value={typeFilter}>
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
                    className="text-xs"
                    onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    size="sm"
                    variant={showUnreadOnly ? "default" : "outline"}
                  >
                    <Filter className="mr-1 h-3 w-3" />
                    Não Lidas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>{" "}
          {/* Messages List */}
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
                  const { icon: PriorityIcon } = priorityInfo;
                  const TypeIcon = getMessageTypeIcon(message.messageType);
                  const isUnread = message.status !== "read";

                  return (
                    <div
                      className={`cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:shadow-md ${
                        isUnread
                          ? "border-blue-200 bg-blue-50"
                          : "border-border bg-background"
                      } ${message.isEmergency ? "border-red-400 ring-2 ring-red-300" : ""}`}
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedMessage(message);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Sender Avatar */}
                        <Avatar className="h-10 w-10">
                          <AvatarImage alt={senderInfo.name} src="" />
                          <AvatarFallback className="bg-blue-100 font-medium text-blue-700">
                            {senderInfo.avatar}
                          </AvatarFallback>
                        </Avatar>

                        {/* Message Content */}
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <p className="truncate font-medium text-foreground">
                                {senderInfo.name}
                              </p>
                              <Badge className="text-xs" variant="outline">
                                {senderInfo.role}
                              </Badge>
                              {message.isEmergency && (
                                <Badge
                                  className="animate-pulse text-xs"
                                  variant="destructive"
                                >
                                  EMERGÊNCIA
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-muted-foreground text-xs">
                              <TypeIcon className="h-3 w-3" />
                              <span>
                                {message.createdAt.toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="mb-2 flex items-center space-x-2">
                            <div className={`rounded p-1 ${priorityInfo.bg}`}>
                              <PriorityIcon
                                className={`h-3 w-3 ${priorityInfo.color}`}
                              />
                            </div>
                            <h3
                              className={`truncate font-medium text-sm ${
                                isUnread
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {message.subject}
                            </h3>
                          </div>

                          <p className="line-clamp-2 text-muted-foreground text-sm">
                            {message.content}
                          </p>

                          {/* Message Metadata */}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-muted-foreground text-xs">
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
                                  className="text-xs"
                                  variant={message.acknowledgedBy.length > 0
                                    ? "default"
                                    : "secondary"}
                                >
                                  {message.acknowledgedBy.length > 0
                                    ? "✓ Confirmado"
                                    : "Aguarda Confirmação"}
                                </Badge>
                              )}
                              {isUnread && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="h-8 w-8 p-0"
                              size="sm"
                              variant="ghost"
                            >
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
                            {message.requiresAcknowledgment
                              && !message.acknowledgedBy.includes(
                                "current-user",
                              ) && (
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
                  <div className="py-12 text-center">
                    <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 font-medium text-foreground text-lg">
                      Nenhuma mensagem encontrada
                    </p>
                    <p className="mb-4 text-muted-foreground">
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
        </TabsContent>{" "}
        {/* Handoffs Tab */}
        <TabsContent className="space-y-6" value="handoffs">
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
                  const { icon: StatusIcon } = statusInfo;
                  const priorityInfo = getPriorityInfo(handoff.priority);

                  return (
                    <Card className="relative" key={handoff.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage alt={fromStaff.name} src="" />
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                  {fromStaff.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <Avatar className="h-8 w-8">
                                <AvatarImage alt={toStaff.name} src="" />
                                <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                                  {toStaff.avatar}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {fromStaff.name} → {toStaff.name}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {fromStaff.role} → {toStaff.role}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge
                              className={`${priorityInfo.bg} ${priorityInfo.color} border-0`}
                            >
                              {priorityInfo.label}
                            </Badge>
                            <Badge
                              className={`${statusInfo.bg} ${statusInfo.color} border-0`}
                            >
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Patient Info */}
                        <div className="rounded-md bg-blue-50 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="flex items-center font-medium text-sm">
                              <User className="mr-2 h-4 w-4" />
                              Paciente ID: {handoff.patientId}
                            </h4>
                            <Badge className="text-xs" variant="outline">
                              {handoff.handoffType === "transfer"
                                ? "Transferência"
                                : handoff.handoffType === "shift_change"
                                ? "Troca de Plantão"
                                : handoff.handoffType === "discharge"
                                ? "Alta"
                                : "Consulta"}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {handoff.currentCondition}
                          </p>
                        </div>

                        {/* Vital Signs */}
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                          {Object.entries(handoff.vitalSigns).map(
                            ([key, value]) => (
                              <div
                                className="rounded bg-gray-50 p-2 text-center"
                                key={key}
                              >
                                <div className="font-medium text-muted-foreground text-xs uppercase">
                                  {key === "pa"
                                    ? "PA"
                                    : key === "fc"
                                    ? "FC"
                                    : key === "fr"
                                    ? "FR"
                                    : key === "temp"
                                    ? "T°"
                                    : "SpO₂"}
                                </div>
                                <div className="mt-1 font-medium text-sm">
                                  {value}
                                </div>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Medications */}
                        <div>
                          <h5 className="mb-2 flex items-center font-medium text-sm">
                            <Heart className="mr-2 h-4 w-4 text-red-500" />
                            Medicações Ativas
                          </h5>
                          <div className="space-y-1">
                            {handoff.activeMedications.map((med, idx) => (
                              <div
                                className="rounded bg-yellow-50 px-2 py-1 text-sm"
                                key={idx}
                              >
                                {med}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Allergies */}
                        {handoff.allergies.length > 0 && (
                          <div>
                            <h5 className="mb-2 flex items-center font-medium text-red-600 text-sm">
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Alergias
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {handoff.allergies.map((allergy, idx) => (
                                <Badge
                                  className="text-xs"
                                  key={idx}
                                  variant="destructive"
                                >
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Care Instructions */}
                        <div>
                          <h5 className="mb-2 flex items-center font-medium text-sm">
                            <FileText className="mr-2 h-4 w-4 text-blue-500" />
                            Instruções de Cuidado
                          </h5>
                          <p className="rounded bg-blue-50 p-3 text-muted-foreground text-sm">
                            {handoff.careInstructions}
                          </p>
                        </div>

                        {/* Follow-up Required */}
                        {handoff.followUpRequired.length > 0 && (
                          <div>
                            <h5 className="mb-2 flex items-center font-medium text-sm">
                              <Clock className="mr-2 h-4 w-4 text-orange-500" />
                              Acompanhamento Necessário
                            </h5>
                            <div className="space-y-1">
                              {handoff.followUpRequired.map((item, idx) => (
                                <div
                                  className="flex items-center text-sm"
                                  key={idx}
                                >
                                  <div className="mr-2 h-2 w-2 rounded-full bg-orange-400" />
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {handoff.notes && (
                          <div>
                            <h5 className="mb-2 font-medium text-sm">
                              Observações
                            </h5>
                            <p className="text-muted-foreground text-sm italic">
                              "{handoff.notes}"
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between border-t pt-3">
                          <div className="text-muted-foreground text-xs">
                            Criado em: {handoff.createdAt.toLocaleString("pt-BR")}
                            {handoff.acknowledgedAt && (
                              <span className="ml-3">
                                Confirmado em: {handoff.acknowledgedAt.toLocaleString("pt-BR")}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {handoff.status === "pending" && (
                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
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
                  <div className="py-12 text-center">
                    <ArrowRight className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 font-medium text-foreground text-lg">
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
        <TabsContent className="space-y-6" value="emergency">
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
                    <CardTitle className="flex items-center text-base text-red-600">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Alertas de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full justify-start"
                      size="lg"
                      variant="destructive"
                    >
                      <Heart className="mr-2 h-5 w-5" />
                      Código Azul - Parada Cardiorrespiratória
                    </Button>

                    <Button
                      className="w-full justify-start bg-orange-600 hover:bg-orange-700"
                      size="lg"
                      variant="destructive"
                    >
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Código Amarelo - Emergência Interna
                    </Button>

                    <Button
                      className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                      size="lg"
                      variant="destructive"
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Código Rosa - Emergência Pediátrica
                    </Button>

                    <Button
                      className="w-full justify-start bg-gray-600 hover:bg-gray-700"
                      size="lg"
                      variant="destructive"
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Código Prata - Arma/Violência
                    </Button>
                  </CardContent>
                </Card>

                {/* Emergency Contacts */}
                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-base text-blue-600">
                      <Phone className="mr-2 h-5 w-5" />
                      Contatos de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded bg-red-50 p-2">
                        <div>
                          <p className="font-medium text-sm">SAMU</p>
                          <p className="text-muted-foreground text-xs">
                            Emergência Médica
                          </p>
                        </div>
                        <Button size="sm" variant="destructive">
                          <Phone className="mr-1 h-3 w-3" />
                          192
                        </Button>
                      </div>

                      <div className="flex items-center justify-between rounded bg-blue-50 p-2">
                        <div>
                          <p className="font-medium text-sm">Polícia Militar</p>
                          <p className="text-muted-foreground text-xs">
                            Emergência Segurança
                          </p>
                        </div>
                        <Button size="sm" variant="destructive">
                          <Phone className="mr-1 h-3 w-3" />
                          190
                        </Button>
                      </div>

                      <div className="flex items-center justify-between rounded bg-orange-50 p-2">
                        <div>
                          <p className="font-medium text-sm">Bombeiros</p>
                          <p className="text-muted-foreground text-xs">
                            Emergência Incêndio
                          </p>
                        </div>
                        <Button size="sm" variant="destructive">
                          <Phone className="mr-1 h-3 w-3" />
                          193
                        </Button>
                      </div>

                      <div className="flex items-center justify-between rounded bg-green-50 p-2">
                        <div>
                          <p className="font-medium text-sm">
                            Central de Transplantes
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Emergência Órgãos
                          </p>
                        </div>
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
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
                    <CardTitle className="flex items-center text-base text-yellow-600">
                      <FileText className="mr-2 h-5 w-5" />
                      Procedimentos de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">
                          RCP (Ressuscitação Cardiopulmonar)
                        </h4>
                        <div className="space-y-1 text-muted-foreground text-sm">
                          <p>1. Verificar responsividade e respiração</p>
                          <p>2. Posicionar vítima em superfície rígida</p>
                          <p>3. Compressões: 30 x 2 ventilações</p>
                          <p>4. Profundidade: 5-6cm, frequência: 100-120/min</p>
                          <p>5. Desfibrilação se disponível</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">
                          Manobra de Heimlich
                        </h4>
                        <div className="space-y-1 text-muted-foreground text-sm">
                          <p>1. Posicionar-se atrás da vítima</p>
                          <p>2. Abraçar pelo abdome</p>
                          <p>3. Posicionar punho fechado acima do umbigo</p>
                          <p>4. Compressões rápidas para cima</p>
                          <p>5. Repetir até desobstruir via aérea</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">
                          Controle de Hemorragia
                        </h4>
                        <div className="space-y-1 text-muted-foreground text-sm">
                          <p>1. Pressão direta no local do sangramento</p>
                          <p>2. Elevação do membro se possível</p>
                          <p>3. Compressa e bandagem compressiva</p>
                          <p>4. Pontos de pressão se necessário</p>
                          <p>5. Torniquete apenas em casos extremos</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Anafilaxia</h4>
                        <div className="space-y-1 text-muted-foreground text-sm">
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
                    <CardTitle className="flex items-center text-base text-green-600">
                      <Users className="mr-2 h-5 w-5" />
                      Status da Equipe de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="rounded border border-green-200 bg-green-50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-medium text-sm">
                            Médico de Plantão
                          </p>
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Dr. Roberto Oliveira
                        </p>
                        <p className="text-green-600 text-xs">
                          Disponível - UTI
                        </p>
                      </div>

                      <div className="rounded border border-green-200 bg-green-50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-medium text-sm">
                            Enfermeiro Responsável
                          </p>
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Enf. Ana Paula
                        </p>
                        <p className="text-green-600 text-xs">
                          Disponível - CC
                        </p>
                      </div>

                      <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-medium text-sm">Anestesista</p>
                          <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Dr. Carlos Mendes
                        </p>
                        <p className="text-xs text-yellow-600">
                          Em Cirurgia - CC2
                        </p>
                      </div>

                      <div className="rounded border border-red-200 bg-red-50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-medium text-sm">Cirurgião</p>
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Dra. Luciana Santos
                        </p>
                        <p className="text-red-600 text-xs">
                          Indisponível - Cirurgia
                        </p>
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
      <Dialog onOpenChange={setIsComposeDialogOpen} open={isComposeDialogOpen}>
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
              <label htmlFor="recipients-select" className="mb-2 block font-medium text-sm">
                Destinatários
              </label>
              <Select>
                <SelectTrigger id="recipients-select">
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
              <label htmlFor="priority-select" className="mb-2 block font-medium text-sm">
                Prioridade
              </label>
              <Select
                onValueChange={(value) =>
                  setNewMessage((prev) => ({
                    ...prev,
                    priority: value as CommunicationPriority,
                  }))}
                value={newMessage.priority}
              >
                <SelectTrigger id="priority-select">
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
              <label htmlFor="subject-input" className="mb-2 block font-medium text-sm">Assunto</label>
              <Input
                id="subject-input"
                onChange={(e) =>
                  setNewMessage((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))}
                placeholder="Assunto da mensagem..."
                value={newMessage.subject}
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="message-textarea" className="mb-2 block font-medium text-sm">Mensagem</label>
              <Textarea
                id="message-textarea"
                onChange={(e) =>
                  setNewMessage((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))}
                placeholder="Digite sua mensagem..."
                rows={6}
                value={newMessage.content}
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  checked={newMessage.isEmergency}
                  className="rounded"
                  id="emergency"
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      isEmergency: e.target.checked,
                    }))}
                  type="checkbox"
                />
                <label className="text-sm" htmlFor="emergency">
                  Marcar como emergência
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  checked={newMessage.requiresAcknowledgment}
                  className="rounded"
                  id="acknowledgment"
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      requiresAcknowledgment: e.target.checked,
                    }))}
                  type="checkbox"
                />
                <label className="text-sm" htmlFor="acknowledgment">
                  Requer confirmação de leitura
                </label>
              </div>
            </div>

            {/* LGPD Notice */}
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
              <div className="flex items-start space-x-2">
                <Shield className="mt-0.5 h-4 w-4 text-yellow-600" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Aviso LGPD</p>
                  <p className="text-yellow-700">
                    Esta mensagem pode conter dados pessoais sensíveis. Certifique-se de que todos
                    os destinatários têm autorização para acessar essas informações.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsComposeDialogOpen(false)}
              variant="outline"
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
