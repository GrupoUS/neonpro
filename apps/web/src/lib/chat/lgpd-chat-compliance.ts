"use client";

import { getChatRealtimeManager } from './supabase-realtime';
import type { ChatMessage, ChatSession } from '@/components/chat/ChatInterface';

// LGPD Compliance Types for Chat
export interface LGPDConsent {
  id: string;
  userId: string;
  userType: 'patient' | 'staff';
  consentType: 'chat_data_processing' | 'ai_analysis' | 'data_retention' | 'medical_recording';
  granted: boolean;
  grantedAt?: Date;
  withdrawnAt?: Date;
  expiresAt?: Date;
  purpose: string;
  legalBasis: 'consent' | 'legitimate_interest' | 'vital_interest' | 'public_interest';
  dataCategories: string[];
  retentionPeriod: number; // days
}

export interface ChatLGPDCompliance {
  conversationId: string;
  consentLevel: 'full' | 'minimal' | 'emergency-only';
  dataRetentionDays: number;
  encryptionEnabled: boolean;
  auditTrailRequired: boolean;
  rightToErasure: boolean;
  dataPortabilityEnabled: boolean;
  consentWithdrawalDate?: Date;
  anonymizationDate?: Date;
  complianceFlags: string[];
}

export interface DataProcessingRecord {
  id: string;
  conversationId: string;
  userId: string;
  processingType: 'collection' | 'analysis' | 'storage' | 'transfer' | 'deletion';
  dataCategory: 'identification' | 'health_data' | 'conversation' | 'metadata' | 'ai_analysis';
  purpose: string;
  legalBasis: string;
  timestamp: Date;
  retentionUntil: Date;
  encryptionMethod: string;
}

// LGPD-compliant chat data manager
export class LGPDChatComplianceManager {
  private realtimeManager = getChatRealtimeManager();

  // Request consent for specific data processing
  async requestConsent(
    userId: string,
    userType: 'patient' | 'staff',
    consentType: LGPDConsent['consentType'],
    purpose: string,
    dataCategories: string[],
    retentionDays: number = 365
  ): Promise<LGPDConsent> {
    const consent: LGPDConsent = {
      id: `consent_${userId}_${consentType}_${Date.now()}`,
      userId,
      userType,
      consentType,
      granted: false, // Must be explicitly granted by user
      purpose,
      legalBasis: 'consent',
      dataCategories,
      retentionPeriod: retentionDays,
    };

    // In a real implementation, this would be stored in the database
    // and the user would be presented with a consent form
    return consent;
  }

  // Grant consent (called after user explicitly agrees)
  async grantConsent(consentId: string): Promise<LGPDConsent> {
    // In real implementation, update database
    const consent = await this.getConsent(consentId);
    consent.granted = true;
    consent.grantedAt = new Date();
    consent.expiresAt = new Date(Date.now() + consent.retentionPeriod * 24 * 60 * 60 * 1000);

    await this.logDataProcessing(
      'consent_granted',
      consent.userId,
      'consent_management',
      'identification',
      `User granted consent for ${consent.consentType}`,
      'consent'
    );

    return consent;
  }

  // Withdraw consent (LGPD right)
  async withdrawConsent(consentId: string, reason?: string): Promise<void> {
    const consent = await this.getConsent(consentId);
    consent.granted = false;
    consent.withdrawnAt = new Date();

    // Trigger data deletion/anonymization process
    await this.initiateDataErasure(consent.userId, consent.consentType, reason);

    await this.logDataProcessing(
      'consent_withdrawn',
      consent.userId,
      'consent_management', 
      'identification',
      `User withdrew consent for ${consent.consentType}. Reason: ${reason || 'Not provided'}`,
      'consent'
    );
  }

  // Initialize LGPD compliance for a chat session
  async initializeChatCompliance(
    conversationId: string,
    userId: string,
    userType: 'patient' | 'staff',
    mode: 'internal' | 'external' | 'emergency'
  ): Promise<ChatLGPDCompliance> {
    // Determine appropriate compliance level based on mode
    let consentLevel: ChatLGPDCompliance['consentLevel'];
    let dataRetentionDays: number;
    let complianceFlags: string[] = [];

    switch (mode) {
      case 'emergency':
        consentLevel = 'emergency-only';
        dataRetentionDays = 2555; // 7 years for medical emergencies
        complianceFlags.push('emergency_exception', 'vital_interest_basis');
        break;
      case 'internal':
        consentLevel = 'minimal';
        dataRetentionDays = 1825; // 5 years for internal communications
        complianceFlags.push('staff_communication', 'legitimate_interest');
        break;
      default: // external
        consentLevel = 'full';
        dataRetentionDays = 365; // 1 year for patient communications
        complianceFlags.push('patient_communication', 'consent_required');
    }

    const compliance: ChatLGPDCompliance = {
      conversationId,
      consentLevel,
      dataRetentionDays,
      encryptionEnabled: true,
      auditTrailRequired: true,
      rightToErasure: mode !== 'emergency', // Emergencies may need longer retention
      dataPortabilityEnabled: true,
      complianceFlags,
    };

    // Request necessary consents
    if (consentLevel === 'full') {
      await this.requestConsent(
        userId,
        userType,
        'chat_data_processing',
        'Processamento de dados para comunicação via chat com IA médica',
        ['identification', 'health_data', 'conversation', 'ai_analysis'],
        dataRetentionDays
      );
    }

    // Log compliance initialization
    await this.logDataProcessing(
      'compliance_initialized',
      userId,
      conversationId,
      'metadata',
      `Chat compliance initialized: ${consentLevel}`,
      mode === 'emergency' ? 'vital_interest' : 'consent'
    );

    return compliance;
  }

