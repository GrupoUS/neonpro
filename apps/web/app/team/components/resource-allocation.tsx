"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Filter,
  Heart,
  MapPin,
  MoreVertical,
  Package,
  Plus,
  Search,
  Settings,
  Shield,
  Users,
  Wrench,
  Wrench as Tool,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { EquipmentStatus, FacilityRoom, MedicalEquipment } from "@/types/team-coordination"; // Mock medical equipment data with ANVISA compliance

const mockEquipmentData: MedicalEquipment[] = [
  {
    id: "equip-001",
    name: "Monitor Multiparamétrico",
    model: "IntelliVue MX40",
    serialNumber: "MX40-2024-001",
    manufacturer: "Philips Healthcare",
    purchaseDate: new Date("2023-05-15"),
    warrantyExpiry: new Date("2026-05-15"),
    anvisaRegistration: "80146270009",
    regulatoryClass: "Classe IIb",
    lastInspectionDate: new Date("2024-01-15"),
    nextInspectionDate: new Date("2024-07-15"),
    status: "available",
    currentLocation: "UTI - Setor A",
    assignedTo: undefined,
    reservations: [],
    lastMaintenanceDate: new Date("2024-01-10"),
    nextMaintenanceDate: new Date("2024-07-10"),
    maintenanceNotes: "Calibração realizada conforme cronograma",
    calibrationDate: new Date("2024-01-10"),
    nextCalibrationDate: new Date("2024-07-10"),
    totalUsageHours: 2450,
    utilizationRate: 85,
    failureCount: 0,
    lastFailureDate: undefined,
    requiredTraining: ["Monitorização Avançada", "Interpretação de Arritmias"],
    safetyAlerts: [],
    operatingInstructions: "Seguir protocolo UTI para monitorização contínua",
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2024-08-21"),
    isActive: true,
  },
  {
    id: "equip-002",
    name: "Ventilador Mecânico",
    model: "SERVO-i",
    serialNumber: "SRV-2024-002",
    manufacturer: "Maquet",
    purchaseDate: new Date("2023-08-20"),
    warrantyExpiry: new Date("2026-08-20"),
    anvisaRegistration: "10313490004",
    regulatoryClass: "Classe III",
    lastInspectionDate: new Date("2024-02-01"),
    nextInspectionDate: new Date("2024-08-01"), // Overdue!
    status: "maintenance",
    currentLocation: "Manutenção - Oficina",
    assignedTo: undefined,
    reservations: [],
    lastMaintenanceDate: new Date("2024-07-20"),
    nextMaintenanceDate: new Date("2024-10-20"),
    maintenanceNotes: "Manutenção preventiva em andamento - sensor de pressão",
    calibrationDate: new Date("2024-07-20"),
    nextCalibrationDate: new Date("2024-10-20"),
    totalUsageHours: 1850,
    utilizationRate: 95,
    failureCount: 1,
    lastFailureDate: new Date("2024-07-18"),
    requiredTraining: ["Ventilação Mecânica Avançada", "Modos Ventilatórios"],
    safetyAlerts: ["Inspeção ANVISA pendente"],
    operatingInstructions: "Protocolo de ventilação protetiva obrigatório",
    createdAt: new Date("2023-08-20"),
    updatedAt: new Date("2024-08-21"),
    isActive: true,
  },
  {
    id: "equip-003",
    name: "Desfibrilador/Monitor",
    model: "HeartStart MRx",
    serialNumber: "MRX-2024-003",
    manufacturer: "Philips Healthcare",
    purchaseDate: new Date("2024-01-10"),
    warrantyExpiry: new Date("2027-01-10"),
    anvisaRegistration: "80146270015",
    regulatoryClass: "Classe III",
    lastInspectionDate: new Date("2024-06-01"),
    nextInspectionDate: new Date("2024-12-01"),
    status: "in_use",
    currentLocation: "Pronto Socorro",
    assignedTo: "prof-002", // Dr. Roberto Oliveira
    reservations: [],
    lastMaintenanceDate: new Date("2024-06-01"),
    nextMaintenanceDate: new Date("2024-12-01"),
    maintenanceNotes: "Teste de bateria e calibração aprovados",
    calibrationDate: new Date("2024-06-01"),
    nextCalibrationDate: new Date("2024-12-01"),
    totalUsageHours: 450,
    utilizationRate: 75,
    failureCount: 0,
    lastFailureDate: undefined,
    requiredTraining: ["Suporte Avançado de Vida", "Desfibrilação"],
    safetyAlerts: [],
    operatingInstructions: "Disponível para emergências 24/7",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-08-21"),
    isActive: true,
  },
]; // Mock facility room data
const mockRoomData: FacilityRoom[] = [
  {
    id: "room-001",
    name: "Consultório 301",
    type: "consultation",
    floor: "3º Andar",
    capacity: 4,
    equipmentIds: ["equip-echo-001", "equip-exam-table-001"],
    status: "available",
    currentOccupancy: 0,
    reservations: [],
    features: ["ar-condicionado", "oxigênio", "aspiração", "wi-fi"],
    accessibilityFeatures: ["rampa-acesso", "banheiro-adaptado"],
    sanitationStatus: "clean",
    lastCleaningTime: new Date("2024-08-21T06:00:00"),
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-08-21"),
    isActive: true,
  },
  {
    id: "room-002",
    name: "Sala Cirúrgica 01",
    type: "surgery",
    floor: "2º Andar",
    capacity: 8,
    equipmentIds: ["equip-surgery-table", "equip-anesthesia", "equip-lights"],
    status: "occupied",
    currentOccupancy: 6,
    reservations: [],
    features: [
      "pressão-positiva",
      "oxigênio",
      "gases-medicinais",
      "aspiração",
      "sistema-som",
    ],
    accessibilityFeatures: ["acesso-amplo"],
    sanitationStatus: "clean",
    lastCleaningTime: new Date("2024-08-21T05:30:00"),
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-08-21"),
    isActive: true,
  },
  {
    id: "room-003",
    name: "UTI - Leito 05",
    type: "recovery",
    floor: "4º Andar",
    capacity: 2,
    equipmentIds: ["equip-001", "equip-002"], // Monitor and ventilator
    status: "occupied",
    currentOccupancy: 2,
    reservations: [],
    features: [
      "monitorização-contínua",
      "oxigênio",
      "aspiração",
      "gases-medicinais",
    ],
    accessibilityFeatures: ["acesso-equipamentos"],
    sanitationStatus: "clean",
    lastCleaningTime: new Date("2024-08-21T04:00:00"),
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-08-21"),
    isActive: true,
  },
  {
    id: "room-004",
    name: "Box Emergência 01",
    type: "emergency",
    floor: "1º Andar",
    capacity: 6,
    equipmentIds: ["equip-003", "equip-emergency-cart"],
    status: "available",
    currentOccupancy: 0,
    reservations: [],
    features: [
      "acesso-rápido",
      "oxigênio",
      "aspiração",
      "desfibrilador",
      "carrinho-emergência",
    ],
    accessibilityFeatures: ["entrada-ampla", "acesso-maca"],
    sanitationStatus: "clean",
    lastCleaningTime: new Date("2024-08-21T07:00:00"),
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-08-21"),
    isActive: true,
  },
]; // Helper functions for status indicators
const getEquipmentStatusInfo = (status: EquipmentStatus) => {
  switch (status) {
    case "available": {
      return {
        color: "text-green-600",
        bg: "bg-green-100",
        icon: CheckCircle,
        label: "Disponível",
      };
    }
    case "in_use": {
      return {
        color: "text-blue-600",
        bg: "bg-blue-100",
        icon: Activity,
        label: "Em Uso",
      };
    }
    case "maintenance": {
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        icon: Tool,
        label: "Manutenção",
      };
    }
    case "reserved": {
      return {
        color: "text-purple-600",
        bg: "bg-purple-100",
        icon: Calendar,
        label: "Reservado",
      };
    }
    case "out_of_service": {
      return {
        color: "text-red-600",
        bg: "bg-red-100",
        icon: XCircle,
        label: "Fora de Serviço",
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

const getRoomStatusInfo = (status: string) => {
  switch (status) {
    case "available": {
      return {
        color: "text-green-600",
        bg: "bg-green-100",
        icon: CheckCircle,
        label: "Disponível",
      };
    }
    case "occupied": {
      return {
        color: "text-red-600",
        bg: "bg-red-100",
        icon: Users,
        label: "Ocupado",
      };
    }
    case "maintenance": {
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        icon: Wrench,
        label: "Manutenção",
      };
    }
    case "reserved": {
      return {
        color: "text-purple-600",
        bg: "bg-purple-100",
        icon: Calendar,
        label: "Reservado",
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

// Room type translations
const roomTypeLabels = {
  consultation: "Consultório",
  procedure: "Procedimento",
  surgery: "Cirúrgica",
  recovery: "Recuperação",
  emergency: "Emergência",
};

interface ResourceAllocationProps {
  emergencyMode?: boolean;
}

export function ResourceAllocation({
  emergencyMode = false,
}: ResourceAllocationProps) {
  const [activeTab, setActiveTab] = useState("equipment");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [showMaintenanceOnly, setShowMaintenanceOnly] = useState(false); // Filter equipment data
  const filteredEquipment = useMemo(() => {
    return mockEquipmentData.filter((equipment) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = equipment.name.toLowerCase().includes(searchLower)
          || equipment.model.toLowerCase().includes(searchLower)
          || equipment.serialNumber.toLowerCase().includes(searchLower)
          || equipment.currentLocation.toLowerCase().includes(searchLower)
          || equipment.anvisaRegistration?.toLowerCase().includes(searchLower);

        if (!matchesSearch) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && equipment.status !== statusFilter) {
        return false;
      }

      // Location filter
      if (
        locationFilter !== "all"
        && !equipment.currentLocation.includes(locationFilter)
      ) {
        return false;
      }

      // Maintenance filter
      if (showMaintenanceOnly) {
        const hasMaintenanceIssues = equipment.status === "maintenance"
          || equipment.safetyAlerts.length > 0
          || (equipment.nextInspectionDate
            && equipment.nextInspectionDate < new Date())
          || (equipment.nextMaintenanceDate
            && equipment.nextMaintenanceDate < new Date());

        if (!hasMaintenanceIssues) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, statusFilter, locationFilter, showMaintenanceOnly]);

  // Filter room data
  const filteredRooms = useMemo(() => {
    return mockRoomData.filter((room) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = room.name.toLowerCase().includes(searchLower)
          || room.type.toLowerCase().includes(searchLower)
          || room.floor.toLowerCase().includes(searchLower)
          || room.features.some((feature) => feature.toLowerCase().includes(searchLower));

        if (!matchesSearch) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && room.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    return [
      ...new Set(
        mockEquipmentData.map((equip) => equip.currentLocation.split(" - ")[0]),
      ),
    ];
  }, []);
  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h2 className="font-bold text-2xl">Coordenação de Recursos</h2>
          <p className="text-muted-foreground">
            Gestão de equipamentos, salas e suprimentos com compliance ANVISA
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Cronograma Manutenção
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Recurso
          </Button>
          {emergencyMode && (
            <Button size="sm" variant="destructive">
              <Shield className="mr-2 h-4 w-4" />
              Recursos Emergência
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Busca e Filtros</CardTitle>
          <CardDescription>
            Encontre recursos por nome, modelo, localização ou registro ANVISA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
                <Input
                  aria-label="Buscar recursos"
                  className="pl-10"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar recursos..."
                  value={searchQuery}
                />
              </div>
            </div>
            {/* Status Filter */}
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="in_use">Em Uso</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="reserved">Reservado</SelectItem>
                <SelectItem value="out_of_service">Fora de Serviço</SelectItem>
              </SelectContent>
            </Select>{" "}
            {/* Location Filter */}
            <Select onValueChange={setLocationFilter} value={locationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Localização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Localizações</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Quick Filters */}
            <div className="flex items-center space-x-2">
              <Button
                className="text-xs"
                onClick={() => setShowMaintenanceOnly(!showMaintenanceOnly)}
                size="sm"
                variant={showMaintenanceOnly ? "default" : "outline"}
              >
                <Filter className="mr-1 h-3 w-3" />
                Manutenção
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Tabs */}
      <Tabs
        className="space-y-6"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger className="text-sm" value="equipment">
            <Heart className="mr-2 h-4 w-4" />
            Equipamentos
          </TabsTrigger>
          <TabsTrigger className="text-sm" value="rooms">
            <MapPin className="mr-2 h-4 w-4" />
            Salas
          </TabsTrigger>
          <TabsTrigger className="text-sm" value="supplies">
            <Package className="mr-2 h-4 w-4" />
            Suprimentos
          </TabsTrigger>
        </TabsList>{" "}
        {/* Equipment Tab */}
        <TabsContent className="space-y-6" value="equipment">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipamentos Médicos</CardTitle>
              <CardDescription>
                {filteredEquipment.length} equipamentos de {mockEquipmentData.length} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>ANVISA</TableHead>
                      <TableHead>Utilização</TableHead>
                      <TableHead>Manutenção</TableHead>
                      <TableHead className="w-[50px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipment.map((equipment) => {
                      const statusInfo = getEquipmentStatusInfo(
                        equipment.status,
                      );
                      const { icon: StatusIcon } = statusInfo;

                      // Check for alerts
                      const hasInspectionAlert = equipment.nextInspectionDate
                        && equipment.nextInspectionDate < new Date();
                      const hasMaintenanceAlert = equipment.nextMaintenanceDate
                        && equipment.nextMaintenanceDate < new Date();
                      const hasSafetyAlerts = equipment.safetyAlerts.length > 0;

                      return (
                        <TableRow
                          className="hover:bg-muted/50"
                          key={equipment.id}
                        >
                          {/* Equipment Info */}
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">
                                {equipment.name}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {equipment.model} | {equipment.serialNumber}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {equipment.manufacturer}
                              </p>
                            </div>
                          </TableCell>
                          {/* Status */}
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`rounded-full p-1 ${statusInfo.bg}`}
                              >
                                <StatusIcon
                                  className={`h-3 w-3 ${statusInfo.color}`}
                                />
                              </div>
                              <span className="font-medium text-sm">
                                {statusInfo.label}
                              </span>
                            </div>
                            {equipment.assignedTo && (
                              <p className="mt-1 text-blue-600 text-xs">
                                Atribuído: Prof. ID {equipment.assignedTo}
                              </p>
                            )}
                          </TableCell>
                          {/* Location */}
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {equipment.currentLocation}
                              </span>
                            </div>
                          </TableCell>{" "}
                          {/* ANVISA Registration */}
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <span className="font-mono text-xs">
                                  {equipment.anvisaRegistration}
                                </span>
                                {hasInspectionAlert
                                  ? <AlertTriangle className="h-3 w-3 text-red-500" />
                                  : <CheckCircle className="h-3 w-3 text-green-500" />}
                              </div>
                              <Badge className="text-xs" variant="outline">
                                {equipment.regulatoryClass}
                              </Badge>
                              {hasInspectionAlert && (
                                <Badge
                                  className="text-xs"
                                  variant="destructive"
                                >
                                  Inspeção Pendente
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          {/* Utilization */}
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <Activity className="h-3 w-3 text-blue-500" />
                                <span className="text-xs">
                                  {equipment.utilizationRate}%
                                </span>
                              </div>
                              <Progress
                                className="h-1"
                                value={equipment.utilizationRate}
                              />
                              <p className="text-muted-foreground text-xs">
                                {equipment.totalUsageHours}h total
                              </p>
                            </div>
                          </TableCell>
                          {/* Maintenance */}
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <Tool className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs">
                                  {equipment.nextMaintenanceDate?.toLocaleDateString(
                                    "pt-BR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                    },
                                  )}
                                </span>
                                {hasMaintenanceAlert
                                  ? <AlertTriangle className="h-3 w-3 text-red-500" />
                                  : <CheckCircle className="h-3 w-3 text-green-500" />}
                              </div>
                              {equipment.failureCount > 0 && (
                                <Badge
                                  className="border-red-500 text-red-700 text-xs"
                                  variant="outline"
                                >
                                  {equipment.failureCount} falha(s)
                                </Badge>
                              )}
                              {hasSafetyAlerts && (
                                <Badge
                                  className="text-xs"
                                  variant="destructive"
                                >
                                  {equipment.safetyAlerts.length} alerta(s)
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          {/* Actions */}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-label={`Ações para ${equipment.name}`}
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
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Reservar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Tool className="mr-2 h-4 w-4" />
                                  Manutenção
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {emergencyMode && (
                                  <DropdownMenuItem className="text-red-600">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Requisição Emergência
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>{" "}
        {/* Rooms Tab */}
        <TabsContent className="space-y-6" value="rooms">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Salas e Ambientes</CardTitle>
              <CardDescription>
                {filteredRooms.length} salas de {mockRoomData.length} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRooms.map((room) => {
                  const statusInfo = getRoomStatusInfo(room.status);
                  const { icon: StatusIcon } = statusInfo;
                  const occupancyPercentage = (room.currentOccupancy / room.capacity) * 100;

                  return (
                    <Card
                      className="transition-shadow hover:shadow-md"
                      key={room.id}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{room.name}</CardTitle>
                          <div className="flex items-center space-x-1">
                            <div
                              className={`rounded-full p-1 ${statusInfo.bg}`}
                            >
                              <StatusIcon
                                className={`h-3 w-3 ${statusInfo.color}`}
                              />
                            </div>
                            <span className="font-medium text-xs">
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                          <Badge variant="outline">
                            {roomTypeLabels[room.type]}
                          </Badge>
                          <span>•</span>
                          <span>{room.floor}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Occupancy */}
                        <div>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span>Ocupação</span>
                            <span>
                              {room.currentOccupancy}/{room.capacity}
                            </span>
                          </div>
                          <Progress
                            className="h-2"
                            value={occupancyPercentage}
                          />
                        </div>

                        {/* Features */}
                        <div>
                          <p className="mb-2 font-medium text-sm">Recursos</p>
                          <div className="flex flex-wrap gap-1">
                            {room.features.slice(0, 3).map((feature) => (
                              <Badge
                                className="text-xs"
                                key={feature}
                                variant="secondary"
                              >
                                {feature}
                              </Badge>
                            ))}
                            {room.features.length > 3 && (
                              <Badge className="text-xs" variant="outline">
                                +{room.features.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Sanitation Status */}
                        <div className="flex items-center justify-between text-sm">
                          <span>Higienização</span>
                          <div className="flex items-center space-x-1">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                room.sanitationStatus === "clean"
                                  ? "bg-green-500"
                                  : room.sanitationStatus === "cleaning"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <span className="text-xs capitalize">
                              {room.sanitationStatus}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 pt-2">
                          <Button
                            className="flex-1"
                            size="sm"
                            variant="outline"
                          >
                            <Calendar className="mr-1 h-3 w-3" />
                            Reservar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Supplies Tab */}
        <TabsContent className="space-y-6" value="supplies">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gestão de Suprimentos</CardTitle>
              <CardDescription>
                Controle de estoque e suprimentos médicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center text-muted-foreground">
                📦 Sistema de gestão de suprimentos será implementado aqui
                <br />
                <span className="text-sm">
                  Integração com controle de estoque, alertas de reposição e rastreabilidade
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
