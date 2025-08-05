/**
 * NeonPro Notification System - In-App Provider
 * Story 1.7: Sistema de Notificações
 *
 * Provedor de notificações in-app para interface web
 * Suporte a notificações em tempo real via WebSocket
 */

import type {
  NotificationChannel,
  NotificationDelivery,
  NotificationContext,
  ChannelConfig,
  DeliveryStatus,
  NotificationPriority,
} from "../types";
import type { ChannelProvider } from "./index";

// ============================================================================
// INTERFACES
// ============================================================================

interface InAppConfig {
  websocketUrl?: string;
  enableRealTime: boolean;
  maxNotifications: number;
  autoMarkAsRead: boolean;
  soundEnabled: boolean;
  persistNotifications: boolean;
}

interface InAppContent {
  title: string;
  message: string;
  icon?: string;
  image?: string;
  actionUrl?: string;
  actionText?: string;
  category?: string;
  metadata?: Record<string, any>;
}

interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  icon?: string;
  image?: string;
  actionUrl?: string;
  actionText?: string;
  category?: string;
  priority: NotificationPriority;
  isRead: boolean;
  isArchived: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

interface WebSocketMessage {
  type: "notification" | "read" | "archive" | "delete";
  data: any;
  timestamp: Date;
}

// ============================================================================
// IN-APP PROVIDER
// ============================================================================

/**
 * Provedor de notificações in-app
 */
export class InAppProvider implements ChannelProvider {
  readonly name = "In-App Notification Provider";
  readonly channel = NotificationChannel.IN_APP;

  private config: InAppConfig | null = null;
  private notifications: Map<string, InAppNotification[]> = new Map();
  private websocket: WebSocket | null = null;
  private listeners: Map<string, ((notification: InAppNotification) => void)[]> = new Map();

  get isEnabled(): boolean {
    return this.config !== null;
  }

  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================

  /**
   * Inicializa o provedor com configuração
   */
  async initialize(config: ChannelConfig): Promise<void> {
    const errors = this.validateConfig(config);
    if (errors.length > 0) {
      throw new Error(`Configuração inválida: ${errors.join(", ")}`);
    }

    this.config = {
      enableRealTime: true,
      maxNotifications: 100,
      autoMarkAsRead: false,
      soundEnabled: true,
      persistNotifications: true,
      ...config.settings,
    } as InAppConfig;

    // Inicializar WebSocket se habilitado
    if (this.config.enableRealTime && this.config.websocketUrl) {
      await this.initializeWebSocket();
    }

    // Carregar notificações persistidas
    if (this.config.persistNotifications) {
      await this.loadPersistedNotifications();
    }
  }

  /**
   * Inicializa conexão WebSocket
   */
  private async initializeWebSocket(): Promise<void> {
    if (!this.config?.websocketUrl) return;

    try {
      this.websocket = new WebSocket(this.config.websocketUrl);

      this.websocket.onopen = () => {
        console.log("🔗 WebSocket conectado para notificações in-app");
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error("Erro ao processar mensagem WebSocket:", error);
        }
      };

      this.websocket.onclose = () => {
        console.log("🔌 WebSocket desconectado. Tentando reconectar...");
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      this.websocket.onerror = (error) => {
        console.error("Erro no WebSocket:", error);
      };
    } catch (error) {
      console.warn("WebSocket não disponível. Usando modo local.");
    }
  }

  /**
   * Carrega notificações persistidas
   */
  private async loadPersistedNotifications(): Promise<void> {
    try {
      const stored = localStorage.getItem("neonpro_notifications");
      if (stored) {
        const data = JSON.parse(stored);
        this.notifications = new Map(
          Object.entries(data).map(([userId, notifications]) => [
            userId,
            (notifications as any[]).map((n) => ({
              ...n,
              createdAt: new Date(n.createdAt),
              readAt: n.readAt ? new Date(n.readAt) : undefined,
              expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
            })),
          ]),
        );
      }
    } catch (error) {
      console.warn("Erro ao carregar notificações persistidas:", error);
    }
  }

