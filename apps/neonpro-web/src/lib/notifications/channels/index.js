/**
 * NeonPro Notification System - Channels
 * Story 1.7: Sistema de Notificações
 *
 * Sistema de canais de entrega de notificações
 * Suporte a Email, SMS, Push e In-App
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  ((m, exports) => {
    for (var p in m)
      if (p !== "default" && !Object.hasOwn(exports, p)) __createBinding(exports, m, p);
  });
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
exports.NotificationChannelManager = void 0;
var types_1 = require("../types");
// ============================================================================
// CHANNEL MANAGER IMPLEMENTATION
// ============================================================================
/**
 * Gerenciador de canais de notificação
 */
var NotificationChannelManager = /** @class */ (() => {
  function NotificationChannelManager() {
    this.providers = new Map();
    this.isInitialized = false;
  }
  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================
  /**
   * Inicializa o gerenciador de canais
   */
  NotificationChannelManager.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, provider, config, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            // Registrar provedores padrão
            return [4 /*yield*/, this.registerDefaultProviders()];
          case 1:
            // Registrar provedores padrão
            _b.sent();
            (_i = 0), (_a = this.providers.values());
            _b.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 9];
            provider = _a[_i];
            _b.label = 3;
          case 3:
            _b.trys.push([3, 7, , 8]);
            return [4 /*yield*/, this.getChannelConfig(provider.channel)];
          case 4:
            config = _b.sent();
            if (!config) return [3 /*break*/, 6];
            return [4 /*yield*/, provider.initialize(config)];
          case 5:
            _b.sent();
            _b.label = 6;
          case 6:
            return [3 /*break*/, 8];
          case 7:
            error_1 = _b.sent();
            console.error("Erro ao inicializar provedor ".concat(provider.name, ":"), error_1);
            return [3 /*break*/, 8];
          case 8:
            _i++;
            return [3 /*break*/, 2];
          case 9:
            this.isInitialized = true;
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Registra provedores padrão
   */
  NotificationChannelManager.prototype.registerDefaultProviders = function () {
    return __awaiter(this, void 0, void 0, function () {
      var EmailProvider, SMSProvider, PushProvider, InAppProvider;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, Promise.resolve().then(() => require("./email-provider"))];
          case 1:
            EmailProvider = _a.sent().EmailProvider;
            return [4 /*yield*/, Promise.resolve().then(() => require("./sms-provider"))];
          case 2:
            SMSProvider = _a.sent().SMSProvider;
            return [4 /*yield*/, Promise.resolve().then(() => require("./push-provider"))];
          case 3:
            PushProvider = _a.sent().PushProvider;
            return [4 /*yield*/, Promise.resolve().then(() => require("./in-app-provider"))];
          case 4:
            InAppProvider = _a.sent().InAppProvider;
            this.registerProvider(new EmailProvider());
            this.registerProvider(new SMSProvider());
            this.registerProvider(new PushProvider());
            this.registerProvider(new InAppProvider());
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // GERENCIAMENTO DE PROVEDORES
  // ============================================================================
  /**
   * Registra um provedor de canal
   */
  NotificationChannelManager.prototype.registerProvider = function (provider) {
    this.providers.set(provider.channel, provider);
  };
  /**
   * Obtém provedor por canal
   */
  NotificationChannelManager.prototype.getProvider = function (channel) {
    return this.providers.get(channel);
  };
  /**
   * Lista canais disponíveis
   */
  NotificationChannelManager.prototype.getAvailableChannels = function () {
    return Array.from(this.providers.keys()).filter((channel) => {
      var _a;
      var provider = this.providers.get(channel);
      return (_a = provider === null || provider === void 0 ? void 0 : provider.isEnabled) !==
        null && _a !== void 0
        ? _a
        : false;
    });
  };
  // ============================================================================
  // ENVIO DE NOTIFICAÇÕES
  // ============================================================================
  /**
   * Envia notificação através do canal especificado
   */
  NotificationChannelManager.prototype.send = function (channel, context, content) {
    return __awaiter(this, void 0, void 0, function () {
      var provider, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            provider = this.getProvider(channel);
            if (!provider) {
              return [
                2 /*return*/,
                {
                  id: this.generateDeliveryId(),
                  notificationId: context.notificationId || "",
                  channel: channel,
                  recipient: context.recipient,
                  status: types_1.DeliveryStatus.FAILED,
                  error: "Provedor n\u00E3o encontrado para canal: ".concat(channel),
                  attempts: 1,
                  sentAt: new Date(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ];
            }
            if (!provider.isEnabled) {
              return [
                2 /*return*/,
                {
                  id: this.generateDeliveryId(),
                  notificationId: context.notificationId || "",
                  channel: channel,
                  recipient: context.recipient,
                  status: types_1.DeliveryStatus.FAILED,
                  error: "Canal ".concat(channel, " est\u00E1 desabilitado"),
                  attempts: 1,
                  sentAt: new Date(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, provider.send(context, content)];
          case 2:
            return [2 /*return*/, _a.sent()];
          case 3:
            error_2 = _a.sent();
            console.error(
              "Erro ao enviar notifica\u00E7\u00E3o via ".concat(channel, ":"),
              error_2,
            );
            return [
              2 /*return*/,
              {
                id: this.generateDeliveryId(),
                notificationId: context.notificationId || "",
                channel: channel,
                recipient: context.recipient,
                status: types_1.DeliveryStatus.FAILED,
                error: error_2 instanceof Error ? error_2.message : "Erro desconhecido",
                attempts: 1,
                sentAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // VALIDAÇÃO
  // ============================================================================
  /**
   * Valida configuração de canal
   */
  NotificationChannelManager.prototype.validateChannelConfig = function (channel, config) {
    var provider = this.getProvider(channel);
    if (!provider) {
      return ["Provedor n\u00E3o encontrado para canal: ".concat(channel)];
    }
    return provider.validateConfig(config);
  };
  // ============================================================================
  // MONITORAMENTO
  // ============================================================================
  /**
   * Verifica status de todos os canais
   */
  NotificationChannelManager.prototype.getChannelsStatus = function () {
    return __awaiter(this, void 0, void 0, function () {
      var status, _i, _a, _b, channel, provider, _c, _d, error_3;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            status = {};
            (_i = 0), (_a = this.providers.entries());
            _e.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            (_b = _a[_i]), (channel = _b[0]), (provider = _b[1]);
            _e.label = 2;
          case 2:
            _e.trys.push([2, 4, , 5]);
            _c = status;
            _d = channel;
            return [4 /*yield*/, provider.getStatus()];
          case 3:
            _c[_d] = _e.sent();
            return [3 /*break*/, 5];
          case 4:
            error_3 = _e.sent();
            status[channel] = {
              healthy: false,
              message: error_3 instanceof Error ? error_3.message : "Erro desconhecido",
            };
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, status];
        }
      });
    });
  };
  /**
   * Verifica se canal está saudável
   */
  NotificationChannelManager.prototype.isChannelHealthy = function (channel) {
    return __awaiter(this, void 0, void 0, function () {
      var provider, status_1, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            provider = this.getProvider(channel);
            if (!provider || !provider.isEnabled) {
              return [2 /*return*/, false];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [4 /*yield*/, provider.getStatus()];
          case 2:
            status_1 = _b.sent();
            return [2 /*return*/, status_1.healthy];
          case 3:
            _a = _b.sent();
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================
  /**
   * Gera ID único para entrega
   */
  NotificationChannelManager.prototype.generateDeliveryId = () =>
    "delivery_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  /**
   * Obtém configuração do canal
   */
  NotificationChannelManager.prototype.getChannelConfig = function (channel) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Em uma implementação real, isso viria do banco de dados
        // Por enquanto, retornamos configurações padrão baseadas em variáveis de ambiente
        switch (channel) {
          case types_1.NotificationChannel.EMAIL:
            return [
              2 /*return*/,
              {
                provider: "resend",
                settings: {
                  apiKey: process.env.RESEND_API_KEY,
                  fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@neonpro.com",
                  fromName: process.env.RESEND_FROM_NAME || "NeonPro",
                },
                isEnabled: !!process.env.RESEND_API_KEY,
              },
            ];
          case types_1.NotificationChannel.SMS:
            return [
              2 /*return*/,
              {
                provider: "twilio",
                settings: {
                  accountSid: process.env.TWILIO_ACCOUNT_SID,
                  authToken: process.env.TWILIO_AUTH_TOKEN,
                  fromNumber: process.env.TWILIO_FROM_NUMBER,
                },
                isEnabled: !!process.env.TWILIO_ACCOUNT_SID,
              },
            ];
          case types_1.NotificationChannel.PUSH:
            return [
              2 /*return*/,
              {
                provider: "firebase",
                settings: {
                  serverKey: process.env.FIREBASE_SERVER_KEY,
                  projectId: process.env.FIREBASE_PROJECT_ID,
                },
                isEnabled: !!process.env.FIREBASE_SERVER_KEY,
              },
            ];
          case types_1.NotificationChannel.IN_APP:
            return [
              2 /*return*/,
              {
                provider: "supabase",
                settings: {
                  url: process.env.SUPABASE_URL,
                  anonKey: process.env.SUPABASE_ANON_KEY,
                },
                isEnabled: true, // Sempre habilitado
              },
            ];
          default:
            return [2 /*return*/, undefined];
        }
        return [2 /*return*/];
      });
    });
  };
  return NotificationChannelManager;
})();
exports.NotificationChannelManager = NotificationChannelManager;
// ============================================================================
// EXPORTS
// ============================================================================
exports.default = NotificationChannelManager;
__exportStar(require("./email-provider"), exports);
__exportStar(require("./sms-provider"), exports);
__exportStar(require("./push-provider"), exports);
__exportStar(require("./in-app-provider"), exports);
