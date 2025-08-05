/**
 * NeonPro Notification System - In-App Provider
 * Story 1.7: Sistema de Notificações
 *
 * Provedor de notificações in-app para interface web
 * Suporte a notificações em tempo real via WebSocket
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InAppProvider = void 0;
var types_1 = require("../types");
// ============================================================================
// IN-APP PROVIDER
// ============================================================================
/**
 * Provedor de notificações in-app
 */
var InAppProvider = /** @class */ (() => {
  function InAppProvider() {
    this.name = "In-App Notification Provider";
    this.channel = types_1.NotificationChannel.IN_APP;
    this.config = null;
    this.notifications = new Map();
    this.websocket = null;
    this.listeners = new Map();
  }
  Object.defineProperty(InAppProvider.prototype, "isEnabled", {
    get: function () {
      return this.config !== null;
    },
    enumerable: false,
    configurable: true,
  });
  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================
  /**
   * Inicializa o provedor com configuração
   */
  InAppProvider.prototype.initialize = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var errors;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            errors = this.validateConfig(config);
            if (errors.length > 0) {
              throw new Error("Configura\u00E7\u00E3o inv\u00E1lida: ".concat(errors.join(", ")));
            }
            this.config = __assign(
              {
                enableRealTime: true,
                maxNotifications: 100,
                autoMarkAsRead: false,
                soundEnabled: true,
                persistNotifications: true,
              },
              config.settings,
            );
            if (!(this.config.enableRealTime && this.config.websocketUrl)) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initializeWebSocket()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            if (!this.config.persistNotifications) return [3 /*break*/, 4];
            return [4 /*yield*/, this.loadPersistedNotifications()];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Inicializa conexão WebSocket
   */
  InAppProvider.prototype.initializeWebSocket = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      var _a;
      return __generator(this, function (_b) {
        if (!((_a = this.config) === null || _a === void 0 ? void 0 : _a.websocketUrl))
          return [2 /*return*/];
        try {
          this.websocket = new WebSocket(this.config.websocketUrl);
          this.websocket.onopen = () => {
            console.log("🔗 WebSocket conectado para notificações in-app");
          };
          this.websocket.onmessage = (event) => {
            try {
              var message = JSON.parse(event.data);
              _this.handleWebSocketMessage(message);
            } catch (error) {
              console.error("Erro ao processar mensagem WebSocket:", error);
            }
          };
          this.websocket.onclose = () => {
            console.log("🔌 WebSocket desconectado. Tentando reconectar...");
            setTimeout(() => _this.initializeWebSocket(), 5000);
          };
          this.websocket.onerror = (error) => {
            console.error("Erro no WebSocket:", error);
          };
        } catch (error) {
          console.warn("WebSocket não disponível. Usando modo local.");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Carrega notificações persistidas
   */
  InAppProvider.prototype.loadPersistedNotifications = function () {
    return __awaiter(this, void 0, void 0, function () {
      var stored, data;
      return __generator(this, function (_a) {
        try {
          stored = localStorage.getItem("neonpro_notifications");
          if (stored) {
            data = JSON.parse(stored);
            this.notifications = new Map(
              Object.entries(data).map((_a) => {
                var userId = _a[0],
                  notifications = _a[1];
                return [
                  userId,
                  notifications.map((n) =>
                    __assign(__assign({}, n), {
                      createdAt: new Date(n.createdAt),
                      readAt: n.readAt ? new Date(n.readAt) : undefined,
                      expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
                    }),
                  ),
                ];
              }),
            );
          }
        } catch (error) {
          console.warn("Erro ao carregar notificações persistidas:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  // ============================================================================
  // ENVIO DE NOTIFICAÇÕES
  // ============================================================================
  /**
   * Envia notificação in-app
   */
  InAppProvider.prototype.send = function (context, content) {
    return __awaiter(this, void 0, void 0, function () {
      var deliveryId, userId, notification, error_1;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!this.config) {
              throw new Error("Provedor não inicializado");
            }
            deliveryId = this.generateDeliveryId();
            userId = context.recipient.id;
            _b.label = 1;
          case 1:
            _b.trys.push([1, 4, , 5]);
            notification = {
              id: deliveryId,
              userId: userId,
              title: content.title,
              message: content.message,
              icon: content.icon,
              image: content.image,
              actionUrl: content.actionUrl,
              actionText: content.actionText,
              category: content.category,
              priority: context.priority,
              isRead: false,
              isArchived: false,
              metadata: content.metadata,
              createdAt: new Date(),
              expiresAt: this.calculateExpirationDate(context.priority),
            };
            // Adicionar à lista de notificações do usuário
            this.addNotificationToUser(userId, notification);
            if (!this.config.persistNotifications) return [3 /*break*/, 3];
            return [4 /*yield*/, this.persistNotifications()];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            // Enviar via WebSocket se conectado
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
              this.websocket.send(
                JSON.stringify({
                  type: "notification",
                  data: notification,
                  timestamp: new Date(),
                }),
              );
            }
            // Notificar listeners
            this.notifyListeners(userId, notification);
            // Reproduzir som se habilitado
            if (this.config.soundEnabled && typeof window !== "undefined") {
              this.playNotificationSound(context.priority);
            }
            return [
              2 /*return*/,
              {
                id: deliveryId,
                notificationId: context.notificationId || "",
                channel: this.channel,
                recipient: context.recipient,
                status: types_1.DeliveryStatus.DELIVERED,
                metadata: {
                  notificationId: notification.id,
                  title: notification.title,
                  message: notification.message,
                  category: notification.category,
                  priority: notification.priority,
                  websocketSent:
                    ((_a = this.websocket) === null || _a === void 0 ? void 0 : _a.readyState) ===
                    WebSocket.OPEN,
                },
                attempts: 1,
                sentAt: new Date(),
                deliveredAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ];
          case 4:
            error_1 = _b.sent();
            console.error("Erro ao enviar notificação in-app:", error_1);
            return [
              2 /*return*/,
              {
                id: deliveryId,
                notificationId: context.notificationId || "",
                channel: this.channel,
                recipient: context.recipient,
                status: types_1.DeliveryStatus.FAILED,
                error: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
                attempts: 1,
                sentAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // GERENCIAMENTO DE NOTIFICAÇÕES
  // ============================================================================
  /**
   * Adiciona notificação à lista do usuário
   */
  InAppProvider.prototype.addNotificationToUser = function (userId, notification) {
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    var userNotifications = this.notifications.get(userId);
    userNotifications.unshift(notification);
    // Limitar número máximo de notificações
    if (this.config && userNotifications.length > this.config.maxNotifications) {
      userNotifications.splice(this.config.maxNotifications);
    }
    // Remover notificações expiradas
    this.cleanupExpiredNotifications(userId);
  };
  /**
   * Obtém notificações do usuário
   */
  InAppProvider.prototype.getUserNotifications = function (userId, options) {
    if (options === void 0) {
      options = {};
    }
    var userNotifications = this.notifications.get(userId) || [];
    var filtered = userNotifications.filter((n) => {
      if (options.unreadOnly && n.isRead) return false;
      if (options.category && n.category !== options.category) return false;
      if (n.isArchived) return false;
      if (n.expiresAt && n.expiresAt < new Date()) return false;
      return true;
    });
    // Aplicar paginação
    var offset = options.offset || 0;
    var limit = options.limit || filtered.length;
    return filtered.slice(offset, offset + limit);
  };
  /**
   * Marca notificação como lida
   */
  InAppProvider.prototype.markAsRead = function (userId, notificationId) {
    return __awaiter(this, void 0, void 0, function () {
      var userNotifications, notification;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            userNotifications = this.notifications.get(userId);
            if (!userNotifications) return [2 /*return*/, false];
            notification = userNotifications.find((n) => n.id === notificationId);
            if (!notification) return [2 /*return*/, false];
            notification.isRead = true;
            notification.readAt = new Date();
            if (!((_a = this.config) === null || _a === void 0 ? void 0 : _a.persistNotifications))
              return [3 /*break*/, 2];
            return [4 /*yield*/, this.persistNotifications()];
          case 1:
            _b.sent();
            _b.label = 2;
          case 2:
            // Notificar via WebSocket
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
              this.websocket.send(
                JSON.stringify({
                  type: "read",
                  data: { userId: userId, notificationId: notificationId },
                  timestamp: new Date(),
                }),
              );
            }
            return [2 /*return*/, true];
        }
      });
    });
  };
  /**
   * Marca todas as notificações como lidas
   */
  InAppProvider.prototype.markAllAsRead = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var userNotifications, count, now;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            userNotifications = this.notifications.get(userId);
            if (!userNotifications) return [2 /*return*/, 0];
            count = 0;
            now = new Date();
            userNotifications.forEach((notification) => {
              if (!notification.isRead && !notification.isArchived) {
                notification.isRead = true;
                notification.readAt = now;
                count++;
              }
            });
            if (
              !(
                ((_a = this.config) === null || _a === void 0 ? void 0 : _a.persistNotifications) &&
                count > 0
              )
            )
              return [3 /*break*/, 2];
            return [4 /*yield*/, this.persistNotifications()];
          case 1:
            _b.sent();
            _b.label = 2;
          case 2:
            return [2 /*return*/, count];
        }
      });
    });
  };
  /**
   * Arquiva notificação
   */
  InAppProvider.prototype.archiveNotification = function (userId, notificationId) {
    return __awaiter(this, void 0, void 0, function () {
      var userNotifications, notification;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            userNotifications = this.notifications.get(userId);
            if (!userNotifications) return [2 /*return*/, false];
            notification = userNotifications.find((n) => n.id === notificationId);
            if (!notification) return [2 /*return*/, false];
            notification.isArchived = true;
            if (!((_a = this.config) === null || _a === void 0 ? void 0 : _a.persistNotifications))
              return [3 /*break*/, 2];
            return [4 /*yield*/, this.persistNotifications()];
          case 1:
            _b.sent();
            _b.label = 2;
          case 2:
            return [2 /*return*/, true];
        }
      });
    });
  };
  /**
   * Remove notificação
   */
  InAppProvider.prototype.deleteNotification = function (userId, notificationId) {
    return __awaiter(this, void 0, void 0, function () {
      var userNotifications, index;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            userNotifications = this.notifications.get(userId);
            if (!userNotifications) return [2 /*return*/, false];
            index = userNotifications.findIndex((n) => n.id === notificationId);
            if (index === -1) return [2 /*return*/, false];
            userNotifications.splice(index, 1);
            if (!((_a = this.config) === null || _a === void 0 ? void 0 : _a.persistNotifications))
              return [3 /*break*/, 2];
            return [4 /*yield*/, this.persistNotifications()];
          case 1:
            _b.sent();
            _b.label = 2;
          case 2:
            return [2 /*return*/, true];
        }
      });
    });
  };
  // ============================================================================
  // LISTENERS E EVENTOS
  // ============================================================================
  /**
   * Adiciona listener para notificações
   */
  InAppProvider.prototype.addNotificationListener = function (userId, callback) {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, []);
    }
    this.listeners.get(userId).push(callback);
    // Retorna função para remover listener
    return () => {
      var userListeners = this.listeners.get(userId);
      if (userListeners) {
        var index = userListeners.indexOf(callback);
        if (index > -1) {
          userListeners.splice(index, 1);
        }
      }
    };
  };
  /**
   * Notifica listeners
   */
  InAppProvider.prototype.notifyListeners = function (userId, notification) {
    var userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.forEach((callback) => {
        try {
          callback(notification);
        } catch (error) {
          console.error("Erro ao executar listener de notificação:", error);
        }
      });
    }
  };
  /**
   * Processa mensagens WebSocket
   */
  InAppProvider.prototype.handleWebSocketMessage = (message) => {
    switch (message.type) {
      case "notification":
        // Notificação recebida de outro cliente
        break;
      case "read":
        // Notificação marcada como lida em outro cliente
        break;
      case "archive":
        // Notificação arquivada em outro cliente
        break;
      case "delete":
        // Notificação removida em outro cliente
        break;
    }
  };
  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================
  /**
   * Calcula data de expiração baseada na prioridade
   */
  InAppProvider.prototype.calculateExpirationDate = (priority) => {
    var now = new Date();
    switch (priority) {
      case types_1.NotificationPriority.URGENT:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 dia
      case types_1.NotificationPriority.HIGH:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
      case types_1.NotificationPriority.MEDIUM:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias
      case types_1.NotificationPriority.LOW:
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 dias
      default:
        return undefined;
    }
  };
  /**
   * Remove notificações expiradas
   */
  InAppProvider.prototype.cleanupExpiredNotifications = function (userId) {
    var userNotifications = this.notifications.get(userId);
    if (!userNotifications) return;
    var now = new Date();
    var validNotifications = userNotifications.filter((n) => !n.expiresAt || n.expiresAt > now);
    if (validNotifications.length !== userNotifications.length) {
      this.notifications.set(userId, validNotifications);
    }
  };
  /**
   * Reproduz som de notificação
   */
  InAppProvider.prototype.playNotificationSound = (priority) => {
    try {
      var audio = new Audio();
      switch (priority) {
        case types_1.NotificationPriority.URGENT:
          audio.src = "/sounds/urgent-notification.mp3";
          break;
        case types_1.NotificationPriority.HIGH:
          audio.src = "/sounds/high-notification.mp3";
          break;
        default:
          audio.src = "/sounds/default-notification.mp3";
          break;
      }
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignorar erros de reprodução (usuário pode ter bloqueado áudio)
      });
    } catch (error) {
      // Ignorar erros de áudio
    }
  };
  /**
   * Persiste notificações no localStorage
   */
  InAppProvider.prototype.persistNotifications = function () {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        try {
          data = Object.fromEntries(this.notifications.entries());
          localStorage.setItem("neonpro_notifications", JSON.stringify(data));
        } catch (error) {
          console.warn("Erro ao persistir notificações:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Gera ID único para entrega
   */
  InAppProvider.prototype.generateDeliveryId = () =>
    "inapp_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  // ============================================================================
  // VALIDAÇÃO E STATUS
  // ============================================================================
  /**
   * Valida configuração do provedor
   */
  InAppProvider.prototype.validateConfig = (config) => {
    var errors = [];
    var settings = config.settings;
    if (
      (settings === null || settings === void 0 ? void 0 : settings.maxNotifications) &&
      settings.maxNotifications < 1
    ) {
      errors.push("Número máximo de notificações deve ser maior que 0");
    }
    return errors;
  };
  /**
   * Verifica status do provedor
   */
  InAppProvider.prototype.getStatus = function () {
    return __awaiter(this, void 0, void 0, function () {
      var wsStatus;
      var _a;
      return __generator(this, function (_b) {
        if (!this.config) {
          return [
            2 /*return*/,
            {
              healthy: false,
              message: "Provedor não inicializado",
            },
          ];
        }
        wsStatus = this.config.enableRealTime
          ? ((_a = this.websocket) === null || _a === void 0 ? void 0 : _a.readyState) ===
            WebSocket.OPEN
            ? "conectado"
            : "desconectado"
          : "desabilitado";
        return [
          2 /*return*/,
          {
            healthy: true,
            message: "Provedor funcionando. WebSocket: ".concat(wsStatus),
          },
        ];
      });
    });
  };
  /**
   * Obtém estatísticas
   */
  InAppProvider.prototype.getStats = function () {
    var _a;
    var totalNotifications = 0;
    var unreadNotifications = 0;
    this.notifications.forEach((userNotifications) => {
      totalNotifications += userNotifications.length;
      unreadNotifications += userNotifications.filter((n) => !n.isRead && !n.isArchived).length;
    });
    return {
      totalNotifications: totalNotifications,
      unreadNotifications: unreadNotifications,
      activeUsers: this.notifications.size,
      websocketConnected:
        ((_a = this.websocket) === null || _a === void 0 ? void 0 : _a.readyState) ===
        WebSocket.OPEN,
    };
  };
  return InAppProvider;
})();
exports.InAppProvider = InAppProvider;
exports.default = InAppProvider;
