"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEmailTemplates = useEmailTemplates;
exports.useEmailTemplate = useEmailTemplate;
exports.useCreateEmailTemplate = useCreateEmailTemplate;
exports.useUpdateEmailTemplate = useUpdateEmailTemplate;
exports.useDeleteEmailTemplate = useDeleteEmailTemplate;
exports.useSendEmail = useSendEmail;
exports.useSendBulkEmail = useSendBulkEmail;
exports.useEmailPreview = useEmailPreview;
exports.useValidateEmail = useValidateEmail;
exports.useEmailAnalytics = useEmailAnalytics;
exports.useEmailDeliveryReport = useEmailDeliveryReport;
exports.useEmailEvents = useEmailEvents;
exports.useEmailSettings = useEmailSettings;
exports.useUpdateEmailSettings = useUpdateEmailSettings;
exports.useEmailProviders = useEmailProviders;
exports.useCreateEmailProvider = useCreateEmailProvider;
exports.useUpdateEmailProvider = useUpdateEmailProvider;
exports.useDeleteEmailProvider = useDeleteEmailProvider;
exports.useTestEmailProvider = useTestEmailProvider;
exports.useEmailSuppressions = useEmailSuppressions;
exports.useAddEmailSuppression = useAddEmailSuppression;
exports.useRemoveEmailSuppression = useRemoveEmailSuppression;
exports.useEmailQuota = useEmailQuota;
exports.useEmailHealth = useEmailHealth;
var react_query_1 = require("@tanstack/react-query");
var use_toast_1 = require("@/components/ui/use-toast");
// =======================================
// EMAIL TEMPLATE HOOKS
// =======================================
function useEmailTemplates(filters) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["email-templates", filters],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var params, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              params = new URLSearchParams();
              if (filters === null || filters === void 0 ? void 0 : filters.category)
                params.append("category", filters.category);
              if (
                (filters === null || filters === void 0 ? void 0 : filters.isActive) !== undefined
              )
                params.append("isActive", filters.isActive.toString());
              if (filters === null || filters === void 0 ? void 0 : filters.search)
                params.append("search", filters.search);
              return [4 /*yield*/, fetch("/api/email/templates?".concat(params))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch email templates");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
  });
}
function useEmailTemplate(id) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["email-template", id],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, fetch("/api/email/templates/".concat(id))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                if (response.status === 404) return [2 /*return*/, null];
                throw new Error("Failed to fetch email template");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!id,
  });
}
function useCreateEmailTemplate() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  return (0, react_query_1.useMutation)({
    mutationFn: function (template) {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/templates", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(template),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to create email template");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (template) {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast({
        title: "Template criado",
        description: 'Template "'.concat(template.name, '" foi criado com sucesso.'),
      });
    },
    onError: function (error) {
      toast({
        title: "Erro ao criar template",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
function useUpdateEmailTemplate() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response;
        var id = _b.id,
          updates = _b.updates;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/templates/".concat(id), {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updates),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!response.ok) {
                throw new Error("Failed to update email template");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (template) {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      queryClient.invalidateQueries({ queryKey: ["email-template", template.id] });
      toast({
        title: "Template atualizado",
        description: 'Template "'.concat(template.name, '" foi atualizado com sucesso.'),
      });
    },
    onError: function (error) {
      toast({
        title: "Erro ao atualizar template",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
function useDeleteEmailTemplate() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  return (0, react_query_1.useMutation)({
    mutationFn: function (id) {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/templates/".concat(id), {
                  method: "DELETE",
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to delete email template");
              }
              return [2 /*return*/];
          }
        });
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast({
        title: "Template excluído",
        description: "Template foi excluído com sucesso.",
      });
    },
    onError: function (error) {
      toast({
        title: "Erro ao excluir template",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
// =======================================
// EMAIL SENDING HOOKS
// =======================================
function useSendEmail() {
  var _this = this;
  var toast = (0, use_toast_1.useToast)().toast;
  return (0, react_query_1.useMutation)({
    mutationFn: function (message) {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/send", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(message),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to send email");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (result) {
      if (result.success) {
        toast({
          title: "Email enviado",
          description: "Email foi enviado com sucesso.",
        });
      } else {
        toast({
          title: "Falha no envio",
          description: result.error || "Erro desconhecido ao enviar email",
          variant: "destructive",
        });
      }
    },
    onError: function (error) {
      toast({
        title: "Erro ao enviar email",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
function useSendBulkEmail() {
  var _this = this;
  var toast = (0, use_toast_1.useToast)().toast;
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response;
        var messages = _b.messages,
          _c = _b.batchSize,
          batchSize = _c === void 0 ? 10 : _c;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/bulk", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ messages: messages, batchSize: batchSize }),
                }),
              ];
            case 1:
              response = _d.sent();
              if (!response.ok) {
                throw new Error("Failed to send bulk emails");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (result) {
      if (result.success) {
        toast({
          title: "Emails enviados",
          description: ""
            .concat(result.totalSent, " emails enviados com sucesso. ")
            .concat(result.totalFailed, " falharam."),
        });
      } else {
        toast({
          title: "Falha no envio em lote",
          description: "Todos os ".concat(result.totalFailed, " emails falharam."),
          variant: "destructive",
        });
      }
    },
    onError: function (error) {
      toast({
        title: "Erro ao enviar emails em lote",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
// =======================================
// EMAIL PREVIEW & VALIDATION HOOKS
// =======================================
function useEmailPreview() {
  var _this = this;
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response;
        var templateId = _b.templateId,
          variables = _b.variables;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/preview", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ templateId: templateId, variables: variables }),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!response.ok) {
                throw new Error("Failed to preview email");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
  });
}
function useValidateEmail() {
  var _this = this;
  return (0, react_query_1.useMutation)({
    mutationFn: function (email) {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/validate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: email }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to validate email");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
  });
}
// =======================================
// EMAIL ANALYTICS HOOKS
// =======================================
function useEmailAnalytics(filters) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["email-analytics", filters],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var params, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              params = new URLSearchParams();
              if (filters === null || filters === void 0 ? void 0 : filters.startDate)
                params.append("startDate", filters.startDate.toISOString());
              if (filters === null || filters === void 0 ? void 0 : filters.endDate)
                params.append("endDate", filters.endDate.toISOString());
              if (filters === null || filters === void 0 ? void 0 : filters.templateId)
                params.append("templateId", filters.templateId);
              if (filters === null || filters === void 0 ? void 0 : filters.campaignId)
                params.append("campaignId", filters.campaignId);
              return [4 /*yield*/, fetch("/api/email/analytics?".concat(params))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch email analytics");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
  });
}
function useEmailDeliveryReport(messageId) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["email-delivery-report", messageId],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, fetch("/api/email/delivery/".concat(messageId))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                if (response.status === 404) return [2 /*return*/, null];
                throw new Error("Failed to fetch delivery report");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!messageId,
  });
}
function useEmailEvents(filters) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["email-events", filters],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var params, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              params = new URLSearchParams();
              if (filters === null || filters === void 0 ? void 0 : filters.startDate)
                params.append("startDate", filters.startDate.toISOString());
              if (filters === null || filters === void 0 ? void 0 : filters.endDate)
                params.append("endDate", filters.endDate.toISOString());
              if (filters === null || filters === void 0 ? void 0 : filters.messageId)
                params.append("messageId", filters.messageId);
              if (filters === null || filters === void 0 ? void 0 : filters.event)
                params.append("event", filters.event);
              return [4 /*yield*/, fetch("/api/email/events?".concat(params))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch email events");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
  });
}
// =======================================
// EMAIL SETTINGS HOOKS
// =======================================
function useEmailSettings() {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["email-settings"],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, fetch("/api/email/settings")];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                if (response.status === 404) return [2 /*return*/, null];
                throw new Error("Failed to fetch email settings");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
  });
}
function useUpdateEmailSettings() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  return (0, react_query_1.useMutation)({
    mutationFn: function (settings) {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/settings", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(settings),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to update email settings");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({ queryKey: ["email-settings"] });
      toast({
        title: "Configurações atualizadas",
        description: "Configurações de email foram atualizadas com sucesso.",
      });
    },
    onError: function (error) {
      toast({
        title: "Erro ao atualizar configurações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
// =======================================
// EMAIL PROVIDER HOOKS
// =======================================
function useEmailProviders() {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["email-providers"],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, fetch("/api/email/providers")];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch email providers");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
  });
}
function useCreateEmailProvider() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  return (0, react_query_1.useMutation)({
    mutationFn: function (provider) {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/providers", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(provider),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to create email provider");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (provider) {
      queryClient.invalidateQueries({ queryKey: ["email-providers"] });
      toast({
        title: "Provedor criado",
        description: 'Provedor "'.concat(provider.name, '" foi criado com sucesso.'),
      });
    },
    onError: function (error) {
      toast({
        title: "Erro ao criar provedor",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
function useUpdateEmailProvider() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response;
        var id = _b.id,
          updates = _b.updates;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/providers/".concat(id), {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updates),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!response.ok) {
                throw new Error("Failed to update email provider");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (provider) {
      queryClient.invalidateQueries({ queryKey: ["email-providers"] });
      toast({
        title: "Provedor atualizado",
        description: 'Provedor "'.concat(provider.name, '" foi atualizado com sucesso.'),
      });
    },
    onError: function (error) {
      toast({
        title: "Erro ao atualizar provedor",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
function useDeleteEmailProvider() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  return (0, react_query_1.useMutation)({
    mutationFn: function (id) {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/providers/".concat(id), {
                  method: "DELETE",
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to delete email provider");
              }
              return [2 /*return*/];
          }
        });
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({ queryKey: ["email-providers"] });
      toast({
        title: "Provedor excluído",
        description: "Provedor foi excluído com sucesso.",
      });
    },
    onError: function (error) {
      toast({
        title: "Erro ao excluir provedor",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
function useTestEmailProvider() {
  var _this = this;
  var toast = (0, use_toast_1.useToast)().toast;
  return (0, react_query_1.useMutation)({
    mutationFn: function (id) {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/providers/".concat(id, "/test"), {
                  method: "POST",
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to test email provider");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (result) {
      if (result.success) {
        toast({
          title: "Teste bem-sucedido",
          description: result.message || "Provedor testado com sucesso.",
        });
      } else {
        toast({
          title: "Teste falhou",
          description: result.message || "Teste do provedor falhou.",
          variant: "destructive",
        });
      }
    },
    onError: function (error) {
      toast({
        title: "Erro ao testar provedor",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
// =======================================
// EMAIL SUPPRESSION HOOKS
// =======================================
function useEmailSuppressions() {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["email-suppressions"],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, fetch("/api/email/suppressions")];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch email suppressions");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
  });
}
function useAddEmailSuppression() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response;
        var email = _b.email,
          reason = _b.reason;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/suppressions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: email, reason: reason }),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!response.ok) {
                throw new Error("Failed to add email suppression");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({ queryKey: ["email-suppressions"] });
      toast({
        title: "Email suprimido",
        description: "Email foi adicionado à lista de supressão.",
      });
    },
    onError: function (error) {
      toast({
        title: "Erro ao suprimir email",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
function useRemoveEmailSuppression() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  return (0, react_query_1.useMutation)({
    mutationFn: function (email) {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/email/suppressions/".concat(encodeURIComponent(email)), {
                  method: "DELETE",
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to remove email suppression");
              }
              return [2 /*return*/];
          }
        });
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({ queryKey: ["email-suppressions"] });
      toast({
        title: "Supressão removida",
        description: "Email foi removido da lista de supressão.",
      });
    },
    onError: function (error) {
      toast({
        title: "Erro ao remover supressão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}
// =======================================
// UTILITY HOOKS
// =======================================
function useEmailQuota() {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["email-quota"],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, fetch("/api/email/quota")];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch email quota");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
function useEmailHealth() {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["email-health"],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, fetch("/api/email/health")];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch email health");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}
