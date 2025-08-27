/**
 * Chat Library - NeonPro Healthcare Platform
 * Complete chat system with Supabase real-time, LGPD compliance, and Brazilian healthcare workflows
 */

// Real-time Supabase Integration
export { 
  ChatRealtimeManager,
  getChatRealtimeManager,
  convertMessageRecordToChatMessage,
  convertConversationRecordToChatSession,
} from './supabase-realtime';

export type {
  ChatConversationRecord,
  ChatMessageRecord,
  TypingIndicatorRecord,
  PresenceRecord,
} from './supabase-realtime';

// Healthcare Workflows
export {
  HealthcareWorkflowEngine,
  BRAZILIAN_HEALTHCARE_WORKFLOWS,
} from './chat-workflows';

export type {
  HealthcareWorkflowType,
  WorkflowPriority,
  EscalationRule,
  HealthcareWorkflow,
  WorkflowStep,
  WorkflowResponse,
} from './chat-workflows';

// LGPD Compliance
export {
  LGPDChatComplianceManager,
  getLGPDComplianceManager,
  createLGPDCompliantMessage,
} from './lgpd-chat-compliance';

export type {
  LGPDConsent,
  ChatLGPDCompliance,
  DataProcessingRecord,
} from './lgpd-chat-compliance';

// Unified chat service factory
export class NeonProChatService {
  private realtimeManager = getChatRealtimeManager();
  private complianceManager = getLGPDComplianceManager();
  private workflowEngine = new HealthcareWorkflowEngine();

  // Initialize complete chat service
  async initializeChatService(
    userId: string,
    userType: 'patient' | 'staff',
    mode: 'internal' | 'external' | 'emergency',
    healthcareContext?: {
      specialty?: 'dermatology' | 'aesthetics' | 'plastic-surgery';
      clinicId?: string;
      patientId?: string;
    }
  ) {
    // Create or get conversation
    const conversation = await this.realtimeManager.createOrGetConversation(
      userId,
      userType,
      mode === 'internal' ? 'internal' : 
      mode === 'emergency' ? 'emergency' : 'consultation',
      healthcareContext,
      mode === 'emergency' ? 'emergency-only' : 
      mode === 'internal' ? 'minimal' : 'full'
    );

    // Initialize LGPD compliance
    const compliance = await this.complianceManager.initializeChatCompliance(
      conversation.id,
      userId,
      userType,
      mode
    );

    return {
      conversation,
      compliance,
      realtimeManager: this.realtimeManager,
      complianceManager: this.complianceManager,
      workflowEngine: this.workflowEngine,
    };
  }

  // Send message with full compliance and workflow processing
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderType: 'patient' | 'staff' | 'ai',
    content: string,
    compliance: ChatLGPDCompliance
  ) {
    // Create LGPD-compliant message
    const { content: processedContent, metadata } = await createLGPDCompliantMessage(
      content,
      conversationId,
      compliance
    );

    // Send via real-time manager
    return await this.realtimeManager.sendMessage(
      conversationId,
      senderId,
      senderType,
      processedContent,
      metadata
    );
  }

  // Get all service instances
  getServices() {
    return {
      realtime: this.realtimeManager,
      compliance: this.complianceManager,
      workflow: this.workflowEngine,
    };
  }
}

// Singleton service instance
let chatService: NeonProChatService | null = null;

export const getNeonProChatService = (): NeonProChatService => {
  if (!chatService) {
    chatService = new NeonProChatService();
  }
  return chatService;
};

// Export default service
export default NeonProChatService;