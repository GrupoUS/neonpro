"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Phone,
  Heart,
  Lungs,
  Brain,
  Shield,
  Baby,
  Pill,
  Clock,
  Users,
  Bell,
  Activity,
  FileText,
  Search,
  Plus,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  ArrowUp,
  Timer,
  MapPin,
  User,
  Stethoscope,
  Truck,
  Radio,
  BookOpen,
  BarChart3,
  Calendar,
  Download,
  Eye,
  AlertCircle,
  Zap,
  PhoneCall,
  UserCheck,
  Settings,
  History,
  Target,
} from "lucide-react";

import type {
  EmergencyProtocol,
  EmergencyResponse,
  EmergencyContact,
  EmergencyCategory,
  EmergencyPriority,
  EmergencyResponseTeam,
} from "@/lib/compliance/emergency-medical-protocols";
import {
  EmergencyStatus,
  EmergencyEscalationLevel,
  EmergencyNotification,
  EmergencyMedicalProtocolsService,
} from "@/lib/compliance/emergency-medical-protocols";

// Initialize Emergency service
const emergencyService = EmergencyMedicalProtocolsService.getInstance();

interface EmergencyProtocolsManagerProps {
  className?: string;
}

interface EmergencyFormData {
  patientId: string;
  patientName: string;
  patientAge: number;
  symptoms: string[];
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    oxygenSaturation: number;
    temperature: number;
    respiratoryRate: number;
    glucoseLevel: number;
  };
  consciousness: string;
  location: string;
  reportedBy: string;
  contactNumber: string;
  description: string;
}

const EMERGENCY_CATEGORY_CONFIG = {
  cardiovascular: {
    label: "Cardiovascular",
    description: "Emergências cardíacas e vasculares",
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-300",
    icon: Heart,
  },
  respiratory: {
    label: "Respiratória",
    description: "Emergências do sistema respiratório",
    bg: "bg-blue-100 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    icon: Lungs,
  },
  neurological: {
    label: "Neurológica",
    description: "Emergências neurológicas",
    bg: "bg-purple-100 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-300",
    icon: Brain,
  },
  allergic: {
    label: "Alérgica",
    description: "Reações alérgicas e anafilaxia",
    bg: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-300",
    icon: Shield,
  },
  obstetric: {
    label: "Obstétrica",
    description: "Emergências obstétricas",
    bg: "bg-pink-100 dark:bg-pink-900/20",
    text: "text-pink-700 dark:text-pink-300",
    icon: Baby,
  },
  toxicological: {
    label: "Toxicológica",
    description: "Intoxicações e envenenamentos",
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-300",
    icon: Pill,
  },
  trauma: {
    label: "Trauma",
    description: "Traumatismos e lesões",
    bg: "bg-gray-100 dark:bg-gray-900/20",
    text: "text-gray-700 dark:text-gray-300",
    icon: Activity,
  },
  general: {
    label: "Geral",
    description: "Emergências gerais",
    bg: "bg-slate-100 dark:bg-slate-900/20",
    text: "text-slate-700 dark:text-slate-300",
    icon: AlertTriangle,
  },
} as const;

const PRIORITY_CONFIG = {
  critical: {
    label: "Crítica",
    description: "Risco iminente de vida",
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-300",
    icon: AlertTriangle,
  },
  high: {
    label: "Alta",
    description: "Requer atenção imediata",
    bg: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-300",
    icon: Zap,
  },
  medium: {
    label: "Média",
    description: "Atenção em 15-30 minutos",
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-300",
    icon: Clock,
  },
  low: {
    label: "Baixa",
    description: "Não urgente",
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-300",
    icon: CheckCircle,
  },
} as const;

const STATUS_CONFIG = {
  active: {
    label: "Ativo",
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-300",
    icon: Play,
  },
  "in-progress": {
    label: "Em Andamento",
    bg: "bg-blue-100 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    icon: Activity,
  },
  resolved: {
    label: "Resolvido",
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-300",
    icon: CheckCircle,
  },
  escalated: {
    label: "Escalado",
    bg: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-300",
    icon: ArrowUp,
  },
} as const;

