"use client";

import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  Activity,
  AlertTriangle,
  Bone,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Ear,
  Edit,
  Eye,
  FileText,
  Filter,
  Heart,
  History,
  Lungs,
  Minus,
  Pill,
  Plus,
  Search,
  Shield,
  Siren,
  Stethoscope,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Checkbox } from "@/components/ui/checkbox";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";

// Types
interface MedicalHistory {
  id: string;
  patientId: string;
  clinicId: string;
  category: string;
  subcategory?: string;
  conditionName: string;
  description?: string;
  severity?: string;
  status: string;
  onsetDate?: Date;
  resolutionDate?: Date;
  isChronic: boolean;
  isHereditary: boolean;
  notes?: string;
  relatedRecords: string[];
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MedicalHistoryManagerProps {
  patientId: string;
  clinicId: string;
  onHistoryUpdate?: (history: MedicalHistory[]) => void;
}

const MEDICAL_CATEGORIES = [
  {
    value: "cardiovascular",
    label: "Cardiovascular",
    icon: <Heart className="w-4 h-4" />,
    color: "bg-red-100 text-red-800",
  },
  {
    value: "respiratory",
    label: "Respiratório",
    icon: <Lungs className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "neurological",
    label: "Neurológico",
    icon: <Brain className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "musculoskeletal",
    label: "Musculoesquelético",
    icon: <Bone className="w-4 h-4" />,
    color: "bg-gray-100 text-gray-800",
  },
  {
    value: "gastrointestinal",
    label: "Gastrointestinal",
    icon: <Activity className="w-4 h-4" />,
    color: "bg-green-100 text-green-800",
  },
  {
    value: "endocrine",
    label: "Endócrino",
    icon: <Pill className="w-4 h-4" />,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "dermatological",
    label: "Dermatológico",
    icon: <Shield className="w-4 h-4" />,
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "ophthalmological",
    label: "Oftalmológico",
    icon: <Eye className="w-4 h-4" />,
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    value: "otolaryngological",
    label: "Otorrinolaringológico",
    icon: <Ear className="w-4 h-4" />,
    color: "bg-pink-100 text-pink-800",
  },
  {
    value: "psychiatric",
    label: "Psiquiátrico",
    icon: <Brain className="w-4 h-4" />,
    color: "bg-teal-100 text-teal-800",
  },
  {
    value: "allergies",
    label: "Alergias",
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "bg-red-100 text-red-800",
  },
  {
    value: "medications",
    label: "Medicamentos",
    icon: <Pill className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "surgeries",
    label: "Cirurgias",
    icon: <Activity className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "family_history",
    label: "Histórico Familiar",
    icon: <History className="w-4 h-4" />,
    color: "bg-green-100 text-green-800",
  },
  {
    value: "social_history",
    label: "Histórico Social",
    icon: <FileText className="w-4 h-4" />,
    color: "bg-gray-100 text-gray-800",
  },
  {
    value: "other",
    label: "Outros",
    icon: <FileText className="w-4 h-4" />,
    color: "bg-gray-100 text-gray-800",
  },
];

const SEVERITY_OPTIONS = [
  { value: "mild", label: "Leve", color: "bg-green-100 text-green-800" },
  { value: "moderate", label: "Moderado", color: "bg-yellow-100 text-yellow-800" },
  { value: "severe", label: "Grave", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Crítico", color: "bg-red-100 text-red-800" },
];

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Ativo",
    color: "bg-red-100 text-red-800",
    icon: <Activity className="w-3 h-3" />,
  },
  {
    value: "resolved",
    label: "Resolvido",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  {
    value: "improving",
    label: "Melhorando",
    color: "bg-blue-100 text-blue-800",
    icon: <TrendingUp className="w-3 h-3" />,
  },
  {
    value: "worsening",
    label: "Piorando",
    color: "bg-orange-100 text-orange-800",
    icon: <TrendingDown className="w-3 h-3" />,
  },
  {
    value: "stable",
    label: "Estável",
    color: "bg-gray-100 text-gray-800",
    icon: <Minus className="w-3 h-3" />,
  },
  {
    value: "chronic",
    label: "Crônico",
    color: "bg-purple-100 text-purple-800",
    icon: <Clock className="w-3 h-3" />,
  },
];

export function MedicalHistoryManager({
  patientId,
  clinicId,
  onHistoryUpdate,
}: MedicalHistoryManagerProps) {
  const [histories, setHistories] = useState<MedicalHistory[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<MedicalHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingHistory, setEditingHistory] = useState<MedicalHistory | null>(null);
  const [newHistory, setNewHistory] = useState<Partial<MedicalHistory>>({
    patientId,
    clinicId,
    category: "",
    conditionName: "",
    status: "active",
    isChronic: false,
    isHereditary: false,
    relatedRecords: [],
    metadata: {},
  });

  // Load medical history
  useEffect(() => {
    loadMedicalHistory();
  }, [patientId]);

  // Filter histories
  useEffect(() => {
    let filtered = histories;

    if (searchTerm) {
      filtered = filtered.filter(
        (history) =>
          history.conditionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          history.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          history.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((history) => history.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((history) => history.status === selectedStatus);
    }

    setFilteredHistories(filtered);
  }, [histories, searchTerm, selectedCategory, selectedStatus]);

  const loadMedicalHistory = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockHistories: MedicalHistory[] = [
        {
          id: "1",
          patientId,
          clinicId,
          category: "cardiovascular",
          conditionName: "Hipertensão Arterial",
          description: "Hipertensão arterial sistêmica controlada com medicação",
          severity: "moderate",
          status: "active",
          onsetDate: new Date("2020-01-15"),
          isChronic: true,
          isHereditary: true,
          notes: "Paciente faz uso de Losartana 50mg 1x ao dia",
          relatedRecords: [],
          metadata: { medications: ["Losartana 50mg"] },
          createdBy: "dr-silva",
          createdAt: new Date("2020-01-15"),
          updatedAt: new Date("2024-01-15"),
        },
        {
          id: "2",
          patientId,
          clinicId,
          category: "allergies",
          conditionName: "Alergia à Penicilina",
          description: "Reação alérgica grave à penicilina e derivados",
          severity: "severe",
          status: "active",
          onsetDate: new Date("2015-06-10"),
          isChronic: false,
          isHereditary: false,
          notes: "Evitar prescrição de antibióticos beta-lactâmicos",
          relatedRecords: [],
          metadata: { allergens: ["Penicilina", "Amoxicilina"] },
          createdBy: "dr-silva",
          createdAt: new Date("2015-06-10"),
          updatedAt: new Date("2023-06-10"),
        },
        {
          id: "3",
          patientId,
          clinicId,
          category: "surgeries",
          conditionName: "Apendicectomia",
          description: "Cirurgia de remoção do apêndice por apendicite aguda",
          severity: "moderate",
          status: "resolved",
          onsetDate: new Date("2018-03-22"),
          resolutionDate: new Date("2018-04-15"),
          isChronic: false,
          isHereditary: false,
          notes: "Cirurgia realizada sem complicações. Recuperação completa.",
          relatedRecords: [],
          metadata: { surgeon: "Dr. Santos", hospital: "Hospital Central" },
          createdBy: "dr-santos",
          createdAt: new Date("2018-03-22"),
          updatedAt: new Date("2018-04-15"),
        },
      ];

      setHistories(mockHistories);
      onHistoryUpdate?.(mockHistories);
    } catch (error) {
      console.error("Erro ao carregar histórico médico:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHistory = async () => {
    try {
      const historyData: MedicalHistory = {
        id: editingHistory?.id || crypto.randomUUID(),
        patientId: newHistory.patientId!,
        clinicId: newHistory.clinicId!,
        category: newHistory.category!,
        subcategory: newHistory.subcategory,
        conditionName: newHistory.conditionName!,
        description: newHistory.description,
        severity: newHistory.severity,
        status: newHistory.status!,
        onsetDate: newHistory.onsetDate,
        resolutionDate: newHistory.resolutionDate,
        isChronic: newHistory.isChronic || false,
        isHereditary: newHistory.isHereditary || false,
        notes: newHistory.notes,
        relatedRecords: newHistory.relatedRecords || [],
        metadata: newHistory.metadata || {},
        createdBy: editingHistory?.createdBy || "current-user",
        createdAt: editingHistory?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (editingHistory) {
        setHistories((prev) => prev.map((h) => (h.id === editingHistory.id ? historyData : h)));
      } else {
        setHistories((prev) => [...prev, historyData]);
      }

      setShowAddDialog(false);
      setEditingHistory(null);
      setNewHistory({
        patientId,
        clinicId,
        category: "",
        conditionName: "",
        status: "active",
        isChronic: false,
        isHereditary: false,
        relatedRecords: [],
        metadata: {},
      });
    } catch (error) {
      console.error("Erro ao salvar histórico médico:", error);
    }
  };

  const handleEditHistory = (history: MedicalHistory) => {
    setEditingHistory(history);
    setNewHistory(history);
    setShowAddDialog(true);
  };

  const handleDeleteHistory = async (historyId: string) => {
    if (confirm("Tem certeza que deseja excluir este item do histórico médico?")) {
      setHistories((prev) => prev.filter((h) => h.id !== historyId));
    }
  };

  const getCategoryInfo = (category: string) => {
    return (
      MEDICAL_CATEGORIES.find((cat) => cat.value === category) ||
      MEDICAL_CATEGORIES[MEDICAL_CATEGORIES.length - 1]
    );
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    const severityOption = SEVERITY_OPTIONS.find((opt) => opt.value === severity);
    return <Badge className={severityOption?.color}>{severityOption?.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status);
    return (
      <Badge className={statusOption?.color}>
        <div className="flex items-center space-x-1">
          {statusOption?.icon}
          <span>{statusOption?.label}</span>
        </div>
      </Badge>
    );
  };

  const getTimelineBadge = (history: MedicalHistory) => {
    if (history.status === "resolved" && history.resolutionDate) {
      return (
        <Badge variant="outline" className="text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          Resolvido em {format(history.resolutionDate, "MM/yyyy", { locale: ptBR })}
        </Badge>
      );
    }

    if (history.onsetDate) {
      const years = new Date().getFullYear() - history.onsetDate.getFullYear();
      return (
        <Badge variant="outline" className="text-xs">
          <Clock className="w-3 h-3 mr-1" />
          {years > 0 ? `${years} ano${years > 1 ? "s" : ""}` : "Recente"}
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Histórico Médico</h2>
          <p className="text-gray-600">Condições médicas, alergias e histórico do paciente</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Adicionar Histórico</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingHistory ? "Editar Histórico Médico" : "Novo Histórico Médico"}
              </DialogTitle>
              <DialogDescription>
                {editingHistory
                  ? "Edite as informações do histórico médico"
                  : "Adicione uma nova condição ao histórico médico do paciente"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={newHistory.category}
                    onValueChange={(value) =>
                      setNewHistory((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDICAL_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center space-x-2">
                            {category.icon}
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={newHistory.status}
                    onValueChange={(value) => setNewHistory((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center space-x-2">
                            {status.icon}
                            <span>{status.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditionName">Nome da Condição *</Label>
                <Input
                  id="conditionName"
                  value={newHistory.conditionName || ""}
                  onChange={(e) =>
                    setNewHistory((prev) => ({ ...prev, conditionName: e.target.value }))
                  }
                  placeholder="Ex: Hipertensão Arterial, Diabetes Tipo 2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newHistory.description || ""}
                  onChange={(e) =>
                    setNewHistory((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Descrição detalhada da condição"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severity">Gravidade</Label>
                  <Select
                    value={newHistory.severity || ""}
                    onValueChange={(value) =>
                      setNewHistory((prev) => ({ ...prev, severity: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a gravidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map((severity) => (
                        <SelectItem key={severity.value} value={severity.value}>
                          {severity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoria</Label>
                  <Input
                    id="subcategory"
                    value={newHistory.subcategory || ""}
                    onChange={(e) =>
                      setNewHistory((prev) => ({ ...prev, subcategory: e.target.value }))
                    }
                    placeholder="Subcategoria específica"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="onsetDate">Data de Início</Label>
                  <Input
                    id="onsetDate"
                    type="date"
                    value={newHistory.onsetDate ? format(newHistory.onsetDate, "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setNewHistory((prev) => ({
                        ...prev,
                        onsetDate: e.target.value ? new Date(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resolutionDate">Data de Resolução</Label>
                  <Input
                    id="resolutionDate"
                    type="date"
                    value={
                      newHistory.resolutionDate
                        ? format(newHistory.resolutionDate, "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) =>
                      setNewHistory((prev) => ({
                        ...prev,
                        resolutionDate: e.target.value ? new Date(e.target.value) : undefined,
                      }))
                    }
                    disabled={newHistory.status !== "resolved"}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isChronic"
                    checked={newHistory.isChronic}
                    onCheckedChange={(checked) =>
                      setNewHistory((prev) => ({ ...prev, isChronic: !!checked }))
                    }
                  />
                  <Label htmlFor="isChronic" className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Condição Crônica</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isHereditary"
                    checked={newHistory.isHereditary}
                    onCheckedChange={(checked) =>
                      setNewHistory((prev) => ({ ...prev, isHereditary: !!checked }))
                    }
                  />
                  <Label htmlFor="isHereditary" className="flex items-center space-x-1">
                    <History className="w-4 h-4" />
                    <span>Hereditária</span>
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={newHistory.notes || ""}
                  onChange={(e) => setNewHistory((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações adicionais, medicamentos, tratamentos..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingHistory(null);
                    setNewHistory({
                      patientId,
                      clinicId,
                      category: "",
                      conditionName: "",
                      status: "active",
                      isChronic: false,
                      isHereditary: false,
                      relatedRecords: [],
                      metadata: {},
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveHistory}
                  disabled={!newHistory.category || !newHistory.conditionName || !newHistory.status}
                >
                  {editingHistory ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por condição, descrição ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {MEDICAL_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center space-x-2">
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Carregando histórico médico...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredHistories.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                    ? "Nenhum histórico encontrado"
                    : "Nenhum histórico médico cadastrado"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Adicione condições médicas, alergias e outros itens do histórico"}
                </p>
                {!searchTerm && selectedCategory === "all" && selectedStatus === "all" && (
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Histórico
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredHistories.map((history) => {
            const categoryInfo = getCategoryInfo(history.category);
            return (
              <Card key={history.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={categoryInfo.color}>
                          <div className="flex items-center space-x-1">
                            {categoryInfo.icon}
                            <span>{categoryInfo.label}</span>
                          </div>
                        </Badge>
                        {getStatusBadge(history.status)}
                        {getSeverityBadge(history.severity)}
                        {getTimelineBadge(history)}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {history.conditionName}
                      </h3>

                      {history.description && (
                        <p className="text-gray-600 mb-2">{history.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {history.onsetDate && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Início: {format(history.onsetDate, "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </span>
                        )}
                        {history.resolutionDate && (
                          <span className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>
                              Resolução:{" "}
                              {format(history.resolutionDate, "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </span>
                        )}
                        {history.isChronic && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Crônica</span>
                          </span>
                        )}
                        {history.isHereditary && (
                          <span className="flex items-center space-x-1">
                            <History className="w-4 h-4" />
                            <span>Hereditária</span>
                          </span>
                        )}
                      </div>

                      {history.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Observações:</strong> {history.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditHistory(history)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteHistory(history.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary */}
      {filteredHistories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Resumo do Histórico</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredHistories.length}</div>
                <div className="text-sm text-gray-600">Total de Condições</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredHistories.filter((h) => h.status === "active").length}
                </div>
                <div className="text-sm text-gray-600">Condições Ativas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredHistories.filter((h) => h.isChronic).length}
                </div>
                <div className="text-sm text-gray-600">Condições Crônicas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredHistories.filter((h) => h.category === "allergies").length}
                </div>
                <div className="text-sm text-gray-600">Alergias</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
