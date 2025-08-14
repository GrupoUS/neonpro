"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FastForward,
  FileText,
  Loader2,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface ApprovalRequest {
  id: string;
  accounts_payable_id: string;
  requester_id: string;
  requester_name: string;
  request_date: string;
  amount: number;
  current_level: number;
  status: "pending" | "approved" | "rejected" | "escalated" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  reason: string;
  justification?: string;
  due_date: string;
  created_at: string;
  updated_at: string;

  // Related data
  vendor_name?: string;
  invoice_number?: string;
  category?: string;

  // Approval chain
  approval_chain: ApprovalStep[];
}

export interface ApprovalStep {
  id: string;
  approval_request_id: string;
  level_order: number;
  level_name: string;
  required_approvers: number;
  approved_count: number;
  status: "pending" | "approved" | "rejected" | "skipped" | "escalated";
  deadline: string;
  created_at: string;
  completed_at?: string;

  // Approvers
  approvers: ApprovalAction[];
}

export interface ApprovalAction {
  id: string;
  approval_step_id: string;
  approver_id: string;
  approver_name: string;
  approver_email: string;
  action: "approve" | "reject" | "request_info" | "escalate";
  comments?: string;
  action_date: string;
  can_override?: boolean;
}

interface ApprovalRequestTrackerProps {
  requestId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pending: {
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  approved: {
    label: "Aprovado",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejeitado",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  escalated: {
    label: "Escalado",
    color: "bg-orange-100 text-orange-800",
    icon: AlertTriangle,
  },
  skipped: {
    label: "Pulado",
    color: "bg-blue-100 text-blue-800",
    icon: FastForward,
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-gray-100 text-gray-800",
    icon: XCircle,
  },
};

const priorityConfig = {
  low: { label: "Baixa", color: "bg-blue-100 text-blue-800" },
  normal: { label: "Normal", color: "bg-gray-100 text-gray-800" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgente", color: "bg-red-100 text-red-800" },
};

export default function ApprovalRequestTracker({
  requestId,
  open,
  onOpenChange,
}: ApprovalRequestTrackerProps) {
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<ApprovalRequest | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "approve" | "reject" | "request_info" | "escalate"
  >("approve");
  const [actionComments, setActionComments] = useState("");
  const [currentStepId, setCurrentStepId] = useState<string>("");

  useEffect(() => {
    if (open && requestId) {
      loadApprovalRequest();
    }
  }, [open, requestId]);

  const loadApprovalRequest = async () => {
    setLoading(true);
    try {
      // Mock data - In real implementation, this would come from API
      const mockRequest: ApprovalRequest = {
        id: requestId || "req_1",
        accounts_payable_id: "ap_001",
        requester_id: "user_req",
        requester_name: "Ana Silva",
        request_date: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        amount: 15000,
        current_level: 2,
        status: "pending",
        priority: "high",
        reason: "Aprovação necessária para pagamento de equipamento médico",
        justification:
          "Equipamento necessário para expansão do atendimento. Orçamento já aprovado no planejamento anual.",
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
        vendor_name: "MedEquip Ltda",
        invoice_number: "INV-2024-001",
        category: "Equipamentos",
        approval_chain: [
          {
            id: "step_1",
            approval_request_id: requestId || "req_1",
            level_order: 1,
            level_name: "Supervisor Direto",
            required_approvers: 1,
            approved_count: 1,
            status: "approved",
            deadline: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
            created_at: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            completed_at: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
            approvers: [
              {
                id: "action_1",
                approval_step_id: "step_1",
                approver_id: "approver_1",
                approver_name: "João Santos",
                approver_email: "joao@neonpro.com",
                action: "approve",
                comments:
                  "Aprovado. Equipamento necessário conforme solicitado.",
                action_date: new Date(
                  Date.now() - 1 * 24 * 60 * 60 * 1000
                ).toISOString(),
              },
            ],
          },
          {
            id: "step_2",
            approval_request_id: requestId || "req_1",
            level_order: 2,
            level_name: "Gerente Departamental",
            required_approvers: 1,
            approved_count: 0,
            status: "pending",
            deadline: new Date(
              Date.now() + 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
            created_at: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
            approvers: [],
          },
          {
            id: "step_3",
            approval_request_id: requestId || "req_1",
            level_order: 3,
            level_name: "Diretor Financeiro",
            required_approvers: 2,
            approved_count: 0,
            status: "pending",
            deadline: new Date(
              Date.now() + 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
            created_at: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
            approvers: [],
          },
        ],
      };

      setRequest(mockRequest);
    } catch (error) {
      console.error("Error loading approval request:", error);
      toast.error("Erro ao carregar solicitação de aprovação");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async () => {
    if (!request || !currentStepId) return;

    setLoading(true);
    try {
      const actionData = {
        approval_step_id: currentStepId,
        approver_id: "current_user",
        approver_name: "Usuário Atual",
        approver_email: "user@neonpro.com",
        action: selectedAction,
        comments: actionComments,
        action_date: new Date().toISOString(),
      };

      // In real implementation, this would call the API
      console.log("Processing approval action:", actionData);

      // Update local state (mock behavior)
      setRequest((prevRequest) => {
        if (!prevRequest) return null;

        const updatedChain = prevRequest.approval_chain.map((step) => {
          if (step.id === currentStepId) {
            const newApprovers = [
              ...step.approvers,
              actionData as ApprovalAction,
            ];
            const approvedCount =
              selectedAction === "approve"
                ? step.approved_count + 1
                : step.approved_count;

            const stepStatus: ApprovalStep["status"] =
              selectedAction === "reject"
                ? "rejected"
                : approvedCount >= step.required_approvers
                ? "approved"
                : "pending";

            return {
              ...step,
              approvers: newApprovers,
              approved_count: approvedCount,
              status: stepStatus,
              completed_at:
                stepStatus !== "pending" ? new Date().toISOString() : undefined,
            };
          }
          return step;
        });

        // Update request status based on chain
        const currentStep = updatedChain.find(
          (s) => s.level_order === prevRequest.current_level
        );
        const newStatus =
          currentStep?.status === "approved"
            ? prevRequest.current_level < updatedChain.length
              ? "pending"
              : "approved"
            : currentStep?.status === "rejected"
            ? "rejected"
            : "pending";

        const newCurrentLevel =
          currentStep?.status === "approved" &&
          prevRequest.current_level < updatedChain.length
            ? prevRequest.current_level + 1
            : prevRequest.current_level;

        return {
          ...prevRequest,
          approval_chain: updatedChain,
          status: newStatus,
          current_level: newCurrentLevel,
          updated_at: new Date().toISOString(),
        };
      });

      toast.success("Ação processada com sucesso");
      setShowActionModal(false);
      setActionComments("");
    } catch (error) {
      console.error("Error processing action:", error);
      toast.error("Erro ao processar ação");
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!request) return 0;
    const totalSteps = request.approval_chain.length;
    const completedSteps = request.approval_chain.filter(
      (s) => s.status === "approved"
    ).length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const getCurrentStep = () => {
    return request?.approval_chain.find(
      (s) => s.level_order === request.current_level
    );
  };

  const canTakeAction = (step: ApprovalStep) => {
    // In real implementation, this would check user permissions
    return (
      step.status === "pending" && step.level_order === request?.current_level
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff < 0) return { text: "Vencido", isOverdue: true };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return {
        text: `${days} dia${days > 1 ? "s" : ""} restante${
          days > 1 ? "s" : ""
        }`,
        isOverdue: false,
      };
    } else {
      return {
        text: `${hours} hora${hours > 1 ? "s" : ""} restante${
          hours > 1 ? "s" : ""
        }`,
        isOverdue: false,
      };
    }
  };

  if (loading && !request) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!request) return null;

  const currentStep = getCurrentStep();
  const progressPercentage = getProgressPercentage();
  const StatusIcon = statusConfig[request.status].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Solicitação de Aprovação #{request.id}
          </DialogTitle>
          <DialogDescription>
            Acompanhe o progresso da aprovação desta conta a pagar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Resumo da Solicitação
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "text-xs",
                      priorityConfig[request.priority].color
                    )}
                  >
                    {priorityConfig[request.priority].label}
                  </Badge>
                  <Badge
                    className={cn(
                      "text-xs",
                      statusConfig[request.status].color
                    )}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[request.status].label}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">
                    Solicitante
                  </p>
                  <p>{request.requester_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(request.request_date),
                      "dd/MM/yyyy HH:mm",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Fornecedor
                  </p>
                  <p>{request.vendor_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.invoice_number}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Valor</p>
                  <p className="font-semibold text-lg">
                    {formatCurrency(request.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.category}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Prazo</p>
                  <p>
                    {format(new Date(request.due_date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      getTimeRemaining(request.due_date).isOverdue
                        ? "text-red-600"
                        : "text-muted-foreground"
                    )}
                  >
                    {getTimeRemaining(request.due_date).text}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso da Aprovação</span>
                  <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Nível {request.current_level} de{" "}
                    {request.approval_chain.length}
                  </span>
                  <span>
                    {currentStep
                      ? `Aguardando: ${currentStep.level_name}`
                      : "Concluído"}
                  </span>
                </div>
              </div>

              {/* Justification */}
              {request.justification && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-sm text-muted-foreground mb-1">
                    Justificativa:
                  </p>
                  <p className="text-sm">{request.justification}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Chain */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cadeia de Aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.approval_chain.map((step, index) => {
                  const StepStatusIcon =
                    statusConfig[step.status]?.icon || Clock;
                  const isActive = step.level_order === request.current_level;
                  const canAction = canTakeAction(step);
                  const timeInfo = getTimeRemaining(step.deadline);

                  return (
                    <div key={step.id} className="relative">
                      {/* Connection Line */}
                      {index < request.approval_chain.length - 1 && (
                        <div className="absolute left-4 top-12 w-0.5 h-16 bg-border" />
                      )}

                      <div
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-lg border",
                          isActive && "bg-blue-50 border-blue-200",
                          step.status === "approved" &&
                            "bg-green-50 border-green-200",
                          step.status === "rejected" &&
                            "bg-red-50 border-red-200"
                        )}
                      >
                        {/* Step Icon */}
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
                            step.status === "approved" && "bg-green-500",
                            step.status === "rejected" && "bg-red-500",
                            step.status === "pending" &&
                              isActive &&
                              "bg-blue-500",
                            step.status === "pending" &&
                              !isActive &&
                              "bg-gray-400"
                          )}
                        >
                          {step.status === "pending" ? (
                            step.level_order
                          ) : (
                            <StepStatusIcon className="h-4 w-4" />
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{step.level_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Nível {step.level_order} •{" "}
                                {step.required_approvers} aprovador
                                {step.required_approvers > 1 ? "es" : ""}{" "}
                                necessário
                                {step.required_approvers > 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    step.status === "approved" &&
                                      "bg-green-100 text-green-800",
                                    step.status === "rejected" &&
                                      "bg-red-100 text-red-800",
                                    step.status === "pending" &&
                                      "bg-yellow-100 text-yellow-800"
                                  )}
                                >
                                  {statusConfig[step.status]?.label ||
                                    step.status}
                                </Badge>
                              </div>
                              {step.status === "pending" && (
                                <p
                                  className={cn(
                                    "text-xs mt-1",
                                    timeInfo.isOverdue
                                      ? "text-red-600"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {timeInfo.text}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                              Progresso:
                            </span>
                            <span className="font-medium">
                              {step.approved_count}/{step.required_approvers}
                            </span>
                            {step.approved_count > 0 && (
                              <div className="flex-1 max-w-24">
                                <Progress
                                  value={
                                    (step.approved_count /
                                      step.required_approvers) *
                                    100
                                  }
                                  className="h-1.5"
                                />
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          {step.approvers.map((action) => (
                            <div
                              key={action.id}
                              className="flex items-start gap-3 p-2 bg-background rounded border"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {action.approver_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {action.approver_name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs",
                                      action.action === "approve" &&
                                        "text-green-600 border-green-200",
                                      action.action === "reject" &&
                                        "text-red-600 border-red-200"
                                    )}
                                  >
                                    {action.action === "approve" && (
                                      <ThumbsUp className="h-2.5 w-2.5 mr-1" />
                                    )}
                                    {action.action === "reject" && (
                                      <ThumbsDown className="h-2.5 w-2.5 mr-1" />
                                    )}
                                    {action.action === "approve"
                                      ? "Aprovado"
                                      : "Rejeitado"}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(action.action_date),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: ptBR }
                                  )}
                                </p>
                                {action.comments && (
                                  <p className="text-xs mt-1 p-2 bg-muted rounded">
                                    {action.comments}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Action Buttons */}
                          {canAction && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedAction("approve");
                                  setCurrentStepId(step.id);
                                  setShowActionModal(true);
                                }}
                                className="text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAction("reject");
                                  setCurrentStepId(step.id);
                                  setShowActionModal(true);
                                }}
                                className="text-xs"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejeitar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAction("request_info");
                                  setCurrentStepId(step.id);
                                  setShowActionModal(true);
                                }}
                                className="text-xs"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Solicitar Info
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAction("escalate");
                                  setCurrentStepId(step.id);
                                  setShowActionModal(true);
                                }}
                                className="text-xs"
                              >
                                <FastForward className="h-3 w-3 mr-1" />
                                Escalar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>

        {/* Action Modal */}
        <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedAction === "approve" && "Aprovar Solicitação"}
                {selectedAction === "reject" && "Rejeitar Solicitação"}
                {selectedAction === "request_info" && "Solicitar Informações"}
                {selectedAction === "escalate" && "Escalar para Próximo Nível"}
              </DialogTitle>
              <DialogDescription>
                {selectedAction === "approve" &&
                  "Você está aprovando esta solicitação. Adicione comentários se necessário."}
                {selectedAction === "reject" &&
                  "Você está rejeitando esta solicitação. Por favor, explique o motivo."}
                {selectedAction === "request_info" &&
                  "Solicite informações adicionais do solicitante."}
                {selectedAction === "escalate" &&
                  "Esta solicitação será escalada para o próximo nível."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comments">
                  {selectedAction === "reject"
                    ? "Motivo da Rejeição *"
                    : "Comentários"}
                </Label>
                <Textarea
                  id="comments"
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  placeholder={
                    selectedAction === "approve"
                      ? "Comentários sobre a aprovação..."
                      : selectedAction === "reject"
                      ? "Explique o motivo da rejeição..."
                      : "Descreva que informações são necessárias..."
                  }
                  rows={3}
                  required={selectedAction === "reject"}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowActionModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleApprovalAction}
                disabled={
                  loading ||
                  (selectedAction === "reject" && !actionComments.trim())
                }
                className={cn(
                  selectedAction === "approve" &&
                    "bg-green-600 hover:bg-green-700",
                  selectedAction === "reject" && "bg-red-600 hover:bg-red-700"
                )}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!loading && selectedAction === "approve" && (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {!loading && selectedAction === "reject" && (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                {!loading && selectedAction === "request_info" && (
                  <MessageSquare className="mr-2 h-4 w-4" />
                )}
                {!loading && selectedAction === "escalate" && (
                  <FastForward className="mr-2 h-4 w-4" />
                )}
                {loading ? "Processando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