  // ============================================================================
  // ENVIO DE NOTIFICAÇÕES
  // ============================================================================

  /**
   * Envia notificação in-app
   */
  async send(context: NotificationContext, content: InAppContent): Promise<NotificationDelivery> {
    if (!this.config) {
      throw new Error("Provedor não inicializado");
    }

    const deliveryId = this.generateDeliveryId();
    const userId = context.recipient.id;

    try {
      // Criar notificação
      const notification: InAppNotification = {
        id: deliveryId,
        userId,
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

      // Persistir se habilitado
      if (this.config.persistNotifications) {
        await this.persistNotifications();
      }

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

      return {
        id: deliveryId,
        notificationId: context.notificationId || "",
        channel: this.channel,
        recipient: context.recipient,
        status: DeliveryStatus.DELIVERED,
        metadata: {
          notificationId: notification.id,
          title: notification.title,
          message: notification.message,
          category: notification.category,
          priority: notification.priority,
          websocketSent: this.websocket?.readyState === WebSocket.OPEN,
        },
        attempts: 1,
        sentAt: new Date(),
        deliveredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Erro ao enviar notificação in-app:", error);

      return {
        id: deliveryId,
        notificationId: context.notificationId || "",
        channel: this.channel,
        recipient: context.recipient,
        status: DeliveryStatus.FAILED,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        attempts: 1,
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  // ============================================================================
  // GERENCIAMENTO DE NOTIFICAÇÕES
  // ============================================================================

  /**
   * Adiciona notificação à lista do usuário
   */
  private addNotificationToUser(userId: string, notification: InAppNotification): void {
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    const userNotifications = this.notifications.get(userId)!;
    userNotifications.unshift(notification);

    // Limitar número máximo de notificações
    if (this.config && userNotifications.length > this.config.maxNotifications) {
      userNotifications.splice(this.config.maxNotifications);
    }

    // Remover notificações expiradas
    this.cleanupExpiredNotifications(userId);
  }

  /**
   * Obtém notificações do usuário
   */
  getUserNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean;
      category?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): InAppNotification[] {
    const userNotifications = this.notifications.get(userId) || [];

    const filtered = userNotifications.filter((n) => {
      if (options.unreadOnly && n.isRead) return false;
      if (options.category && n.category !== options.category) return false;
      if (n.isArchived) return false;
      if (n.expiresAt && n.expiresAt < new Date()) return false;
      return true;
    });

    // Aplicar paginação
    const offset = options.offset || 0;
    const limit = options.limit || filtered.length;

    return filtered.slice(offset, offset + limit);
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const notification = userNotifications.find((n) => n.id === notificationId);
    if (!notification) return false;

    notification.isRead = true;
    notification.readAt = new Date();

    // Persistir mudança
    if (this.config?.persistNotifications) {
      await this.persistNotifications();
    }

    // Notificar via WebSocket
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(
        JSON.stringify({
          type: "read",
          data: { userId, notificationId },
          timestamp: new Date(),
        }),
      );
    }

    return true;
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(userId: string): Promise<number> {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return 0;

    let count = 0;
    const now = new Date();

    userNotifications.forEach((notification) => {
      if (!notification.isRead && !notification.isArchived) {
        notification.isRead = true;
        notification.readAt = now;
        count++;
      }
    });

    // Persistir mudanças
    if (this.config?.persistNotifications && count > 0) {
      await this.persistNotifications();
    }

    return count;
  }

  /**
   * Arquiva notificação
   */
  async archiveNotification(userId: string, notificationId: string): Promise<boolean> {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const notification = userNotifications.find((n) => n.id === notificationId);
    if (!notification) return false;

    notification.isArchived = true;

    // Persistir mudança
    if (this.config?.persistNotifications) {
      await this.persistNotifications();
    }

    return true;
  }

  /**
   * Remove notificação
   */
  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const index = userNotifications.findIndex((n) => n.id === notificationId);
    if (index === -1) return false;

    userNotifications.splice(index, 1);

    // Persistir mudança
    if (this.config?.persistNotifications) {
      await this.persistNotifications();
    }

    return true;
  }

  // ============================================================================
  // LISTENERS E EVENTOS
  // ============================================================================

  /**
   * Adiciona listener para notificações
   */
  addNotificationListener(
    userId: string,
    callback: (notification: InAppNotification) => void,
  ): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, []);
    }

    this.listeners.get(userId)!.push(callback);

    // Retorna função para remover listener
    return () => {
      const userListeners = this.listeners.get(userId);
      if (userListeners) {
        const index = userListeners.indexOf(callback);
        if (index > -1) {
          userListeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notifica listeners
   */
  private notifyListeners(userId: string, notification: InAppNotification): void {
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.forEach((callback) => {
        try {
          callback(notification);
        } catch (error) {
          console.error("Erro ao executar listener de notificação:", error);
        }
      });
    }
  }

  /**
   * Processa mensagens WebSocket
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
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
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  /**
   * Calcula data de expiração baseada na prioridade
   */
  private calculateExpirationDate(priority: NotificationPriority): Date | undefined {
    const now = new Date();

    switch (priority) {
      case NotificationPriority.URGENT:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 dia
      case NotificationPriority.HIGH:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
      case NotificationPriority.MEDIUM:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias
      case NotificationPriority.LOW:
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 dias
      default:
        return undefined;
    }
  }

  /**
   * Remove notificações expiradas
   */
  private cleanupExpiredNotifications(userId: string): void {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return;

    const now = new Date();
    const validNotifications = userNotifications.filter((n) => !n.expiresAt || n.expiresAt > now);

    if (validNotifications.length !== userNotifications.length) {
      this.notifications.set(userId, validNotifications);
    }
  }

  /**
   * Reproduz som de notificação
   */
  private playNotificationSound(priority: NotificationPriority): void {
    try {
      const audio = new Audio();

      switch (priority) {
        case NotificationPriority.URGENT:
          audio.src = "/sounds/urgent-notification.mp3";
          break;
        case NotificationPriority.HIGH:
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
  }

  /**
   * Persiste notificações no localStorage
   */
  private async persistNotifications(): Promise<void> {
    try {
      const data = Object.fromEntries(this.notifications.entries());
      localStorage.setItem("neonpro_notifications", JSON.stringify(data));
    } catch (error) {
      console.warn("Erro ao persistir notificações:", error);
    }
  }

  /**
   * Gera ID único para entrega
   */
  private generateDeliveryId(): string {
    return `inapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // VALIDAÇÃO E STATUS
  // ============================================================================

  /**
   * Valida configuração do provedor
   */
  validateConfig(config: ChannelConfig): string[] {
    const errors: string[] = [];
    const settings = config.settings as InAppConfig;

    if (settings?.maxNotifications && settings.maxNotifications < 1) {
      errors.push("Número máximo de notificações deve ser maior que 0");
    }

    return errors;
  }

  /**
   * Verifica status do provedor
   */
  async getStatus(): Promise<{ healthy: boolean; message?: string }> {
    if (!this.config) {
      return {
        healthy: false,
        message: "Provedor não inicializado",
      };
    }

    const wsStatus = this.config.enableRealTime
      ? this.websocket?.readyState === WebSocket.OPEN
        ? "conectado"
        : "desconectado"
      : "desabilitado";

    return {
      healthy: true,
      message: `Provedor funcionando. WebSocket: ${wsStatus}`,
    };
  }

  /**
   * Obtém estatísticas
   */
  getStats(): {
    totalNotifications: number;
    unreadNotifications: number;
    activeUsers: number;
    websocketConnected: boolean;
  } {
    let totalNotifications = 0;
    let unreadNotifications = 0;

    this.notifications.forEach((userNotifications) => {
      totalNotifications += userNotifications.length;
      unreadNotifications += userNotifications.filter((n) => !n.isRead && !n.isArchived).length;
    });

    return {
      totalNotifications,
      unreadNotifications,
      activeUsers: this.notifications.size,
      websocketConnected: this.websocket?.readyState === WebSocket.OPEN,
    };
  }
}

export default InAppProvider;
