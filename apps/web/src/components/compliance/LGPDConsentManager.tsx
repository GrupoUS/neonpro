"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Globe,
  History,
  Lock,
  Mail,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Settings,
  Shield,
  Trash2,
  Unlock,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type {
  LGPDConsentRecord,
  LGPDConsentStatus,
  LGPDConsentType,
  LGPDDataCategory,
  LGPDDataProcessingActivity,
  LGPDProcessingPurpose,
} from "@/lib/compliance/lgpd-consent-management";
import {
  LGPDConsentManagementService,
  LGPDConsentWithdrawalRequest,
  LGPDDataDeletionRequest,
  LGPDDataPortabilityRequest,
  LGPDDataRectificationRequest,
  LGPDLegalBasis,
} from "@/lib/compliance/lgpd-consent-management";

// Initialize LGPD service
const lgpdService = LGPDConsentManagementService.getInstance();

interface LGPDConsentManagerProps {
  className?: string;
}

interface ConsentFormData {
  dataSubjectId: string;
  dataSubjectName: string;
  dataSubjectEmail: string;
  dataSubjectPhone: string;
  processingActivityId: string;
  consentType: LGPDConsentType;
  purposes: LGPDProcessingPurpose[];
  dataCategories: LGPDDataCategory[];
  optionalConsents: { purpose: string; granted: boolean; }[];
  communicationChannel: "web" | "mobile" | "email" | "sms" | "in-person";
}

const CONSENT_TYPE_CONFIG = {
  explicit: {
    label: "Consentimento Explícito",
    description: "Manifestação livre, informada e inequívoca",
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-300",
    icon: CheckCircle,
  },
  implied: {
    label: "Consentimento Implícito",
    description: "Inferido através do comportamento do titular",
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-300",
    icon: AlertTriangle,
  },
  granular: {
    label: "Consentimento Granular",
    description: "Por finalidade específica e categoria de dados",
    bg: "bg-blue-100 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    icon: Settings,
  },
} as const;

const STATUS_CONFIG = {
  given: {
    label: "Concedido",
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-300",
    icon: CheckCircle,
  },
  withdrawn: {
    label: "Retirado",
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-300",
    icon: UserX,
  },
  expired: {
    label: "Expirado",
    bg: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-300",
    icon: Clock,
  },
  renewed: {
    label: "Renovado",
    bg: "bg-blue-100 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    icon: RefreshCw,
  },
} as const;

const LEGAL_BASIS_CONFIG = {
  consent: {
    label: "Consentimento",
    description: "Manifestação livre, informada e inequívoca",
    icon: UserCheck,
    requiresConsent: true,
  },
  contract: {
    label: "Execução de Contrato",
    description: "Necessário para execução de contrato",
    icon: FileText,
    requiresConsent: false,
  },
  "legal-obligation": {
    label: "Cumprimento de Obrigação Legal",
    description: "Exigido por lei ou regulamento",
    icon: Scale,
    requiresConsent: false,
  },
  "vital-interests": {
    label: "Proteção da Vida",
    description: "Proteção da vida ou incolumidade física",
    icon: Shield,
    requiresConsent: false,
  },
  "public-interest": {
    label: "Interesse Público",
    description: "Execução de políticas públicas",
    icon: Globe,
    requiresConsent: false,
  },
  "legitimate-interests": {
    label: "Interesse Legítimo",
    description: "Interesse legítimo do controlador",
    icon: Activity,
    requiresConsent: false,
  },
} as const;

const DATA_CATEGORIES = {
  "identification-data": "Dados de Identificação",
  "contact-data": "Dados de Contato",
  "health-data": "Dados de Saúde",
  "financial-data": "Dados Financeiros",
  "preference-data": "Dados de Preferências",
  "behavioral-data": "Dados Comportamentais",
  "biometric-data": "Dados Biométricos",
  "location-data": "Dados de Localização",
  "transaction-data": "Dados de Transações",
};

