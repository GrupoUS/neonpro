"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DuplicateMatch,
  duplicateDetectionSystem,
} from "@/lib/patients/duplicate-detection";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Eye,
  GitMerge,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DuplicateManagerProps {
  onMergeComplete?: (result: any) => void;
}

export default function DuplicateManager({
  onMergeComplete,
}: DuplicateManagerProps) {
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuplicate, setSelectedDuplicate] =
    useState<DuplicateMatch | null>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [fieldComparisons, setFieldComparisons] = useState<any[]>([]);
  const [mergePreview, setMergePreview] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadDuplicates();
  }, []);

  const loadDuplicates = async () => {
    try {
      setLoading(true);
      const data = await duplicateDetectionSystem.detectDuplicates();
      setDuplicates(data);
    } catch (error) {
      console.error("Erro ao carregar duplicatas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewComparison = async (duplicate: DuplicateMatch) => {
    try {
      setSelectedDuplicate(duplicate);
      const comparisons = await duplicateDetectionSystem.comparePatients(
        duplicate.primaryPatientId,
        duplicate.duplicatePatientId
      );
      setFieldComparisons(comparisons);
      setCompareDialogOpen(true);
    } catch (error) {
      console.error("Erro ao comparar pacientes:", error);
    }
  };

  const handleConfirmDuplicate = async (duplicate: DuplicateMatch) => {
    try {
      setProcessing(true);
      await duplicateDetectionSystem.confirmDuplicate(
        duplicate.id,
        "current_user"
      );
      await loadDuplicates();
    } catch (error) {
      console.error("Erro ao confirmar duplicata:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectDuplicate = async (duplicate: DuplicateMatch) => {
    try {
      setProcessing(true);
      await duplicateDetectionSystem.rejectDuplicate(
        duplicate.id,
        "current_user",
        "Não são o mesmo paciente"
      );
      await loadDuplicates();
    } catch (error) {
      console.error("Erro ao rejeitar duplicata:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handlePreviewMerge = async (duplicate: DuplicateMatch) => {
    try {
      setSelectedDuplicate(duplicate);
      const preview = await duplicateDetectionSystem.previewMerge(
        duplicate.primaryPatientId,
        duplicate.duplicatePatientId,
        {
          patientData: "merge_intelligent",
          medicalHistory: "combine",
          appointments: "combine",
          documents: "combine",
          financialData: "keep_primary",
        }
      );
      setMergePreview(preview);
      setMergeDialogOpen(true);
    } catch (error) {
      console.error("Erro no preview de merge:", error);
    }
  };

  const handleExecuteMerge = async () => {
    if (!selectedDuplicate) return;

    try {
      setProcessing(true);
      const result = await duplicateDetectionSystem.mergePatients(
        selectedDuplicate.primaryPatientId,
        selectedDuplicate.duplicatePatientId,
        {
          patientData: "merge_intelligent",
          medicalHistory: "combine",
          appointments: "combine",
          documents: "combine",
          financialData: "keep_primary",
        },
        "current_user"
      );

      setMergeDialogOpen(false);
      await loadDuplicates();
      onMergeComplete?.(result);
    } catch (error) {
      console.error("Erro no merge:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getConfidenceBadgeVariant = (score: number) => {
    if (score >= 0.9) return "destructive";
    if (score >= 0.7) return "default";
    return "secondary";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "confirmed":
        return "destructive";
      case "merged":
        return "default";
      case "rejected":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const pendingDuplicates = duplicates.filter((d) => d.status === "pending");
  const confirmedDuplicates = duplicates.filter(
    (d) => d.status === "confirmed"
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando duplicatas...</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={undefined} className="w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
              <div>
                <p className="text-2xl font-bold">{pendingDuplicates.length}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-red-500 mr-2" />
              <div>
                <p className="text-2xl font-bold">
                  {confirmedDuplicates.length}
                </p>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <GitMerge className="h-4 w-4 text-green-500 mr-2" />
              <div>
                <p className="text-2xl font-bold">
                  {duplicates.filter((d) => d.status === "merged").length}
                </p>
                <p className="text-sm text-muted-foreground">Mescladas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
              <div>
                <p className="text-2xl font-bold">
                  {duplicates.length > 0
                    ? Math.round(
                        (duplicates.reduce(
                          (acc, d) => acc + d.confidenceScore,
                          0
                        ) /
                          duplicates.length) *
                          100
                      )
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Confiança Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Duplicates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Duplicatas Pendentes de Revisão
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingDuplicates.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhuma duplicata pendente encontrada!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {pendingDuplicates.map((duplicate) => (
                <div key={duplicate.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          Possível Duplicata #{duplicate.id}
                        </h3>
                        <Badge
                          variant={getConfidenceBadgeVariant(
                            duplicate.confidenceScore
                          )}
                        >
                          {Math.round(duplicate.confidenceScore * 100)}%
                        </Badge>
                        <Badge
                          variant={getStatusBadgeVariant(duplicate.status)}
                        >
                          {duplicate.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Campos similares:{" "}
                          {duplicate.matchingFields.join(", ")}
                        </p>
                        {duplicate.potentialIssues.length > 0 && (
                          <p className="text-sm text-yellow-600">
                            Possíveis problemas:{" "}
                            {duplicate.potentialIssues.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewComparison(duplicate)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Comparar registros</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreviewMerge(duplicate)}
                            >
                              <GitMerge className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Preview do merge</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Button
                        size="sm"
                        onClick={() => handleConfirmDuplicate(duplicate)}
                        disabled={processing}
                      >
                        Confirmar
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectDuplicate(duplicate)}
                        disabled={processing}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Comparação Detalhada</DialogTitle>
            {selectedDuplicate && (
              <DialogDescription>
                Paciente {selectedDuplicate.primaryPatientId} vs{" "}
                {selectedDuplicate.duplicatePatientId}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4">
            {fieldComparisons.map((comparison, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{comparison.field}</h4>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Principal:</p>
                    <p>{comparison.primaryValue || "(vazio)"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duplicata:</p>
                    <p>{comparison.duplicateValue || "(vazio)"}</p>
                  </div>
                </div>
                <div>
                  <Progress
                    value={comparison.similarity * 100}
                    className="h-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Similaridade: {Math.round(comparison.similarity * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setCompareDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Preview Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview do Merge</DialogTitle>
          </DialogHeader>
          {mergePreview && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Estratégia de Merge</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Dados do Paciente:</span>
                    <span>{mergePreview.strategy.patientData}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Histórico Médico:</span>
                    <span>{mergePreview.strategy.medicalHistory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agendamentos:</span>
                    <span>{mergePreview.strategy.appointments}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">
                  Transferência de Dados Estimada
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    Agendamentos:{" "}
                    {mergePreview.estimatedDataTransfer.appointments}
                  </div>
                  <div>
                    Documentos: {mergePreview.estimatedDataTransfer.documents}
                  </div>
                  <div>
                    Registros Médicos:{" "}
                    {mergePreview.estimatedDataTransfer.medicalRecords}
                  </div>
                  <div>
                    Dados Financeiros:{" "}
                    {mergePreview.estimatedDataTransfer.financialRecords}
                  </div>
                </div>
              </div>

              {mergePreview.potentialConflicts.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Conflitos Potenciais</h4>
                  <div className="space-y-2">
                    {mergePreview.potentialConflicts.map(
                      (conflict: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                          <span>{conflict}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {mergePreview.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recomendações</h4>
                  <div className="space-y-2">
                    {mergePreview.recommendations.map(
                      (recommendation: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                          <span>{recommendation}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExecuteMerge} disabled={processing}>
              {processing ? "Executando..." : "Executar Merge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