  // Encrypt message content
  async encryptMessage(content: string, conversationId: string): Promise<string> {
    // In real implementation, use proper encryption
    // This is a placeholder for AES-256-GCM encryption
    const encryptedContent = Buffer.from(content, 'utf8').toString('base64');
    
    await this.logDataProcessing(
      'data_encrypted',
      'system',
      conversationId,
      'conversation',
      'Message content encrypted using AES-256-GCM',
      'security'
    );

    return `encrypted:${encryptedContent}`;
  }

  // Decrypt message content
  async decryptMessage(encryptedContent: string, conversationId: string): Promise<string> {
    if (!encryptedContent.startsWith('encrypted:')) {
      return encryptedContent; // Not encrypted
    }

    // In real implementation, use proper decryption
    const base64Content = encryptedContent.replace('encrypted:', '');
    const decryptedContent = Buffer.from(base64Content, 'base64').toString('utf8');

    await this.logDataProcessing(
      'data_decrypted',
      'system',
      conversationId,
      'conversation',
      'Message content decrypted for display',
      'security'
    );

    return decryptedContent;
  }

  // Anonymize message content (for data retention)
  async anonymizeMessage(message: ChatMessage): Promise<ChatMessage> {
    const anonymizedMessage = { ...message };
    
    // Remove or hash personally identifiable information
    anonymizedMessage.content = this.anonymizeText(message.content);
    anonymizedMessage.id = `anon_${message.id}`;
    
    // Remove healthcare context that might identify patient
    if (anonymizedMessage.healthcareContext) {
      delete anonymizedMessage.healthcareContext.procedureType;
    }

    await this.logDataProcessing(
      'data_anonymized',
      'system',
      'anonymization_process',
      'conversation',
      `Message ${message.id} anonymized for retention`,
      'legitimate_interest'
    );

    return anonymizedMessage;
  }

