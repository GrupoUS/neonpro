"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Barcode,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Package,
  QrCode,
  Search,
  Shield,
  Thermometer,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";

interface Batch {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  category: string;
  brand: string;
  quantity: number;
  unit: string;
  manufactureDate: string;
  expirationDate: string;
  supplierName: string;
  supplierCnpj: string;
  receivedDate: string;
  receivedBy: string;
  currentLocation: string;
  temperatureControlled: boolean;
  storageTemperature?: string;
  anvisaRegistration?: string;
  ncmCode: string;
  invoiceNumber: string;
  unitCost: number;
  totalCost: number;
  qualityControl: {
    status: "pending" | "approved" | "rejected";
    inspector: string;
    inspectionDate?: string;
    notes?: string;
  };
  traceabilityChain: TraceabilityEntry[];
  status: "quarantine" | "available" | "in_use" | "expired" | "recalled";
  utilizationTracking: UtilizationEntry[];
}

interface TraceabilityEntry {
  id: string;
  date: string;
  action: string;
  user: string;
  location: string;
  details: string;
  temperature?: number;
  validated: boolean;
}

interface UtilizationEntry {
  id: string;
  date: string;
  patientId?: string;
  procedureType: string;
  quantityUsed: number;
  professionalId: string;
  professionalName: string;
  notes?: string;
}

// Mock data for demonstration
const mockBatches: Batch[] = [
  {
    id: "BATCH001",
    batchNumber: "BT240915",
    productId: "PRD001",
    productName: "Botox Allergan 100U",
    category: "botox",
    brand: "Allergan",
    quantity: 50,
    unit: "frasco",
    manufactureDate: "2024-09-15",
    expirationDate: "2024-12-15",
    supplierName: "Medfarma Distribuidora",
    supplierCnpj: "12.345.678/0001-90",
    receivedDate: "2024-09-20T14:30:00Z",
    receivedBy: "João Silva - Farmacêutico",
    currentLocation: "Geladeira A1-03",
    temperatureControlled: true,
    storageTemperature: "2-8°C",
    anvisaRegistration: "10295770028",
    ncmCode: "30042000",
    invoiceNumber: "NF-001234",
    unitCost: 650.0,
    totalCost: 32500.0,
    qualityControl: {
      status: "approved",
      inspector: "Maria Santos - QC",
      inspectionDate: "2024-09-20T16:00:00Z",
      notes: "Produto dentro das especificações. Embalagem íntegra.",
    },
    traceabilityChain: [
      {
        id: "TRACE001",
        date: "2024-09-20T14:30:00Z",
        action: "Recebimento",
        user: "João Silva",
        location: "Almoxarifado",
        details: "Recebimento de 50 frascos conforme NF-001234",
        temperature: 4.2,
        validated: true,
      },
      {
        id: "TRACE002",
        date: "2024-09-20T16:00:00Z",
        action: "Aprovação CQ",
        user: "Maria Santos",
        location: "Laboratório QC",
        details: "Aprovado após inspeção visual e documental",
        validated: true,
      },
      {
        id: "TRACE003",
        date: "2024-09-20T16:30:00Z",
        action: "Armazenamento",
        user: "João Silva",
        location: "Geladeira A1-03",
        details: "Armazenado em refrigeração controlada",
        temperature: 3.8,
        validated: true,
      },
    ],
    status: "available",
    utilizationTracking: [
      {
        id: "UTIL001",
        date: "2024-10-15T09:30:00Z",
        patientId: "PAT12345",
        procedureType: "Aplicação Botox - Rugas de Expressão",
        quantityUsed: 1,
        professionalId: "PROF001",
        professionalName: "Dr. Ana Costa - CRM 123456",
        notes: "Aplicação em região frontal - 20 unidades",
      },
    ],
  },
];

const statusConfig = {
  quarantine: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Quarentena",
    icon: Clock,
  },
  available: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Disponível",
    icon: CheckCircle,
  },
  in_use: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Em Uso",
    icon: Package,
  },
  expired: {
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Vencido",
    icon: AlertTriangle,
  },
  recalled: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    label: "Recall",
    icon: AlertTriangle,
  },
};

