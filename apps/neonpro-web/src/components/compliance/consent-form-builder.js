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
exports.default = ConsentFormBuilder;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var use_toast_1 = require("@/hooks/use-toast");
var FIELD_TYPES = [
  { value: "text", label: "Text Input", icon: lucide_react_1.Type },
  { value: "textarea", label: "Text Area", icon: lucide_react_1.FileText },
  { value: "select", label: "Dropdown", icon: lucide_react_1.Circle },
  { value: "checkbox", label: "Checkbox", icon: lucide_react_1.CheckSquare },
  { value: "radio", label: "Radio Buttons", icon: lucide_react_1.Circle },
  { value: "date", label: "Date Picker", icon: lucide_react_1.Calendar },
  { value: "signature", label: "Digital Signature", icon: lucide_react_1.Signature },
  { value: "file", label: "File Upload", icon: lucide_react_1.Upload },
];
function ConsentFormBuilder(_a) {
  var _this = this;
  var clinicId = _a.clinicId,
    templateId = _a.templateId,
    onSave = _a.onSave;
  var _b = (0, react_1.useState)({
      title: "",
      description: "",
      version: "1.0",
      form_type: "general",
      clinic_id: clinicId,
      fields: [],
      legal_text: "",
      footer_text: "",
      is_active: false,
    }),
    template = _b[0],
    setTemplate = _b[1];
  var _c = (0, react_1.useState)(null),
    draggedField = _c[0],
    setDraggedField = _c[1];
  var _d = (0, react_1.useState)(false),
    previewMode = _d[0],
    setPreviewMode = _d[1];
  var _e = (0, react_1.useState)(false),
    saving = _e[0],
    setSaving = _e[1];
  var _f = (0, react_1.useState)(false),
    loading = _f[0],
    setLoading = _f[1];
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  (0, react_1.useEffect)(
    function () {
      if (templateId) {
        loadTemplate();
      }
    },
    [templateId],
  );
  var loadTemplate = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var _a, data, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!templateId) return [2 /*return*/];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, 4, 5]);
            setLoading(true);
            return [
              4 /*yield*/,
              supabase.from("consent_forms").select("*").eq("id", templateId).single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error loading template:", error);
              toast({
                title: "Error",
                description: "Failed to load form template",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            setTemplate(data);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _b.sent();
            console.error("Error:", error_1);
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
  var addField = function (type) {
    var newField = __assign(
      {
        id: Math.random().toString(36).substr(2, 9),
        type: type,
        label: "New ".concat(type, " field"),
        required: false,
        order: template.fields.length,
      },
      type === "select" || type === "radio" ? { options: ["Option 1", "Option 2"] } : {},
    );
    setTemplate(function (prev) {
      return __assign(__assign({}, prev), {
        fields: __spreadArray(__spreadArray([], prev.fields, true), [newField], false),
      });
    });
  };
  var updateField = function (fieldId, updates) {
    setTemplate(function (prev) {
      return __assign(__assign({}, prev), {
        fields: prev.fields.map(function (field) {
          return field.id === fieldId ? __assign(__assign({}, field), updates) : field;
        }),
      });
    });
  };
  var removeField = function (fieldId) {
    setTemplate(function (prev) {
      return __assign(__assign({}, prev), {
        fields: prev.fields.filter(function (field) {
          return field.id !== fieldId;
        }),
      });
    });
  };
  var reorderFields = function (dragIndex, hoverIndex) {
    var draggedField = template.fields[dragIndex];
    var newFields = __spreadArray([], template.fields, true);
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, draggedField);
    setTemplate(function (prev) {
      return __assign(__assign({}, prev), {
        fields: newFields.map(function (field, index) {
          return __assign(__assign({}, field), { order: index });
        }),
      });
    });
  };
  var saveTemplate = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var templateData, result, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!template.title.trim()) {
              toast({
                title: "Validation Error",
                description: "Please provide a title for the form",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            setSaving(true);
            templateData = __assign(__assign({}, template), {
              fields: template.fields,
              updated_at: new Date().toISOString(),
            });
            result = void 0;
            if (!templateId) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              supabase
                .from("consent_forms")
                .update(templateData)
                .eq("id", templateId)
                .select()
                .single(),
            ];
          case 2:
            result = _a.sent();
            return [3 /*break*/, 5];
          case 3:
            return [
              4 /*yield*/,
              supabase.from("consent_forms").insert(templateData).select().single(),
            ];
          case 4:
            result = _a.sent();
            _a.label = 5;
          case 5:
            if (result.error) {
              console.error("Error saving template:", result.error);
              toast({
                title: "Error",
                description: "Failed to save form template",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            toast({
              title: "Success",
              description: "Form template saved successfully",
              variant: "default",
            });
            if (onSave) {
              onSave(result.data);
            }
            return [3 /*break*/, 8];
          case 6:
            error_2 = _a.sent();
            console.error("Error:", error_2);
            toast({
              title: "Error",
              description: "An unexpected error occurred",
              variant: "destructive",
            });
            return [3 /*break*/, 8];
          case 7:
            setSaving(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  var duplicateTemplate = function () {
    setTemplate(function (prev) {
      return __assign(__assign({}, prev), {
        id: undefined,
        title: "".concat(prev.title, " (Copy)"),
        version: "1.0",
        is_active: false,
      });
    });
  };
  var renderField = function (field, isPreview) {
    var _a, _b, _c, _d;
    if (isPreview === void 0) {
      isPreview = false;
    }
    var FieldIcon =
      ((_a = FIELD_TYPES.find(function (type) {
        return type.value === field.type;
      })) === null || _a === void 0
        ? void 0
        : _a.icon) || lucide_react_1.Type;
    if (isPreview) {
      return (
        <div key={field.id} className="space-y-2">
          <label_1.Label className="flex items-center gap-2">
            <FieldIcon className="h-4 w-4" />
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label_1.Label>
          {field.type === "text" && <input_1.Input placeholder={field.placeholder} disabled />}
          {field.type === "textarea" && (
            <textarea_1.Textarea placeholder={field.placeholder} disabled />
          )}
          {field.type === "select" && (
            <select_1.Select disabled>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Select an option" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {(_b = field.options) === null || _b === void 0
                  ? void 0
                  : _b.map(function (option, index) {
                      return (
                        <select_1.SelectItem key={index} value={option}>
                          {option}
                        </select_1.SelectItem>
                      );
                    })}
              </select_1.SelectContent>
            </select_1.Select>
          )}
          {field.type === "checkbox" && (
            <div className="flex items-center space-x-2">
              <input type="checkbox" disabled />
              <label_1.Label>{field.placeholder || "Checkbox option"}</label_1.Label>
            </div>
          )}
          {field.type === "radio" && (
            <div className="space-y-2">
              {(_c = field.options) === null || _c === void 0
                ? void 0
                : _c.map(function (option, index) {
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <input type="radio" name={field.id} disabled />
                        <label_1.Label>{option}</label_1.Label>
                      </div>
                    );
                  })}
            </div>
          )}
          {field.type === "date" && <input_1.Input type="date" disabled />}
          {field.type === "signature" && (
            <div className="border-2 border-dashed border-gray-300 p-8 text-center">
              <lucide_react_1.Signature className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Digital signature area</p>
            </div>
          )}
          {field.type === "file" && (
            <div className="border-2 border-dashed border-gray-300 p-4 text-center">
              <lucide_react_1.Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">File upload area</p>
            </div>
          )}
        </div>
      );
    }
    return (
      <card_1.Card key={field.id} className="p-4">
        <div className="flex items-start gap-4">
          <lucide_react_1.GripVertical className="h-5 w-5 text-gray-400 mt-1 cursor-move" />
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <FieldIcon className="h-4 w-4" />
              <badge_1.Badge variant="outline">{field.type}</badge_1.Badge>
              <button_1.Button
                variant="ghost"
                size="sm"
                onClick={function () {
                  return removeField(field.id);
                }}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                <lucide_react_1.Trash2 className="h-4 w-4" />
              </button_1.Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label_1.Label htmlFor={"label-".concat(field.id)}>Field Label</label_1.Label>
                <input_1.Input
                  id={"label-".concat(field.id)}
                  value={field.label}
                  onChange={function (e) {
                    return updateField(field.id, { label: e.target.value });
                  }}
                />
              </div>
              <div>
                <label_1.Label htmlFor={"placeholder-".concat(field.id)}>Placeholder</label_1.Label>
                <input_1.Input
                  id={"placeholder-".concat(field.id)}
                  value={field.placeholder || ""}
                  onChange={function (e) {
                    return updateField(field.id, { placeholder: e.target.value });
                  }}
                />
              </div>
            </div>

            {(field.type === "select" || field.type === "radio") && (
              <div>
                <label_1.Label>Options</label_1.Label>
                <div className="space-y-2">
                  {(_d = field.options) === null || _d === void 0
                    ? void 0
                    : _d.map(function (option, index) {
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <input_1.Input
                              value={option}
                              onChange={function (e) {
                                var newOptions = __spreadArray([], field.options || [], true);
                                newOptions[index] = e.target.value;
                                updateField(field.id, { options: newOptions });
                              }}
                            />
                            <button_1.Button
                              variant="ghost"
                              size="sm"
                              onClick={function () {
                                var _a;
                                var newOptions =
                                  (_a = field.options) === null || _a === void 0
                                    ? void 0
                                    : _a.filter(function (_, i) {
                                        return i !== index;
                                      });
                                updateField(field.id, { options: newOptions });
                              }}
                            >
                              <lucide_react_1.Trash2 className="h-4 w-4" />
                            </button_1.Button>
                          </div>
                        );
                      })}
                  <button_1.Button
                    variant="outline"
                    size="sm"
                    onClick={function () {
                      var _a;
                      var newOptions = __spreadArray(
                        __spreadArray([], field.options || [], true),
                        [
                          "Option ".concat(
                            (((_a = field.options) === null || _a === void 0
                              ? void 0
                              : _a.length) || 0) + 1,
                          ),
                        ],
                        false,
                      );
                      updateField(field.id, { options: newOptions });
                    }}
                  >
                    <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </button_1.Button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <switch_1.Switch
                id={"required-".concat(field.id)}
                checked={field.required}
                onCheckedChange={function (checked) {
                  return updateField(field.id, { required: checked });
                }}
              />
              <label_1.Label htmlFor={"required-".concat(field.id)}>Required field</label_1.Label>
            </div>
          </div>
        </div>
      </card_1.Card>
    );
  };
  if (loading) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Form Builder</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (previewMode) {
    return (
      <div className="space-y-6">
        <card_1.Card>
          <card_1.CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <card_1.CardTitle>{template.title}</card_1.CardTitle>
                <card_1.CardDescription>{template.description}</card_1.CardDescription>
              </div>
              <button_1.Button
                onClick={function () {
                  return setPreviewMode(false);
                }}
              >
                Exit Preview
              </button_1.Button>
            </div>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            {template.fields.map(function (field) {
              return renderField(field, true);
            })}

            {template.legal_text && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">Legal Information</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {template.legal_text}
                </div>
              </div>
            )}

            {template.footer_text && (
              <div className="border-t pt-4">
                <div className="text-sm text-muted-foreground">{template.footer_text}</div>
              </div>
            )}
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Form Configuration */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.FileText className="h-5 w-5" />
            Consent Form Builder
          </card_1.CardTitle>
          <card_1.CardDescription>
            Create and customize consent forms with drag-and-drop field builder
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label_1.Label htmlFor="title">Form Title</label_1.Label>
              <input_1.Input
                id="title"
                value={template.title}
                onChange={function (e) {
                  return setTemplate(function (prev) {
                    return __assign(__assign({}, prev), { title: e.target.value });
                  });
                }}
                placeholder="Enter form title"
              />
            </div>
            <div>
              <label_1.Label htmlFor="version">Version</label_1.Label>
              <input_1.Input
                id="version"
                value={template.version}
                onChange={function (e) {
                  return setTemplate(function (prev) {
                    return __assign(__assign({}, prev), { version: e.target.value });
                  });
                }}
                placeholder="1.0"
              />
            </div>
          </div>

          <div>
            <label_1.Label htmlFor="description">Description</label_1.Label>
            <textarea_1.Textarea
              id="description"
              value={template.description}
              onChange={function (e) {
                return setTemplate(function (prev) {
                  return __assign(__assign({}, prev), { description: e.target.value });
                });
              }}
              placeholder="Describe the purpose of this form"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label_1.Label htmlFor="form-type">Form Type</label_1.Label>
              <select_1.Select
                value={template.form_type}
                onValueChange={function (value) {
                  return setTemplate(function (prev) {
                    return __assign(__assign({}, prev), { form_type: value });
                  });
                }}
              >
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Select form type" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="treatment">Treatment Consent</select_1.SelectItem>
                  <select_1.SelectItem value="photography">Photography Consent</select_1.SelectItem>
                  <select_1.SelectItem value="data_processing">Data Processing</select_1.SelectItem>
                  <select_1.SelectItem value="research">Research Participation</select_1.SelectItem>
                  <select_1.SelectItem value="general">General Consent</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <switch_1.Switch
                id="is-active"
                checked={template.is_active}
                onCheckedChange={function (checked) {
                  return setTemplate(function (prev) {
                    return __assign(__assign({}, prev), { is_active: checked });
                  });
                }}
              />
              <label_1.Label htmlFor="is-active">Active template</label_1.Label>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Field Palette */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Field Types</card_1.CardTitle>
          <card_1.CardDescription>Drag fields to add them to your form</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-8">
            {FIELD_TYPES.map(function (fieldType) {
              var Icon = fieldType.icon;
              return (
                <button_1.Button
                  key={fieldType.value}
                  variant="outline"
                  onClick={function () {
                    return addField(fieldType.value);
                  }}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{fieldType.label}</span>
                </button_1.Button>
              );
            })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Form Fields */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle>Form Fields ({template.fields.length})</card_1.CardTitle>
            <div className="flex gap-2">
              <button_1.Button
                variant="outline"
                onClick={function () {
                  return setPreviewMode(true);
                }}
              >
                <lucide_react_1.Eye className="h-4 w-4 mr-2" />
                Preview
              </button_1.Button>
              <button_1.Button variant="outline" onClick={duplicateTemplate}>
                <lucide_react_1.Copy className="h-4 w-4 mr-2" />
                Duplicate
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          {template.fields.length === 0
            ? <alert_1.Alert>
                <lucide_react_1.FileText className="h-4 w-4" />
                <alert_1.AlertDescription>
                  No fields added yet. Use the field types above to start building your form.
                </alert_1.AlertDescription>
              </alert_1.Alert>
            : <div className="space-y-4">
                {template.fields
                  .sort(function (a, b) {
                    return a.order - b.order;
                  })
                  .map(function (field) {
                    return renderField(field);
                  })}
              </div>}
        </card_1.CardContent>
      </card_1.Card>

      {/* Legal Text */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Legal Information</card_1.CardTitle>
          <card_1.CardDescription>Add legal text and disclaimers</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div>
            <label_1.Label htmlFor="legal-text">Legal Text</label_1.Label>
            <textarea_1.Textarea
              id="legal-text"
              value={template.legal_text}
              onChange={function (e) {
                return setTemplate(function (prev) {
                  return __assign(__assign({}, prev), { legal_text: e.target.value });
                });
              }}
              placeholder="Enter legal disclaimers, terms, and conditions..."
              rows={6}
            />
          </div>
          <div>
            <label_1.Label htmlFor="footer-text">Footer Text</label_1.Label>
            <textarea_1.Textarea
              id="footer-text"
              value={template.footer_text}
              onChange={function (e) {
                return setTemplate(function (prev) {
                  return __assign(__assign({}, prev), { footer_text: e.target.value });
                });
              }}
              placeholder="Footer information, contact details, etc."
              rows={3}
            />
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Actions */}
      <div className="flex gap-2">
        <button_1.Button onClick={saveTemplate} disabled={saving}>
          <lucide_react_1.Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Template"}
        </button_1.Button>
        <button_1.Button
          variant="outline"
          onClick={function () {
            return setPreviewMode(true);
          }}
        >
          <lucide_react_1.Eye className="h-4 w-4 mr-2" />
          Preview Form
        </button_1.Button>
      </div>
    </div>
  );
}