const ESCALATION_CONFIG = {
  initial: {
    label: "Inicial",
    description: "Primeiro nível de atendimento",
  },
  specialist: {
    label: "Especialista",
    description: "Escalado para especialista",
  },
  director: {
    label: "Direção",
    description: "Escalado para direção médica",
  },
  external: {
    label: "Externo",
    description: "Escalado para SAMU/Bombeiros",
  },
} as const;

const CONTACT_TYPE_CONFIG = {
  "medical-emergency": {
    label: "Emergência Médica",
    icon: Stethoscope,
    color: "text-red-600",
  },
  "rescue-emergency": {
    label: "Resgate",
    icon: Truck,
    color: "text-orange-600",
  },
  "security-emergency": {
    label: "Segurança",
    icon: Shield,
    color: "text-blue-600",
  },
  "toxicological-emergency": {
    label: "Toxicológica",
    icon: Pill,
    color: "text-green-600",
  },
  "internal-coordinator": {
    label: "Coordenador Interno",
    icon: UserCheck,
    color: "text-purple-600",
  },
  "medical-authority": {
    label: "Autoridade Médica",
    icon: User,
    color: "text-indigo-600",
  },
} as const;

export const EmergencyProtocolsManager: React.FC<
  EmergencyProtocolsManagerProps
