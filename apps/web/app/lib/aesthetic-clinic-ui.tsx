"use client";

import React, { useState } from "react";
import {
  Calendar,
  Camera,
  FileText,
  Monitor,
  Plus,
  Search,
  Filter,
  Syringe,
  MapPin,
  Clock,
  AlertCircle,
  Save,
  Users,
  Minus,
  Eye,
  Download,
  Settings,
  Package,
  TrendingUp,
  BarChart3,
  Activity,
  Stethoscope,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Separator,
  Switch,
  Alert,
  Progress,
} from "@neonpro/ui";

// =====================================================
// TYPES AND INTERFACES
// =====================================================

interface Treatment {
  id: string;
  type: "botox" | "filler" | "laser" | "skincare" | "body-contouring";
  patientName: string;
  patientId: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  date: string;
  practitioner: string;
  area: string;
  nextSession?: string;
  units?: number;
  photos?: number;
  sessionsCompleted: number;
  totalSessions: number;
  priority: "low" | "medium" | "high";
  price?: number;
}

interface TreatmentArea {
  id: string;
  name: string;
  units: number;
  notes: string;
}

interface Product {
  id: string;
  name: string;
  category: "botox" | "filler" | "laser-consumable" | "skincare" | "equipment";
  brand: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lotNumber?: string;
  expiryDate?: string;
  supplier: string;
  lastRestock: string;
  cost: number;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  consultationPreferences: {
    preferredTime: string;
    communicationMethod: "email" | "sms" | "whatsapp" | "phone";
    reminderFrequency: "none" | "day-before" | "week-before" | "both";
  };
  treatmentHistory: Treatment[];
  totalSpent: number;
  loyaltyPoints: number;
  consentForms: string[];
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  treatmentType: string;
  date: string;
  time: string;
  duration: number;
  practitioner: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  notes?: string;
  isFollowUp: boolean;
}

// =====================================================
// MOCK DATA
// =====================================================

const mockTreatments: Treatment[] = [
  {
    id: "1",
    type: "botox",
    patientName: "Ana Silva",
    patientId: "pat_001",
    status: "scheduled",
    date: "2024-08-20",
    practitioner: "Dr. Maria Santos",
    area: "Glabella",
    nextSession: "2024-11-20",
    units: 20,
    photos: 3,
    sessionsCompleted: 0,
    totalSessions: 1,
    priority: "medium",
    price: 800,
  },
  {
    id: "2",
    type: "filler",
    patientName: "Carla Rodrigues",
    patientId: "pat_002",
    status: "in-progress",
    date: "2024-08-18",
    practitioner: "Dr. João Lima",
    area: "Lábios",
    nextSession: "2024-09-18",
    units: 15,
    photos: 5,
    sessionsCompleted: 1,
    totalSessions: 3,
    priority: "high",
    price: 1200,
  },
  {
    id: "3",
    type: "laser",
    patientName: "Beatriz Costa",
    patientId: "pat_003",
    status: "completed",
    date: "2024-08-15",
    practitioner: "Dr. Pedro Oliveira",
    area: "Face Completa",
    photos: 8,
    sessionsCompleted: 6,
    totalSessions: 6,
    priority: "low",
    price: 2400,
  },
];

const mockProducts: Product[] = [
  {
    id: "prod_001",
    name: "Botox 100U",
    category: "botox",
    brand: "Allergan",
    currentStock: 15,
    minStock: 5,
    maxStock: 50,
    unit: "frascos",
    lotNumber: "BOT2024081",
    expiryDate: "2025-08-01",
    supplier: "Farmácia Especializada",
    lastRestock: "2024-07-15",
    cost: 450,
  },
  {
    id: "prod_002",
    name: "Ácido Hialurônico 1ml",
    category: "filler",
    brand: "Juvederm",
    currentStock: 8,
    minStock: 10,
    maxStock: 30,
    unit: "seringas",
    lotNumber: "JUV2024075",
    expiryDate: "2025-12-01",
    supplier: "Distribuidora Médica",
    lastRestock: "2024-08-01",
    cost: 350,
  },
  {
    id: "prod_003",
    name: "Gel Condutor Laser",
    category: "laser-consumable",
    brand: "LaserTech",
    currentStock: 25,
    minStock: 15,
    maxStock: 100,
    unit: "tubos",
    supplier: "Equipamentos Laser",
    lastRestock: "2024-08-10",
    cost: 45,
  },
];

