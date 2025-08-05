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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var ai_1 = require("ai");
var openai_1 = require("@ai-sdk/openai");
var anthropic_1 = require("@ai-sdk/anthropic");
// Configuração dos modelos
var MODELS = {
  gpt4: (0, openai_1.openai)("gpt-4o"),
  claude: (0, anthropic_1.anthropic)("claude-3-5-sonnet-20241022"),
  gpt35: (0, openai_1.openai)("gpt-3.5-turbo"),
};
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      _b,
      messages,
      conversationId,
      _c,
      model,
      conversation,
      _d,
      existingConversation,
      convError,
      _e,
      newConversation,
      createError,
      preferences,
      profile,
      recentAppointments,
      systemPrompt,
      coreMessages,
      userMessage,
      result,
      error_1;
    var _f, _g;
    return __generator(this, (_h) => {
      switch (_h.label) {
        case 0:
          _h.trys.push([0, 14, undefined, 15]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _h.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _h.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          (_b = _h.sent()),
            (messages = _b.messages),
            (conversationId = _b.conversationId),
            (_c = _b.model),
            (model = _c === void 0 ? "gpt4" : _c);
          // Validar modelo
          if (!MODELS[model]) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid model" }, { status: 400 }),
            ];
          }
          conversation = void 0;
          if (!conversationId) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            supabase
              .from("assistant_conversations")
              .select("*")
              .eq("id", conversationId)
              .eq("user_id", user.id)
              .single(),
          ];
        case 4:
          (_d = _h.sent()), (existingConversation = _d.data), (convError = _d.error);
          if (convError || !existingConversation) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Conversation not found" }, { status: 404 }),
            ];
          }
          conversation = existingConversation;
          return [3 /*break*/, 7];
        case 5:
          return [
            4 /*yield*/,
            supabase
              .from("assistant_conversations")
              .insert({
                user_id: user.id,
                title:
                  ((_g = (_f = messages[0]) === null || _f === void 0 ? void 0 : _f.content) ===
                    null || _g === void 0
                    ? void 0
                    : _g.substring(0, 50)) || "Nova Conversa",
                model_used: model,
                is_active: true,
              })
              .select()
              .single(),
          ];
        case 6:
          (_e = _h.sent()), (newConversation = _e.data), (createError = _e.error);
          if (createError || !newConversation) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to create conversation" },
                { status: 500 },
              ),
            ];
          }
          conversation = newConversation;
          _h.label = 7;
        case 7:
          return [
            4 /*yield*/,
            supabase.from("assistant_preferences").select("*").eq("user_id", user.id).single(),
          ];
        case 8:
          preferences = _h.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("profiles")
              .select("full_name, role, specialty, clinic_name")
              .eq("id", user.id)
              .single(),
          ];
        case 9:
          profile = _h.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select(
                "\n        id,\n        date_time,\n        status,\n        service,\n        notes,\n        patients(name, phone)\n      ",
              )
              .eq("user_id", user.id)
              .order("date_time", { ascending: false })
              .limit(5),
          ];
        case 10:
          recentAppointments = _h.sent().data;
          systemPrompt =
            "Voc\u00EA \u00E9 o Assistente Virtual do NeonPro, uma plataforma de gest\u00E3o para cl\u00EDnicas de est\u00E9tica e beleza.\n\nCONTEXTO DO USU\u00C1RIO:\n- Nome: "
              .concat(
                (profile === null || profile === void 0 ? void 0 : profile.full_name) || "Usuário",
                "\n- Cargo: ",
              )
              .concat(
                (profile === null || profile === void 0 ? void 0 : profile.role) || "Profissional",
                "\n- Especialidade: ",
              )
              .concat(
                (profile === null || profile === void 0 ? void 0 : profile.specialty) ||
                  "Não informada",
                "\n- Cl\u00EDnica: ",
              )
              .concat(
                (profile === null || profile === void 0 ? void 0 : profile.clinic_name) ||
                  "Não informada",
                "\n\nPREFER\u00CANCIAS DO ASSISTENTE:\n- Personalidade: ",
              )
              .concat(
                (preferences === null || preferences === void 0
                  ? void 0
                  : preferences.personality) || "profissional e amigável",
                "\n- Temperatura: ",
              )
              .concat(
                (preferences === null || preferences === void 0
                  ? void 0
                  : preferences.temperature) || 0.7,
                "\n- Idioma: ",
              )
              .concat(
                (preferences === null || preferences === void 0 ? void 0 : preferences.language) ||
                  "pt-BR",
                "\n\nCONTEXTO RECENTE:\n",
              )
              .concat(
                recentAppointments && recentAppointments.length > 0
                  ? "\u00DAltimos agendamentos:\n".concat(
                      recentAppointments
                        .map((apt) => {
                          var _a;
                          return "- "
                            .concat(apt.date_time, ": ")
                            .concat(
                              (_a = apt.patients) === null || _a === void 0 ? void 0 : _a.name,
                              " - ",
                            )
                            .concat(apt.service, " (")
                            .concat(apt.status, ")");
                        })
                        .join("\n"),
                    )
                  : "Nenhum agendamento recente encontrado.",
                "\n\nINSTRU\u00C7\u00D5ES:\n1. Sempre responda em portugu\u00EAs brasileiro\n2. Mantenha um tom profissional mas acess\u00EDvel\n3. Foque em ajudar com gest\u00E3o da cl\u00EDnica, agendamentos, pacientes e procedimentos\n4. Use o contexto fornecido para personalizar suas respostas\n5. N\u00E3o acesse dados de outros usu\u00E1rios - trabalhe apenas com o contexto fornecido\n6. Se precisar de informa\u00E7\u00F5es n\u00E3o dispon\u00EDveis, pe\u00E7a para o usu\u00E1rio fornecer\n7. Sugira funcionalidades do NeonPro que podem ajudar o usu\u00E1rio\n\nSeja sempre \u00FAtil, preciso e contextualmente relevante para a gest\u00E3o de cl\u00EDnicas de est\u00E9tica e beleza.",
              );
          coreMessages = (0, ai_1.convertToCoreMessages)(messages);
          userMessage = messages[messages.length - 1];
          return [
            4 /*yield*/,
            supabase.from("assistant_messages").insert({
              conversation_id: conversation.id,
              user_id: user.id,
              role: "user",
              content: userMessage.content,
              model_used: model,
            }),
          ];
        case 11:
          _h.sent();
          return [
            4 /*yield*/,
            (0, ai_1.streamText)({
              model: MODELS[model],
              system: systemPrompt,
              messages: coreMessages,
              temperature:
                (preferences === null || preferences === void 0
                  ? void 0
                  : preferences.temperature) || 0.7,
              maxTokens:
                (preferences === null || preferences === void 0
                  ? void 0
                  : preferences.max_tokens) || 2000,
            }),
          ];
        case 12:
          result = _h.sent();
          // Log da interação
          return [
            4 /*yield*/,
            supabase.from("assistant_logs").insert({
              user_id: user.id,
              conversation_id: conversation.id,
              action: "chat_request",
              details: {
                model: model,
                message_count: messages.length,
                context_used: {
                  has_preferences: !!preferences,
                  has_profile: !!profile,
                  recent_appointments_count:
                    (recentAppointments === null || recentAppointments === void 0
                      ? void 0
                      : recentAppointments.length) || 0,
                },
              },
            }),
          ];
        case 13:
          // Log da interação
          _h.sent();
          return [2 /*return*/, result.toDataStreamResponse()];
        case 14:
          error_1 = _h.sent();
          console.error("Assistant API Error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 15:
          return [2 /*return*/];
      }
    });
  });
}
