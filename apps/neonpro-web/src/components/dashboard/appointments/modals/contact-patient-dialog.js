"use client";
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactPatientDialog = ContactPatientDialog;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// Form validation schema
var contactSchema = zod_2.z.object({
  contact_method: zod_2.z.enum(["whatsapp", "sms", "email", "phone"]),
  message_template: zod_2.z.string().optional(),
  custom_message: zod_2.z.string().min(1, "Mensagem é obrigatória"),
  send_appointment_details: zod_2.z.boolean().default(true),
});
function ContactPatientDialog(_a) {
  var _b;
  var appointment = _a.appointment,
    open = _a.open,
    onOpenChange = _a.onOpenChange;
  var _c = (0, react_1.useState)(false),
    isSending = _c[0],
    setIsSending = _c[1];
  var _d = (0, react_1.useState)(false),
    copiedPhone = _d[0],
    setCopiedPhone = _d[1];
  var _e = (0, react_1.useState)(false),
    copiedEmail = _e[0],
    setCopiedEmail = _e[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(contactSchema),
    defaultValues: {
      contact_method: "whatsapp",
      message_template: "",
      custom_message: "",
      send_appointment_details: true,
    },
  });
  // Message templates
  var messageTemplates = {
    reminder:
      "Ol\u00E1 {patient_name}! Este \u00E9 um lembrete do seu agendamento para {service_name} no dia {date} \u00E0s {time}. Nos vemos em breve!",
    confirmation:
      "Ol\u00E1 {patient_name}! Seu agendamento para {service_name} no dia {date} \u00E0s {time} foi confirmado. Aguardamos voc\u00EA!",
    rescheduling:
      "Ol\u00E1 {patient_name}! Precisamos reagendar seu agendamento de {service_name} que estava marcado para {date} \u00E0s {time}. Entre em contato conosco para marcar uma nova data.",
    cancellation:
      "Ol\u00E1 {patient_name}! Infelizmente precisamos cancelar seu agendamento de {service_name} no dia {date} \u00E0s {time}. Entre em contato conosco para remarcar.",
    followup:
      "Ol\u00E1 {patient_name}! Como foi sua experi\u00EAncia com nosso servi\u00E7o de {service_name}? Sua opini\u00E3o \u00E9 muito importante para n\u00F3s!",
    custom: "",
  };
  // Replace template variables with actual data
  var replaceTemplateVariables = (template) => {
    var _a, _b, _c;
    if (!appointment) return template;
    var replacements = {
      "{patient_name}":
        ((_a = appointment.patient) === null || _a === void 0 ? void 0 : _a.full_name) ||
        "Paciente",
      "{service_name}":
        ((_b = appointment.service) === null || _b === void 0 ? void 0 : _b.name) || "Serviço",
      "{date}": (0, date_fns_1.format)(new Date(appointment.start_time), "dd 'de' MMMM 'de' yyyy", {
        locale: locale_1.ptBR,
      }),
      "{time}": (0, date_fns_1.format)(new Date(appointment.start_time), "HH:mm", {
        locale: locale_1.ptBR,
      }),
      "{professional}":
        ((_c = appointment.professional) === null || _c === void 0 ? void 0 : _c.full_name) ||
        "Profissional",
    };
    var result = template;
    Object.entries(replacements).forEach((_a) => {
      var key = _a[0],
        value = _a[1];
      result = result.replace(new RegExp(key, "g"), value);
    });
    return result;
  };
  // Handle template selection
  var handleTemplateChange = (templateKey) => {
    var template = messageTemplates[templateKey];
    if (template) {
      var processedMessage = replaceTemplateVariables(template);
      form.setValue("custom_message", processedMessage);
    }
  };
  // Handle contact method specific actions
  var handleDirectContact = (method) =>
    __awaiter(this, void 0, void 0, function () {
      var patient, message, whatsappUrl, subject, body;
      var _a;
      return __generator(this, (_b) => {
        if (!(appointment === null || appointment === void 0 ? void 0 : appointment.patient))
          return [2 /*return*/];
        patient = appointment.patient;
        switch (method) {
          case "phone":
            if (patient.phone) {
              window.open("tel:".concat(patient.phone));
            } else {
              sonner_1.toast.error("Paciente não possui telefone cadastrado");
            }
            break;
          case "whatsapp":
            if (patient.phone) {
              message = encodeURIComponent(form.getValues("custom_message"));
              whatsappUrl = "https://wa.me/55"
                .concat(patient.phone.replace(/\D/g, ""), "?text=")
                .concat(message);
              window.open(whatsappUrl, "_blank");
            } else {
              sonner_1.toast.error("Paciente não possui telefone cadastrado");
            }
            break;
          case "email":
            if (patient.email) {
              subject = encodeURIComponent(
                "Agendamento - ".concat(
                  (_a = appointment.service) === null || _a === void 0 ? void 0 : _a.name,
                ),
              );
              body = encodeURIComponent(form.getValues("custom_message"));
              window.open(
                "mailto:".concat(patient.email, "?subject=").concat(subject, "&body=").concat(body),
              );
            } else {
              sonner_1.toast.error("Paciente não possui email cadastrado");
            }
            break;
        }
        return [2 /*return*/];
      });
    });
  // Copy contact info to clipboard
  var copyToClipboard = (text, type) =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, navigator.clipboard.writeText(text)];
          case 1:
            _a.sent();
            if (type === "phone") {
              setCopiedPhone(true);
              setTimeout(() => setCopiedPhone(false), 2000);
            } else {
              setCopiedEmail(true);
              setTimeout(() => setCopiedEmail(false), 2000);
            }
            sonner_1.toast.success("Copiado para a área de transferência!");
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            sonner_1.toast.error("Erro ao copiar para área de transferência");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  // Handle form submission (for scheduled/tracked contacts)
  var onSubmit = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var contactData;
      return __generator(this, (_a) => {
        if (!appointment) return [2 /*return*/];
        try {
          setIsSending(true);
          // For WhatsApp, open direct link
          if (data.contact_method === "whatsapp") {
            handleDirectContact("whatsapp");
            sonner_1.toast.success("WhatsApp aberto! Mensagem pronta para envio.");
            onOpenChange(false);
            return [2 /*return*/];
          }
          contactData = {
            appointment_id: appointment.id,
            patient_id: appointment.patient_id,
            contact_method: data.contact_method,
            message: data.custom_message,
            sent_at: new Date().toISOString(),
          };
          // TODO: Implement API call to log contact
          console.log("Contact logged:", contactData);
          // Open appropriate contact method
          switch (data.contact_method) {
            case "email":
              handleDirectContact("email");
              break;
            case "phone":
              handleDirectContact("phone");
              break;
            case "sms":
              // TODO: Implement SMS API integration
              sonner_1.toast.info("Funcionalidade de SMS será implementada em breve");
              break;
          }
          sonner_1.toast.success("Contato realizado com sucesso!");
          onOpenChange(false);
        } catch (error) {
          console.error("Error sending contact:", error);
          sonner_1.toast.error("Erro ao realizar contato");
        } finally {
          setIsSending(false);
        }
        return [2 /*return*/];
      });
    });
  if (!appointment) return null;
  var patient = appointment.patient;
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.MessageSquare className="h-5 w-5" />
            Contatar Paciente
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Entre em contato com{" "}
            {patient === null || patient === void 0 ? void 0 : patient.full_name} sobre o
            agendamento
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        {/* Patient and Appointment Info */}
        <card_1.Card className="bg-muted/50">
          <card_1.CardHeader className="pb-3">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.User className="h-4 w-4" />
              Informações do Paciente
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-3">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <lucide_react_1.Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {(patient === null || patient === void 0 ? void 0 : patient.phone) ||
                      "Não informado"}
                  </span>
                </div>
                {(patient === null || patient === void 0 ? void 0 : patient.phone) && (
                  <div className="flex gap-1">
                    <button_1.Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(patient.phone, "phone")}
                    >
                      {copiedPhone
                        ? <lucide_react_1.Check className="h-3 w-3" />
                        : <lucide_react_1.Copy className="h-3 w-3" />}
                    </button_1.Button>
                    <button_1.Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDirectContact("phone")}
                    >
                      <lucide_react_1.ExternalLink className="h-3 w-3" />
                    </button_1.Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <lucide_react_1.Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {(patient === null || patient === void 0 ? void 0 : patient.email) ||
                      "Não informado"}
                  </span>
                </div>
                {(patient === null || patient === void 0 ? void 0 : patient.email) && (
                  <div className="flex gap-1">
                    <button_1.Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(patient.email, "email")}
                    >
                      {copiedEmail
                        ? <lucide_react_1.Check className="h-3 w-3" />
                        : <lucide_react_1.Copy className="h-3 w-3" />}
                    </button_1.Button>
                    <button_1.Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDirectContact("email")}
                    >
                      <lucide_react_1.ExternalLink className="h-3 w-3" />
                    </button_1.Button>
                  </div>
                )}
              </div>
            </div>

            <separator_1.Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {(0, date_fns_1.format)(
                    new Date(appointment.start_time),
                    "dd 'de' MMMM 'de' yyyy",
                    { locale: locale_1.ptBR },
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {(0, date_fns_1.format)(new Date(appointment.start_time), "HH:mm", {
                    locale: locale_1.ptBR,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <badge_1.Badge variant="outline">
                  {((_b = appointment.service) === null || _b === void 0 ? void 0 : _b.name) ||
                    "Serviço não especificado"}
                </badge_1.Badge>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Contact Method */}
            <form_1.FormField
              control={form.control}
              name="contact_method"
              render={(_a) => {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Método de Contato</form_1.FormLabel>
                    <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="whatsapp">WhatsApp</select_1.SelectItem>
                        <select_1.SelectItem value="phone">Ligação</select_1.SelectItem>
                        <select_1.SelectItem value="email">Email</select_1.SelectItem>
                        <select_1.SelectItem value="sms">SMS</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            {/* Message Template */}
            <div className="space-y-2">
              <form_1.FormLabel>Template de Mensagem</form_1.FormLabel>
              <select_1.Select onValueChange={handleTemplateChange}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Escolha um template ou escreva uma mensagem personalizada" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="reminder">
                    Lembrete de agendamento
                  </select_1.SelectItem>
                  <select_1.SelectItem value="confirmation">
                    Confirmação de agendamento
                  </select_1.SelectItem>
                  <select_1.SelectItem value="rescheduling">
                    Reagendamento necessário
                  </select_1.SelectItem>
                  <select_1.SelectItem value="cancellation">Cancelamento</select_1.SelectItem>
                  <select_1.SelectItem value="followup">
                    Follow-up pós-atendimento
                  </select_1.SelectItem>
                  <select_1.SelectItem value="custom">Mensagem personalizada</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            {/* Custom Message */}
            <form_1.FormField
              control={form.control}
              name="custom_message"
              render={(_a) => {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Mensagem</form_1.FormLabel>
                    <form_1.FormControl>
                      <textarea_1.Textarea
                        placeholder="Digite sua mensagem aqui..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            <dialog_1.DialogFooter className="gap-2 sm:gap-0">
              <button_1.Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSending}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button
                type="submit"
                disabled={
                  isSending ||
                  (!(patient === null || patient === void 0 ? void 0 : patient.phone) &&
                    !(patient === null || patient === void 0 ? void 0 : patient.email))
                }
              >
                {isSending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <lucide_react_1.Send className="mr-2 h-4 w-4" />
                {form.watch("contact_method") === "whatsapp"
                  ? "Abrir WhatsApp"
                  : form.watch("contact_method") === "phone"
                    ? "Fazer Ligação"
                    : form.watch("contact_method") === "email"
                      ? "Abrir Email"
                      : "Enviar"}
              </button_1.Button>
            </dialog_1.DialogFooter>
          </form>
        </form_1.Form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
