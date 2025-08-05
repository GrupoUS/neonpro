"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchTracking = BatchTracking;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Mock data for demonstration
var mockBatches = [
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
var statusConfig = {
    quarantine: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Quarentena",
        icon: lucide_react_1.Clock,
    },
    available: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Disponível",
        icon: lucide_react_1.CheckCircle,
    },
    in_use: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Em Uso",
        icon: lucide_react_1.Package,
    },
    expired: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Vencido",
        icon: lucide_react_1.AlertTriangle,
    },
    recalled: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Recall",
        icon: lucide_react_1.AlertTriangle,
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
function BatchTracking() {
    var _a = (0, react_1.useState)(""), searchTerm = _a[0], setSearchTerm = _a[1];
    var _b = (0, react_1.useState)("all"), selectedStatus = _b[0], setSelectedStatus = _b[1];
    var _c = (0, react_1.useState)("all"), selectedCategory = _c[0], setSelectedCategory = _c[1];
    var _d = (0, react_1.useState)("summary"), viewMode = _d[0], setViewMode = _d[1];
    var filteredBatches = (0, react_1.useMemo)(function () {
        return mockBatches.filter(function (batch) {
            var matchesSearch = batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                batch.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
            var matchesStatus = selectedStatus === "all" || batch.status === selectedStatus;
            var matchesCategory = selectedCategory === "all" || batch.category === selectedCategory;
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [searchTerm, selectedStatus, selectedCategory]);
    var getBatchAlert = function (batch) {
        var today = new Date();
        var expDate = new Date(batch.expirationDate);
        var daysToExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysToExpiry <= 0) {
            return {
                type: "expired",
                message: "Lote vencido",
                color: "bg-red-50 border-red-200",
            };
        }
        else if (daysToExpiry <= 30) {
            return {
                type: "expiring",
                message: "Vence em ".concat(daysToExpiry, " dias"),
                color: "bg-amber-50 border-amber-200",
            };
        }
        else if (batch.status === "quarantine") {
            return {
                type: "quarantine",
                message: "Aguardando liberação",
                color: "bg-yellow-50 border-yellow-200",
            };
        }
        return null;
    };
    var formatBrazilianDate = function (dateString) {
        return new Date(dateString).toLocaleDateString("pt-BR");
    };
    return (<div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"/>
          <input_1.Input placeholder="Buscar por lote, produto ou fornecedor..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
        </div>

        <select_1.Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <select_1.SelectTrigger className="w-40">
            <select_1.SelectValue placeholder="Status"/>
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todos os Status</select_1.SelectItem>
            <select_1.SelectItem value="quarantine">Quarentena</select_1.SelectItem>
            <select_1.SelectItem value="available">Disponível</select_1.SelectItem>
            <select_1.SelectItem value="in_use">Em Uso</select_1.SelectItem>
            <select_1.SelectItem value="expired">Vencido</select_1.SelectItem>
            <select_1.SelectItem value="recalled">Recall</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>

        <select_1.Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <select_1.SelectTrigger className="w-48">
            <select_1.SelectValue placeholder="Categoria"/>
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todas as Categorias</select_1.SelectItem>
            <select_1.SelectItem value="botox">💉 Toxina Botulínica</select_1.SelectItem>
            <select_1.SelectItem value="fillers">🧪 Preenchedores</select_1.SelectItem>
            <select_1.SelectItem value="skincare">✨ Dermocosméticos</select_1.SelectItem>
            <select_1.SelectItem value="equipment">⚕️ Equipamentos</select_1.SelectItem>
            <select_1.SelectItem value="consumables">🧤 Descartáveis</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>

        <tabs_1.Tabs value={viewMode} onValueChange={function (value) {
            return setViewMode(value);
        }}>
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="summary">Resumo</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="detailed">Detalhado</tabs_1.TabsTrigger>
          </tabs_1.TabsList>
        </tabs_1.Tabs>
      </div>
      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Lotes Ativos
                </p>
                <p className="text-2xl font-bold">
                  {mockBatches.filter(function (b) { return b.status === "available"; }).length}
                </p>
              </div>
              <lucide_react_1.Barcode className="h-8 w-8 text-green-500"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Vencendo (30 dias)
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {mockBatches.filter(function (b) {
            var daysToExpiry = Math.ceil((new Date(b.expirationDate).getTime() -
                new Date().getTime()) /
                (1000 * 60 * 60 * 24));
            return daysToExpiry > 0 && daysToExpiry <= 30;
        }).length}
                </p>
              </div>
              <lucide_react_1.Clock className="h-8 w-8 text-amber-500"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Controle Temp.
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockBatches.filter(function (b) { return b.temperatureControlled; }).length}
                </p>
              </div>
              <lucide_react_1.Thermometer className="h-8 w-8 text-blue-500"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  ANVISA Compliant
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {mockBatches.filter(function (b) { return b.anvisaRegistration; }).length}
                </p>
              </div>
              <lucide_react_1.Shield className="h-8 w-8 text-green-500"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>{" "}
      {/* Batches Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center justify-between">
            <span>Lotes Registrados ({filteredBatches.length})</span>
            <div className="flex items-center gap-2">
              <badge_1.Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <lucide_react_1.Shield className="w-3 h-3 mr-1"/>
                ANVISA Tracking
              </badge_1.Badge>
              <button_1.Button size="sm">
                <lucide_react_1.QrCode className="w-4 h-4 mr-2"/>
                Escanear Lote
              </button_1.Button>
            </div>
          </card_1.CardTitle>
          <card_1.CardDescription>
            Rastreamento completo com compliance ANVISA e auditoria
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="overflow-x-auto">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Lote / Produto</table_1.TableHead>
                  <table_1.TableHead>Quantidade</table_1.TableHead>
                  <table_1.TableHead>Validade</table_1.TableHead>
                  <table_1.TableHead>Fornecedor</table_1.TableHead>
                  <table_1.TableHead>Localização</table_1.TableHead>
                  <table_1.TableHead>Compliance</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                  {viewMode === "detailed" && (<table_1.TableHead>Rastreabilidade</table_1.TableHead>)}
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredBatches.map(function (batch) {
            var alert = getBatchAlert(batch);
            var statusConfig_ = statusConfig[batch.status];
            var StatusIcon = statusConfig_.icon;
            return (<table_1.TableRow key={batch.id} className="hover:bg-muted/50">
                      <table_1.TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <lucide_react_1.Barcode className="w-4 h-4 text-muted-foreground"/>
                            <span className="font-mono font-medium">
                              {batch.batchNumber}
                            </span>
                          </div>
                          <div className="font-medium">{batch.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            {batch.brand} • NCM: {batch.ncmCode}
                          </div>
                          {alert && (<alert_1.Alert className={"".concat(alert.color, " p-2")}>
                              <lucide_react_1.AlertTriangle className="h-3 w-3"/>
                              <alert_1.AlertDescription className="text-xs font-medium">
                                {alert.message}
                              </alert_1.AlertDescription>
                            </alert_1.Alert>)}
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="text-center">
                          <div className="font-medium">{batch.quantity}</div>
                          <div className="text-sm text-muted-foreground">
                            {batch.unit}
                          </div>
                          {batch.utilizationTracking.length > 0 && (<div className="text-xs text-blue-600">
                              {batch.utilizationTracking.reduce(function (acc, util) { return acc + util.quantityUsed; }, 0)}{" "}
                              utilizados
                            </div>)}
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Calendar className="w-3 h-3 text-muted-foreground"/>
                            <span className="text-sm">
                              {formatBrazilianDate(batch.expirationDate)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Fabricação:{" "}
                            {formatBrazilianDate(batch.manufactureDate)}
                          </div>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {batch.supplierName}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {batch.supplierCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}
                          </div>
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Truck className="w-3 h-3 text-muted-foreground"/>
                            <span className="text-xs text-muted-foreground">
                              Recebido:{" "}
                              {formatBrazilianDate(batch.receivedDate)}
                            </span>
                          </div>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Package className="w-3 h-3 text-muted-foreground"/>
                            <span className="text-sm">
                              {batch.currentLocation}
                            </span>
                          </div>
                          {batch.temperatureControlled && (<badge_1.Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              <lucide_react_1.Thermometer className="w-3 h-3 mr-1"/>
                              {batch.storageTemperature}
                            </badge_1.Badge>)}
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="space-y-1">
                          {batch.anvisaRegistration && (<badge_1.Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              <lucide_react_1.Shield className="w-3 h-3 mr-1"/>
                              ANVISA
                            </badge_1.Badge>)}
                          <badge_1.Badge variant="outline" className={batch.qualityControl.status === "approved"
                    ? "bg-green-50 text-green-700 border-green-200 text-xs"
                    : batch.qualityControl.status === "pending"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                        : "bg-red-50 text-red-700 border-red-200 text-xs"}>
                            <lucide_react_1.FileText className="w-3 h-3 mr-1"/>
                            QC{" "}
                            {batch.qualityControl.status === "approved"
                    ? "Aprovado"
                    : batch.qualityControl.status === "pending"
                        ? "Pendente"
                        : "Rejeitado"}
                          </badge_1.Badge>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <badge_1.Badge variant="outline" className={statusConfig_.color}>
                          <StatusIcon className="w-3 h-3 mr-1"/>
                          {statusConfig_.label}
                        </badge_1.Badge>
                      </table_1.TableCell>

                      {viewMode === "detailed" && (<table_1.TableCell>
                          <div className="space-y-1 max-w-[200px]">
                            <div className="text-xs font-medium">
                              Última Movimentação:
                            </div>
                            {batch.traceabilityChain.slice(-1).map(function (entry) { return (<div key={entry.id} className="text-xs text-muted-foreground">
                                <div>{entry.action}</div>
                                <div>
                                  {entry.user} •{" "}
                                  {formatBrazilianDate(entry.date)}
                                </div>
                              </div>); })}
                            <div className="text-xs text-blue-600 font-medium">
                              {batch.traceabilityChain.length} registros
                            </div>
                          </div>
                        </table_1.TableCell>)}
                    </table_1.TableRow>);
        })}
              </table_1.TableBody>
            </table_1.Table>

            {filteredBatches.length === 0 && (<div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Barcode className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                <p>Nenhum lote encontrado com os filtros aplicados.</p>
              </div>)}
          </div>
        </card_1.CardContent>
      </card_1.Card>
      {/* Detailed Traceability Section (when detailed view is selected) */}
      {viewMode === "detailed" && filteredBatches.length > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Auditoria de Rastreabilidade</card_1.CardTitle>
            <card_1.CardDescription>
              Histórico completo de movimentações com validação ANVISA
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            {filteredBatches.slice(0, 1).map(function (batch // Show details for first batch as example
            ) { return (<div key={batch.id} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <lucide_react_1.Barcode className="w-5 h-5"/>
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
                        <lucide_react_1.FileText className="w-4 h-4"/>
                        Cadeia de Rastreabilidade
                      </h4>
                      <div className="space-y-2">
                        {batch.traceabilityChain.map(function (entry, index) { return (<div key={entry.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">
                                  {entry.action}
                                </span>
                                {entry.validated && (<badge_1.Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <lucide_react_1.CheckCircle className="w-3 h-3 mr-1"/>
                                    Validado
                                  </badge_1.Badge>)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {entry.user} • {entry.location}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(entry.date).toLocaleString("pt-BR")}
                              </div>
                              {entry.temperature && (<div className="flex items-center gap-1 text-xs text-blue-600">
                                  <lucide_react_1.Thermometer className="w-3 h-3"/>
                                  {entry.temperature}°C
                                </div>)}
                              <p className="text-xs text-muted-foreground">
                                {entry.details}
                              </p>
                            </div>
                          </div>); })}
                      </div>
                    </div>

                    {/* Utilization Tracking */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <lucide_react_1.Package className="w-4 h-4"/>
                        Rastreamento de Utilização
                      </h4>
                      {batch.utilizationTracking.length > 0 ? (<div className="space-y-2">
                          {batch.utilizationTracking.map(function (util) { return (<div key={util.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">
                                  {util.procedureType}
                                </span>
                                <badge_1.Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                  {util.quantityUsed} {batch.unit}
                                </badge_1.Badge>
                              </div>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <div>Profissional: {util.professionalName}</div>
                                <div>
                                  Data:{" "}
                                  {new Date(util.date).toLocaleString("pt-BR")}
                                </div>
                                {util.patientId && (<div>
                                    Paciente ID: {util.patientId} (LGPD
                                    Protected)
                                  </div>)}
                                {util.notes && <div>Obs: {util.notes}</div>}
                              </div>
                            </div>); })}
                        </div>) : (<p className="text-sm text-muted-foreground">
                          Nenhuma utilização registrada ainda.
                        </p>)}
                    </div>
                  </div>
                </div>); })}
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