const PROCESSING_PURPOSES = {
  "medical-care": "Prestação de Cuidados Médicos",
  "service-provision": "Prestação de Serviços",
  "payment-processing": "Processamento de Pagamentos",
  communication: "Comunicação",
  marketing: "Marketing",
  "legal-obligation": "Cumprimento de Obrigação Legal",
  research: "Pesquisa e Desenvolvimento",
  security: "Segurança",
  accounting: "Contabilidade",
};

export const LGPDConsentManager: React.FC<LGPDConsentManagerProps> = ({
  className,
}) => {
  const [consentRecords, setConsentRecords] = useState<LGPDConsentRecord[]>([]);
  const [processingActivities, setProcessingActivities] = useState<
    LGPDDataProcessingActivity[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LGPDConsentStatus | "all">(
    "all",
  );
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [isConsentDialogOpen, setIsConsentDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<LGPDConsentRecord | null>(null);
  const [withdrawalReason, setWithdrawalReason] = useState("");
  const [complianceScore, setComplianceScore] = useState(0);

  const [formData, setFormData] = useState<ConsentFormData>({
    dataSubjectId: "",
    dataSubjectName: "",
    dataSubjectEmail: "",
    dataSubjectPhone: "",
    processingActivityId: "",
    consentType: "explicit",
    purposes: [],
    dataCategories: [],
    optionalConsents: [],
    communicationChannel: "web",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load processing activities
      const activities = lgpdService.getProcessingActivities();
      setProcessingActivities(activities);

      // Load consent records
      const consents = lgpdService.getConsentRecords();
      setConsentRecords(consents);

      // Calculate compliance score
      calculateComplianceScore(consents, activities);
    } catch (error) {
      console.error("Error loading LGPD data:", error);
      toast.error("Erro ao carregar dados LGPD");
    } finally {
      setLoading(false);
    }
  };

  const calculateComplianceScore = (
    consents: LGPDConsentRecord[],
    activities: LGPDDataProcessingActivity[],
  ) => {
    let score = 100;

    // Check for expired consents
    const expiredConsents = consents.filter((c) => c.status === "expired");
    score -= expiredConsents.length * 5;

    // Check for missing consents for consent-based activities
    const consentBasedActivities = activities.filter(
      (a) => a.legalBasis === "consent",
    );
    const activeConsents = consents.filter((c) => c.status === "given");

    consentBasedActivities.forEach((activity) => {
      const hasActiveConsent = activeConsents.some(
        (c) => c.processingActivityId === activity.id,
      );
      if (!hasActiveConsent) {
        score -= 10;
      }
    });

    setComplianceScore(Math.max(0, score));
  };

  const handleCreateConsent = async () => {
    try {
      const result = await lgpdService.collectConsent(formData.dataSubjectId, {
        processingActivityId: formData.processingActivityId,
        consentType: formData.consentType,
        purposes: formData.purposes,
        dataCategories: formData.dataCategories,
        optionalConsents: formData.optionalConsents,
        communicationChannel: formData.communicationChannel,
        ipAddress: "127.0.0.1", // In real app, get actual IP
        userAgent: navigator.userAgent,
        location: "Web Application",
      });

      if (result.isValid && result.data) {
        setConsentRecords((prev) => [result.data!, ...prev]);
        setIsConsentDialogOpen(false);
        resetForm();
        toast.success("Consentimento registrado com sucesso");

        // Recalculate compliance score
        const activities = lgpdService.getProcessingActivities();
        calculateComplianceScore([result.data, ...consentRecords], activities);
      } else {
        toast.error(result.errors?.[0] || "Erro ao registrar consentimento");
      }
    } catch (error) {
      console.error("Error creating consent:", error);
      toast.error("Erro interno ao registrar consentimento");
    }
  };

  const handleWithdrawConsent = async () => {
    if (!selectedConsent) {
      return;
    }

    try {
      const result = await lgpdService.withdrawConsent(
        selectedConsent.id,
        withdrawalReason || "Solicitação do titular",
      );

      if (result.isValid) {
        // Update local state
        setConsentRecords((prev) =>
          prev.map((consent) =>
            consent.id === selectedConsent.id
              ? { ...consent, status: "withdrawn" as LGPDConsentStatus }
              : consent
          )
        );

        setIsWithdrawalDialogOpen(false);
        setSelectedConsent(null);
        setWithdrawalReason("");
        toast.success("Consentimento retirado com sucesso");

        // Recalculate compliance score
        const activities = lgpdService.getProcessingActivities();
        const updatedConsents = consentRecords.map((c) =>
          c.id === selectedConsent.id
            ? { ...c, status: "withdrawn" as LGPDConsentStatus }
            : c
        );
        calculateComplianceScore(updatedConsents, activities);
      } else {
        toast.error(result.errors?.[0] || "Erro ao retirar consentimento");
      }
    } catch (error) {
      console.error("Error withdrawing consent:", error);
      toast.error("Erro interno ao retirar consentimento");
    }
  };

  const handleDataSubjectRequest = async (
    type: "access" | "portability" | "deletion" | "rectification",
  ) => {
    try {
      // This would typically show a form to collect request details
      const result = await lgpdService.processDataSubjectRightsRequest(
        type,
        "demo-subject-id", // In real app, get from user selection
        {},
      );

      if (result.isValid) {
        toast.success(
          `Solicitação de ${
            type === "access"
              ? "acesso"
              : type === "portability"
              ? "portabilidade"
              : type === "deletion"
              ? "exclusão"
              : "retificação"
          } processada com sucesso`,
        );
      } else {
        toast.error(result.errors?.[0] || "Erro ao processar solicitação");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error("Erro interno ao processar solicitação");
    }
  };

  const resetForm = () => {
    setFormData({
      dataSubjectId: "",
      dataSubjectName: "",
      dataSubjectEmail: "",
      dataSubjectPhone: "",
      processingActivityId: "",
      consentType: "explicit",
      purposes: [],
      dataCategories: [],
      optionalConsents: [],
      communicationChannel: "web",
    });
  };

  const filteredConsentRecords = consentRecords.filter((consent) => {
    const matchesSearch = consent.dataSubjectId
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || consent.status === statusFilter;
    const matchesActivity = activityFilter === "all"
      || consent.processingActivityId === activityFilter;
    return matchesSearch && matchesStatus && matchesActivity;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) {
      return "text-green-600";
    }
    if (score >= 70) {
      return "text-yellow-600";
    }
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados LGPD...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Gestão de Consentimento LGPD
          </h2>
          <p className="text-muted-foreground">
            Controle de consentimentos e direitos dos titulares de dados
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div
              className={cn(
                "text-2xl font-bold",
                getScoreColor(complianceScore),
              )}
            >
              {complianceScore}%
            </div>
            <div className="text-sm text-muted-foreground">Conformidade</div>
            <Progress value={complianceScore} className="w-20 h-2 mt-1" />
          </div>
          <Dialog
            open={isConsentDialogOpen}
            onOpenChange={setIsConsentDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Consentimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Novo Consentimento</DialogTitle>
                <DialogDescription>
                  Coletar consentimento para processamento de dados pessoais
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Data Subject Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Dados do Titular</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dataSubjectName">Nome Completo</Label>
                      <Input
                        id="dataSubjectName"
                        value={formData.dataSubjectName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dataSubjectName: e.target.value,
                          }))}
                        placeholder="Nome completo do titular"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dataSubjectId">CPF/Documento</Label>
                      <Input
                        id="dataSubjectId"
                        value={formData.dataSubjectId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dataSubjectId: e.target.value,
                          }))}
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dataSubjectEmail">E-mail</Label>
                      <Input
                        id="dataSubjectEmail"
                        type="email"
                        value={formData.dataSubjectEmail}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dataSubjectEmail: e.target.value,
                          }))}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dataSubjectPhone">Telefone</Label>
                      <Input
                        id="dataSubjectPhone"
                        value={formData.dataSubjectPhone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dataSubjectPhone: e.target.value,
                          }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                {/* Processing Activity */}
                <div className="space-y-4">
                  <h4 className="font-medium">Atividade de Processamento</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="processingActivity">Atividade</Label>
                      <Select
                        value={formData.processingActivityId}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            processingActivityId: value,
                          }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a atividade" />
                        </SelectTrigger>
                        <SelectContent>
                          {processingActivities.map((activity) => (
                            <SelectItem key={activity.id} value={activity.id}>
                              <div className="flex flex-col">
                                <span>{activity.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {activity.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="consentType">Tipo de Consentimento</Label>
                      <Select
                        value={formData.consentType}
                        onValueChange={(value: LGPDConsentType) =>
                          setFormData((prev) => ({
                            ...prev,
                            consentType: value,
                          }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de consentimento" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CONSENT_TYPE_CONFIG).map(
                            ([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <config.icon className="h-4 w-4" />
                                  {config.label}
                                </div>
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Data Categories */}
                <div className="space-y-4">
                  <h4 className="font-medium">Categorias de Dados</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(DATA_CATEGORIES).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={formData.dataCategories.includes(key as unknown)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData((prev) => ({
                                ...prev,
                                dataCategories: [
                                  ...prev.dataCategories,
                                  key as unknown,
                                ],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                dataCategories: prev.dataCategories.filter(
                                  (cat) =>
                                    cat !== key,
                                ),
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={key} className="text-sm">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Processing Purposes */}
                <div className="space-y-4">
                  <h4 className="font-medium">Finalidades do Processamento</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(PROCESSING_PURPOSES).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={formData.purposes.includes(key as unknown)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData((prev) => ({
                                ...prev,
                                purposes: [...prev.purposes, key as unknown],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                purposes: prev.purposes.filter(
                                  (purpose) =>
                                    purpose !== key,
                                ),
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={key} className="text-sm">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Communication Channel */}
                <div className="space-y-4">
                  <h4 className="font-medium">Canal de Comunicação</h4>
                  <Select
                    value={formData.communicationChannel}
                    onValueChange={(value: unknown) =>
                      setFormData((prev) => ({
                        ...prev,
                        communicationChannel: value,
                      }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="in-person">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsConsentDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateConsent}
                  disabled={!formData.dataSubjectId
                    || !formData.processingActivityId
                    || formData.dataCategories.length === 0}
                >
                  Registrar Consentimento
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
            placeholder="Buscar por CPF, nome ou ID do titular..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: LGPDConsentStatus | "all") => setStatusFilter(value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="given">Concedido</SelectItem>
            <SelectItem value="withdrawn">Retirado</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
            <SelectItem value="renewed">Renovado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activityFilter} onValueChange={setActivityFilter}>
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Atividades</SelectItem>
            {processingActivities.map((activity) => (
              <SelectItem key={activity.id} value={activity.id}>
                {activity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="consents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Consents Tab */}
        <TabsContent value="consents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Registros de Consentimento
              </CardTitle>
              <CardDescription>
                Histórico completo de consentimentos coletados e gerenciados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titular</TableHead>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsentRecords.map((consent) => {
                    const activity = processingActivities.find(
                      (a) => a.id === consent.processingActivityId,
                    );
                    const statusConfig = STATUS_CONFIG[consent.status];
                    const consentTypeConfig = CONSENT_TYPE_CONFIG[consent.consentType];
                    const StatusIcon = statusConfig.icon;
                    const ConsentIcon = consentTypeConfig.icon;

                    return (
                      <TableRow key={consent.id}>
                        <TableCell>
                          <div className="font-medium">
                            ID: {consent.dataSubjectId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">
                              {activity?.name || "Atividade não encontrada"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Base legal: {activity?.legalBasis}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "flex items-center gap-2 px-2 py-1 rounded-md w-fit text-xs",
                                    consentTypeConfig.bg,
                                    consentTypeConfig.text,
                                  )}
                                >
                                  <ConsentIcon className="h-3 w-3" />
                                  {consentTypeConfig.label}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {consentTypeConfig.description}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <div
                            className={cn(
                              "flex items-center gap-2 text-sm",
                              statusConfig.text,
                            )}
                          >
                            <StatusIcon className="h-4 w-4" />
                            {statusConfig.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {consent.consentDate.toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {consent.expirationDate
                              ? consent.expirationDate.toLocaleDateString(
                                "pt-BR",
                              )
                              : "Indefinida"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {consent.status === "given" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedConsent(consent);
                                  setIsWithdrawalDialogOpen(true);
                                }}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processingActivities.map((activity) => {
              const legalBasisConfig = LEGAL_BASIS_CONFIG[activity.legalBasis];
              const LegalIcon = legalBasisConfig.icon;
              const activeConsents = consentRecords.filter(
                (c) =>
                  c.processingActivityId === activity.id
                  && c.status === "given",
              ).length;

              return (
                <Card key={activity.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {activity.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {activity.description}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={activity.isActive ? "bg-green-50" : "bg-red-50"}
                      >
                        {activity.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <LegalIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Base Legal:</span>
                      <span className="text-sm">{legalBasisConfig.label}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Categorias de Dados:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {activity.dataCategories.map((category) => (
                          <Badge
                            key={category}
                            variant="secondary"
                            className="text-xs"
                          >
                            {DATA_CATEGORIES[category]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Finalidades:</div>
                      <div className="flex flex-wrap gap-1">
                        {activity.processingPurposes.map((purpose) => (
                          <Badge
                            key={purpose}
                            variant="outline"
                            className="text-xs"
                          >
                            {PROCESSING_PURPOSES[purpose]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        Consentimentos ativos: {activeConsents}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Retenção: {activity.retentionPeriod}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => handleDataSubjectRequest("access")}
            >
              <Eye className="h-6 w-6" />
              <span>Solicitar Acesso</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => handleDataSubjectRequest("portability")}
            >
              <Download className="h-6 w-6" />
              <span>Portabilidade</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => handleDataSubjectRequest("deletion")}
            >
              <Trash2 className="h-6 w-6" />
              <span>Exclusão</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => handleDataSubjectRequest("rectification")}
            >
              <Edit className="h-6 w-6" />
              <span>Retificação</span>
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Direitos dos Titulares</AlertTitle>
            <AlertDescription>
              Os titulares de dados têm direito ao acesso, correção, portabilidade e eliminação de
              seus dados pessoais, conforme previsto na LGPD. As solicitações devem ser atendidas em
              até 15 dias.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {consentRecords.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Consentimentos
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
                    <p className="text-2xl font-bold">
                      {consentRecords.filter((c) => c.status === "given")
                        .length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Consentimentos Ativos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {consentRecords.filter((c) => c.status === "withdrawn")
                        .length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Consentimentos Retirados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {consentRecords.filter((c) => c.status === "expired")
                        .length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Consentimentos Expirados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Conformidade</CardTitle>
              <CardDescription>
                Gerar relatórios de conformidade com a LGPD e auditorias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Relatório de Consentimentos
                </Button>
                <Button variant="outline">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Registro de Atividades
                </Button>
                <Button variant="outline">
                  <Scale className="h-4 w-4 mr-2" />
                  Auditoria LGPD
                </Button>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Score de Conformidade Atual:{" "}
                  <span
                    className={cn("font-bold", getScoreColor(complianceScore))}
                  >
                    {complianceScore}%
                  </span>
                  {complianceScore < 90 && (
                    <span className="block mt-2 text-sm">
                      • {consentRecords.filter((c) => c.status === "expired")
                            .length > 0 && "Renovar consentimentos expirados"}
                      • {consentRecords.filter((c) => c.status === "given")
                            .length === 0
                        && "Coletar consentimentos para atividades obrigatórias"}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdrawal Dialog */}
      <Dialog
        open={isWithdrawalDialogOpen}
        onOpenChange={setIsWithdrawalDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirar Consentimento</DialogTitle>
            <DialogDescription>
              Confirmar a retirada do consentimento para o titular de dados
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="withdrawalReason">
                Motivo da Retirada (opcional)
              </Label>
              <Textarea
                id="withdrawalReason"
                value={withdrawalReason}
                onChange={(e) => setWithdrawalReason(e.target.value)}
                placeholder="Descreva o motivo da retirada do consentimento..."
                rows={3}
              />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                A retirada do consentimento será efetiva imediatamente e pode impactar a prestação
                de alguns serviços.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsWithdrawalDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleWithdrawConsent}>
              Confirmar Retirada
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LGPDConsentManager;
