"use client";
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
exports.MedicalRecordForm = MedicalRecordForm;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var form_1 = require("@/components/ui/form");
var schemas_1 = require("@/lib/healthcare/schemas");
var sonner_1 = require("sonner");
function MedicalRecordForm(_a) {
  var _this = this;
  var patientId = _a.patientId,
    appointmentId = _a.appointmentId,
    patientName = _a.patientName,
    patientAge = _a.patientAge,
    onSubmit = _a.onSubmit,
    _b = _a.isLoading,
    isLoading = _b === void 0 ? false : _b;
  var _c = (0, react_1.useState)(1),
    currentSection = _c[0],
    setCurrentSection = _c[1];
  var totalSections = 4;
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(schemas_1.medicalRecordSchema),
    defaultValues: {
      patient_id: patientId,
      appointment_id: appointmentId,
      chief_complaint: "",
      diagnosis: "",
      treatment_plan: "",
      medications_prescribed: [],
      follow_up_instructions: "",
      notes: "",
      vital_signs: {
        blood_pressure: "",
        weight: undefined,
        height: undefined,
        temperature: undefined,
      },
    },
  });
  var _d = (0, react_hook_form_1.useFieldArray)({
      control: form.control,
      name: "medications_prescribed",
    }),
    medicationFields = _d.fields,
    addMedication = _d.append,
    removeMedication = _d.remove;
  var handleSubmitForm = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, onSubmit(data)];
          case 1:
            _a.sent();
            sonner_1.toast.success("Prontuário salvo com sucesso!", {
              description: "As informações médicas foram registradas de forma segura.",
            });
            form.reset();
            setCurrentSection(1);
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            sonner_1.toast.error("Erro ao salvar prontuário", {
              description: "Verifique os dados e tente novamente.",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var nextSection = function () {
    if (currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
    }
  };
  var prevSection = function () {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };
  var addNewMedication = function () {
    addMedication({
      medication_name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    });
  };
  return (
    <card_1.Card className="w-full max-w-5xl mx-auto medical-card">
      <card_1.CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <lucide_react_1.FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <card_1.CardTitle className="text-2xl">Prontuário Médico</card_1.CardTitle>
            <card_1.CardDescription>
              Paciente: {patientName} • {patientAge} anos •{" "}
              {(0, date_fns_1.format)(new Date(), "dd/MM/yyyy", { locale: locale_1.ptBR })}
            </card_1.CardDescription>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSections }, function (_, i) {
            return (
              <div
                key={i}
                className={"flex-1 h-2 rounded-full transition-colors ".concat(
                  i + 1 <= currentSection ? "bg-primary" : "bg-muted",
                )}
              />
            );
          })}
        </div>
        <div className="text-sm text-muted-foreground text-center">
          Seção {currentSection} de {totalSections}
        </div>
      </card_1.CardHeader>

      <card_1.CardContent>
        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            {/* Section 1: Chief Complaint & Diagnosis */}
            {currentSection === 1 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Avaliação Inicial</h3>
                  <p className="text-sm text-muted-foreground">Queixa principal e diagnóstico</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <lucide_react_1.AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Atenção</h4>
                      <p className="text-sm text-blue-700">
                        Este prontuário deve seguir as diretrizes CFM e será mantido por no mínimo
                        20 anos conforme legislação.
                      </p>
                    </div>
                  </div>
                </div>

                <form_1.FormField
                  control={form.control}
                  name="chief_complaint"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Queixa Principal *</form_1.FormLabel>
                        <form_1.FormControl>
                          <textarea_1.Textarea
                            placeholder="Descreva a queixa principal do paciente..."
                            {...field}
                            className="bg-background min-h-[100px]"
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Motivo da consulta relatado pelo paciente
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="diagnosis"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Diagnóstico *</form_1.FormLabel>
                        <form_1.FormControl>
                          <textarea_1.Textarea
                            placeholder="Diagnóstico baseado na avaliação clínica..."
                            {...field}
                            className="bg-background min-h-[80px]"
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Diagnóstico clínico baseado na avaliação realizada
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <div className="flex justify-end">
                  <button_1.Button type="button" onClick={nextSection}>
                    Próxima Seção
                  </button_1.Button>
                </div>
              </div>
            )}{" "}
            {/* Section 2: Treatment Plan */}
            {currentSection === 2 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Plano de Tratamento</h3>
                  <p className="text-sm text-muted-foreground">Detalhes do tratamento prescrito</p>
                </div>

                <form_1.FormField
                  control={form.control}
                  name="treatment_plan"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Plano de Tratamento *</form_1.FormLabel>
                        <form_1.FormControl>
                          <textarea_1.Textarea
                            placeholder="Detalhe o plano de tratamento recomendado..."
                            {...field}
                            className="bg-background min-h-[120px]"
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Procedimentos, orientações e cuidados recomendados
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Sinais Vitais (Opcional)</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="vital_signs.blood_pressure"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Pressão Arterial</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                placeholder="120/80"
                                {...field}
                                className="bg-background"
                              />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="vital_signs.weight"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Peso (kg)</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                step="0.1"
                                placeholder="70.5"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(
                                    e.target.value ? parseFloat(e.target.value) : undefined,
                                  );
                                }}
                                className="bg-background"
                              />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="vital_signs.height"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Altura (cm)</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                step="0.1"
                                placeholder="170"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(
                                    e.target.value ? parseFloat(e.target.value) : undefined,
                                  );
                                }}
                                className="bg-background"
                              />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="vital_signs.temperature"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Temperatura (°C)</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                step="0.1"
                                placeholder="36.5"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(
                                    e.target.value ? parseFloat(e.target.value) : undefined,
                                  );
                                }}
                                className="bg-background"
                              />
                            </form_1.FormControl>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button_1.Button type="button" variant="outline" onClick={prevSection}>
                    Seção Anterior
                  </button_1.Button>
                  <button_1.Button type="button" onClick={nextSection}>
                    Próxima Seção
                  </button_1.Button>
                </div>
              </div>
            )}{" "}
            {/* Section 3: Medications */}
            {currentSection === 3 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Medicações Prescritas</h3>
                  <p className="text-sm text-muted-foreground">
                    Lista de medicamentos e instruções de uso
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Medicamentos</h4>
                    <button_1.Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewMedication}
                      className="flex items-center gap-2"
                    >
                      <lucide_react_1.Plus className="w-4 h-4" />
                      Adicionar Medicamento
                    </button_1.Button>
                  </div>

                  {medicationFields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                        <lucide_react_1.Plus className="w-6 h-6" />
                      </div>
                      <p>Nenhuma medicação prescrita ainda</p>
                      <p className="text-sm">Clique em "Adicionar Medicamento" para começar</p>
                    </div>
                  )}

                  {medicationFields.map(function (field, index) {
                    return (
                      <card_1.Card key={field.id} className="p-4 bg-muted/30">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-medium">Medicamento {index + 1}</h5>
                          <button_1.Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={function () {
                              return removeMedication(index);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <lucide_react_1.Trash2 className="w-4 h-4" />
                          </button_1.Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <form_1.FormField
                            control={form.control}
                            name={"medications_prescribed.".concat(index, ".medication_name")}
                            render={function (_a) {
                              var field = _a.field;
                              return (
                                <form_1.FormItem>
                                  <form_1.FormLabel>Nome do Medicamento *</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input
                                      placeholder="Ex: Dipirona"
                                      {...field}
                                      className="bg-background"
                                    />
                                  </form_1.FormControl>
                                  <form_1.FormMessage />
                                </form_1.FormItem>
                              );
                            }}
                          />

                          <form_1.FormField
                            control={form.control}
                            name={"medications_prescribed.".concat(index, ".dosage")}
                            render={function (_a) {
                              var field = _a.field;
                              return (
                                <form_1.FormItem>
                                  <form_1.FormLabel>Dosagem *</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input
                                      placeholder="Ex: 500mg"
                                      {...field}
                                      className="bg-background"
                                    />
                                  </form_1.FormControl>
                                  <form_1.FormMessage />
                                </form_1.FormItem>
                              );
                            }}
                          />

                          <form_1.FormField
                            control={form.control}
                            name={"medications_prescribed.".concat(index, ".frequency")}
                            render={function (_a) {
                              var field = _a.field;
                              return (
                                <form_1.FormItem>
                                  <form_1.FormLabel>Frequência *</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input
                                      placeholder="Ex: 8/8 horas"
                                      {...field}
                                      className="bg-background"
                                    />
                                  </form_1.FormControl>
                                  <form_1.FormMessage />
                                </form_1.FormItem>
                              );
                            }}
                          />

                          <form_1.FormField
                            control={form.control}
                            name={"medications_prescribed.".concat(index, ".duration")}
                            render={function (_a) {
                              var field = _a.field;
                              return (
                                <form_1.FormItem>
                                  <form_1.FormLabel>Duração *</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input
                                      placeholder="Ex: 7 dias"
                                      {...field}
                                      className="bg-background"
                                    />
                                  </form_1.FormControl>
                                  <form_1.FormMessage />
                                </form_1.FormItem>
                              );
                            }}
                          />
                        </div>

                        <form_1.FormField
                          control={form.control}
                          name={"medications_prescribed.".concat(index, ".instructions")}
                          render={function (_a) {
                            var field = _a.field;
                            return (
                              <form_1.FormItem className="mt-4">
                                <form_1.FormLabel>Instruções de Uso *</form_1.FormLabel>
                                <form_1.FormControl>
                                  <textarea_1.Textarea
                                    placeholder="Instruções detalhadas para o paciente..."
                                    {...field}
                                    className="bg-background"
                                    rows={2}
                                  />
                                </form_1.FormControl>
                                <form_1.FormMessage />
                              </form_1.FormItem>
                            );
                          }}
                        />
                      </card_1.Card>
                    );
                  })}
                </div>

                <div className="flex justify-between">
                  <button_1.Button type="button" variant="outline" onClick={prevSection}>
                    Seção Anterior
                  </button_1.Button>
                  <button_1.Button type="button" onClick={nextSection}>
                    Próxima Seção
                  </button_1.Button>
                </div>
              </div>
            )}{" "}
            {/* Section 4: Follow-up & Notes */}
            {currentSection === 4 && (
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">Acompanhamento e Observações</h3>
                  <p className="text-sm text-muted-foreground">
                    Instruções de acompanhamento e notas clínicas
                  </p>
                </div>

                <form_1.FormField
                  control={form.control}
                  name="follow_up_date"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Data de Retorno</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input
                            type="date"
                            {...field}
                            value={
                              field.value ? (0, date_fns_1.format)(field.value, "yyyy-MM-dd") : ""
                            }
                            onChange={function (e) {
                              var date = e.target.value ? new Date(e.target.value) : undefined;
                              field.onChange(date);
                            }}
                            className="bg-background"
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Data recomendada para próxima consulta (opcional)
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="follow_up_instructions"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Instruções de Acompanhamento</form_1.FormLabel>
                        <form_1.FormControl>
                          <textarea_1.Textarea
                            placeholder="Instruções para cuidados domiciliares, retorno, etc..."
                            {...field}
                            className="bg-background min-h-[80px]"
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Orientações para o paciente sobre cuidados e acompanhamento
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <form_1.FormField
                  control={form.control}
                  name="notes"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem>
                        <form_1.FormLabel>Notas Clínicas *</form_1.FormLabel>
                        <form_1.FormControl>
                          <textarea_1.Textarea
                            placeholder="Observações detalhadas sobre a consulta, exame físico, evolução do quadro..."
                            {...field}
                            className="bg-background min-h-[120px]"
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Registro detalhado da consulta para histórico médico
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <lucide_react_1.AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Importante</h4>
                      <p className="text-sm text-amber-700">
                        Este prontuário será armazenado de forma segura e confidencial conforme a
                        Lei 13.787/2018 e resolução CFM nº 1.821/2007. Os dados serão mantidos por
                        no mínimo 20 anos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button_1.Button type="button" variant="outline" onClick={prevSection}>
                    Seção Anterior
                  </button_1.Button>
                  <button_1.Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <lucide_react_1.Save className="w-4 h-4" />
                    {isLoading ? "Salvando..." : "Salvar Prontuário"}
                  </button_1.Button>
                </div>
              </div>
            )}
          </form>
        </form_1.Form>
      </card_1.CardContent>
    </card_1.Card>
  );
}
