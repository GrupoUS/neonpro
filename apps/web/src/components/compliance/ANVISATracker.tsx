// ANVISA Controlled Substances Tracker Component  
// React interface for managing controlled substances according to ANVISA regulations

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, Pill, AlertTriangle, Package, FileText, Calendar, 
  Plus, Minus, Check, X, Info, ShieldAlert, TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { 
  anvisaManager, 
  getPrescriptionTypeDescription, 
  getControlClassDescription 
} from "@/lib/compliance/anvisa-controlled-substances";
import type {
  ControlledSubstance,
  PrescriptionRecord,
  StockEntry,
  ANVISAControlClass,
  PrescriptionType,
} from "@/types/compliance";

// =============================================================================
// INTERFACE DEFINITIONS
// =============================================================================

interface ANVISATrackerProps {
  className?: string;
  clinicId: string;
  currentUserId: string;
  userRole: 'doctor' | 'pharmacist' | 'admin';
  onAlert?: (alert: { type: string; message: string; severity: 'low' | 'medium' | 'high' }) => void;
  compactView?: boolean;
}

interface SearchFilters {
  controlClass?: ANVISAControlClass;
  prescriptionType?: PrescriptionType;
  requiresNotification?: boolean;
}

interface PrescriptionFormData {
  substanceId: string;
  patientId: string;
  quantity: number;
  instructions: string;
  prescriptionNumber: string;
}

