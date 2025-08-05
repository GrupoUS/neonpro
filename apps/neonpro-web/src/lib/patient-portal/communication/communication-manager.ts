import { SupabaseClient } from '@supabase/supabase-js';
import { AuditLogger } from '../../audit/audit-logger';
import { LGPDManager } from '../../lgpd/lgpd-manager';
import { SessionManager } from '../auth/session-manager';
import { NotificationService } from '../../notifications/notification-service';

/**
 * Configuration for communication manager
 */
export interface CommunicationConfig {
  maxMessageLength: number;
  allowAttachments: boolean;
  maxAttachmentSize: number;
  autoResponseEnabled: boolean;
  moderationEnabled: boolean;
  encryptMessages: boolean;
  retentionDays: number;
  allowedFileTypes: string[];
}

/**
 * Message interface
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'patient' | 'staff' | 'system';
  recipientId: string;
  recipientType: 'patient' | 'staff' | 'department';
  subject?: string;
  content: string;
  messageType: 'text' | 'appointment_request' | 'prescription_request' | 'general_inquiry' | 'urgent';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'archived';
  attachments?: MessageAttachment[];
  metadata?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
  isEncrypted: boolean;
}

/**
 * Message attachment
 */
export interface MessageAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
  isEncrypted: boolean;
}

/**
 * Conversation interface
 */
export interface Conversation {
  id: string;
  patientId: string;
  staffId?: string;
  departmentId?: string;
  subject: string;
  status: 'active' | 'closed' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  lastMessageAt: Date;
  unreadCount: number;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
}

/**
 * Send message request
 */
export interface SendMessageRequest {
  patientId: string;
  recipientId?: string;
  recipientType: 'staff' | 'department';
  subject?: string;
  content: string;
  messageType: 'text' | 'appointment_request' | 'prescription_request' | 'general_inquiry' | 'urgent';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: File[];
  conversationId?: string;
}

/**
 * Send message result
 */
export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  conversationId?: string;
  message: string;
  estimatedResponseTime?: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  appointmentReminders: boolean;
  messageNotifications: boolean;
  treatmentUpdates: boolean;
  promotionalMessages: boolean;
}

/**
 * Communication statistics
 */
export interface CommunicationStats {
  totalMessages: number;
  unreadMessages: number;
  activeConversations: number;
  averageResponseTime: number;
  messagesByType: Record<string, number>;
  recentActivity: MessageActivity[];
}

/**
 * Message activity
 */
export interface MessageActivity {
  id: string;
  action: 'sent' | 'received' | 'read' | 'archived';
  messageId: string;
  timestamp: Date;
  details?: Record<string, any>;
}

/**
 * Patient communication manager
 */
export class CommunicationManager {
  private supabase: SupabaseClient;
  private auditLogger: AuditLogger;
  private lgpdManager: LGPDManager;
  private sessionManager: SessionManager;
  private notificationService: NotificationService;
  private config: CommunicationConfig;

  constructor(
    supabase: SupabaseClient,
    auditLogger: AuditLogger,
    lgpdManager: LGPDManager,
    sessionManager: SessionManager,
    notificationService: NotificationService,
    config: CommunicationConfig
  ) {
    this.supabase = supabase;
    this.auditLogger = auditLogger;
    this.lgpdManager = lgpdManager;
    this.sessionManager = sessionManager;
    this.notificationService = notificationService;
    this.config = config;
  }  
  /**
   * Send a message
   */
  async sendMessage(
    request: SendMessageRequest,
    sessionToken: string
  ): Promise<SendMessageResult> {
    try {
      // Validate session
      const sessionValidation = await this.sessionManager.validateSession(sessionToken);
      if (!sessionValidation.isValid || sessionValidation.session?.patientId !== request.patientId) {
        throw new Error('Invalid session or unauthorized access');
      }

      // Validate message content
      const validationResult = this.validateMessage(request);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.message
        };
      }

      // Get or create conversation
      let conversationId = request.conversationId;
      if (!conversationId) {
        conversationId = await this.createConversation(request);
      }

      // Process attachments if any
      let attachments: MessageAttachment[] = [];
      if (request.attachments && request.attachments.length > 0) {
        attachments = await this.processAttachments(request.attachments, request.patientId);
      }

      // Create message record
      const { data: message, error: messageError } = await this.supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: request.patientId,
          sender_type: 'patient',
          recipient_id: request.recipientId,
          recipient_type: request.recipientType,
          subject: request.subject,
          content: this.config.encryptMessages ? 
            await this.encryptContent(request.content) : request.content,
          message_type: request.messageType,
          priority: request.priority,
          status: 'sent',
          attachments: attachments,
          is_encrypted: this.config.encryptMessages,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Update conversation
      await this.updateConversation(conversationId, {
        lastMessageAt: new Date(),
        status: 'active'
      });

      // Send notifications
      await this.sendNotifications(message, request);

      // Log message activity
      await this.auditLogger.log({
        action: 'message_sent',
        userId: request.patientId,
        userType: 'patient',
        details: {
          messageId: message.id,
          conversationId: conversationId,
          messageType: request.messageType,
          priority: request.priority,
          hasAttachments: attachments.length > 0
        }
      });

