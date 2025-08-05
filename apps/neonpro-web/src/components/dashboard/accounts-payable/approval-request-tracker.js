"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ApprovalRequestTracker;
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var progress_1 = require("@/components/ui/progress");
var textarea_1 = require("@/components/ui/textarea");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var statusConfig = {
    pending: {
        label: "Pendente",
        color: "bg-yellow-100 text-yellow-800",
        icon: lucide_react_1.Clock,
    },
    approved: {
        label: "Aprovado",
        color: "bg-green-100 text-green-800",
        icon: lucide_react_1.CheckCircle,
    },
    rejected: {
        label: "Rejeitado",
        color: "bg-red-100 text-red-800",
        icon: lucide_react_1.XCircle,
    },
    escalated: {
        label: "Escalado",
        color: "bg-orange-100 text-orange-800",
        icon: lucide_react_1.AlertTriangle,
    },
    skipped: {
        label: "Pulado",
        color: "bg-blue-100 text-blue-800",
        icon: lucide_react_1.FastForward,
    },
    cancelled: {
        label: "Cancelado",
        color: "bg-gray-100 text-gray-800",
        icon: lucide_react_1.XCircle,
    },
};
var priorityConfig = {
    low: { label: "Baixa", color: "bg-blue-100 text-blue-800" },
    normal: { label: "Normal", color: "bg-gray-100 text-gray-800" },
    high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
    urgent: { label: "Urgente", color: "bg-red-100 text-red-800" },
};
function ApprovalRequestTracker(_a) {
    var _this = this;
    var requestId = _a.requestId, open = _a.open, onOpenChange = _a.onOpenChange;
    var _b = (0, react_1.useState)(false), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), request = _c[0], setRequest = _c[1];
    var _d = (0, react_1.useState)(false), showActionModal = _d[0], setShowActionModal = _d[1];
    var _e = (0, react_1.useState)("approve"), selectedAction = _e[0], setSelectedAction = _e[1];
    var _f = (0, react_1.useState)(""), actionComments = _f[0], setActionComments = _f[1];
    var _g = (0, react_1.useState)(""), currentStepId = _g[0], setCurrentStepId = _g[1];
    (0, react_1.useEffect)(function () {
        if (open && requestId) {
            loadApprovalRequest();
        }
    }, [open, requestId]);
    var loadApprovalRequest = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockRequest;
        return __generator(this, function (_a) {
            setLoading(true);
            try {
                mockRequest = {
                    id: requestId || "req_1",
                    accounts_payable_id: "ap_001",
                    requester_id: "user_req",
                    requester_name: "Ana Silva",
                    request_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    amount: 15000,
                    current_level: 2,
                    status: "pending",
                    priority: "high",
                    reason: "Aprovação necessária para pagamento de equipamento médico",
                    justification: "Equipamento necessário para expansão do atendimento. Orçamento já aprovado no planejamento anual.",
                    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
                            deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                            completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                            approvers: [
                                {
                                    id: "action_1",
                                    approval_step_id: "step_1",
                                    approver_id: "approver_1",
                                    approver_name: "João Santos",
                                    approver_email: "joao@neonpro.com",
                                    action: "approve",
                                    comments: "Aprovado. Equipamento necessário conforme solicitado.",
                                    action_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
                            deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
                            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                            approvers: [],
                        },
                    ],
                };
                setRequest(mockRequest);
            }
            catch (error) {
                console.error("Error loading approval request:", error);
                sonner_1.toast.error("Erro ao carregar solicitação de aprovação");
            }
            finally {
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var handleApprovalAction = function () { return __awaiter(_this, void 0, void 0, function () {
        var actionData_1;
        return __generator(this, function (_a) {
            if (!request || !currentStepId)
                return [2 /*return*/];
            setLoading(true);
            try {
                actionData_1 = {
                    approval_step_id: currentStepId,
                    approver_id: "current_user",
                    approver_name: "Usuário Atual",
                    approver_email: "user@neonpro.com",
                    action: selectedAction,
                    comments: actionComments,
                    action_date: new Date().toISOString(),
                };
                // In real implementation, this would call the API
                console.log("Processing approval action:", actionData_1);
                // Update local state (mock behavior)
                setRequest(function (prevRequest) {
                    if (!prevRequest)
                        return null;
                    var updatedChain = prevRequest.approval_chain.map(function (step) {
                        if (step.id === currentStepId) {
                            var newApprovers = __spreadArray(__spreadArray([], step.approvers, true), [
                                actionData_1,
                            ], false);
                            var approvedCount = selectedAction === "approve"
                                ? step.approved_count + 1
                                : step.approved_count;
                            var stepStatus = selectedAction === "reject"
                                ? "rejected"
                                : approvedCount >= step.required_approvers
                                    ? "approved"
                                    : "pending";
                            return __assign(__assign({}, step), { approvers: newApprovers, approved_count: approvedCount, status: stepStatus, completed_at: stepStatus !== "pending" ? new Date().toISOString() : undefined });
                        }
                        return step;
                    });
                    // Update request status based on chain
                    var currentStep = updatedChain.find(function (s) { return s.level_order === prevRequest.current_level; });
                    var newStatus = (currentStep === null || currentStep === void 0 ? void 0 : currentStep.status) === "approved"
                        ? prevRequest.current_level < updatedChain.length
                            ? "pending"
                            : "approved"
                        : (currentStep === null || currentStep === void 0 ? void 0 : currentStep.status) === "rejected"
                            ? "rejected"
                            : "pending";
                    var newCurrentLevel = (currentStep === null || currentStep === void 0 ? void 0 : currentStep.status) === "approved" &&
                        prevRequest.current_level < updatedChain.length
                        ? prevRequest.current_level + 1
                        : prevRequest.current_level;
                    return __assign(__assign({}, prevRequest), { approval_chain: updatedChain, status: newStatus, current_level: newCurrentLevel, updated_at: new Date().toISOString() });
                });
                sonner_1.toast.success("Ação processada com sucesso");
                setShowActionModal(false);
                setActionComments("");
            }
            catch (error) {
                console.error("Error processing action:", error);
                sonner_1.toast.error("Erro ao processar ação");
            }
            finally {
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var getProgressPercentage = function () {
        if (!request)
            return 0;
        var totalSteps = request.approval_chain.length;
        var completedSteps = request.approval_chain.filter(function (s) { return s.status === "approved"; }).length;
        return Math.round((completedSteps / totalSteps) * 100);
    };
    var getCurrentStep = function () {
        return request === null || request === void 0 ? void 0 : request.approval_chain.find(function (s) { return s.level_order === request.current_level; });
    };
    var canTakeAction = function (step) {
        // In real implementation, this would check user permissions
        return (step.status === "pending" && step.level_order === (request === null || request === void 0 ? void 0 : request.current_level));
    };
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(amount);
    };
    var getTimeRemaining = function (deadline) {
        var now = new Date();
        var deadlineDate = new Date(deadline);
        var diff = deadlineDate.getTime() - now.getTime();
        if (diff < 0)
            return { text: "Vencido", isOverdue: true };
        var hours = Math.floor(diff / (1000 * 60 * 60));
        var days = Math.floor(hours / 24);
        if (days > 0) {
            return {
                text: "".concat(days, " dia").concat(days > 1 ? "s" : "", " restante").concat(days > 1 ? "s" : ""),
                isOverdue: false,
            };
        }
        else {
            return {
                text: "".concat(hours, " hora").concat(hours > 1 ? "s" : "", " restante").concat(hours > 1 ? "s" : ""),
                isOverdue: false,
            };
        }
    };
    if (loading && !request) {
        return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
        <dialog_1.DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <lucide_react_1.Loader2 className="h-8 w-8 animate-spin"/>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>);
    }
    if (!request)
        return null;
    var currentStep = getCurrentStep();
    var progressPercentage = getProgressPercentage();
    var StatusIcon = statusConfig[request.status].icon;
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.FileText className="h-5 w-5"/>
            Solicitação de Aprovação #{request.id}
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Acompanhe o progresso da aprovação desta conta a pagar
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Request Summary */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-sm flex items-center justify-between">
                Resumo da Solicitação
                <div className="flex items-center gap-2">
                  <badge_1.Badge className={(0, utils_1.cn)("text-xs", priorityConfig[request.priority].color)}>
                    {priorityConfig[request.priority].label}
                  </badge_1.Badge>
                  <badge_1.Badge className={(0, utils_1.cn)("text-xs", statusConfig[request.status].color)}>
                    <StatusIcon className="h-3 w-3 mr-1"/>
                    {statusConfig[request.status].label}
                  </badge_1.Badge>
                </div>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">
                    Solicitante
                  </p>
                  <p>{request.requester_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(0, date_fns_1.format)(new Date(request.request_date), "dd/MM/yyyy HH:mm", { locale: locale_1.ptBR })}
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
                    {(0, date_fns_1.format)(new Date(request.due_date), "dd/MM/yyyy", {
            locale: locale_1.ptBR,
        })}
                  </p>
                  <p className={(0, utils_1.cn)("text-xs", getTimeRemaining(request.due_date).isOverdue
            ? "text-red-600"
            : "text-muted-foreground")}>
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
                <progress_1.Progress value={progressPercentage} className="h-2"/>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Nível {request.current_level} de{" "}
                    {request.approval_chain.length}
                  </span>
                  <span>
                    {currentStep
            ? "Aguardando: ".concat(currentStep.level_name)
            : "Concluído"}
                  </span>
                </div>
              </div>

              {/* Justification */}
              {request.justification && (<div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-sm text-muted-foreground mb-1">
                    Justificativa:
                  </p>
                  <p className="text-sm">{request.justification}</p>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>

          {/* Approval Chain */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-sm">Cadeia de Aprovação</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {request.approval_chain.map(function (step, index) {
            var _a, _b;
            var StepStatusIcon = ((_a = statusConfig[step.status]) === null || _a === void 0 ? void 0 : _a.icon) || lucide_react_1.Clock;
            var isActive = step.level_order === request.current_level;
            var canAction = canTakeAction(step);
            var timeInfo = getTimeRemaining(step.deadline);
            return (<div key={step.id} className="relative">
                      {/* Connection Line */}
                      {index < request.approval_chain.length - 1 && (<div className="absolute left-4 top-12 w-0.5 h-16 bg-border"/>)}

                      <div className={(0, utils_1.cn)("flex items-start gap-4 p-4 rounded-lg border", isActive && "bg-blue-50 border-blue-200", step.status === "approved" &&
                    "bg-green-50 border-green-200", step.status === "rejected" &&
                    "bg-red-50 border-red-200")}>
                        {/* Step Icon */}
                        <div className={(0, utils_1.cn)("w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium", step.status === "approved" && "bg-green-500", step.status === "rejected" && "bg-red-500", step.status === "pending" &&
                    isActive &&
                    "bg-blue-500", step.status === "pending" &&
                    !isActive &&
                    "bg-gray-400")}>
                          {step.status === "pending" ? (step.level_order) : (<StepStatusIcon className="h-4 w-4"/>)}
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
                                <badge_1.Badge className={(0, utils_1.cn)("text-xs", step.status === "approved" &&
                    "bg-green-100 text-green-800", step.status === "rejected" &&
                    "bg-red-100 text-red-800", step.status === "pending" &&
                    "bg-yellow-100 text-yellow-800")}>
                                  {((_b = statusConfig[step.status]) === null || _b === void 0 ? void 0 : _b.label) ||
                    step.status}
                                </badge_1.Badge>
                              </div>
                              {step.status === "pending" && (<p className={(0, utils_1.cn)("text-xs mt-1", timeInfo.isOverdue
                        ? "text-red-600"
                        : "text-muted-foreground")}>
                                  {timeInfo.text}
                                </p>)}
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
                            {step.approved_count > 0 && (<div className="flex-1 max-w-24">
                                <progress_1.Progress value={(step.approved_count /
                        step.required_approvers) *
                        100} className="h-1.5"/>
                              </div>)}
                          </div>

                          {/* Actions */}
                          {step.approvers.map(function (action) { return (<div key={action.id} className="flex items-start gap-3 p-2 bg-background rounded border">
                              <avatar_1.Avatar className="h-6 w-6">
                                <avatar_1.AvatarFallback className="text-xs">
                                  {action.approver_name.charAt(0)}
                                </avatar_1.AvatarFallback>
                              </avatar_1.Avatar>
                              <div className="flex-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {action.approver_name}
                                  </span>
                                  <badge_1.Badge variant="outline" className={(0, utils_1.cn)("text-xs", action.action === "approve" &&
                        "text-green-600 border-green-200", action.action === "reject" &&
                        "text-red-600 border-red-200")}>
                                    {action.action === "approve" && (<lucide_react_1.ThumbsUp className="h-2.5 w-2.5 mr-1"/>)}
                                    {action.action === "reject" && (<lucide_react_1.ThumbsDown className="h-2.5 w-2.5 mr-1"/>)}
                                    {action.action === "approve"
                        ? "Aprovado"
                        : "Rejeitado"}
                                  </badge_1.Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {(0, date_fns_1.format)(new Date(action.action_date), "dd/MM/yyyy HH:mm", { locale: locale_1.ptBR })}
                                </p>
                                {action.comments && (<p className="text-xs mt-1 p-2 bg-muted rounded">
                                    {action.comments}
                                  </p>)}
                              </div>
                            </div>); })}

                          {/* Action Buttons */}
                          {canAction && (<div className="flex gap-2 pt-2">
                              <button_1.Button size="sm" onClick={function () {
                        setSelectedAction("approve");
                        setCurrentStepId(step.id);
                        setShowActionModal(true);
                    }} className="text-xs">
                                <lucide_react_1.CheckCircle className="h-3 w-3 mr-1"/>
                                Aprovar
                              </button_1.Button>
                              <button_1.Button size="sm" variant="outline" onClick={function () {
                        setSelectedAction("reject");
                        setCurrentStepId(step.id);
                        setShowActionModal(true);
                    }} className="text-xs">
                                <lucide_react_1.XCircle className="h-3 w-3 mr-1"/>
                                Rejeitar
                              </button_1.Button>
                              <button_1.Button size="sm" variant="outline" onClick={function () {
                        setSelectedAction("request_info");
                        setCurrentStepId(step.id);
                        setShowActionModal(true);
                    }} className="text-xs">
                                <lucide_react_1.MessageSquare className="h-3 w-3 mr-1"/>
                                Solicitar Info
                              </button_1.Button>
                              <button_1.Button size="sm" variant="outline" onClick={function () {
                        setSelectedAction("escalate");
                        setCurrentStepId(step.id);
                        setShowActionModal(true);
                    }} className="text-xs">
                                <lucide_react_1.FastForward className="h-3 w-3 mr-1"/>
                                Escalar
                              </button_1.Button>
                            </div>)}
                        </div>
                      </div>
                    </div>);
        })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        <dialog_1.DialogFooter>
          <button_1.Button type="button" variant="outline" onClick={function () { return onOpenChange(false); }}>
            Fechar
          </button_1.Button>
        </dialog_1.DialogFooter>

        {/* Action Modal */}
        <dialog_1.Dialog open={showActionModal} onOpenChange={setShowActionModal}>
          <dialog_1.DialogContent className="max-w-lg">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>
                {selectedAction === "approve" && "Aprovar Solicitação"}
                {selectedAction === "reject" && "Rejeitar Solicitação"}
                {selectedAction === "request_info" && "Solicitar Informações"}
                {selectedAction === "escalate" && "Escalar para Próximo Nível"}
              </dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                {selectedAction === "approve" &&
            "Você está aprovando esta solicitação. Adicione comentários se necessário."}
                {selectedAction === "reject" &&
            "Você está rejeitando esta solicitação. Por favor, explique o motivo."}
                {selectedAction === "request_info" &&
            "Solicite informações adicionais do solicitante."}
                {selectedAction === "escalate" &&
            "Esta solicitação será escalada para o próximo nível."}
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="comments">
                  {selectedAction === "reject"
            ? "Motivo da Rejeição *"
            : "Comentários"}
                </label_1.Label>
                <textarea_1.Textarea id="comments" value={actionComments} onChange={function (e) { return setActionComments(e.target.value); }} placeholder={selectedAction === "approve"
            ? "Comentários sobre a aprovação..."
            : selectedAction === "reject"
                ? "Explique o motivo da rejeição..."
                : "Descreva que informações são necessárias..."} rows={3} required={selectedAction === "reject"}/>
              </div>
            </div>

            <dialog_1.DialogFooter>
              <button_1.Button type="button" variant="outline" onClick={function () { return setShowActionModal(false); }}>
                Cancelar
              </button_1.Button>
              <button_1.Button onClick={handleApprovalAction} disabled={loading ||
            (selectedAction === "reject" && !actionComments.trim())} className={(0, utils_1.cn)(selectedAction === "approve" &&
            "bg-green-600 hover:bg-green-700", selectedAction === "reject" && "bg-red-600 hover:bg-red-700")}>
                {loading && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {!loading && selectedAction === "approve" && (<lucide_react_1.CheckCircle className="mr-2 h-4 w-4"/>)}
                {!loading && selectedAction === "reject" && (<lucide_react_1.XCircle className="mr-2 h-4 w-4"/>)}
                {!loading && selectedAction === "request_info" && (<lucide_react_1.MessageSquare className="mr-2 h-4 w-4"/>)}
                {!loading && selectedAction === "escalate" && (<lucide_react_1.FastForward className="mr-2 h-4 w-4"/>)}
                {loading ? "Processando..." : "Confirmar"}
              </button_1.Button>
            </dialog_1.DialogFooter>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