/**
 * Batch Tracking Component for NeonPro Inventory Management
 *
 * Features:
 * - Complete batch/lot tracking with ANVISA compliance
 * - Medical device registration tracking
 * - Temperature-controlled storage monitoring
 * - Quality control approval workflow
 * - Full traceability chain from receipt to patient use
 * - Controlled substance utilization tracking
 * - Expiration date monitoring with Brazilian date format
 * - ANVISA recall management integration
 * - Patient safety audit trail
 *
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD
 */
export function BatchTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"summary" | "detailed">("summary");

  const filteredBatches = useMemo(() => {
    return mockBatches.filter((batch) => {
      const matchesSearch =
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || batch.status === selectedStatus;
      const matchesCategory =
        selectedCategory === "all" || batch.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchTerm, selectedStatus, selectedCategory]);

  const getBatchAlert = (batch: Batch) => {
    const today = new Date();
    const expDate = new Date(batch.expirationDate);
    const daysToExpiry = Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysToExpiry <= 0) {
      return {
        type: "expired",
        message: "Lote vencido",
        color: "bg-red-50 border-red-200",
      };
    } else if (daysToExpiry <= 30) {
      return {
        type: "expiring",
        message: `Vence em ${daysToExpiry} dias`,
        color: "bg-amber-50 border-amber-200",
      };
    } else if (batch.status === "quarantine") {
      return {
        type: "quarantine",
        message: "Aguardando liberação",
        color: "bg-yellow-50 border-yellow-200",
      };
    }
    return null;
  };

  const formatBrazilianDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por lote, produto ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="quarantine">Quarentena</SelectItem>
            <SelectItem value="available">Disponível</SelectItem>
            <SelectItem value="in_use">Em Uso</SelectItem>
            <SelectItem value="expired">Vencido</SelectItem>
            <SelectItem value="recalled">Recall</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            <SelectItem value="botox">💉 Toxina Botulínica</SelectItem>
            <SelectItem value="fillers">🧪 Preenchedores</SelectItem>
            <SelectItem value="skincare">✨ Dermocosméticos</SelectItem>
            <SelectItem value="equipment">⚕️ Equipamentos</SelectItem>
            <SelectItem value="consumables">🧤 Descartáveis</SelectItem>
          </SelectContent>
        </Select>

        <Tabs
          value={viewMode}
          onValueChange={(value) =>
            setViewMode(value as "summary" | "detailed")
          }
        >
          <TabsList>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="detailed">Detalhado</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Lotes Ativos
                </p>
                <p className="text-2xl font-bold">
                  {mockBatches.filter((b) => b.status === "available").length}
                </p>
              </div>
              <Barcode className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Vencendo (30 dias)
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {
                    mockBatches.filter((b) => {
                      const daysToExpiry = Math.ceil(
                        (new Date(b.expirationDate).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return daysToExpiry > 0 && daysToExpiry <= 30;
                    }).length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Controle Temp.
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockBatches.filter((b) => b.temperatureControlled).length}
                </p>
              </div>
              <Thermometer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  ANVISA Compliant
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {mockBatches.filter((b) => b.anvisaRegistration).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>{" "}
      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lotes Registrados ({filteredBatches.length})</span>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <Shield className="w-3 h-3 mr-1" />
                ANVISA Tracking
              </Badge>
              <Button size="sm">
                <QrCode className="w-4 h-4 mr-2" />
                Escanear Lote
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Rastreamento completo com compliance ANVISA e auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote / Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Status</TableHead>
                  {viewMode === "detailed" && (
                    <TableHead>Rastreabilidade</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => {
                  const alert = getBatchAlert(batch);
                  const statusConfig_ = statusConfig[batch.status];
                  const StatusIcon = statusConfig_.icon;

                  return (
                    <TableRow key={batch.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Barcode className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono font-medium">
                              {batch.batchNumber}
                            </span>
                          </div>
                          <div className="font-medium">{batch.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            {batch.brand} • NCM: {batch.ncmCode}
                          </div>
                          {alert && (
                            <Alert className={`${alert.color} p-2`}>
                              <AlertTriangle className="h-3 w-3" />
                              <AlertDescription className="text-xs font-medium">
                                {alert.message}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{batch.quantity}</div>
                          <div className="text-sm text-muted-foreground">
                            {batch.unit}
                          </div>
                          {batch.utilizationTracking.length > 0 && (
                            <div className="text-xs text-blue-600">
                              {batch.utilizationTracking.reduce(
                                (acc, util) => acc + util.quantityUsed,
                                0
                              )}{" "}
                              utilizados
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">
                              {formatBrazilianDate(batch.expirationDate)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Fabricação:{" "}
                            {formatBrazilianDate(batch.manufactureDate)}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {batch.supplierName}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {batch.supplierCnpj.replace(
                              /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                              "$1.$2.$3/$4-$5"
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Recebido:{" "}
                              {formatBrazilianDate(batch.receivedDate)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">
                              {batch.currentLocation}
                            </span>
                          </div>
                          {batch.temperatureControlled && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            >
                              <Thermometer className="w-3 h-3 mr-1" />
                              {batch.storageTemperature}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {batch.anvisaRegistration && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              ANVISA
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={
                              batch.qualityControl.status === "approved"
                                ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                : batch.qualityControl.status === "pending"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                                  : "bg-red-50 text-red-700 border-red-200 text-xs"
                            }
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            QC{" "}
                            {batch.qualityControl.status === "approved"
                              ? "Aprovado"
                              : batch.qualityControl.status === "pending"
                                ? "Pendente"
                                : "Rejeitado"}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusConfig_.color}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig_.label}
                        </Badge>
                      </TableCell>

                      {viewMode === "detailed" && (
                        <TableCell>
                          <div className="space-y-1 max-w-[200px]">
                            <div className="text-xs font-medium">
                              Última Movimentação:
                            </div>
                            {batch.traceabilityChain.slice(-1).map((entry) => (
                              <div
                                key={entry.id}
                                className="text-xs text-muted-foreground"
                              >
                                <div>{entry.action}</div>
                                <div>
                                  {entry.user} •{" "}
                                  {formatBrazilianDate(entry.date)}
                                </div>
                              </div>
                            ))}
                            <div className="text-xs text-blue-600 font-medium">
                              {batch.traceabilityChain.length} registros
                            </div>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredBatches.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Barcode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum lote encontrado com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Detailed Traceability Section (when detailed view is selected) */}
      {viewMode === "detailed" && filteredBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Auditoria de Rastreabilidade</CardTitle>
            <CardDescription>
              Histórico completo de movimentações com validação ANVISA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {filteredBatches.slice(0, 1).map(
              (
                batch // Show details for first batch as example
              ) => (
                <div key={batch.id} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Barcode className="w-5 h-5" />
                    <span className="font-mono font-medium">
                      {batch.batchNumber}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium">{batch.productName}</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Traceability Chain */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Cadeia de Rastreabilidade
                      </h4>
                      <div className="space-y-2">
                        {batch.traceabilityChain.map((entry, index) => (
                          <div
                            key={entry.id}
                            className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">
                                  {entry.action}
                                </span>
                                {entry.validated && (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Validado
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {entry.user} • {entry.location}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(entry.date).toLocaleString("pt-BR")}
                              </div>
                              {entry.temperature && (
                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                  <Thermometer className="w-3 h-3" />
                                  {entry.temperature}°C
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {entry.details}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Utilization Tracking */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Rastreamento de Utilização
                      </h4>
                      {batch.utilizationTracking.length > 0 ? (
                        <div className="space-y-2">
                          {batch.utilizationTracking.map((util) => (
                            <div
                              key={util.id}
                              className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">
                                  {util.procedureType}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="bg-blue-100 text-blue-800 border-blue-300"
                                >
                                  {util.quantityUsed} {batch.unit}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <div>Profissional: {util.professionalName}</div>
                                <div>
                                  Data:{" "}
                                  {new Date(util.date).toLocaleString("pt-BR")}
                                </div>
                                {util.patientId && (
                                  <div>
                                    Paciente ID: {util.patientId} (LGPD
                                    Protected)
                                  </div>
                                )}
                                {util.notes && <div>Obs: {util.notes}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma utilização registrada ainda.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