const mockPatients: Patient[] = [
  {
    id: "pat_001",
    name: "Ana Silva",
    email: "ana.silva@email.com",
    phone: "(11) 99999-9999",
    dateOfBirth: "1985-03-15",
    gender: "female",
    medicalHistory: ["Rinoplastia (2020)", "Cirurgia de vesícula (2018)"],
    allergies: ["Penicilina"],
    currentMedications: ["Vitamina D", "Anticoncepcional"],
    emergencyContact: {
      name: "João Silva",
      phone: "(11) 88888-8888",
      relationship: "Esposo",
    },
    consultationPreferences: {
      preferredTime: "manhã",
      communicationMethod: "whatsapp",
      reminderFrequency: "day-before",
    },
    treatmentHistory: [],
    totalSpent: 2400,
    loyaltyPoints: 240,
    consentForms: ["botox-consent-2024"],
  },
];

const mockAppointments: Appointment[] = [
  {
    id: "app_001",
    patientId: "pat_001",
    patientName: "Ana Silva",
    treatmentType: "Botox - Glabella",
    date: "2024-08-20",
    time: "14:30",
    duration: 60,
    practitioner: "Dr. Maria Santos",
    status: "confirmed",
    notes: "Primeira aplicação de botox",
    isFollowUp: false,
  },
  {
    id: "app_002",
    patientId: "pat_002",
    patientName: "Carla Rodrigues",
    treatmentType: "Preenchimento Labial",
    date: "2024-08-21",
    time: "10:00",
    duration: 90,
    practitioner: "Dr. João Lima",
    status: "confirmed",
    notes: "Segunda sessão do tratamento",
    isFollowUp: true,
  },
];

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const treatmentTypes = [
  { value: "botox", label: "Toxina Botulínica", unitType: "Unidades", color: "blue" },
  { value: "filler", label: "Preenchimento", unitType: "ml", color: "purple" },
  { value: "laser", label: "Laser", unitType: "Disparos", color: "red" },
  { value: "skincare", label: "Skincare", unitType: "Aplicações", color: "green" },
  { value: "body-contouring", label: "Contorno Corporal", unitType: "Sessões", color: "orange" },
];

const commonAreas = {
  face: [
    "Glabela",
    "Testa",
    "Pés de Galinha",
    "Código de Barras",
    "Lábios",
    "Sulco Nasogeniano",
    "Bigode Chinês",
    "Malar",
    "Região Temporal",
    "Rugas Periorais",
    "Masseter",
  ],
  body: [
    "Abdômen",
    "Flancos",
    "Coxas",
    "Braços",
    "Papada",
    "Culote",
    "Costas",
    "Peitoral",
    "Joelhos",
    "Axilas",
  ],
};

const contraindications = [
  "Gravidez ou amamentação",
  "Infecção ativa na área",
  "Histórico de reações alérgicas",
  "Uso de anticoagulantes",
  "Distúrbios neuromusculares",
  "Histórico de queloides",
  "Herpes labial ativo",
  "Diabetes descontrolado",
  "Imunossupressão",
];

const getTreatmentTypeColor = (type: Treatment["type"]) => {
  const colors = {
    botox: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    filler: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    laser: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    skincare: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "body-contouring": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  };
  return colors[type];
};

