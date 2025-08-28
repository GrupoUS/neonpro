"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Package,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import type {
  ControlledPrescription,
  ControlledPrescriptionStatus,
  ControlledSubstance,
  ControlledSubstanceClass,
  PrescriptionType,
} from "@/lib/compliance/anvisa-controlled-substances";
import {
  ANVISAControlledSubstancesService,
  ANVISAValidationResult,
} from "@/lib/compliance/anvisa-controlled-substances";

// Initialize ANVISA service
const anvisaService = ANVISAControlledSubstancesService.getInstance();

interface ANVISATrackerProps {
  className?: string;
}

interface PrescriptionFormData {
  patientId: string;
  patientName: string;
  patientCpf: string;
  professionalId: string;
  professionalName: string;
  professionalCrm: string;
  substanceId: string;
  quantity: number;
  dosage: string;
  instructions: string;
  prescriptionType: PrescriptionType;
  validityDays: number;
  specialAuthorization?: string;
}

const SUBSTANCE_CLASS_CONFIG = {
  A1: {
    label: "Classe A1 (Narcóticos)",
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-300",
    icon: AlertTriangle,
    description: "Substâncias de controle especial - Lista A1",
  },
  A2: {
    label: "Classe A2 (Psicotrópicos)",
    bg: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-300",
    icon: AlertCircle,
    description: "Substâncias psicotrópicas - Lista A2",
  },
  A3: {
    label: "Classe A3 (Imunossupressores)",
    bg: "bg-purple-100 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-300",
    icon: Shield,
    description: "Substâncias imunossupressoras - Lista A3",
  },
  B1: {
    label: "Classe B1 (Psicotrópicos)",
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-300",
    icon: Activity,
    description: "Substâncias psicotrópicas - Lista B1",
  },
  B2: {
    label: "Classe B2 (Psicotrópicos)",
    bg: "bg-blue-100 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    icon: Package,
    description: "Substâncias psicotrópicas anorexígenas - Lista B2",
  },
  C1: {
    label: "Classe C1 (Ret. Especial)",
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-300",
    icon: CheckCircle,
    description: "Outras substâncias sujeitas a controle especial - Lista C1",
  },
  C2: {
    label: "Classe C2 (Ret. Comum)",
    bg: "bg-gray-100 dark:bg-gray-900/20",
    text: "text-gray-700 dark:text-gray-300",
    icon: FileText,
    description: "Substâncias retinóicas de uso tópico - Lista C2",
  },
} as const;

const STATUS_CONFIG = {
  active: {
    label: "Ativo",
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-300",
    icon: CheckCircle,
  },
  expired: {
    label: "Expirado",
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-300",
    icon: AlertTriangle,
  },
  used: {
    label: "Utilizado",
    bg: "bg-gray-100 dark:bg-gray-900/20",
    text: "text-gray-700 dark:text-gray-300",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelado",
    bg: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-300",
    icon: AlertCircle,
  },
} as const;

