/**
 * NotificationSender Component
 *
 * Componente para criação e envio de notificações com
 * otimização ML e validação de compliance.
 *
 * @author APEX UI/UX Team
 * @version 1.0.0
 * @compliance WCAG 2.1 AA, LGPD
 */
"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSender = NotificationSender;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var badge_1 = require("@/components/ui/badge");
var icons_1 = require("@/components/ui/icons");
var use_toast_1 = require("@/hooks/use-toast");
var separator_1 = require("@/components/ui/separator");
// ================================================================================
// SCHEMAS & TYPES
// ================================================================================
var NotificationFormSchema = zod_2.z.object({
  recipientType: zod_2.z.enum(["single", "group", "all"]),
  recipientId: zod_2.z.string().optional(),
  groupFilters: zod_2.z
    .object({
      ageMin: zod_2.z.number().optional(),
      ageMax: zod_2.z.number().optional(),
      gender: zod_2.z.string().optional(),
      lastVisit: zod_2.z.string().optional(),
    })
    .optional(),
  type: zod_2.z.enum(["appointment_reminder", "promotional", "informational", "urgent", "system"]),
  title: zod_2.z.string().min(1, "Título é obrigatório").max(100, "Título muito longo"),
  content: zod_2.z.string().min(1, "Conteúdo é obrigatório").max(1000, "Conteúdo muito longo"),
  channels: zod_2.z
    .array(zod_2.z.enum(["email", "sms", "whatsapp", "push", "in_app"]))
    .min(1, "Selecione pelo menos um canal"),
  priority: zod_2.z.enum(["low", "normal", "high", "urgent"]),
  scheduledFor: zod_2.z.string().optional(),
  templateId: zod_2.z.string().optional(),
  enableMLOptimization: zod_2.z.boolean(),
  testMode: zod_2.z.boolean(),
});
// ================================================================================
// COMPONENT
// ================================================================================
function NotificationSender(_a) {
  var onNotificationSent = _a.onNotificationSent;
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(0),
    estimatedReach = _c[0],
    setEstimatedReach = _c[1];
  var _d = (0, react_1.useState)([]),
    templates = _d[0],
    setTemplates = _d[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(NotificationFormSchema),
    defaultValues: {
      recipientType: "single",
      type: "informational",
      channels: ["email"],
      priority: "normal",
      enableMLOptimization: true,
      testMode: false,
    },
  });
  // ================================================================================
  // EFFECTS
  // ================================================================================
  (0, react_1.useEffect)(() => {
    loadTemplates();
  }, []);
  (0, react_1.useEffect)(() => {
    var subscription = form.watch((value) => {
      if (value.recipientType) {
        calculateEstimatedReach(value);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);
  // ================================================================================
  // DATA LOADING
  // ================================================================================
  var loadTemplates = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/notifications/templates")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setTemplates(data.templates || []);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Erro ao carregar templates:", error_1);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var calculateEstimatedReach = (formData) =>
    __awaiter(this, void 0, void 0, function () {
      var params, response, data, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (formData.recipientType === "single") {
              setEstimatedReach(1);
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            params = new URLSearchParams(
              __assign(
                { type: formData.recipientType },
                formData.groupFilters &&
                  Object.fromEntries(
                    Object.entries(formData.groupFilters).filter((_a) => {
                      var _ = _a[0],
                        value = _a[1];
                      return value != null;
                    }),
                  ),
              ),
            );
            return [4 /*yield*/, fetch("/api/patients/count?".concat(params))];
          case 2:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            setEstimatedReach(data.count || 0);
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_2 = _a.sent();
            console.error("Erro ao calcular alcance:", error_2);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  // ================================================================================
  // FORM HANDLERS
  // ================================================================================
  var onSubmit = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var payload, endpoint, response, result, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            payload = __assign(__assign({}, data), {
              scheduledFor: data.scheduledFor
                ? new Date(data.scheduledFor).toISOString()
                : undefined,
              metadata: {
                estimatedReach: estimatedReach,
                formSource: "dashboard",
              },
            });
            endpoint =
              data.recipientType === "single"
                ? "/api/notifications/send"
                : "/api/notifications/send";
            return [
              4 /*yield*/,
              fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }),
            ];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            if (!response.ok) {
              throw new Error(result.error || "Erro ao enviar notificação");
            }
            toast({
              title: "Sucesso!",
              description: data.testMode
                ? "Notificação de teste enviada com sucesso"
                : "Notifica\u00E7\u00E3o enviada para ".concat(
                    estimatedReach,
                    " destinat\u00E1rio(s)",
                  ),
            });
            // Reset form
            form.reset();
            setEstimatedReach(0);
            // Callback para atualizar dashboard
            if (onNotificationSent) {
              onNotificationSent();
            }
            return [3 /*break*/, 5];
          case 3:
            error_3 = _a.sent();
            console.error("Erro no envio:", error_3);
            toast({
              title: "Erro",
              description: error_3.message || "Falha ao enviar notificação",
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
  // ================================================================================
  // RENDER HELPERS
  // ================================================================================
  var renderRecipientSelection = () => <div className />;
  "space-y-4\">
        < form_1.FormField
  control =
    form: form,
    : .control
  name =
  "recipientType\";
    render =
  (
    field: field
  )
  <form_1.FormItem>
    <form_1.FormLabel>Destinatários</form_1.FormLabel>
    <select_1.Select onValueChange=
    field.onChange
  defaultValue={field.value}>
      <form_1.FormControl>
        <select_1.SelectTrigger>
          <select_1.SelectValue placeholder />
          \"Selecione o tipo de destinatário\" />
        </select_1.SelectTrigger>
      </form_1.FormControl>
      <select_1.SelectContent>
        <select_1.SelectItem value />
  \"single\">Paciente Individual
      </select_1.SelectItem>
      <select_1.SelectItem value />
      \"group\">Grupo de Pacientes
    </select_1.SelectItem>
    <select_1.SelectItem value />
    \"all\">Todos os Pacientes
  </select_1.SelectItem>
  select_1.SelectContent >
  select_1.Select > <form_1.FormMessage />
  form_1.FormItem >
}
/;;;;;;;;>;
{
  form.watch("recipientType") === "single" && <form_1.FormField control={form.control} name />;
  "recipientId\";
    render =
  (
    field: field
  )
  <form_1.FormItem>
    <form_1.FormLabel>Paciente</form_1.FormLabel>
    <form_1.FormControl>
      <input_1.Input placeholder />
      \"Buscar paciente...\" {...field} />
    </form_1.FormControl>
    <form_1.FormDescription>Digite o nome ou CPF
  do paciente
  </form_1.FormDescription>
  <form_1.FormMessage />
  </form_1.FormItem>
}
/ 2;;;;;;;;<>div{};
className/>;
"flex items-center space-x-2 text-sm text-muted-foreground\">
    < icons_1.Icons.Users
className =
"h-4 w-4\" />
    < span > Alcance
estimado:
{
  estimatedReach;
}
destinatário(s);
span >
;
div >
;
div >
;
var renderChannelSelection = () => <form_1.FormField control={form.control} name />;
"channels\";
render =
{
}
();
(
  <form_1.FormItem>
    <div className />
    \"mb-4\">
    <form_1.FormLabel className />
    \"text-base\">Canais de Envio
  </form_1.FormLabel>
),
  (<form_1.FormDescription>Selecione os canais para envio da notificação</form_1.FormDescription>);
div > <div className />;
"grid grid-cols-2 gap-4\">;
{
  [
        { id: 'email', label: 'E-mail', icon: icons_1.Icons.Mail },
        { id: 'sms', label: 'SMS', icon: icons_1.Icons.MessageSquare },
        { id: 'whatsapp', label: 'WhatsApp', icon: icons_1.Icons.MessageCircle },
        { id: 'push', label: 'Push', icon: icons_1.Icons.Bell },
        { id: 'in_app', label: 'In-App', icon: icons_1.Icons.Smartphone },
    ].map((channel) => (<form_1.FormField key={channel.id} control={form.control} name/>), "channels\", render = {}({ field: field }), {
  const: Icon = channel.icon
}
>
            (<form_1.FormControl>
                        <checkbox_1.Checkbox checked=
{
  (_a = field.value) === null || _a === void 0 ? void 0 : _a.includes(channel.id);
}
onCheckedChange={function (checked) {
                    var updatedChannels = checked
                        ? __spreadArray(__spreadArray([], (field.value || []), true), [channel.id], false) : (field.value || []).filter((value) => value !== channel.id);
                    field.onChange(updatedChannels);
                }}/>
</form_1.FormControl>
                ,
                    <div className/>), "flex items-center space-x-2\">
        < Icon, className = , "h-4 w-4\" />
        < form_1.FormLabel, className = , "font-normal\">, { channel: channel, : .label }, form_1.FormLabel >
    , div >
    , form_1.FormItem >
    )
}
/>
div > <form_1.FormMessage />
form_1.FormItem >
/
>
var renderAdvancedOptions = () => <div className />;
"space-y-4\">
    < div
className =
"grid grid-cols-2 gap-4\">
    < form_1.FormField
control =
{
  form: form,
  : .control
}
name = ;
"priority\";
render =
{
}
({ field: field });
(
  <form_1.FormItem>
    <form_1.FormLabel>Prioridade</form_1.FormLabel>
    <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
      <form_1.FormControl>
        <select_1.SelectTrigger>
          <select_1.SelectValue />
        </select_1.SelectTrigger>
      </form_1.FormControl>
      <select_1.SelectContent>
        <select_1.SelectItem value />
        \"low\">Baixa
      </select_1.SelectItem>
      <select_1.SelectItem value />
      \"normal\">Normal
    </select_1.SelectItem>
    <select_1.SelectItem value />
    \"high\">Alta
  </select_1.SelectItem>
),
  (<select_1.SelectItem value />);
"urgent\">Urgente</SelectItem>;
select_1.SelectContent >
select_1.Select > <form_1.FormMessage />
form_1.FormItem >
/  .1
<>FF_defilmmoorr
control =
{
  form: form,
  : .control
}
name = ;
"scheduledFor\";
render =
{
}
({ field: field });
<form_1.FormItem>
  <form_1.FormLabel>Agendar Para</form_1.FormLabel>
  <form_1.FormControl>
    <input_1.Input type />
    \"datetime-local\"
    {...field}
    />
  </form_1.FormControl>
  <form_1.FormDescription>Deixe vazio para enviar imediatamente</form_1.FormDescription>
  <form_1.FormMessage />
</form_1.FormItem>;
/;;;;;;;>;
div > <div className />;
"space-y-3\">
    < form_1.FormField
control =
{
  form: form,
  : .control
}
name = ;
"enableMLOptimization\";
render =
{
}
({ field: field });
<form_1.FormItem className />;
"flex flex-row items-center justify-between rounded-lg border p-4\">
    < div
className =
"space-y-0.5\">
    < form_1.FormLabel
className =
"text-base\">;
Otimização
Inteligente
form_1.FormLabel >
<form_1.FormDescription>Usar IA para otimizar horário e canal de envio</form_1.FormDescription>
div >
(
  <form_1.FormControl>
    <checkbox_1.Checkbox checked=
{
  field.value;
}
onCheckedChange={field.onChange} />
</form_1.FormControl>
)
form_1.FormItem >
/  .1
<>FF_defilmmoorr
control = { form: form, : .control };
name = ;
"testMode\";
render =
{
}
({ field: field });
<form_1.FormItem className />;
"flex flex-row items-center justify-between rounded-lg border p-4\">
    < div
className =
"space-y-0.5\">
    < form_1.FormLabel
className =
"text-base\">;
Modo
Teste
form_1.FormLabel >
<form_1.FormDescription>Enviar apenas para administradores</form_1.FormDescription>
div >
(
  <form_1.FormControl>
    <checkbox_1.Checkbox checked=
{
  field.value;
}
onCheckedChange={field.onChange} />
</form_1.FormControl>
)
form_1.FormItem >
/
>
div >
;
div >
;
// ================================================================================
// MAIN RENDER
// ================================================================================
return (<div className/>);
"max-w-4xl space-y-6\">
    < card_1.Card >
    (<card_1.CardHeader>
          <card_1.CardTitle>Enviar Notificação</card_1.CardTitle>
          <card_1.CardDescription>
            Crie e envie notificações personalizadas para seus pacientes
          </card_1.CardDescription>
        </card_1.CardHeader>
        ,
            <card_1.CardContent>
          <form_1.Form
{
  ...form
}
>
            <form onSubmit=
{
  form.handleSubmit(onSubmit);
}
className/>\
"space-y-6\">
{
  /* Destinatários */
}
{
  renderRecipientSelection();
}

<separator_1.Separator />;

{
  /* Conteúdo */
}
<div className />;
\"grid grid-cols-1 gap-4\">
                <form_1.FormField control=
{
  form.control;
}
name/>\
"type\"
                  render=
{
  (_a) => {
    var field = _a.field;
    return (
      (
        <form_1.FormItem>
          <form_1.FormLabel>Tipo de Notificação</form_1.FormLabel>
          <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
            <form_1.FormControl>
              <select_1.SelectTrigger>
                <select_1.SelectValue />
              </select_1.SelectTrigger>
            </form_1.FormControl>
            <select_1.SelectContent>
              <select_1.SelectItem value />
              \"appointment_reminder\">Lembrete de Consulta
            </select_1.SelectItem>
            <select_1.SelectItem value />
            \"promotional\">Promocional
          </select_1.SelectItem>
          <select_1.SelectItem value />
          \"informational\">Informativa
        </select_1.SelectItem>
      ),
      (<select_1.SelectItem value />)
    );
  };
}
\"urgent\">Urgente</select_1.SelectItem>
                          <select_1.SelectItem value/>\"system\">Sistema</select_1.SelectItem>);
select_1.SelectContent >
select_1.Select > <form_1.FormMessage />
form_1.FormItem >
/  .1
<>FF_defilmmoorr
control =
{
  form: form,
  : .control
}
name = ;
"title\";
render =
{
}
({ field: field });
<form_1.FormItem>
  <form_1.FormLabel>Título</form_1.FormLabel>
  <form_1.FormControl>
    <input_1.Input placeholder />
    \"Título da notificação...\"
    {...field}
    />
  </form_1.FormControl>
  <form_1.FormDescription>
    {((_b = field.value) === null || _b === void 0 ? void 0 : _b.length) || 0}/100 caracteres
  </form_1.FormDescription>
  <form_1.FormMessage />
</form_1.FormItem>;
/ .12;;;;<>FF_defilmmoorr{};
control = { form: form, : .control };
name = ;
"content\";
render =
{
}
({ field: field });
<form_1.FormItem>
  <form_1.FormLabel>Conteúdo</form_1.FormLabel>
  <form_1.FormControl>
    <textarea_1.Textarea placeholder />
    \"Conteúdo da notificação...\" className=\"min-h-[100px]\"
    {...field}
    />
  </form_1.FormControl>
  <form_1.FormDescription>
    {((_c = field.value) === null || _c === void 0 ? void 0 : _c.length) || 0}/1000 caracteres
  </form_1.FormDescription>
  <form_1.FormMessage />
</form_1.FormItem>;
/;;;;;>;
div > <separator_1.Separator />;
{
  /* Canais */
}
{
  renderChannelSelection();
}
<separator_1.Separator />;
{
  /* Opções Avançadas */
}
{
  renderAdvancedOptions();
}
{
  /* Ações */
}
<div className />;
"flex items-center justify-between pt-6\">
    < div
className =
"flex items-center space-x-2\">;
{
  form.watch("testMode") && <badge_1.Badge variant />;
  "outline\">Modo Teste</Badge>;
}
{
  form.watch("enableMLOptimization") && <badge_1.Badge variant />;
  "secondary\">IA Ativada</Badge>;
}
div > <div className />;
"space-x-2\">
    < button_1.Button
type = ;
"button\" ;
variant =
"outline\";
onClick =
{
}
();
form.reset();
>
        Limpar
button_1.Button > <button_1.Button
type />;
"submit\" disabled={loading}>;
{
  loading && <icons_1.Icons.Loader2 className />;
  "mr-2 h-4 w-4 animate-spin\" />};
    loading ? "Enviando..." : "Enviar Notificação"
  button_1.Button >
    ;
  div >
    ;
  div >
    ;
  form >
    ;
  form_1.Form >
    ;
  card_1.CardContent >
    ;
  card_1.Card >
    ;
  div >
    ;
}
