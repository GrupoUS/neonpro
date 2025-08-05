"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateManager = TemplateManager;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var label_1 = require("@/components/ui/label");
var client_1 = require("@/lib/supabase/client");
var use_toast_1 = require("@/hooks/use-toast");
var utils_1 = require("@/lib/utils");
var TEMPLATE_TYPES = [
  { value: "email", label: "Email", icon: <lucide_react_1.Mail className="w-4 h-4" /> },
  { value: "sms", label: "SMS", icon: <lucide_react_1.Smartphone className="w-4 h-4" /> },
  { value: "push", label: "Push", icon: <lucide_react_1.MessageSquare className="w-4 h-4" /> },
];
var TEMPLATE_CATEGORIES = [
  "appointment_reminder",
  "appointment_confirmation",
  "treatment_followup",
  "payment_reminder",
  "results_available",
  "welcome",
  "birthday",
  "marketing",
  "emergency",
];
var AVAILABLE_VARIABLES = [
  "{{patient_name}}",
  "{{appointment_date}}",
  "{{appointment_time}}",
  "{{doctor_name}}",
  "{{clinic_name}}",
  "{{treatment_name}}",
  "{{payment_amount}}",
  "{{payment_due_date}}",
  "{{result_type}}",
  "{{emergency_contact}}",
];
function TemplateManager(_a) {
  var _this = this;
  var templates = _a.templates,
    onTemplateUpdate = _a.onTemplateUpdate,
    onTemplateDelete = _a.onTemplateDelete,
    className = _a.className;
  var _b = (0, react_1.useState)(false),
    isEditing = _b[0],
    setIsEditing = _b[1];
  var _c = (0, react_1.useState)(null),
    selectedTemplate = _c[0],
    setSelectedTemplate = _c[1];
  var _d = (0, react_1.useState)(null),
    previewTemplate = _d[0],
    setPreviewTemplate = _d[1];
  var _e = (0, react_1.useState)({
      name: "",
      type: "email",
      category: "appointment_reminder",
      subject: "",
      content: "",
      variables: [],
      is_active: true,
    }),
    formData = _e[0],
    setFormData = _e[1];
  var _f = (0, react_1.useState)(false),
    loading = _f[0],
    setLoading = _f[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var supabase = (0, client_1.createClient)();
  // Abrir editor de template
  var openEditor = function (template) {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        name: template.name,
        type: template.type,
        category: template.category,
        subject: template.subject || "",
        content: template.content,
        variables: template.variables || [],
        is_active: template.is_active,
      });
    } else {
      setSelectedTemplate(null);
      setFormData({
        name: "",
        type: "email",
        category: "appointment_reminder",
        subject: "",
        content: "",
        variables: [],
        is_active: true,
      });
    }
    setIsEditing(true);
  };
  // Fechar editor
  var closeEditor = function () {
    setIsEditing(false);
    setSelectedTemplate(null);
    setFormData({
      name: "",
      type: "email",
      category: "appointment_reminder",
      subject: "",
      content: "",
      variables: [],
      is_active: true,
    });
  };
  // Salvar template
  var saveTemplate = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var variableMatches, extractedVariables, templateData, response, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            variableMatches = formData.content.match(/\{\{[^}]+\}\}/g) || [];
            extractedVariables = __spreadArray([], new Set(variableMatches), true);
            templateData = __assign(__assign({}, formData), {
              variables: extractedVariables,
              clinic_id: "clinic-id",
              updated_at: new Date().toISOString(),
            });
            response = void 0;
            if (!selectedTemplate) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              supabase
                .from("communication_templates")
                .update(templateData)
                .eq("id", selectedTemplate.id)
                .select()
                .single(),
            ];
          case 2:
            // Atualizar template existente
            response = _a.sent();
            return [3 /*break*/, 5];
          case 3:
            return [
              4 /*yield*/,
              supabase
                .from("communication_templates")
                .insert(
                  __assign(__assign({}, templateData), { created_at: new Date().toISOString() }),
                )
                .select()
                .single(),
            ];
          case 4:
            // Criar novo template
            response = _a.sent();
            _a.label = 5;
          case 5:
            if (response.error) throw response.error;
            onTemplateUpdate(response.data);
            closeEditor();
            toast({
              title: selectedTemplate ? "Template atualizado" : "Template criado",
              description: "Template salvo com sucesso.",
            });
            return [3 /*break*/, 8];
          case 6:
            error_1 = _a.sent();
            toast({
              title: "Erro ao salvar template",
              description: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
              variant: "destructive",
            });
            return [3 /*break*/, 8];
          case 7:
            setLoading(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  // Deletar template
  var deleteTemplate = function (templateId) {
    return __awaiter(_this, void 0, void 0, function () {
      var error, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              supabase.from("communication_templates").delete().eq("id", templateId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) throw error;
            onTemplateDelete(templateId);
            toast({
              title: "Template deletado",
              description: "Template removido com sucesso.",
            });
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            toast({
              title: "Erro ao deletar template",
              description: error_2 instanceof Error ? error_2.message : "Erro desconhecido",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Duplicar template
  var duplicateTemplate = function (template) {
    openEditor(
      __assign(__assign({}, template), {
        id: "",
        name: "".concat(template.name, " (C\u00F3pia)"),
        created_at: "",
        updated_at: "",
      }),
    );
  };
  // Renderizar preview do template
  var renderPreview = function (template) {
    var sampleData = {
      "{{patient_name}}": "João Silva",
      "{{appointment_date}}": "15/03/2024",
      "{{appointment_time}}": "14:30",
      "{{doctor_name}}": "Dra. Maria Santos",
      "{{clinic_name}}": "NeonPro Clinic",
      "{{treatment_name}}": "Limpeza de Pele",
      "{{payment_amount}}": "R$ 250,00",
      "{{payment_due_date}}": "20/03/2024",
      "{{result_type}}": "Exame de Sangue",
      "{{emergency_contact}}": "(11) 99999-9999",
    };
    var previewContent = template.content;
    Object.entries(sampleData).forEach(function (_a) {
      var variable = _a[0],
        value = _a[1];
      previewContent = previewContent.replace(new RegExp(variable, "g"), value);
    });
    return previewContent;
  };
  // Inserir variável no conteúdo
  var insertVariable = function (variable) {
    var textarea = document.getElementById("template-content");
    if (textarea) {
      var start_1 = textarea.selectionStart;
      var end = textarea.selectionEnd;
      var newContent_1 =
        formData.content.substring(0, start_1) + variable + formData.content.substring(end);
      setFormData(function (prev) {
        return __assign(__assign({}, prev), { content: newContent_1 });
      });
      // Refocar e posicionar cursor
      setTimeout(function () {
        textarea.focus();
        textarea.setSelectionRange(start_1 + variable.length, start_1 + variable.length);
      }, 0);
    }
  };
  return (
    <div className={(0, utils_1.cn)("space-y-6", className)}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates de Comunicação</h2>
          <p className="text-muted-foreground">
            Gerencie templates para emails, SMS e notificações push
          </p>
        </div>
        <button_1.Button
          onClick={function () {
            return openEditor();
          }}
        >
          <lucide_react_1.Plus className="w-4 h-4 mr-2" />
          Novo Template
        </button_1.Button>
      </div>

      {/* Lista de templates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map(function (template) {
          var _a, _b;
          return (
            <card_1.Card key={template.id} className="relative">
              <card_1.CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <card_1.CardTitle className="text-lg">{template.name}</card_1.CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {(_a = TEMPLATE_TYPES.find(function (t) {
                        return t.value === template.type;
                      })) === null || _a === void 0
                        ? void 0
                        : _a.icon}
                      <badge_1.Badge variant="outline">
                        {(_b = TEMPLATE_TYPES.find(function (t) {
                          return t.value === template.type;
                        })) === null || _b === void 0
                          ? void 0
                          : _b.label}
                      </badge_1.Badge>
                      <badge_1.Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Ativo" : "Inativo"}
                      </badge_1.Badge>
                    </div>
                  </div>
                </div>
              </card_1.CardHeader>

              <card_1.CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Categoria: {template.category.replace("_", " ")}
                  </p>

                  {template.subject && (
                    <div>
                      <label_1.Label className="text-xs">Assunto:</label_1.Label>
                      <p className="text-sm truncate">{template.subject}</p>
                    </div>
                  )}

                  <div>
                    <label_1.Label className="text-xs">Conteúdo:</label_1.Label>
                    <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                  </div>
                </div>

                <separator_1.Separator />

                <div className="flex items-center gap-2">
                  <dialog_1.Dialog>
                    <dialog_1.DialogTrigger asChild>
                      <button_1.Button
                        variant="ghost"
                        size="sm"
                        onClick={function () {
                          return setPreviewTemplate(template);
                        }}
                      >
                        <lucide_react_1.Eye className="w-3 h-3" />
                      </button_1.Button>
                    </dialog_1.DialogTrigger>
                    <dialog_1.DialogContent className="max-w-2xl">
                      <dialog_1.DialogHeader>
                        <dialog_1.DialogTitle>Preview - {template.name}</dialog_1.DialogTitle>
                        <dialog_1.DialogDescription>
                          Visualização com dados de exemplo
                        </dialog_1.DialogDescription>
                      </dialog_1.DialogHeader>
                      <div className="space-y-4">
                        {template.subject && (
                          <div>
                            <label_1.Label>Assunto:</label_1.Label>
                            <p className="font-medium">{template.subject}</p>
                          </div>
                        )}
                        <div>
                          <label_1.Label>Conteúdo:</label_1.Label>
                          <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                            {renderPreview(template)}
                          </div>
                        </div>
                      </div>
                    </dialog_1.DialogContent>
                  </dialog_1.Dialog>

                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    onClick={function () {
                      return openEditor(template);
                    }}
                  >
                    <lucide_react_1.Edit className="w-3 h-3" />
                  </button_1.Button>

                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    onClick={function () {
                      return duplicateTemplate(template);
                    }}
                  >
                    <lucide_react_1.Copy className="w-3 h-3" />
                  </button_1.Button>

                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    onClick={function () {
                      return deleteTemplate(template.id);
                    }}
                    disabled={loading}
                  >
                    <lucide_react_1.Trash2 className="w-3 h-3" />
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>

      {/* Editor de template */}
      <dialog_1.Dialog open={isEditing} onOpenChange={setIsEditing}>
        <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>
              {selectedTemplate ? "Editar Template" : "Novo Template"}
            </dialog_1.DialogTitle>
          </dialog_1.DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* Formulário */}
            <div className="space-y-4">
              <div>
                <label_1.Label htmlFor="template-name">Nome do Template</label_1.Label>
                <input_1.Input
                  id="template-name"
                  value={formData.name}
                  onChange={function (e) {
                    return setFormData(function (prev) {
                      return __assign(__assign({}, prev), { name: e.target.value });
                    });
                  }}
                  placeholder="Ex: Lembrete de Consulta"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label_1.Label htmlFor="template-type">Tipo</label_1.Label>
                  <select_1.Select
                    value={formData.type}
                    onValueChange={function (value) {
                      return setFormData(function (prev) {
                        return __assign(__assign({}, prev), { type: value });
                      });
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {TEMPLATE_TYPES.map(function (type) {
                        return (
                          <select_1.SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.label}
                            </div>
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div>
                  <label_1.Label htmlFor="template-category">Categoria</label_1.Label>
                  <select_1.Select
                    value={formData.category}
                    onValueChange={function (value) {
                      return setFormData(function (prev) {
                        return __assign(__assign({}, prev), { category: value });
                      });
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {TEMPLATE_CATEGORIES.map(function (category) {
                        return (
                          <select_1.SelectItem key={category} value={category}>
                            {category.replace("_", " ")}
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              {formData.type === "email" && (
                <div>
                  <label_1.Label htmlFor="template-subject">Assunto</label_1.Label>
                  <input_1.Input
                    id="template-subject"
                    value={formData.subject}
                    onChange={function (e) {
                      return setFormData(function (prev) {
                        return __assign(__assign({}, prev), { subject: e.target.value });
                      });
                    }}
                    placeholder="Ex: Lembrete: Consulta agendada para {{appointment_date}}"
                  />
                </div>
              )}

              <div>
                <label_1.Label htmlFor="template-content">Conteúdo</label_1.Label>
                <textarea_1.Textarea
                  id="template-content"
                  value={formData.content}
                  onChange={function (e) {
                    return setFormData(function (prev) {
                      return __assign(__assign({}, prev), { content: e.target.value });
                    });
                  }}
                  placeholder="Digite o conteúdo do template..."
                  rows={8}
                />
              </div>

              <div>
                <label_1.Label>Variáveis Disponíveis</label_1.Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {AVAILABLE_VARIABLES.map(function (variable) {
                    return (
                      <button_1.Button
                        key={variable}
                        variant="outline"
                        size="sm"
                        onClick={function () {
                          return insertVariable(variable);
                        }}
                        type="button"
                      >
                        {variable}
                      </button_1.Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div>
                <label_1.Label>Preview</label_1.Label>
                <div className="mt-2 p-4 bg-muted rounded-lg min-h-[200px]">
                  {formData.subject && (
                    <div className="mb-4">
                      <strong>Assunto:</strong>
                      <p>{formData.subject}</p>
                    </div>
                  )}
                  <div>
                    <strong>Conteúdo:</strong>
                    <div className="mt-2 whitespace-pre-wrap">
                      {formData.content || "Digite o conteúdo para ver o preview..."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={closeEditor}>
              <lucide_react_1.X className="w-4 h-4 mr-2" />
              Cancelar
            </button_1.Button>
            <button_1.Button
              onClick={saveTemplate}
              disabled={loading || !formData.name || !formData.content}
            >
              <lucide_react_1.Save className="w-4 h-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Template"}
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}