      return {
        success: true,
        messageId: message.id,
        conversationId: conversationId,
        message: 'Mensagem enviada com sucesso!',
        estimatedResponseTime: this.getEstimatedResponseTime(request.priority)
      };
    } catch (error) {
      await this.auditLogger.log({
        action: 'message_send_failed',
        userId: request.patientId,
        userType: 'patient',
        details: { error: error.message }
      });
      throw error;
    }
  }  
  /**
   * Validate message content
   */
  private validateMessage(request: SendMessageRequest): {
    isValid: boolean;
    message: string;
  } {
    // Check message length
    if (request.content.length > this.config.maxMessageLength) {
      return {
        isValid: false,
        message: `Mensagem excede o limite de ${this.config.maxMessageLength} caracteres.`
      };
    }

    // Check for empty content
    if (!request.content.trim()) {
      return {
        isValid: false,
        message: 'Conteúdo da mensagem não pode estar vazio.'
      };
    }

    // Validate attachments if present
    if (request.attachments && request.attachments.length > 0) {
      if (!this.config.allowAttachments) {
        return {
          isValid: false,
          message: 'Anexos não são permitidos.'
        };
      }

      for (const file of request.attachments) {
        if (file.size > this.config.maxAttachmentSize) {
          return {
            isValid: false,
            message: `Arquivo ${file.name} excede o tamanho máximo permitido.`
          };
        }

        if (!this.config.allowedFileTypes.includes(file.type)) {
          return {
            isValid: false,
            message: `Tipo de arquivo ${file.type} não é permitido.`
          };
        }
      }
    }

    return {
      isValid: true,
      message: 'Validação bem-sucedida'
    };
  }  
  /**
   * Create a new conversation
   */
  private async createConversation(request: SendMessageRequest): Promise<string> {
    const { data: conversation, error } = await this.supabase
      .from('conversations')
      .insert({
        patient_id: request.patientId,
        staff_id: request.recipientType === 'staff' ? request.recipientId : null,
        department_id: request.recipientType === 'department' ? request.recipientId : null,
        subject: request.subject || `${request.messageType} - ${new Date().toLocaleDateString()}`,
        status: 'active',
        priority: request.priority,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return conversation.id;
  }

  /**
   * Update conversation
   */
  private async updateConversation(
    conversationId: string,
    updates: Partial<{
      lastMessageAt: Date;
      status: string;
      unreadCount: number;
    }>
  ): Promise<void> {
    const updateData: any = {};
    
    if (updates.lastMessageAt) {
      updateData.last_message_at = updates.lastMessageAt.toISOString();
    }
    if (updates.status) {
      updateData.status = updates.status;
    }
    if (updates.unreadCount !== undefined) {
      updateData.unread_count = updates.unreadCount;
    }

    const { error } = await this.supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId);

    if (error) throw error;
  }  
  /**
   * Process message attachments
   */
  private async processAttachments(
    files: File[],
    patientId: string
  ): Promise<MessageAttachment[]> {
    const attachments: MessageAttachment[] = [];

    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `messages/${patientId}/${fileName}`;

      // Upload file to storage
      const { data, error } = await this.supabase.storage
        .from('message-attachments')
        .upload(filePath, file);

      if (error) throw error;

      // Get download URL
      const { data: urlData } = await this.supabase.storage
        .from('message-attachments')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      attachments.push({
        id: data.path,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        downloadUrl: urlData?.signedUrl || '',
        isEncrypted: this.config.encryptMessages
      });
    }

    return attachments;
  }

  /**
   * Send notifications for new message
   */
  private async sendNotifications(
    message: any,
    request: SendMessageRequest
  ): Promise<void> {
    // This would integrate with the notification service
    // to send email, SMS, or push notifications based on recipient preferences
    await this.notificationService.sendMessageNotification({
      recipientId: request.recipientId!,
      recipientType: request.recipientType,
      messageType: request.messageType,
      priority: request.priority,
      subject: request.subject,
      senderName: 'Patient' // Would get actual patient name
    });
  }

  /**
   * Encrypt message content
   */
  private async encryptContent(content: string): Promise<string> {
    // This would integrate with encryption service
    // For now, return content as-is
    return content;
  }

  /**
   * Get estimated response time based on priority
   */
  private getEstimatedResponseTime(priority: string): string {
    switch (priority) {
      case 'urgent':
        return '1-2 horas';
      case 'high':
        return '4-6 horas';
      case 'normal':
        return '24 horas';
      case 'low':
        return '48-72 horas';
      default:
        return '24 horas';
    }
  }

  /**
   * Get communication statistics for a patient
   */
  async getCommunicationStats(
    patientId: string,
    sessionToken: string
  ): Promise<CommunicationStats> {
    // Validate session
    const sessionValidation = await this.sessionManager.validateSession(sessionToken);
    if (!sessionValidation.isValid || sessionValidation.session?.patientId !== patientId) {
      throw new Error('Invalid session or unauthorized access');
    }

    const { data: messages, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('sender_id', patientId)
      .eq('sender_type', 'patient');

    if (error) throw error;

    const stats: CommunicationStats = {
      totalMessages: messages.length,
      unreadMessages: messages.filter(m => m.status !== 'read').length,
      activeConversations: 0, // Would calculate from conversations table
      averageResponseTime: 0, // Would calculate from response times
      messagesByType: {},
      recentActivity: []
    };

    // Count messages by type
    messages.forEach(message => {
      stats.messagesByType[message.message_type] = 
        (stats.messagesByType[message.message_type] || 0) + 1;
    });

    return stats;
  }
}