export const ANVISATracker: React.FC<ANVISATrackerProps> = ({ className }) => {
  const [substances, setSubstances] = useState<ControlledSubstance[]>([]);
  const [prescriptions, setPrescriptions] = useState<ControlledPrescription[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<
    ControlledSubstanceClass | "all"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    ControlledPrescriptionStatus | "all"
  >("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<ControlledPrescription | null>(
    null,
  );

  const [formData, setFormData] = useState<PrescriptionFormData>({
    patientId: "",
    patientName: "",
    patientCpf: "",
    professionalId: "",
    professionalName: "",
    professionalCrm: "",
    substanceId: "",
    quantity: 1,
    dosage: "",
    instructions: "",
    prescriptionType: "common",
    validityDays: 30,
    specialAuthorization: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load controlled substances
      const substancesResult = await anvisaService.getControlledSubstances();
      if (substancesResult.isValid && substancesResult.data) {
        setSubstances(substancesResult.data);
      }

      // Load prescriptions (mock data for demo - in real app would fetch from API)
      const mockPrescriptions: ControlledPrescription[] = [
        {
          id: "presc-001",
          patientId: "pat-001",
          patientName: "Maria Silva Santos",
          patientCpf: "123.456.789-00",
          professionalId: "prof-001",
          professionalName: "Dr. João Oliveira",
          professionalCrm: "CRM/SP 123456",
          substanceId: "sub-001",
          quantity: 30,
          dosage: "10mg",
          instructions: "Tomar 1 comprimido pela manhã",
          prescriptionDate: new Date("2024-01-15"),
          validUntil: new Date("2024-02-14"),
          prescriptionType: "A-yellow",
          status: "active",
          specialAuthorization: "AUT-2024-001",
        },
        {
          id: "presc-002",
          patientId: "pat-002",
          patientName: "Carlos Eduardo Lima",
          patientCpf: "987.654.321-00",
          professionalId: "prof-002",
          professionalName: "Dra. Ana Costa",
          professionalCrm: "CRM/RJ 654321",
          substanceId: "sub-002",
          quantity: 60,
          dosage: "5mg",
          instructions: "Tomar 2 comprimidos ao deitar",
          prescriptionDate: new Date("2024-01-10"),
          validUntil: new Date("2024-02-09"),
          prescriptionType: "B-blue",
          status: "used",
          dispensedDate: new Date("2024-01-25"),
          dispensedQuantity: 60,
        },
      ];
      setPrescriptions(mockPrescriptions);
    } catch (error) {
      console.error("Error loading ANVISA data:", error);
      toast.error("Erro ao carregar dados da ANVISA");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = async () => {
    try {
      const result = await anvisaService.createControlledPrescription({
        patientId: formData.patientId,
        patientName: formData.patientName,
        patientCpf: formData.patientCpf,
        professionalId: formData.professionalId,
        professionalName: formData.professionalName,
        professionalCrm: formData.professionalCrm,
        substanceId: formData.substanceId,
        quantity: formData.quantity,
        dosage: formData.dosage,
        instructions: formData.instructions,
        validUntil: new Date(
          Date.now() + formData.validityDays * 24 * 60 * 60 * 1000,
        ),
        prescriptionType: formData.prescriptionType,
        specialAuthorization: formData.specialAuthorization,
      });

      if (result.isValid && result.data) {
        setPrescriptions((prev) => [result.data!, ...prev]);
        setIsCreateDialogOpen(false);
        resetForm();
        toast.success("Receita controlada criada com sucesso");
      } else {
        toast.error(result.errors?.[0] || "Erro ao criar receita controlada");
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast.error("Erro interno ao criar receita");
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      patientName: "",
      patientCpf: "",
      professionalId: "",
      professionalName: "",
      professionalCrm: "",
      substanceId: "",
      quantity: 1,
      dosage: "",
      instructions: "",
      prescriptionType: "common",
      validityDays: 30,
      specialAuthorization: "",
    });
  };

  const filteredSubstances = substances.filter((substance) => {
    const matchesSearch = substance.name.toLowerCase().includes(searchTerm.toLowerCase())
      || substance.activeIngredient
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "all" || substance.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch = prescription.patientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
      || prescription.professionalName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados da ANVISA...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Controle ANVISA</h2>
          <p className="text-muted-foreground">
            Gestão de substâncias controladas e prescrições especiais
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Receita Controlada</DialogTitle>
              <DialogDescription>
                Criar uma nova receita para substância controlada ANVISA
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Patient Information */}
              <div className="space-y-4">
                <h4 className="font-medium">Dados do Paciente</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientName">Nome do Paciente</Label>
                    <Input
                      id="patientName"
                      value={formData.patientName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          patientName: e.target.value,
                        }))}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientCpf">CPF do Paciente</Label>
                    <Input
                      id="patientCpf"
                      value={formData.patientCpf}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          patientCpf: e.target.value,
                        }))}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h4 className="font-medium">Dados do Profissional</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="professionalName">
                      Nome do Profissional
                    </Label>
                    <Input
                      id="professionalName"
                      value={formData.professionalName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          professionalName: e.target.value,
                        }))}
                      placeholder="Dr./Dra. Nome"
                    />
                  </div>
                  <div>
                    <Label htmlFor="professionalCrm">CRM</Label>
                    <Input
                      id="professionalCrm"
                      value={formData.professionalCrm}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          professionalCrm: e.target.value,
                        }))}
                      placeholder="CRM/UF 123456"
                    />
                  </div>
                </div>
              </div>

              {/* Prescription Details */}
              <div className="space-y-4">
                <h4 className="font-medium">Detalhes da Prescrição</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="substanceId">Substância Controlada</Label>
                    <Select
                      value={formData.substanceId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, substanceId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a substância" />
                      </SelectTrigger>
                      <SelectContent>
                        {substances.map((substance) => (
                          <SelectItem key={substance.id} value={substance.id}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {substance.class}
                              </Badge>
                              {substance.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="prescriptionType">Tipo de Receita</Label>
                    <Select
                      value={formData.prescriptionType}
                      onValueChange={(value: PrescriptionType) =>
                        setFormData((prev) => ({
                          ...prev,
                          prescriptionType: value,
                        }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de receita" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A-yellow">
                          Receita A (Amarela)
                        </SelectItem>
                        <SelectItem value="B-blue">Receita B (Azul)</SelectItem>
                        <SelectItem value="common">Receita Comum</SelectItem>
                        <SelectItem value="special">
                          Receita Especial
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          quantity: parseInt(e.target.value) || 1,
                        }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dosage">Dosagem</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dosage: e.target.value,
                        }))}
                      placeholder="10mg, 5ml, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="validityDays">Validade (dias)</Label>
                    <Input
                      id="validityDays"
                      type="number"
                      min="1"
                      max="60"
                      value={formData.validityDays}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          validityDays: parseInt(e.target.value) || 30,
                        }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="instructions">Instruções de Uso</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))}
                    placeholder="Instruções detalhadas para o paciente"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="specialAuthorization">
                    Autorização Especial (opcional)
                  </Label>
                  <Input
                    id="specialAuthorization"
                    value={formData.specialAuthorization}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        specialAuthorization: e.target.value,
                      }))}
                    placeholder="Número da autorização especial"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreatePrescription}
                disabled={!formData.patientName || !formData.substanceId}
              >
                Criar Receita
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar substâncias, pacientes ou profissionais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={classFilter}
          onValueChange={(value: ControlledSubstanceClass | "all") => setClassFilter(value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Classes</SelectItem>
            <SelectItem value="A1">Classe A1</SelectItem>
            <SelectItem value="A2">Classe A2</SelectItem>
            <SelectItem value="A3">Classe A3</SelectItem>
            <SelectItem value="B1">Classe B1</SelectItem>
            <SelectItem value="B2">Classe B2</SelectItem>
            <SelectItem value="C1">Classe C1</SelectItem>
            <SelectItem value="C2">Classe C2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="prescriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prescriptions">Receitas Controladas</TabsTrigger>
          <TabsTrigger value="substances">Substâncias</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Select
              value={statusFilter}
              onValueChange={(value: ControlledPrescriptionStatus | "all") =>
                setStatusFilter(value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="used">Utilizado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Receitas Controladas
              </CardTitle>
              <CardDescription>
                Lista de receitas para substâncias controladas pela ANVISA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Substância</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions.map((prescription) => {
                    const substance = substances.find(
                      (s) => s.id === prescription.substanceId,
                    );
                    const statusConfig = STATUS_CONFIG[prescription.status];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <TableRow key={prescription.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {prescription.patientName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              CPF: {prescription.patientCpf}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {prescription.professionalName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {prescription.professionalCrm}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {substance && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        SUBSTANCE_CLASS_CONFIG[substance.class]
                                          ?.bg,
                                        SUBSTANCE_CLASS_CONFIG[substance.class]
                                          ?.text,
                                      )}
                                    >
                                      {substance.class}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {SUBSTANCE_CLASS_CONFIG[substance.class]
                                      ?.description}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <div>
                              <div className="font-medium text-sm">
                                {substance?.name || "Substância não encontrada"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {prescription.quantity} unidades - {prescription.dosage}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {prescription.prescriptionType}
                          </Badge>
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
                            {prescription.validUntil.toLocaleDateString(
                              "pt-BR",
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
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

        {/* Substances Tab */}
        <TabsContent value="substances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Substâncias Controladas
              </CardTitle>
              <CardDescription>
                Cadastro de substâncias controladas pela ANVISA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Princípio Ativo</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Concentração</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubstances.map((substance) => {
                    const classConfig = SUBSTANCE_CLASS_CONFIG[substance.class];
                    const ClassIcon = classConfig?.icon || Pill;

                    return (
                      <TableRow key={substance.id}>
                        <TableCell className="font-medium">
                          {substance.name}
                        </TableCell>
                        <TableCell>{substance.activeIngredient}</TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "flex items-center gap-2 px-2 py-1 rounded-md w-fit text-sm",
                                    classConfig?.bg,
                                    classConfig?.text,
                                  )}
                                >
                                  <ClassIcon className="h-4 w-4" />
                                  {classConfig?.label}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {classConfig?.description}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>{substance.concentration}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={substance.isActive
                              ? "text-green-700 bg-green-50"
                              : "text-red-700 bg-red-50"}
                          >
                            {substance.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{prescriptions.length}</p>
                    <p className="text-sm text-muted-foreground">
                      Total de Receitas
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
                      {prescriptions.filter((p) => p.status === "active")
                        .length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receitas Ativas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {prescriptions.filter((p) => p.status === "expired")
                        .length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receitas Expiradas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios ANVISA</CardTitle>
              <CardDescription>
                Gerar relatórios de controle de substâncias para ANVISA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Os relatórios são gerados automaticamente e devem ser enviados mensalmente para a
                  ANVISA. Certifique-se de que todas as receitas estão devidamente registradas.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Relatório Mensal
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Balanço de Substâncias
                </Button>
                <Button variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Controle de Estoque
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ANVISATracker;