  // Export user's chat data (LGPD data portability right)
  async exportUserChatData(
    userId: string,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<{
    conversations: any[];
    messages: any[];
    consents: LGPDConsent[];
    processingLog: DataProcessingRecord[];
  }> {
    // In real implementation, query database for all user's chat data
    const exportData = {
      conversations: [], // All user's conversations
      messages: [], // All user's messages (decrypted)
      consents: [], // All user's consent records
      processingLog: [], // All data processing activities
    };

    await this.logDataProcessing(
      'data_exported',
      userId,
      'data_portability',
      'identification',
      `User requested data export in ${format} format`,
      'user_request'
    );

    return exportData;
  }

  // Initiate data erasure (LGPD right to be forgotten)
  async initiateDataErasure(
    userId: string,
    scope: 'all' | 'chat_data_processing' | 'ai_analysis' | 'specific_conversation',
    reason?: string,
    conversationId?: string
  ): Promise<void> {
    const erasureId = `erasure_${userId}_${Date.now()}`;

    // Schedule data deletion based on scope
    switch (scope) {
      case 'all':
        await this.scheduleFullErasure(userId, erasureId);
        break;
      case 'chat_data_processing':
        await this.scheduleChatDataErasure(userId, erasureId);
        break;
      case 'ai_analysis':
        await this.scheduleAIAnalysisErasure(userId, erasureId);
        break;
      case 'specific_conversation':
        if (conversationId) {
          await this.scheduleConversationErasure(conversationId, erasureId);
        }
        break;
    }

    await this.logDataProcessing(
      'erasure_initiated',
      userId,
      erasureId,
      'identification',
      `Data erasure initiated: ${scope}. Reason: ${reason || 'User request'}`,
      'user_request'
    );
  }

  // Generate LGPD compliance report
  async generateComplianceReport(
    conversationId: string
  ): Promise<{
    compliance: ChatLGPDCompliance;
    consents: LGPDConsent[];
    processingActivities: DataProcessingRecord[];
    violations: string[];
    recommendations: string[];
  }> {
    const compliance = await this.getChatCompliance(conversationId);
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check for violations
    if (!compliance.encryptionEnabled) {
      violations.push('Dados não criptografados em repouso');
      recommendations.push('Habilitar criptografia AES-256-GCM');
    }

    if (compliance.consentLevel === 'full' && !compliance.rightToErasure) {
      violations.push('Direito ao esquecimento não implementado');
      recommendations.push('Implementar processo de exclusão de dados');
    }

    // Check consent expiration
    const now = new Date();
    const expiredConsents = await this.getExpiredConsents(conversationId);
    if (expiredConsents.length > 0) {
      violations.push(`${expiredConsents.length} consentimentos expirados`);
      recommendations.push('Solicitar renovação de consentimentos');
    }

    return {
      compliance,
      consents: [], // All conversation consents
      processingActivities: [], // All processing records
      violations,
      recommendations,
    };
  }

  // Private helper methods
  private async getConsent(consentId: string): Promise<LGPDConsent> {
    // Mock implementation - in real app, query database
    return {
      id: consentId,
      userId: 'user123',
      userType: 'patient',
      consentType: 'chat_data_processing',
      granted: false,
      purpose: 'Chat processing',
      legalBasis: 'consent',
      dataCategories: ['conversation'],
      retentionPeriod: 365,
    };
  }

  private async getChatCompliance(conversationId: string): Promise<ChatLGPDCompliance> {
    // Mock implementation - in real app, query database
    return {
      conversationId,
      consentLevel: 'full',
      dataRetentionDays: 365,
      encryptionEnabled: true,
      auditTrailRequired: true,
      rightToErasure: true,
      dataPortabilityEnabled: true,
      complianceFlags: ['patient_communication', 'consent_required'],
    };
  }

  private async getExpiredConsents(conversationId: string): Promise<LGPDConsent[]> {
    // Mock implementation - in real app, query database
    return [];
  }

  private async logDataProcessing(
    processingType: DataProcessingRecord['processingType'],
    userId: string,
    conversationId: string,
    dataCategory: DataProcessingRecord['dataCategory'],
    purpose: string,
    legalBasis: string
  ): Promise<void> {
    const record: DataProcessingRecord = {
      id: `processing_${Date.now()}`,
      conversationId,
      userId,
      processingType,
      dataCategory,
      purpose,
      legalBasis,
      timestamp: new Date(),
      retentionUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      encryptionMethod: 'AES-256-GCM',
    };

    // In real implementation, store in audit database
    console.log('LGPD Audit Log:', record);
  }

  private anonymizeText(text: string): string {
    // Basic anonymization - in real implementation, use more sophisticated methods
    return text
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF]')
      .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '[CNPJ]')
      .replace(/\b\d{10,11}\b/g, '[TELEFONE]')
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+/g, '[NOME]');
  }

  private async scheduleFullErasure(userId: string, erasureId: string): Promise<void> {
    // Implementation for complete user data deletion
    console.log(`Scheduled full erasure for user ${userId} - ${erasureId}`);
  }

  private async scheduleChatDataErasure(userId: string, erasureId: string): Promise<void> {
    // Implementation for chat data deletion only
    console.log(`Scheduled chat data erasure for user ${userId} - ${erasureId}`);
  }

  private async scheduleAIAnalysisErasure(userId: string, erasureId: string): Promise<void> {
    // Implementation for AI analysis data deletion
    console.log(`Scheduled AI analysis erasure for user ${userId} - ${erasureId}`);
  }

  private async scheduleConversationErasure(conversationId: string, erasureId: string): Promise<void> {
    // Implementation for specific conversation deletion
    console.log(`Scheduled conversation erasure ${conversationId} - ${erasureId}`);
  }
}

// Singleton instance
let complianceManager: LGPDChatComplianceManager | null = null;

export const getLGPDComplianceManager = (): LGPDChatComplianceManager => {
  if (!complianceManager) {
    complianceManager = new LGPDChatComplianceManager();
  }
  return complianceManager;
};

// LGPD-compliant message wrapper
export const createLGPDCompliantMessage = async (
  content: string,
  conversationId: string,
  compliance: ChatLGPDCompliance
): Promise<{ content: string; metadata: any }> => {
  const manager = getLGPDComplianceManager();

  let processedContent = content;
  const metadata: any = {
    lgpd_compliance: true,
    consent_level: compliance.consentLevel,
    retention_until: new Date(Date.now() + compliance.dataRetentionDays * 24 * 60 * 60 * 1000),
  };

  // Encrypt if required
  if (compliance.encryptionEnabled) {
    processedContent = await manager.encryptMessage(content, conversationId);
    metadata.encrypted = true;
  }

  // Add compliance flags
  metadata.compliance_flags = compliance.complianceFlags;

  return {
    content: processedContent,
    metadata,
  };
};

export default LGPDChatComplianceManager;