> = ({ className }) => {
  const [protocols, setProtocols] = useState<EmergencyProtocol[]>([]);
  const [activeEmergencies, setActiveEmergencies] = useState<
    EmergencyResponse[]
  >([]);
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([]);
  const [responseTeams, setResponseTeams] = useState<EmergencyResponseTeam[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    EmergencyCategory | "all"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    EmergencyPriority | "all"
  >("all");
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] =
    useState<EmergencyResponse | null>(null);
  const [actionType, setActionType] = useState<
    "update" | "escalate" | "resolve"
  >("update");

  const [formData, setFormData] = useState<EmergencyFormData>({
    patientId: "",
    patientName: "",
    patientAge: 0,
    symptoms: [],
    vitalSigns: {
      bloodPressure: "",
      heartRate: 0,
      oxygenSaturation: 0,
      temperature: 0,
      respiratoryRate: 0,
      glucoseLevel: 0,
    },
    consciousness: "",
    location: "",
    reportedBy: "",
    contactNumber: "",
    description: "",
  });

  const [actionForm, setActionForm] = useState({
    action: "",
    notes: "",
    medication: {
      name: "",
      dosage: "",
      administeredBy: "",
    },
    escalationReason: "",
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30_000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load protocols
      const protocolsData = emergencyService.getEmergencyProtocols();
      setProtocols(protocolsData);

      // Load active emergencies
      const emergenciesData = emergencyService.getActiveEmergencies();
      setActiveEmergencies(emergenciesData);

      // Load emergency contacts
      const contactsData = emergencyService.getEmergencyContacts();
      setEmergencyContacts(contactsData);

      // Load response teams
      const teamsData = emergencyService.getResponseTeams();
      setResponseTeams(teamsData);
    } catch (error) {
      console.error("Error loading emergency data:", error);
      toast.error("Erro ao carregar dados de emergência");
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerEmergency = async () => {
    try {
      const result = await emergencyService.triggerEmergencyResponse({
        patientId: formData.patientId,
        patientName: formData.patientName,
        patientAge: formData.patientAge,
        symptoms: formData.symptoms,
        vitalSigns:
          formData.vitalSigns.heartRate > 0 ? formData.vitalSigns : undefined,
        consciousness: formData.consciousness,
        location: formData.location,
        reportedBy: formData.reportedBy,
        contactNumber: formData.contactNumber,
        description: formData.description,
      });

      if (result.isValid && result.data) {
        setActiveEmergencies((prev) => [result.data!, ...prev]);
        setIsEmergencyDialogOpen(false);
        resetForm();
        toast.success("Protocolo de emergência acionado com sucesso");

        // Show critical alert if SAMU was called
        if (result.data.samuCalled) {
          toast.success("SAMU (192) foi acionado automaticamente", {
            description: `Emergência crítica registrada - ${result.data.protocolId}`,
          });
        }
      } else {
        toast.error(
          result.errors?.[0] || "Erro ao acionar protocolo de emergência",
        );
      }
    } catch (error) {
      console.error("Error triggering emergency:", error);
      toast.error("Erro interno ao acionar emergência");
    }
  };

  const handleEmergencyAction = async () => {
    if (!selectedEmergency) {
      return;
    }

    try {
      let result;

      switch (actionType) {
        case "update":
          result = await emergencyService.updateEmergencyStatus(
            selectedEmergency.id,
            {
              action: actionForm.action,
              medication: actionForm.medication.name
                ? {
                    name: actionForm.medication.name,
                    dosage: actionForm.medication.dosage,
                    time: new Date(),
                    administeredBy: actionForm.medication.administeredBy,
                  }
                : undefined,
              notes: actionForm.notes,
              userId: "current-user", // In real app, get from auth
            },
          );
          break;

        case "escalate":
          result = await emergencyService.escalateEmergency(
            selectedEmergency.id,
            actionForm.escalationReason,
            "current-user",
          );
          break;

        case "resolve":
          result = await emergencyService.updateEmergencyStatus(
            selectedEmergency.id,
            {
              status: "resolved",
              notes: actionForm.notes,
              userId: "current-user",
            },
          );
          break;
      }

      if (result?.isValid) {
        // Update local state
        setActiveEmergencies((prev) =>
          prev.map((emergency) =>
            emergency.id === selectedEmergency.id ? result.data! : emergency,
          ),
        );

        setIsActionDialogOpen(false);
        resetActionForm();
        toast.success(
          actionType === "update"
            ? "Ação registrada com sucesso"
            : actionType === "escalate"
              ? "Emergência escalada com sucesso"
              : "Emergência resolvida com sucesso",
        );
      } else {
        toast.error(result?.errors?.[0] || "Erro ao processar ação");
      }
    } catch (error) {
      console.error("Error handling emergency action:", error);
      toast.error("Erro interno ao processar ação");
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      patientName: "",
      patientAge: 0,
      symptoms: [],
      vitalSigns: {
        bloodPressure: "",
        heartRate: 0,
        oxygenSaturation: 0,
        temperature: 0,
        respiratoryRate: 0,
        glucoseLevel: 0,
      },
      consciousness: "",
      location: "",
      reportedBy: "",
      contactNumber: "",
      description: "",
    });
  };

  const resetActionForm = () => {
    setActionForm({
      action: "",
      notes: "",
      medication: {
        name: "",
        dosage: "",
        administeredBy: "",
      },
      escalationReason: "",
    });
  };

  const filteredProtocols = protocols.filter((protocol) => {
    const matchesSearch =
      protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protocol.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || protocol.category === categoryFilter;
    const matchesPriority =
      priorityFilter === "all" || protocol.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const filteredEmergencies = activeEmergencies.filter((emergency) => {
    const matchesSearch =
      emergency.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emergency.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || emergency.category === categoryFilter;
    const matchesPriority =
      priorityFilter === "all" || emergency.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getElapsedTime = (startTime: Date): string => {
    const now = new Date();
    const elapsed = Math.floor(
      (now.getTime() - startTime.getTime()) / (1000 * 60),
    );
    if (elapsed < 60) {
      return `${elapsed}m`;
    }
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return `${hours}h ${minutes}m`;
  };

  const getResponseTimeColor = (
    startTime: Date,
    maxResponseTime: number,
  ): string => {
    const elapsed = (new Date().getTime() - startTime.getTime()) / (1000 * 60);
    if (elapsed <= maxResponseTime) {
      return "text-green-600";
    }
    if (elapsed <= maxResponseTime * 1.5) {
      return "text-yellow-600";
    }
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-pulse" />
        <span className="ml-2">Carregando protocolos de emergência...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Protocolos de Emergência
          </h2>
          <p className="text-muted-foreground">
            Gestão de emergências médicas e protocolos de resposta
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Emergency Status Indicators */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                {
                  activeEmergencies.filter((e) => e.priority === "critical")
                    .length
                }{" "}
                Críticas
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200">
              <Zap className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">
                {activeEmergencies.filter((e) => e.priority === "high").length}{" "}
                Altas
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {activeEmergencies.length} Ativas
              </span>
            </div>
          </div>

          <Dialog
            open={isEmergencyDialogOpen}
            onOpenChange={setIsEmergencyDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" size="lg">
                <AlertTriangle className="h-4 w-4 mr-2" />
                ACIONAR EMERGÊNCIA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Acionar Protocolo de Emergência
                </DialogTitle>
                <DialogDescription>
                  Registrar nova emergência médica e acionar protocolos de
                  resposta
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Dados do Paciente</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="patientName">Nome do Paciente *</Label>
                      <Input
                        id="patientName"
                        value={formData.patientName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            patientName: e.target.value,
                          }))
                        }
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientId">CPF/ID do Paciente</Label>
                      <Input
                        id="patientId"
                        value={formData.patientId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            patientId: e.target.value,
                          }))
                        }
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientAge">Idade *</Label>
                      <Input
                        id="patientAge"
                        type="number"
                        min="0"
                        max="150"
                        value={formData.patientAge}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            patientAge: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="Idade do paciente"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Details */}
                <div className="space-y-4">
                  <h4 className="font-medium">Detalhes da Emergência</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Local da Emergência *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="Sala, consultório, endereço..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="consciousness">
                        Nível de Consciência
                      </Label>
                      <Select
                        value={formData.consciousness}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            consciousness: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alert">Alerta</SelectItem>
                          <SelectItem value="verbal">
                            Responde a estímulo verbal
                          </SelectItem>
                          <SelectItem value="pain">Responde a dor</SelectItem>
                          <SelectItem value="unresponsive">
                            Não responsivo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">
                      Descrição dos Sintomas/Situação *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Descreva detalhadamente os sintomas apresentados e a situação encontrada..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Sintomas Específicos</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {[
                        "Dor torácica",
                        "Dispneia",
                        "Perda de consciência",
                        "Convulsões",
                        "Hemorragia",
                        "Hipotensão",
                        "Taquicardia",
                        "Bradicardia",
                        "Cianose",
                        "Edema",
                        "Náuseas/Vômitos",
                        "Febre alta",
                      ].map((symptom) => (
                        <div
                          key={symptom}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={symptom}
                            checked={formData.symptoms.includes(symptom)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  symptoms: [...prev.symptoms, symptom],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  symptoms: prev.symptoms.filter(
                                    (s) => s !== symptom,
                                  ),
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={symptom} className="text-sm">
                            {symptom}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vital Signs */}
                <div className="space-y-4">
                  <h4 className="font-medium">Sinais Vitais (opcional)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bloodPressure">PA (mmHg)</Label>
                      <Input
                        id="bloodPressure"
                        value={formData.vitalSigns.bloodPressure}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vitalSigns: {
                              ...prev.vitalSigns,
                              bloodPressure: e.target.value,
                            },
                          }))
                        }
                        placeholder="120/80"
                      />
                    </div>
                    <div>
                      <Label htmlFor="heartRate">FC (bpm)</Label>
                      <Input
                        id="heartRate"
                        type="number"
                        min="0"
                        max="300"
                        value={formData.vitalSigns.heartRate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vitalSigns: {
                              ...prev.vitalSigns,
                              heartRate: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        placeholder="72"
                      />
                    </div>
                    <div>
                      <Label htmlFor="oxygenSaturation">SpO2 (%)</Label>
                      <Input
                        id="oxygenSaturation"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.vitalSigns.oxygenSaturation}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vitalSigns: {
                              ...prev.vitalSigns,
                              oxygenSaturation: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        placeholder="98"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="temperature">Temperatura (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        min="20"
                        max="50"
                        step="0.1"
                        value={formData.vitalSigns.temperature}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vitalSigns: {
                              ...prev.vitalSigns,
                              temperature: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                        placeholder="36.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="respiratoryRate">FR (irpm)</Label>
                      <Input
                        id="respiratoryRate"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.vitalSigns.respiratoryRate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vitalSigns: {
                              ...prev.vitalSigns,
                              respiratoryRate: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        placeholder="16"
                      />
                    </div>
                    <div>
                      <Label htmlFor="glucoseLevel">Glicemia (mg/dL)</Label>
                      <Input
                        id="glucoseLevel"
                        type="number"
                        min="0"
                        max="1000"
                        value={formData.vitalSigns.glucoseLevel}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vitalSigns: {
                              ...prev.vitalSigns,
                              glucoseLevel: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                        placeholder="90"
                      />
                    </div>
                  </div>
                </div>

                {/* Reporter Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Dados do Relator</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reportedBy">Nome do Profissional *</Label>
                      <Input
                        id="reportedBy"
                        value={formData.reportedBy}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            reportedBy: e.target.value,
                          }))
                        }
                        placeholder="Nome do profissional que está relatando"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactNumber">
                        Telefone de Contato *
                      </Label>
                      <Input
                        id="contactNumber"
                        value={formData.contactNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            contactNumber: e.target.value,
                          }))
                        }
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    O protocolo de emergência será acionado imediatamente. Para
                    emergências críticas, o SAMU (192) será contactado
                    automaticamente.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEmergencyDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleTriggerEmergency}
                  disabled={
                    !formData.patientName ||
                    !formData.description ||
                    !formData.reportedBy ||
                    formData.patientAge === 0
                  }
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  ACIONAR EMERGÊNCIA
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por protocolo, paciente ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(value: EmergencyCategory | "all") =>
            setCategoryFilter(value)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {Object.entries(EMERGENCY_CATEGORY_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4" />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={priorityFilter}
          onValueChange={(value: EmergencyPriority | "all") =>
            setPriorityFilter(value)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Prioridades</SelectItem>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4" />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active-emergencies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active-emergencies">
            Emergências Ativas
          </TabsTrigger>
          <TabsTrigger value="protocols">Protocolos</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="teams">Equipes</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Active Emergencies */}
        <TabsContent value="active-emergencies" className="space-y-4">
          {filteredEmergencies.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhuma Emergência Ativa
                </h3>
                <p className="text-muted-foreground">
                  Não há emergências médicas ativas no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredEmergencies.map((emergency) => {
                const protocol = protocols.find(
                  (p) => p.id === emergency.protocolId,
                );
                const categoryConfig =
                  EMERGENCY_CATEGORY_CONFIG[emergency.category];
                const priorityConfig = PRIORITY_CONFIG[emergency.priority];
                const statusConfig = STATUS_CONFIG[emergency.status];
                const CategoryIcon = categoryConfig?.icon || AlertTriangle;
                const PriorityIcon = priorityConfig?.icon || AlertTriangle;
                const StatusIcon = statusConfig?.icon || Play;

                return (
                  <Card
                    key={emergency.id}
                    className={cn(
                      "border-l-4",
                      emergency.priority === "critical" && "border-l-red-500",
                      emergency.priority === "high" && "border-l-orange-500",
                      emergency.priority === "medium" && "border-l-yellow-500",
                      emergency.priority === "low" && "border-l-green-500",
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="h-5 w-5" />
                            <CardTitle className="text-lg">
                              {protocol?.name || "Protocolo não encontrado"}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                priorityConfig?.bg,
                                priorityConfig?.text,
                              )}
                            >
                              <PriorityIcon className="h-3 w-3 mr-1" />
                              {priorityConfig?.label}
                            </Badge>
                            {emergency.samuCalled && (
                              <Badge
                                variant="outline"
                                className="bg-red-50 text-red-700"
                              >
                                <Phone className="h-3 w-3 mr-1" />
                                SAMU
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {emergency.patientName} ({emergency.patientAge}{" "}
                                anos)
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {emergency.location}
                              </div>
                              <div
                                className={cn(
                                  "flex items-center gap-1",
                                  getResponseTimeColor(
                                    emergency.startTime,
                                    emergency.responseTime,
                                  ),
                                )}
                              >
                                <Timer className="h-4 w-4" />
                                {getElapsedTime(emergency.startTime)}
                              </div>
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(statusConfig?.bg, statusConfig?.text)}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig?.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {ESCALATION_CONFIG[emergency.escalationLevel].label}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Descrição:
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {emergency.description}
                        </p>
                      </div>

                      {emergency.symptoms.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">
                            Sintomas:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {emergency.symptoms.map((symptom) => (
                              <Badge
                                key={symptom}
                                variant="secondary"
                                className="text-xs"
                              >
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {emergency.vitalSigns && (
                        <div>
                          <div className="text-sm font-medium mb-2">
                            Sinais Vitais:
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            {emergency.vitalSigns.bloodPressure && (
                              <div>
                                PA: {emergency.vitalSigns.bloodPressure}
                              </div>
                            )}
                            {emergency.vitalSigns.heartRate > 0 && (
                              <div>
                                FC: {emergency.vitalSigns.heartRate} bpm
                              </div>
                            )}
                            {emergency.vitalSigns.oxygenSaturation > 0 && (
                              <div>
                                SpO2: {emergency.vitalSigns.oxygenSaturation}%
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {emergency.actionsPerformed.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">
                            Ações Realizadas:
                          </div>
                          <div className="space-y-1">
                            {emergency.actionsPerformed.map((action, index) => (
                              <div
                                key={index}
                                className="text-xs text-muted-foreground"
                              >
                                {action.timestamp.toLocaleTimeString("pt-BR")} -{" "}
                                {action.action}({action.performedBy})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedEmergency(emergency);
                            setActionType("update");
                            setIsActionDialogOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Registrar Ação
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEmergency(emergency);
                            setActionType("escalate");
                            setIsActionDialogOpen(true);
                          }}
                        >
                          <ArrowUp className="h-4 w-4 mr-2" />
                          Escalar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEmergency(emergency);
                            setActionType("resolve");
                            setIsActionDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Protocols Tab */}
        <TabsContent value="protocols" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProtocols.map((protocol) => {
              const categoryConfig =
                EMERGENCY_CATEGORY_CONFIG[protocol.category];
              const priorityConfig = PRIORITY_CONFIG[protocol.priority];
              const CategoryIcon = categoryConfig?.icon || AlertTriangle;
              const PriorityIcon = priorityConfig?.icon || AlertTriangle;

              return (
                <Card key={protocol.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <CategoryIcon className="h-5 w-5" />
                          {protocol.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {protocol.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            priorityConfig?.bg,
                            priorityConfig?.text,
                          )}
                        >
                          <PriorityIcon className="h-3 w-3 mr-1" />
                          {priorityConfig?.label}
                        </Badge>
                        {protocol.samuIntegration && (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 text-xs"
                          >
                            SAMU
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Critérios de Ativação:
                      </div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        {protocol.triggerCriteria
                          .slice(0, 3)
                          .map((criteria, index) => (
                            <li key={index}>{criteria}</li>
                          ))}
                        {protocol.triggerCriteria.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{protocol.triggerCriteria.length - 3} mais
                            critérios...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">
                        Ações Imediatas:
                      </div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        {protocol.immediateActions
                          .slice(0, 3)
                          .map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        {protocol.immediateActions.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{protocol.immediateActions.length - 3} mais
                            ações...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        Tempo máximo: {protocol.maxResponseTime} min
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          v{protocol.version}
                        </Badge>
                        {protocol.cfmCompliant && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 text-xs"
                          >
                            CFM
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Emergency Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => {
              const typeConfig = CONTACT_TYPE_CONFIG[contact.type];
              const TypeIcon = typeConfig?.icon || Phone;

              return (
                <Card key={contact.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TypeIcon
                            className={cn("h-5 w-5", typeConfig?.color)}
                          />
                          {contact.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {contact.description}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          contact.priority === 1
                            ? "bg-red-50 text-red-700"
                            : "bg-yellow-50 text-yellow-700",
                        )}
                      >
                        Prioridade {contact.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`tel:${contact.phoneNumber}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          {contact.phoneNumber}
                        </a>
                      </Button>
                      {contact.email && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${contact.email}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            E-mail
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Horário:</div>
                        <div className="text-muted-foreground">
                          {contact.availableHours}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Área:</div>
                        <div className="text-muted-foreground">
                          {contact.responseArea}
                        </div>
                      </div>
                    </div>

                    {contact.specialties && contact.specialties.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Especialidades:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {contact.specialties.map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="secondary"
                              className="text-xs"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Response Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <div className="grid gap-4">
            {responseTeams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {team.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {team.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {team.responseTime} min
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          team.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700",
                        )}
                      >
                        {team.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-2">
                      Membros da Equipe:
                    </div>
                    <div className="space-y-2">
                      {team.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full",
                                member.isOnCall
                                  ? "bg-green-500"
                                  : "bg-gray-300",
                              )}
                            />
                            <div>
                              <div className="font-medium text-sm">
                                {member.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {member.role} - {member.crm || member.coren}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`tel:${member.phoneNumber}`}>
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Capacidades:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {team.capabilities.map((capability) => (
                          <Badge
                            key={capability}
                            variant="secondary"
                            className="text-xs"
                          >
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Equipamentos:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {team.equipment.map((equipment) => (
                          <Badge
                            key={equipment}
                            variant="outline"
                            className="text-xs"
                          >
                            {equipment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {activeEmergencies.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Emergências Ativas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {
                        activeEmergencies.filter(
                          (e) =>
                            e.priority === "critical" || e.priority === "high",
                        ).length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Alta Prioridade
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {activeEmergencies.filter((e) => e.samuCalled).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Chamadas SAMU
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{protocols.length}</p>
                    <p className="text-sm text-muted-foreground">
                      Protocolos Ativos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Emergência</CardTitle>
              <CardDescription>
                Gerar relatórios de atividade e conformidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Relatório de Emergências
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Estatísticas Mensais
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Auditoria CFM
                </Button>
              </div>

              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  Todos os protocolos de emergência estão em conformidade com as
                  diretrizes do CFM e regulamentações da ANVISA para
                  estabelecimentos de saúde.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "update" && "Registrar Ação na Emergência"}
              {actionType === "escalate" && "Escalar Emergência"}
              {actionType === "resolve" && "Resolver Emergência"}
            </DialogTitle>
            <DialogDescription>
              {selectedEmergency && (
                <>
                  {selectedEmergency.patientName} -{" "}
                  {selectedEmergency.description}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === "update" && (
              <>
                <div>
                  <Label htmlFor="action">Ação Realizada</Label>
                  <Input
                    id="action"
                    value={actionForm.action}
                    onChange={(e) =>
                      setActionForm((prev) => ({
                        ...prev,
                        action: e.target.value,
                      }))
                    }
                    placeholder="Ex: Administrou oxigênio, verificou sinais vitais..."
                  />
                </div>

                <div className="space-y-3">
                  <Label>Medicação Administrada (opcional)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="medicationName">Medicamento</Label>
                      <Input
                        id="medicationName"
                        value={actionForm.medication.name}
                        onChange={(e) =>
                          setActionForm((prev) => ({
                            ...prev,
                            medication: {
                              ...prev.medication,
                              name: e.target.value,
                            },
                          }))
                        }
                        placeholder="Nome do medicamento"
                      />
                    </div>
                    <div>
                      <Label htmlFor="medicationDosage">Dosagem</Label>
                      <Input
                        id="medicationDosage"
                        value={actionForm.medication.dosage}
                        onChange={(e) =>
                          setActionForm((prev) => ({
                            ...prev,
                            medication: {
                              ...prev.medication,
                              dosage: e.target.value,
                            },
                          }))
                        }
                        placeholder="Ex: 10mg, 1 ampola..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="administeredBy">Administrado por</Label>
                      <Input
                        id="administeredBy"
                        value={actionForm.medication.administeredBy}
                        onChange={(e) =>
                          setActionForm((prev) => ({
                            ...prev,
                            medication: {
                              ...prev.medication,
                              administeredBy: e.target.value,
                            },
                          }))
                        }
                        placeholder="Nome do profissional"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {actionType === "escalate" && (
              <div>
                <Label htmlFor="escalationReason">Motivo da Escalação</Label>
                <Textarea
                  id="escalationReason"
                  value={actionForm.escalationReason}
                  onChange={(e) =>
                    setActionForm((prev) => ({
                      ...prev,
                      escalationReason: e.target.value,
                    }))
                  }
                  placeholder="Descreva o motivo da escalação..."
                  rows={3}
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Observações Adicionais</Label>
              <Textarea
                id="notes"
                value={actionForm.notes}
                onChange={(e) =>
                  setActionForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Observações sobre a ação realizada..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsActionDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEmergencyAction}
              disabled={
                (actionType === "update" && !actionForm.action) ||
                (actionType === "escalate" && !actionForm.escalationReason)
              }
            >
              {actionType === "update" && "Registrar Ação"}
              {actionType === "escalate" && "Escalar Emergência"}
              {actionType === "resolve" && "Resolver Emergência"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyProtocolsManager;