interface StockUpdateFormData {
  substanceId: string;
  quantity: number;
  operation: 'add' | 'remove' | 'set';
  reason: string;
  batchNumber: string;
  expirationDate: string;
  supplierId: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ANVISATracker({
  className = "",
  clinicId,
  currentUserId,
  userRole,
  onAlert,
  compactView = false,
}: ANVISATrackerProps) {
  // State management
  const [activeTab, setActiveTab] = useState("substances");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [substances, setSubstances] = useState<ControlledSubstance[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [stockAlerts, setStockAlerts] = useState<any>({});
  const [selectedSubstance, setSelectedSubstance] = useState<ControlledSubstance | null>(null);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionFormData>({
    substanceId: "",
    patientId: "",
    quantity: 1,
    instructions: "",
    prescriptionNumber: "",
  });

  const [stockUpdateForm, setStockUpdateForm] = useState<StockUpdateFormData>({
    substanceId: "",
    quantity: 0,
    operation: 'add',
    reason: "",
    batchNumber: "",
    expirationDate: "",
    supplierId: "",
  });

  // Load initial data
  useEffect(() => {
    loadSubstances();
    loadStockAlerts();
    if (userRole === 'doctor' || userRole === 'admin') {
      loadRecentPrescriptions();
    }
  }, [searchQuery, searchFilters]);

  // =============================================================================
  // DATA LOADING FUNCTIONS
  // =============================================================================

  const loadSubstances = useCallback(() => {
    setIsLoading(true);
    try {
      const results = anvisaManager.searchControlledSubstances(searchQuery, searchFilters);
      setSubstances(results);
    } catch (error) {
      console.error("Error loading substances:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, searchFilters]);

  const loadStockAlerts = useCallback(async () => {
    try {
      const alerts = anvisaManager.getStockAlerts(clinicId);
      setStockAlerts(alerts);

      // Emit alerts if handler is provided
      if (onAlert) {
        if (alerts.expired.length > 0) {
          onAlert({
            type: "stock_expired",
            message: `${alerts.expired.length} substâncias vencidas no estoque`,
            severity: "high"
          });
        }
        if (alerts.lowStock.length > 0) {
          onAlert({
            type: "stock_low",
            message: `${alerts.lowStock.length} substâncias com estoque baixo`,
            severity: "medium"
          });
        }
      }
    } catch (error) {
      console.error("Error loading stock alerts:", error);
    }
  }, [clinicId, onAlert]);

  const loadRecentPrescriptions = useCallback(() => {
    // In production, this would load from API
    // For now, we'll show empty state
    setPrescriptions([]);
  }, []);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleCreatePrescription = async () => {
    if (!selectedSubstance || !prescriptionForm.patientId) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await anvisaManager.createPrescriptionRecord({
        substanceId: selectedSubstance.id,
        patientId: prescriptionForm.patientId,
        doctorId: currentUserId,
        quantity: prescriptionForm.quantity,
        instructions: prescriptionForm.instructions,
        prescriptionNumber: prescriptionForm.prescriptionNumber,
        prescriptionType: selectedSubstance.prescriptionType,
        prescribedAt: new Date().toISOString(),
        anvisaReportRequired: selectedSubstance.requiresNotification,
      });

      if (result.success) {
        setShowPrescriptionDialog(false);
        setPrescriptionForm({
          substanceId: "",
          patientId: "",
          quantity: 1,
          instructions: "",
          prescriptionNumber: "",
        });
        loadRecentPrescriptions();
        
        onAlert?.({
          type: "prescription_created",
          message: "Prescrição criada com sucesso",
          severity: "low"
        });
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!stockUpdateForm.substanceId) return;

    setIsLoading(true);

    try {
      const result = await anvisaManager.updateStockEntry(
        stockUpdateForm.substanceId,
        clinicId,
        {
          quantity: stockUpdateForm.quantity,
          operation: stockUpdateForm.operation,
          reason: stockUpdateForm.reason,
          batchNumber: stockUpdateForm.batchNumber,
          expirationDate: stockUpdateForm.expirationDate,
          supplierId: stockUpdateForm.supplierId,
        }
      );

      if (result.success) {
        setShowStockDialog(false);
        setStockUpdateForm({
          substanceId: "",
          quantity: 0,
          operation: 'add',
          reason: "",
          batchNumber: "",
          expirationDate: "",
          supplierId: "",
        });
        loadStockAlerts();
        
        onAlert?.({
          type: "stock_updated",
          message: `Estoque atualizado: ${result.newStockLevel} unidades`,
          severity: "low"
        });
      }
    } catch (error) {
      console.error("Error updating stock:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openPrescriptionDialog = (substance: ControlledSubstance) => {
    setSelectedSubstance(substance);
    setPrescriptionForm(prev => ({ ...prev, substanceId: substance.id }));
    setShowPrescriptionDialog(true);
  };

  const openStockDialog = (substance: ControlledSubstance) => {
    setSelectedSubstance(substance);
    setStockUpdateForm(prev => ({ ...prev, substanceId: substance.id }));
    setShowStockDialog(true);
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderSubstanceCard = (substance: ControlledSubstance) => {
    const validation = anvisaManager.validatePrescriptionParameters(substance.id, 1);
    
    return (
      <Card key={substance.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">{substance.name}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Badge 
                variant="outline"
                className={getControlClassColor(substance.controlClass)}
              >
                {substance.controlClass}
              </Badge>
              {substance.requiresNotification && (
                <Badge variant="secondary" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Notificação
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>{substance.activeIngredient}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Código ANVISA:</strong> {substance.anvisaCode}</p>
              <p><strong>Quantidade máx:</strong> {substance.maxQuantity} unidades</p>
              <p><strong>Validade:</strong> {substance.validityDays} dias</p>
            </div>
            <div>
              <p><strong>Receituário:</strong></p>
              <p className="text-xs text-gray-600">
                {getPrescriptionTypeDescription(substance.prescriptionType)}
              </p>
            </div>
          </div>

          {substance.restrictions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-amber-700 mb-1">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Restrições:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                {substance.restrictions.slice(0, 2).map((restriction, index) => (
                  <li key={index}>• {restriction}</li>
                ))}
                {substance.restrictions.length > 2 && (
                  <li className="text-blue-600">• +{substance.restrictions.length - 2} mais...</li>
                )}
              </ul>
            </div>
          )}

          {(userRole === 'doctor' || userRole === 'admin') && (
            <div className="flex gap-2 pt-2 border-t">
              <Button 
                size="sm" 
                onClick={() => openPrescriptionDialog(substance)}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-1" />
                Prescrever
              </Button>
              {(userRole === 'admin') && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openStockDialog(substance)}
                  className="flex-1"
                >
                  <Package className="w-4 h-4 mr-1" />
                  Estoque
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStockAlerts = () => (
    <div className="space-y-3">
      {stockAlerts.expired?.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <ShieldAlert className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Estoque Vencido ({stockAlerts.expired.length})</strong>
            <p className="text-sm mt-1">
              Substâncias controladas vencidas precisam ser descartadas seguindo protocolo ANVISA.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {stockAlerts.expiringSoon?.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <Calendar className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>Vencimento Próximo ({stockAlerts.expiringSoon.length})</strong>
            <p className="text-sm mt-1">
              Substâncias que vencem nos próximos 30 dias.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {stockAlerts.lowStock?.length > 0 && (
        <Alert className="border-orange-500 bg-orange-50">
          <TrendingDown className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong>Estoque Baixo ({stockAlerts.lowStock.length})</strong>
            <p className="text-sm mt-1">
              Substâncias abaixo do estoque mínimo configurado.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {(!stockAlerts.expired?.length && !stockAlerts.expiringSoon?.length && !stockAlerts.lowStock?.length) && (
        <div className="text-center py-8 text-gray-500">
          <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <p>Nenhum alerta de estoque no momento</p>
          <p className="text-sm">Todos os estoques estão dentro dos parâmetros normais</p>
        </div>
      )}
    </div>
  );

  const renderPrescriptionHistory = () => (
    <div className="space-y-3">
      {prescriptions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3" />
          <p>Nenhuma prescrição recente</p>
          <p className="text-sm">Prescrições de substâncias controladas aparecerão aqui</p>
        </div>
      ) : (
        prescriptions.map((prescription) => (
          <Card key={prescription.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Prescrição #{prescription.prescriptionNumber}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(prescription.prescribedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Badge 
                  variant={prescription.status === 'dispensed' ? 'default' : 'secondary'}
                >
                  {prescription.status === 'dispensed' ? 'Dispensado' : 
                   prescription.status === 'prescribed' ? 'Prescrito' : 
                   'Expirado'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const getControlClassColor = (controlClass: ANVISAControlClass) => {
    const colors = {
      A1: "border-red-500 text-red-700",
      A2: "border-red-400 text-red-600", 
      A3: "border-red-300 text-red-500",
      B1: "border-blue-500 text-blue-700",
      B2: "border-blue-400 text-blue-600",
      C1: "border-green-500 text-green-700",
      C2: "border-green-400 text-green-600",
      C3: "border-green-300 text-green-500",
      C4: "border-purple-500 text-purple-700",
      C5: "border-purple-400 text-purple-600",
    };
    return colors[controlClass] || "border-gray-500 text-gray-700";
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  if (compactView) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            ANVISA Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {renderStockAlerts()}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-600" />
            ANVISA - Controle de Substâncias
          </CardTitle>
          <CardDescription>
            Sistema de rastreamento e controle de substâncias controladas conforme regulamentação ANVISA
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="substances">Substâncias</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescrições</TabsTrigger>
              <TabsTrigger value="stock">Estoque</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="substances" className="mt-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar substância, princípio ativo ou código ANVISA..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select 
                    value={searchFilters.controlClass || ""} 
                    onValueChange={(value) => 
                      setSearchFilters(prev => ({ ...prev, controlClass: value as ANVISAControlClass || undefined }))
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Classe de controle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as classes</SelectItem>
                      <SelectItem value="A1">A1 - Narcóticos (alta)</SelectItem>
                      <SelectItem value="A2">A2 - Narcóticos (média)</SelectItem>
                      <SelectItem value="B1">B1 - Psicotrópicos</SelectItem>
                      <SelectItem value="C1">C1 - Outras controladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {substances.map(renderSubstanceCard)}
                </div>

                {substances.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3" />
                    <p>Nenhuma substância encontrada</p>
                    <p className="text-sm">Tente ajustar os filtros de busca</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="prescriptions" className="mt-4">
              {renderPrescriptionHistory()}
            </TabsContent>

            <TabsContent value="stock" className="mt-4">
              {renderStockAlerts()}
            </TabsContent>

            <TabsContent value="reports" className="mt-4">
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3" />
                <p>Relatórios ANVISA</p>
                <p className="text-sm">Funcionalidade em desenvolvimento</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Prescription Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Prescrição</DialogTitle>
            <DialogDescription>
              {selectedSubstance?.name} - {selectedSubstance?.activeIngredient}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">ID do Paciente *</label>
              <Input
                value={prescriptionForm.patientId}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, patientId: e.target.value }))}
                placeholder="Digite o ID do paciente"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Quantidade *</label>
              <Input
                type="number"
                min="1"
                max={selectedSubstance?.maxQuantity}
                value={prescriptionForm.quantity}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              />
              {selectedSubstance && (
                <p className="text-xs text-gray-600 mt-1">
                  Máximo permitido: {selectedSubstance.maxQuantity} unidades
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Número da Prescrição</label>
              <Input
                value={prescriptionForm.prescriptionNumber}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, prescriptionNumber: e.target.value }))}
                placeholder="Ex: REC-2024-001"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Instruções de Uso</label>
              <Textarea
                value={prescriptionForm.instructions}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Ex: Tomar 1 comprimido a cada 8 horas..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleCreatePrescription}
                disabled={isLoading || !prescriptionForm.patientId}
                className="flex-1"
              >
                {isLoading ? "Criando..." : "Criar Prescrição"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPrescriptionDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Estoque</DialogTitle>
            <DialogDescription>
              {selectedSubstance?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Operação *</label>
              <Select 
                value={stockUpdateForm.operation} 
                onValueChange={(value) => setStockUpdateForm(prev => ({ ...prev, operation: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Adicionar ao estoque</SelectItem>
                  <SelectItem value="remove">Remover do estoque</SelectItem>
                  <SelectItem value="set">Definir quantidade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Quantidade *</label>
              <Input
                type="number"
                min="0"
                value={stockUpdateForm.quantity}
                onChange={(e) => setStockUpdateForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Motivo *</label>
              <Input
                value={stockUpdateForm.reason}
                onChange={(e) => setStockUpdateForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Ex: Compra, venda, expiração, etc."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleUpdateStock}
                disabled={isLoading || !stockUpdateForm.reason}
                className="flex-1"
              >
                {isLoading ? "Atualizando..." : "Atualizar"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowStockDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ANVISATracker;