const getStatusColor = (status: Treatment["status"]) => {
  const colors = {
    scheduled: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[status];
};

const getPriorityColor = (priority: Treatment["priority"]) => {
  const colors = {
    low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[priority];
};

const getStockStatus = (current: number, min: number) => {
  if (current <= min) return { status: "low", color: "bg-red-100 text-red-800" };
  if (current <= min * 2) return { status: "medium", color: "bg-yellow-100 text-yellow-800" };
  return { status: "good", color: "bg-green-100 text-green-800" };
};

// =====================================================
// 1. TREATMENT MANAGEMENT UI
// =====================================================

export function TreatmentPlanningInterface() {
  const [plan, setPlan] = useState({
    patientName: "",
    patientId: "",
    treatmentType: "",
    areas: [] as TreatmentArea[],
    totalUnits: 0,
    estimatedDuration: 30,
    sessionCount: 1,
    intervalWeeks: 4,
    specialInstructions: "",
    contraindications: [] as string[],
    followUpRequired: true,
    priority: "medium" as Treatment["priority"],
    expectedResults: "",
    postCareInstructions: "",
    riskAssessment: "",
  });

  const [selectedArea, setSelectedArea] = useState("");
  const [areaUnits, setAreaUnits] = useState("");
  const [areaNotes, setAreaNotes] = useState("");

  const addTreatmentArea = () => {
    if (!(selectedArea && areaUnits)) return;

    const newArea: TreatmentArea = {
      id: Date.now().toString(),
      name: selectedArea,
      units: Number(areaUnits),
      notes: areaNotes,
    };

    const newAreas = [...plan.areas, newArea];
    const totalUnits = newAreas.reduce((sum, area) => sum + area.units, 0);

    setPlan({
      ...plan,
      areas: newAreas,
      totalUnits,
    });

    setSelectedArea("");
    setAreaUnits("");
    setAreaNotes("");
  };

  const removeArea = (areaId: string) => {
    const newAreas = plan.areas.filter((area) => area.id !== areaId);
    const totalUnits = newAreas.reduce((sum, area) => sum + area.units, 0);

    setPlan({
      ...plan,
      areas: newAreas,
      totalUnits,
    });
  };

  const toggleContraindication = (contraindication: string) => {
    const newContraindications = plan.contraindications.includes(contraindication)
      ? plan.contraindications.filter((c) => c !== contraindication)
      : [...plan.contraindications, contraindication];

    setPlan({
      ...plan,
      contraindications: newContraindications,
    });
  };

  const selectedTreatmentType = treatmentTypes.find((t) => t.value === plan.treatmentType);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5 text-blue-600" />
            Planejamento de Tratamento Estético
          </CardTitle>
          <CardDescription>
            Configure e planeje tratamentos personalizados com total segurança e documentação
            completa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient and Treatment Selection */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="patient-name">Nome do Paciente</Label>
              <Input
                id="patient-name"
                placeholder="Digite o nome do paciente"
                value={plan.patientName}
                onChange={(e) => setPlan({ ...plan, patientName: e.target.value })}
                aria-label="Nome do paciente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment-type">Tipo de Tratamento</Label>
              <Select
                value={plan.treatmentType}
                onValueChange={(value) => setPlan({ ...plan, treatmentType: value })}
              >
                <SelectTrigger id="treatment-type">
                  <SelectValue placeholder="Selecione o tratamento" />
                </SelectTrigger>
                <SelectContent>
                  {treatmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={plan.priority}
                onValueChange={(value) =>
                  setPlan({ ...plan, priority: value as Treatment["priority"] })
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Treatment Areas */}
          <Separator />

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              <MapPin className="h-5 w-5" />
              Áreas de Tratamento
            </h3>

            {/* Add Area Form */}
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-4 dark:bg-gray-800">
              <div className="space-y-2">
                <Label htmlFor="area-select">Área</Label>
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger id="area-select">
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 font-semibold text-blue-600">Face</div>
                    {commonAreas.face.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                    <Separator className="my-1" />
                    <div className="px-2 py-1 font-semibold text-orange-600">Corpo</div>
                    {commonAreas.body.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area-units">
                  {selectedTreatmentType?.unitType || "Quantidade"}
                </Label>
                <Input
                  id="area-units"
                  type="number"
                  placeholder="0"
                  value={areaUnits}
                  onChange={(e) => setAreaUnits(e.target.value)}
                  aria-label={`Quantidade em ${selectedTreatmentType?.unitType || "unidades"}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area-notes">Observações</Label>
                <Input
                  id="area-notes"
                  placeholder="Observações específicas"
                  value={areaNotes}
                  onChange={(e) => setAreaNotes(e.target.value)}
                  aria-label="Observações da área"
                />
              </div>

              <div className="flex items-end">
                <Button onClick={addTreatmentArea} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Areas List */}
            {plan.areas.length > 0 && (
              <div className="space-y-3">
                {plan.areas.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm dark:bg-gray-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30">
                          {area.name}
                        </Badge>
                        <span className="font-medium text-blue-600">
                          {area.units} {selectedTreatmentType?.unitType || "un"}
                        </span>
                      </div>
                      {area.notes && (
                        <p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
                          {area.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArea(area.id)}
                      aria-label={`Remover área ${area.name}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {plan.totalUnits} {selectedTreatmentType?.unitType || "un"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Session Planning */}
          <Separator />

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              <Calendar className="h-5 w-5" />
              Planejamento de Sessões
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="session-count">Número de Sessões</Label>
                <Input
                  id="session-count"
                  type="number"
                  min="1"
                  value={plan.sessionCount}
                  onChange={(e) => setPlan({ ...plan, sessionCount: Number(e.target.value) })}
                  aria-label="Número de sessões"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interval-weeks">Intervalo (semanas)</Label>
                <Input
                  id="interval-weeks"
                  type="number"
                  min="1"
                  value={plan.intervalWeeks}
                  onChange={(e) => setPlan({ ...plan, intervalWeeks: Number(e.target.value) })}
                  aria-label="Intervalo entre sessões em semanas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated-duration">Duração estimada (min)</Label>
                <Input
                  id="estimated-duration"
                  type="number"
                  min="15"
                  step="15"
                  value={plan.estimatedDuration}
                  onChange={(e) => setPlan({ ...plan, estimatedDuration: Number(e.target.value) })}
                  aria-label="Duração estimada em minutos"
                />
              </div>
            </div>
          </div>

          {/* Contraindications */}
          <Separator />

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Contraindicações e Precauções
            </h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {contraindications.map((contraindication) => (
                <div key={contraindication} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`contraindication-${contraindication}`}
                    checked={plan.contraindications.includes(contraindication)}
                    onChange={() => toggleContraindication(contraindication)}
                    className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <Label
                    htmlFor={`contraindication-${contraindication}`}
                    className="cursor-pointer text-sm"
                  >
                    {contraindication}
                  </Label>
                </div>
              ))}
            </div>

            {plan.contraindications.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div className="ml-2">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Atenção às Contraindicações
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Verifique cuidadosamente as contraindicações selecionadas antes de prosseguir
                    com o tratamento.
                  </p>
                </div>
              </Alert>
            )}
          </div>

          {/* Action Buttons */}
          <Separator />

          <div className="flex justify-end gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline">Salvar como Rascunho</Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Salvar Plano de Tratamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function BeforeAfterGallery() {
  const [selectedTreatment, setSelectedTreatment] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "comparison">("grid");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-600" />
                Galeria Antes/Depois
              </CardTitle>
              <CardDescription>
                Documente e compare resultados dos tratamentos com galeria profissional
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grade
              </Button>
              <Button
                variant={viewMode === "comparison" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("comparison")}
              >
                Comparação
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por tratamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tratamentos</SelectItem>
                {treatmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Fotos
            </Button>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockTreatments.map((treatment) => (
                <Card
                  key={treatment.id}
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{treatment.patientName}</CardTitle>
                      <Badge className={getTreatmentTypeColor(treatment.type)}>
                        {treatment.type.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>{treatment.area}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Photo Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                          <div className="text-center">
                            <Camera className="mx-auto mb-1 h-6 w-6 text-gray-400" />
                            <span className="text-gray-500 text-xs">Antes</span>
                          </div>
                        </div>
                        <div className="flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                          <div className="text-center">
                            <Camera className="mx-auto mb-1 h-6 w-6 text-blue-400" />
                            <span className="text-blue-500 text-xs">Depois</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {treatment.photos || 0} fotos
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {new Date(treatment.date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="mr-1 h-4 w-4" />
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Camera className="mr-1 h-4 w-4" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Comparison View */
            <div className="space-y-6">
              {mockTreatments.slice(0, 2).map((treatment) => (
                <Card key={treatment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{treatment.patientName}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getTreatmentTypeColor(treatment.type)}>
                          {treatment.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{treatment.area}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="text-center">
                        <h4 className="mb-3 font-semibold text-red-600">Antes</h4>
                        <div className="mb-3 flex aspect-video items-center justify-center rounded-lg border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:border-red-800 dark:from-red-900/20 dark:to-red-800/20">
                          <Camera className="h-8 w-8 text-red-400" />
                        </div>
                        <p className="text-gray-600 text-sm dark:text-gray-400">
                          {new Date(treatment.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>

                      <div className="text-center">
                        <h4 className="mb-3 font-semibold text-green-600">Depois</h4>
                        <div className="mb-3 flex aspect-video items-center justify-center rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
                          <Camera className="h-8 w-8 text-green-400" />
                        </div>
                        <p className="text-gray-600 text-sm dark:text-gray-400">
                          {treatment.nextSession
                            ? new Date(treatment.nextSession).toLocaleDateString("pt-BR")
                            : "Aguardando"}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="text-center">
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Comparação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function TreatmentSessionTracker() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-green-600" />
            Acompanhamento de Sessões
          </CardTitle>
          <CardDescription>
            Monitore progresso detalhado e evolução dos tratamentos ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockTreatments.map((treatment) => (
              <div
                key={treatment.id}
                className="rounded-lg border p-4 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{treatment.patientName}</h3>
                    <p className="text-gray-600 text-sm dark:text-gray-400">
                      {treatment.type.toUpperCase()} - {treatment.area}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(treatment.status)}>{treatment.status}</Badge>
                    <Badge className={getPriorityColor(treatment.priority)}>
                      {treatment.priority}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Progresso do Tratamento</span>
                    <span>
                      {treatment.sessionsCompleted}/{treatment.totalSessions} sessões
                    </span>
                  </div>
                  <Progress
                    value={(treatment.sessionsCompleted / treatment.totalSessions) * 100}
                    className="h-2"
                  />
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="rounded border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-800 dark:bg-blue-900/20">
                    <div className="font-bold text-2xl text-blue-600">
                      {treatment.units || "--"}
                    </div>
                    <div className="text-gray-600 text-sm dark:text-gray-400">
                      Unidades aplicadas
                    </div>
                  </div>

                  <div className="rounded border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-900/20">
                    <div className="font-bold text-2xl text-green-600">
                      {new Date(treatment.date).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="text-gray-600 text-sm dark:text-gray-400">Última sessão</div>
                  </div>

                  <div className="rounded border border-purple-200 bg-purple-50 p-3 text-center dark:border-purple-800 dark:bg-purple-900/20">
                    <div className="font-bold text-2xl text-purple-600">
                      {treatment.nextSession
                        ? new Date(treatment.nextSession).toLocaleDateString("pt-BR")
                        : "--"}
                    </div>
                    <div className="text-gray-600 text-sm dark:text-gray-400">Próxima sessão</div>
                  </div>

                  <div className="rounded border border-orange-200 bg-orange-50 p-3 text-center dark:border-orange-800 dark:bg-orange-900/20">
                    <div className="font-bold text-2xl text-orange-600">
                      {treatment.photos || 0}
                    </div>
                    <div className="text-gray-600 text-sm dark:text-gray-400">
                      Fotos registradas
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Histórico Completo
                  </Button>
                  <Button variant="outline" size="sm">
                    <Camera className="mr-2 h-4 w-4" />
                    Galeria de Fotos
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Próxima
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Ajustar Plano
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 2. PRODUCT & PROCEDURE MANAGEMENT
// =====================================================

export function ProductInventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Gestão de Produtos e Estoque
          </CardTitle>
          <CardDescription>
            Controle completo do inventário de produtos estéticos e equipamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="botox">Toxina Botulínica</SelectItem>
                <SelectItem value="filler">Preenchimentos</SelectItem>
                <SelectItem value="laser-consumable">Consumíveis Laser</SelectItem>
                <SelectItem value="skincare">Skincare</SelectItem>
                <SelectItem value="equipment">Equipamentos</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>

          {/* Stock Alert Summary */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="font-medium text-red-600 text-sm">Estoque Baixo</p>
                    <p className="font-bold text-2xl text-red-700">2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="font-medium text-sm text-yellow-600">Próximo ao Vencimento</p>
                    <p className="font-bold text-2xl text-yellow-700">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="font-medium text-green-600 text-sm">Em Estoque</p>
                    <p className="font-bold text-2xl text-green-700">{mockProducts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="font-medium text-blue-600 text-sm">Valor Total</p>
                    <p className="font-bold text-2xl text-blue-700">R$ 23.400</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-4 text-left font-medium">Produto</th>
                  <th className="p-4 text-left font-medium">Categoria</th>
                  <th className="p-4 text-left font-medium">Estoque Atual</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Validade</th>
                  <th className="p-4 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.currentStock, product.minStock);
                  return (
                    <tr
                      key={product.id}
                      className="border-t hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-gray-500 text-sm">{product.brand}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">
                          {product.category.replace("-", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {product.currentStock} {product.unit}
                        </div>
                        <div className="text-gray-500 text-sm">
                          Min: {product.minStock} {product.unit}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={stockStatus.color}>
                          {stockStatus.status === "low"
                            ? "Baixo"
                            : stockStatus.status === "medium"
                              ? "Médio"
                              : "Bom"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {product.expiryDate ? (
                          <span
                            className={
                              new Date(product.expiryDate) <
                              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                ? "font-medium text-red-600"
                                : "text-gray-600"
                            }
                          >
                            {new Date(product.expiryDate).toLocaleDateString("pt-BR")}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="mr-1 h-3 w-3" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Plus className="mr-1 h-3 w-3" />
                            Repor
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 3. PATIENT EXPERIENCE MODULES
// =====================================================

export function PatientConsultationForm() {
  const [formData, setFormData] = useState({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
    },
    medicalHistory: {
      allergies: "",
      medications: "",
      previousTreatments: "",
      medicalConditions: "",
    },
    aestheticConcerns: {
      primaryConcern: "",
      secondaryConcerns: "",
      treatmentGoals: "",
      budgetRange: "",
    },
    preferences: {
      communicationMethod: "",
      appointmentTime: "",
      reminderFrequency: "",
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            Formulário de Consulta Estética
          </CardTitle>
          <CardDescription>
            Coleta completa de informações para consulta personalizada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="medical">Histórico Médico</TabsTrigger>
              <TabsTrigger value="aesthetic">Objetivos Estéticos</TabsTrigger>
              <TabsTrigger value="preferences">Preferências</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Digite seu nome completo"
                    value={formData.personalInfo.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, name: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.personalInfo.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, email: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.personalInfo.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, phone: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth-date">Data de Nascimento</Label>
                  <Input
                    id="birth-date"
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, dateOfBirth: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <Select
                    value={formData.personalInfo.gender}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, gender: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias</Label>
                  <Textarea
                    id="allergies"
                    placeholder="Liste todas as alergias conhecidas..."
                    value={formData.medicalHistory.allergies}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medicalHistory: { ...formData.medicalHistory, allergies: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications">Medicamentos Atuais</Label>
                  <Textarea
                    id="medications"
                    placeholder="Liste todos os medicamentos em uso..."
                    value={formData.medicalHistory.medications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medicalHistory: { ...formData.medicalHistory, medications: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previous-treatments">Tratamentos Estéticos Anteriores</Label>
                  <Textarea
                    id="previous-treatments"
                    placeholder="Descreva tratamentos estéticos realizados anteriormente..."
                    value={formData.medicalHistory.previousTreatments}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medicalHistory: {
                          ...formData.medicalHistory,
                          previousTreatments: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conditions">Condições Médicas</Label>
                  <Textarea
                    id="conditions"
                    placeholder="Informe sobre condições médicas relevantes..."
                    value={formData.medicalHistory.medicalConditions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medicalHistory: {
                          ...formData.medicalHistory,
                          medicalConditions: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aesthetic" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-concern">Principal Preocupação Estética</Label>
                  <Select
                    value={formData.aestheticConcerns.primaryConcern}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        aestheticConcerns: { ...formData.aestheticConcerns, primaryConcern: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua principal preocupação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wrinkles">Rugas e Linhas de Expressão</SelectItem>
                      <SelectItem value="volume-loss">Perda de Volume</SelectItem>
                      <SelectItem value="skin-texture">Textura da Pele</SelectItem>
                      <SelectItem value="body-contouring">Contorno Corporal</SelectItem>
                      <SelectItem value="skin-tightening">Flacidez da Pele</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-concerns">Outras Preocupações</Label>
                  <Textarea
                    id="secondary-concerns"
                    placeholder="Descreva outras áreas de interesse..."
                    value={formData.aestheticConcerns.secondaryConcerns}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        aestheticConcerns: {
                          ...formData.aestheticConcerns,
                          secondaryConcerns: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Objetivos do Tratamento</Label>
                  <Textarea
                    id="goals"
                    placeholder="Descreva os resultados que espera alcançar..."
                    value={formData.aestheticConcerns.treatmentGoals}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        aestheticConcerns: {
                          ...formData.aestheticConcerns,
                          treatmentGoals: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Faixa de Orçamento</Label>
                  <Select
                    value={formData.aestheticConcerns.budgetRange}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        aestheticConcerns: { ...formData.aestheticConcerns, budgetRange: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua faixa de orçamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-500">Até R$ 500</SelectItem>
                      <SelectItem value="500-1000">R$ 500 - R$ 1.000</SelectItem>
                      <SelectItem value="1000-2000">R$ 1.000 - R$ 2.000</SelectItem>
                      <SelectItem value="2000-5000">R$ 2.000 - R$ 5.000</SelectItem>
                      <SelectItem value="over-5000">Acima de R$ 5.000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="communication">Forma de Comunicação Preferida</Label>
                  <Select
                    value={formData.preferences.communicationMethod}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, communicationMethod: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment-time">Horário Preferido</Label>
                  <Select
                    value={formData.preferences.appointmentTime}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, appointmentTime: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Manhã (8h-12h)</SelectItem>
                      <SelectItem value="afternoon">Tarde (12h-18h)</SelectItem>
                      <SelectItem value="evening">Noite (18h-20h)</SelectItem>
                      <SelectItem value="flexible">Flexível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminders">Frequência de Lembretes</Label>
                  <Select
                    value={formData.preferences.reminderFrequency}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, reminderFrequency: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem lembretes</SelectItem>
                      <SelectItem value="day-before">1 dia antes</SelectItem>
                      <SelectItem value="week-before">1 semana antes</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="flex justify-end gap-3">
            <Button variant="outline">Salvar Rascunho</Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Enviar Formulário
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AppointmentBookingSystem() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedTreatment, setSelectedTreatment] = useState("");

  const availableTimes = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Agendamento de Consultas
          </CardTitle>
          <CardDescription>
            Sistema inteligente de agendamento para tratamentos estéticos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Booking Form */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="treatment-select">Tipo de Tratamento</Label>
                  <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
                    <SelectTrigger id="treatment-select">
                      <SelectValue placeholder="Selecione o tratamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {treatmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-select">Data</Label>
                  <Input
                    id="date-select"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-select">Horário</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger id="time-select">
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações adicionais sobre o agendamento..."
                    rows={3}
                  />
                </div>
              </div>

              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Confirmar Agendamento
              </Button>
            </div>

            {/* Appointment Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Próximos Agendamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAppointments.map((appointment) => (
                      <div key={appointment.id} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="font-medium">{appointment.patientName}</div>
                          <Badge
                            className={
                              appointment.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="text-gray-600 text-sm dark:text-gray-400">
                          <p>{appointment.treatmentType}</p>
                          <p>
                            {new Date(appointment.date).toLocaleDateString("pt-BR")} às{" "}
                            {appointment.time}
                          </p>
                          <p>Dr. {appointment.practitioner}</p>
                        </div>
                        {appointment.isFollowUp && (
                          <Badge variant="outline" className="mt-2">
                            Retorno
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Disponibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.slice(0, 9).map((time) => (
                      <div
                        key={time}
                        className="cursor-pointer rounded border p-2 text-center text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 4. PROFESSIONAL DASHBOARD COMPONENTS
// =====================================================

export function ProfessionalDashboard() {
  const totalRevenue = mockTreatments.reduce((sum, treatment) => sum + (treatment.price || 0), 0);
  const completedTreatments = mockTreatments.filter((t) => t.status === "completed").length;
  const activeTreatments = mockTreatments.filter((t) => t.status === "in-progress").length;
  const todayAppointments = mockAppointments.length;

  return (
    <div className="space-y-6">
      {/* Revenue and KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="font-medium text-green-600 text-sm">Receita Total</p>
                <p className="font-bold text-2xl text-green-700">
                  R$ {totalRevenue.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="font-medium text-blue-600 text-sm">Pacientes Ativos</p>
                <p className="font-bold text-2xl text-blue-700">{mockPatients.length * 52}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="font-medium text-purple-600 text-sm">Tratamentos Ativos</p>
                <p className="font-bold text-2xl text-purple-700">{activeTreatments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="font-medium text-orange-600 text-sm">Agendamentos Hoje</p>
                <p className="font-bold text-2xl text-orange-700">{todayAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Agenda de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="font-bold text-blue-600 text-lg">{appointment.time}</div>
                    <div className="text-gray-500 text-sm">{appointment.duration}min</div>
                  </div>
                  <div>
                    <div className="font-medium">{appointment.patientName}</div>
                    <div className="text-gray-600 text-sm">{appointment.treatmentType}</div>
                    <div className="text-gray-500 text-sm">{appointment.practitioner}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {appointment.isFollowUp && <Badge variant="outline">Retorno</Badge>}
                  <Badge
                    className={
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {appointment.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-1 h-4 w-4" />
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Treatment Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tratamentos por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {treatmentTypes.map((type) => {
                const count = mockTreatments.filter((t) => t.type === type.value).length;
                const percentage = (count / mockTreatments.length) * 100;
                return (
                  <div key={type.value} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{type.label}</span>
                      <span className="text-gray-500 text-sm">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Tratamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {treatmentTypes.map((type) => {
                const treatments = mockTreatments.filter((t) => t.type === type.value);
                const revenue = treatments.reduce((sum, t) => sum + (t.price || 0), 0);
                return (
                  <div
                    key={type.value}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-gray-500 text-sm">{treatments.length} tratamentos</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        R$ {revenue.toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =====================================================
// MAIN AESTHETIC CLINIC UI COMPONENT
// =====================================================

export function AestheticClinicManagementSystem() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between lg:flex-row lg:items-center">
          <div>
            <h1 className="font-bold text-3xl text-gray-900 dark:text-white">
              Sistema de Gestão para Clínicas Estéticas
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Plataforma completa para gerenciar todos os aspectos da sua clínica estética
            </p>
          </div>

          <div className="mt-4 flex gap-3 lg:mt-0">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="treatments">Tratamentos</TabsTrigger>
            <TabsTrigger value="inventory">Produtos</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="consultation">Consulta</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ProfessionalDashboard />
          </TabsContent>

          <TabsContent value="treatments">
            <Tabs defaultValue="planning" className="space-y-4">
              <TabsList>
                <TabsTrigger value="planning">Planejamento</TabsTrigger>
                <TabsTrigger value="gallery">Galeria</TabsTrigger>
                <TabsTrigger value="tracking">Acompanhamento</TabsTrigger>
              </TabsList>

              <TabsContent value="planning">
                <TreatmentPlanningInterface />
              </TabsContent>

              <TabsContent value="gallery">
                <BeforeAfterGallery />
              </TabsContent>

              <TabsContent value="tracking">
                <TreatmentSessionTracker />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="inventory">
            <ProductInventoryManagement />
          </TabsContent>

          <TabsContent value="patients">
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="font-semibold text-gray-700 text-lg dark:text-gray-300">
                Gestão de Pacientes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Módulo de gestão de pacientes será implementado aqui
              </p>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentBookingSystem />
          </TabsContent>

          <TabsContent value="consultation">
            <PatientConsultationForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
