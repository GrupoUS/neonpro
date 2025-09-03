import type { SupabaseClient } from "@supabase/supabase-js";
import { EnhancedAIService } from "./enhanced-service-base";

export interface ConversationManagementInput {
  userId: string;
  clinicId: string;
  action: "create" | "update" | "archive" | "analyze" | "summarize" | "export";
  sessionId?: string;
  context?: ConversationContext;
  options?: ConversationOptions;
}

export interface ConversationManagementOutput {
  success: boolean;
  data: unknown;
  analytics?: ConversationAnalytics;
  recommendations?: ConversationRecommendation[];
  summary?: ConversationSummary;
  metadata: ConversationMetadata;
}

export interface ConversationContext {
  interfaceType: "external" | "internal";
  patientId?: string;
  emergencyContext?: boolean;
  language: string;
  timezone: string;
  deviceType?: string;
  sessionDuration?: number;
  messageCount?: number;
  topics?: string[];
  sentiment?: "positive" | "neutral" | "negative" | "mixed";
  urgencyLevel?: "low" | "medium" | "high" | "critical";
}

export interface ConversationOptions {
  includeAnalytics?: boolean;
  includeSummary?: boolean;
  includeRecommendations?: boolean;
  exportFormat?: "json" | "pdf" | "csv";
  anonymize?: boolean;
  includeMetadata?: boolean;
}

export interface ConversationAnalytics {
  totalMessages: number;
  averageResponseTime: number;
  sentimentAnalysis: SentimentAnalysis;
  topicDistribution: TopicDistribution[];
  engagementMetrics: EngagementMetrics;
  complianceMetrics: ComplianceMetrics;
  performanceMetrics: PerformanceMetrics;
}

export interface SentimentAnalysis {
  overall: "positive" | "neutral" | "negative" | "mixed";
  confidence: number;
  emotions: EmotionScore[];
  sentimentTimeline: SentimentTimepoint[];
}

export interface EmotionScore {
  emotion:
    | "joy"
    | "sadness"
    | "anger"
    | "fear"
    | "surprise"
    | "trust"
    | "anticipation"
    | "disgust";
  score: number;
  confidence: number;
}

export interface SentimentTimepoint {
  timestamp: Date;
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  messageIndex: number;
}

export interface TopicDistribution {
  topic: string;
  frequency: number;
  relevance: number;
  category: "medical" | "administrative" | "technical" | "general";
}

export interface EngagementMetrics {
  responseRate: number;
  averageMessageLength: number;
  conversationDepth: number;
  userSatisfaction: number;
  escalationTriggered: boolean;
  goalAchievement: number;
}

export interface ComplianceMetrics {
  lgpdCompliant: boolean;
  anvisaCompliant: boolean;
  cfmCompliant: boolean;
  auditTrailComplete: boolean;
  consentObtained: boolean;
  dataRetentionCompliant: boolean;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  systemResponseTime: number;
  aiConfidenceScore: number;
  errorRate: number;
  successRate: number;
  resourceUsage: ResourceUsage;
}

export interface ResourceUsage {
  tokensUsed: number;
  computeTime: number;
  cacheHits: number;
  cacheMisses: number;
  databaseQueries: number;
}

export interface ConversationRecommendation {
  type: "improvement" | "follow_up" | "escalation" | "training" | "process";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  title: string;
  description: string;
  actionItems: string[];
  expectedOutcome: string;
  implementationSteps: string[];
}

export interface ConversationSummary {
  overview: string;
  keyTopics: string[];
  userGoals: string[];
  outcomes: string[];
  nextSteps: string[];
  aiRecommendations: string[];
  escalationNeeded: boolean;
  followUpRequired: boolean;
  patientSafety: SafetyAssessment;
}

export interface SafetyAssessment {
  riskLevel: "none" | "low" | "medium" | "high" | "critical";
  concerns: string[];
  recommendations: string[];
  immediateActions: string[];
  monitoringRequired: boolean;
}

export interface ConversationMetadata {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  messageCount: number;
  participantCount: number;
  interfaceType: "external" | "internal";
  qualityScore: number;
  complianceStatus: string;
  version: string;
}

export interface ConversationSession {
  id: string;
  userId: string;
  clinicId: string;
  sessionType: string;
  title: string;
  status: "active" | "archived" | "deleted";
  context: ConversationContext;
  metadata: Record<string, unknown>;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokensUsed: number;
  modelUsed?: string;
  responseTime: number;
  confidence?: number;
  complianceFlags: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export class ConversationManagementService extends EnhancedAIService<
  ConversationManagementInput,
  ConversationManagementOutput
> {
  protected serviceId = "conversation-management";
  protected version = "1.0.0";
  protected description =
    "Comprehensive conversation management and analytics for AI chat sessions";

  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient, config: unknown) {
    super(config);
    this.supabase = supabase;
  }

  async execute(
    input: ConversationManagementInput,
  ): Promise<ConversationManagementOutput> {
    try {
      this.validateInput(input);

      let result: unknown;
      let analytics: ConversationAnalytics | undefined;
      let recommendations: ConversationRecommendation[] | undefined;
      let summary: ConversationSummary | undefined;

      switch (input.action) {
        case "create": {
          result = await this.createConversation(input);
          break;
        }

        case "update": {
          result = await this.updateConversation(input);
          break;
        }

        case "archive": {
          result = await this.archiveConversation(input);
          break;
        }

        case "analyze": {
          if (!input.sessionId) throw new Error("sessionId is required");
          result = await this.getConversation(input.sessionId);
          if (input.options?.includeAnalytics) {
            analytics = await this.analyzeConversation(input.sessionId);
          }
          if (input.options?.includeRecommendations) {
            if (!input.sessionId) throw new Error("sessionId is required");
            recommendations = await this.generateRecommendations(
              input.sessionId,
              analytics,
            );
          }
          break;
        }

        case "summarize": {
          if (!input.sessionId) throw new Error("sessionId is required");
          result = await this.getConversation(input.sessionId);
          summary = await this.summarizeConversation(input.sessionId);
          if (input.options?.includeAnalytics) {
            analytics = await this.analyzeConversation(input.sessionId);
          }
          break;
        }

        case "export": {
          result = await this.exportConversation(input);
          break;
        }

        default: {
          throw new Error(`Unknown action: ${input.action}`);
        }
      }

      const metadata: ConversationMetadata = {
        sessionId: input.sessionId || result.id,
        startTime: result.createdAt || new Date(),
        endTime: result.updatedAt,
        duration: this.calculateDuration(result),
        messageCount: result.messages?.length || 0,
        participantCount: this.calculateParticipantCount(result),
        interfaceType: input.context?.interfaceType || "external",
        qualityScore: analytics?.engagementMetrics.userSatisfaction || 0,
        complianceStatus: analytics?.complianceMetrics.lgpdCompliant
          ? "compliant"
          : "review_required",
        version: this.version,
      };

      return {
        success: true,
        data: result,
        analytics,
        recommendations,
        summary,
        metadata,
      };
    } catch (error) {
      this.logger.error(
        `Conversation management failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        {
          serviceName: this.serviceId,
          userId: input.userId,
          clinicId: input.clinicId,
          action: input.action,
          sessionId: input.sessionId,
          error: error instanceof Error ? error.stack : String(error),
        },
      );

      throw new Error(
        `Conversation management failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  private validateInput(input: ConversationManagementInput): void {
    if (!(input.userId && input.clinicId && input.action)) {
      throw new Error("Missing required fields: userId, clinicId, action");
    }

    const requiresSessionId = [
      "update",
      "archive",
      "analyze",
      "summarize",
      "export",
    ];
    if (requiresSessionId.includes(input.action) && !input.sessionId) {
      throw new Error(`Action '${input.action}' requires sessionId`);
    }

    if (input.action === "create" && !input.context) {
      throw new Error('Action "create" requires conversation context');
    }
  }

  private async createConversation(
    input: ConversationManagementInput,
  ): Promise<ConversationSession> {
    const sessionData = {
      user_id: input.userId,
      clinic_id: input.clinicId,
      session_type: input.context?.interfaceType,
      title: input.context ? this.generateSessionTitle(input.context) : "AI Conversation",
      status: "active",
      context: input.context,
      metadata: {
        created_via: "conversation-management-service",
        interface_type: input.context?.interfaceType,
        language: input.context?.language,
        timezone: input.context?.timezone,
        emergency_context: input.context?.emergencyContext,
      },
    };

    const { data, error } = await this.supabase
      .from("ai_chat_sessions")
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to create conversation session: ${error.message}`,
      );
    }

    this.logger.info("Conversation session created successfully", {
      serviceName: this.serviceId,
      sessionId: data.id,
      userId: input.userId,
      clinicId: input.clinicId,
      interfaceType: input.context?.interfaceType,
    });

    return this.mapSessionData(data);
  }

  private async updateConversation(
    input: ConversationManagementInput,
  ): Promise<ConversationSession> {
    const updates: unknown = {};

    if (input.context) {
      updates.context = input.context;
      updates.metadata = {
        ...updates.metadata,
        updated_via: "conversation-management-service",
        last_update: new Date().toISOString(),
      };
    }

    const { data, error } = await this.supabase
      .from("ai_chat_sessions")
      .update(updates)
      .eq("id", input.sessionId ?? "")
      .eq("user_id", input.userId) // Security check
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to update conversation session: ${error.message}`,
      );
    }

    this.logger.info("Conversation session updated successfully", {
      serviceName: this.serviceId,
      sessionId: input.sessionId,
      userId: input.userId,
      updates: Object.keys(updates),
    });

    return this.mapSessionData(data);
  }

  private async archiveConversation(
    input: ConversationManagementInput,
  ): Promise<ConversationSession> {
    // First, get conversation analytics for archival summary
    if (!input.sessionId) throw new Error("sessionId is required");
    const analytics = await this.analyzeConversation(input.sessionId);
    const summary = await this.summarizeConversation(input.sessionId);

    const { data, error } = await this.supabase
      .from("ai_chat_sessions")
      .update({
        status: "archived",
        metadata: {
          archived_at: new Date().toISOString(),
          archived_by: input.userId,
          final_analytics: analytics,
          conversation_summary: summary,
          archive_reason: "manual_archive",
        },
      })
      .eq("id", input.sessionId ?? "")
      .eq("user_id", input.userId) // Security check
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to archive conversation session: ${error.message}`,
      );
    }

    this.logger.info("Conversation session archived successfully", {
      serviceName: this.serviceId,
      sessionId: input.sessionId,
      userId: input.userId,
      messageCount: analytics.totalMessages,
      qualityScore: analytics.engagementMetrics.userSatisfaction,
    });

    return this.mapSessionData(data);
  }

  private async getConversation(
    sessionId: string,
  ): Promise<ConversationSession> {
    const { data: sessionData, error: sessionError } = await this.supabase
      .from("ai_chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !sessionData) {
      throw new Error(`Conversation session not found: ${sessionId}`);
    }

    const { data: messagesData, error: messagesError } = await this.supabase
      .from("ai_chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      throw new Error(
        `Failed to load conversation messages: ${messagesError.message}`,
      );
    }

    const session = this.mapSessionData(sessionData);
    session.messages = (messagesData || []).map(this.mapMessageData);

    return session;
  }

  private async analyzeConversation(
    sessionId: string,
  ): Promise<ConversationAnalytics> {
    const conversation = await this.getConversation(sessionId);

    // Perform comprehensive analysis
    const sentimentAnalysis = await this.analyzeSentiment(
      conversation.messages,
    );
    const topicDistribution = await this.analyzeTopics(conversation.messages);
    const engagementMetrics = await this.calculateEngagementMetrics(conversation);
    const complianceMetrics = await this.assessCompliance(conversation);
    const performanceMetrics = await this.calculatePerformanceMetrics(conversation);

    return {
      totalMessages: conversation.messages.length,
      averageResponseTime: performanceMetrics.averageResponseTime,
      sentimentAnalysis,
      topicDistribution,
      engagementMetrics,
      complianceMetrics,
      performanceMetrics,
    };
  }

  private async summarizeConversation(
    sessionId: string,
  ): Promise<ConversationSummary> {
    const conversation = await this.getConversation(sessionId);
    const analytics = await this.analyzeConversation(sessionId);

    // Extract key information from messages
    const userMessages = conversation.messages.filter((m) => m.role === "user");
    // Generate AI-powered summary
    const overview = await this.generateOverview(conversation);
    const keyTopics = analytics.topicDistribution
      .filter((topic) => topic.relevance > 0.5)
      .map((topic) => topic.topic);

    const userGoals = await this.extractUserGoals(userMessages);
    const outcomes = await this.assessOutcomes(conversation, analytics);
    const nextSteps = await this.generateNextSteps(conversation, analytics);
    const aiRecommendations = await this.generateAIRecommendations(
      conversation,
      analytics,
    );

    const safetyAssessment = await this.assessSafety(conversation, analytics);

    return {
      overview,
      keyTopics,
      userGoals,
      outcomes,
      nextSteps,
      aiRecommendations,
      escalationNeeded: analytics.engagementMetrics.escalationTriggered,
      followUpRequired: safetyAssessment.monitoringRequired,
      patientSafety: safetyAssessment,
    };
  }

  private async generateRecommendations(
    sessionId: string,
    analytics?: ConversationAnalytics,
  ): Promise<ConversationRecommendation[]> {
    if (!analytics) {
      analytics = await this.analyzeConversation(sessionId);
    }

    const recommendations: ConversationRecommendation[] = [];

    // Performance recommendations
    if (analytics.performanceMetrics.averageResponseTime > 2000) {
      recommendations.push({
        type: "improvement",
        priority: "medium",
        category: "performance",
        title: "Optimize Response Time",
        description: "Average response time exceeds target threshold of 2 seconds",
        actionItems: [
          "Review AI model optimization",
          "Check cache configuration",
          "Analyze query performance",
        ],
        expectedOutcome: "Reduce average response time by 30%",
        implementationSteps: [
          "Enable response caching for common queries",
          "Optimize database queries",
          "Consider model fine-tuning",
        ],
      });
    }

    // Engagement recommendations
    if (analytics.engagementMetrics.userSatisfaction < 0.7) {
      recommendations.push({
        type: "improvement",
        priority: "high",
        category: "user_experience",
        title: "Improve User Satisfaction",
        description: "User satisfaction score is below target threshold",
        actionItems: [
          "Analyze conversation patterns",
          "Review AI response quality",
          "Implement feedback collection",
        ],
        expectedOutcome: "Increase satisfaction score to >80%",
        implementationSteps: [
          "Deploy sentiment analysis improvements",
          "Add conversation quality metrics",
          "Implement user feedback loops",
        ],
      });
    }

    // Compliance recommendations
    if (!analytics.complianceMetrics.lgpdCompliant) {
      recommendations.push({
        type: "escalation",
        priority: "urgent",
        category: "compliance",
        title: "Address LGPD Compliance Issues",
        description: "Conversation contains potential LGPD compliance violations",
        actionItems: [
          "Review data handling practices",
          "Ensure proper consent management",
          "Implement data minimization",
        ],
        expectedOutcome: "Achieve full LGPD compliance",
        implementationSteps: [
          "Audit current data practices",
          "Implement compliance automation",
          "Update privacy policies",
        ],
      });
    }

    // Safety recommendations
    if (analytics.engagementMetrics.escalationTriggered) {
      recommendations.push({
        type: "follow_up",
        priority: "high",
        category: "patient_safety",
        title: "Follow Up on Escalated Conversation",
        description: "Conversation was escalated due to safety concerns",
        actionItems: [
          "Contact patient within 24 hours",
          "Review escalation triggers",
          "Document follow-up actions",
        ],
        expectedOutcome: "Ensure patient safety and satisfaction",
        implementationSteps: [
          "Schedule follow-up call",
          "Review with healthcare professional",
          "Update patient record",
        ],
      });
    }

    return recommendations;
  }

  private async exportConversation(
    input: ConversationManagementInput,
  ): Promise<unknown> {
    if (!input.sessionId) throw new Error("sessionId is required");
    const conversation = await this.getConversation(input.sessionId);
    const analytics = input.options?.includeAnalytics
      ? await this.analyzeConversation(input.sessionId)
      : undefined;
    const summary = input.options?.includeSummary
      ? await this.summarizeConversation(input.sessionId)
      : undefined;

    const exportData = {
      session: conversation,
      analytics,
      summary,
      exportedAt: new Date().toISOString(),
      exportedBy: input.userId,
      format: input.options?.exportFormat || "json",
    };

    // Apply anonymization if requested
    if (input.options?.anonymize) {
      this.anonymizeExportData(exportData);
    }

    return exportData;
  }

  // Helper methods for analysis
  private async analyzeSentiment(
    messages: ConversationMessage[],
  ): Promise<SentimentAnalysis> {
    // Simplified sentiment analysis - in production, use proper NLP library
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    const sentimentTimeline: SentimentTimepoint[] = [];

    messages.forEach((message, index) => {
      if (message.role === "user") {
        // Simple sentiment detection based on keywords
        const content = message.content.toLowerCase();
        let sentiment: "positive" | "neutral" | "negative" = "neutral";
        let score = 0.5;

        if (this.containsPositiveKeywords(content)) {
          sentiment = "positive";
          score = 0.7;
          positiveCount++;
        } else if (this.containsNegativeKeywords(content)) {
          sentiment = "negative";
          score = 0.3;
          negativeCount++;
        } else {
          neutralCount++;
        }

        sentimentTimeline.push({
          timestamp: message.createdAt,
          sentiment,
          score,
          messageIndex: index,
        });
      }
    });

    const total = positiveCount + negativeCount + neutralCount;
    let overall: "positive" | "neutral" | "negative" | "mixed" = "neutral";

    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      overall = "positive";
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      overall = "negative";
    } else if (positiveCount > 0 && negativeCount > 0) {
      overall = "mixed";
    }

    return {
      overall,
      confidence: total > 0
        ? Math.max(positiveCount, negativeCount, neutralCount) / total
        : 0,
      emotions: this.extractEmotions(messages),
      sentimentTimeline,
    };
  }

  private async analyzeTopics(
    messages: ConversationMessage[],
  ): Promise<TopicDistribution[]> {
    const topicCounts = new Map<string, number>();
    const topicCategories = new Map<
      string,
      "medical" | "administrative" | "technical" | "general"
    >();

    // Medical topics
    const medicalTopics = [
      "consulta",
      "dor",
      "sintoma",
      "medicamento",
      "tratamento",
      "exame",
      "diagnóstico",
    ];
    const adminTopics = [
      "agendamento",
      "cancelamento",
      "horário",
      "pagamento",
      "plano",
      "convênio",
    ];
    const techTopics = [
      "sistema",
      "erro",
      "problema",
      "aplicativo",
      "login",
      "senha",
    ];

    messages.forEach((message) => {
      const content = message.content.toLowerCase();
      const words = content.split(/\s+/);

      words.forEach((word) => {
        if (medicalTopics.some((topic) => word.includes(topic))) {
          const topic = medicalTopics.find((t) => word.includes(t));
          if (!topic) continue;
          topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
          topicCategories.set(topic, "medical");
        } else if (adminTopics.some((topic) => word.includes(topic))) {
          const topic = adminTopics.find((t) => word.includes(t));
          if (!topic) continue;
          topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
          topicCategories.set(topic, "administrative");
        } else if (techTopics.some((topic) => word.includes(topic))) {
          const topic = techTopics.find((t) => word.includes(t));
          if (!topic) continue;
          topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
          topicCategories.set(topic, "technical");
        }
      });
    });

    const totalWords = messages.reduce(
      (sum, m) => sum + m.content.split(/\s+/).length,
      0,
    );

    return [...topicCounts.entries()]
      .map(([topic, frequency]) => ({
        topic,
        frequency,
        relevance: frequency / Math.max(totalWords / 100, 1), // Normalize by message length
        category: topicCategories.get(topic) || "general",
      }))
      .sort((a, b) => b.relevance - a.relevance);
  }

  private async calculateEngagementMetrics(
    conversation: ConversationSession,
  ): Promise<EngagementMetrics> {
    const userMessages = conversation.messages.filter((m) => m.role === "user");
    const assistantMessages = conversation.messages.filter(
      (m) => m.role === "assistant",
    );

    const responseRate = userMessages.length > 0
      ? assistantMessages.length / userMessages.length
      : 0;
    const averageMessageLength = userMessages.length > 0
      ? userMessages.reduce((sum, m) => sum + m.content.length, 0)
        / userMessages.length
      : 0;

    const conversationDepth = Math.min(conversation.messages.length / 2, 10); // Normalize to 0-10 scale

    // Simple satisfaction calculation based on sentiment and engagement
    const userSatisfaction = this.calculateSatisfactionScore(conversation);

    const escalationTriggered = conversation.messages.some(
      (m) =>
        m.metadata?.escalation_triggered
        || m.complianceFlags.includes("emergency_detected"),
    );

    const goalAchievement = this.assessGoalAchievement(conversation);

    return {
      responseRate,
      averageMessageLength,
      conversationDepth,
      userSatisfaction,
      escalationTriggered,
      goalAchievement,
    };
  }

  private async assessCompliance(
    conversation: ConversationSession,
  ): Promise<ComplianceMetrics> {
    // Check compliance based on conversation content and metadata
    const lgpdCompliant = !conversation.messages.some(
      (m) =>
        m.complianceFlags.includes("LGPD-001")
        || m.complianceFlags.includes("LGPD-002"),
    );

    const anvisaCompliant = !conversation.messages.some(
      (m) =>
        m.complianceFlags.includes("ANVISA-001")
        || m.complianceFlags.includes("ANVISA-002"),
    );

    const cfmCompliant = !conversation.messages.some(
      (m) =>
        m.complianceFlags.includes("CFM-001")
        || m.complianceFlags.includes("CFM-002"),
    );

    const auditTrailComplete = conversation.messages.every(
      (m) => m.metadata && m.createdAt,
    );

    const consentObtained = conversation.context.patientId
      ? await this.checkPatientConsent(conversation.context.patientId)
      : true; // External interface doesn't require specific consent

    const dataRetentionCompliant = true; // Assume compliant unless flagged

    return {
      lgpdCompliant,
      anvisaCompliant,
      cfmCompliant,
      auditTrailComplete,
      consentObtained,
      dataRetentionCompliant,
    };
  }

  private async calculatePerformanceMetrics(
    conversation: ConversationSession,
  ): Promise<PerformanceMetrics> {
    const assistantMessages = conversation.messages.filter(
      (m) => m.role === "assistant",
    );

    const averageResponseTime = assistantMessages.length > 0
      ? assistantMessages.reduce((sum, m) => sum + m.responseTime, 0)
        / assistantMessages.length
      : 0;

    const systemResponseTime = averageResponseTime; // Simplified - same as AI response time

    const aiConfidenceScore = assistantMessages.length > 0
      ? assistantMessages.reduce((sum, m) => sum + (m.confidence || 0.5), 0)
        / assistantMessages.length
      : 0.5;

    const errorMessages = conversation.messages.filter(
      (m) => m.metadata?.error || m.complianceFlags.includes("error"),
    );
    const errorRate = conversation.messages.length > 0
      ? errorMessages.length / conversation.messages.length
      : 0;

    const successRate = 1 - errorRate;

    const resourceUsage: ResourceUsage = {
      tokensUsed: conversation.messages.reduce(
        (sum, m) => sum + m.tokensUsed,
        0,
      ),
      computeTime: assistantMessages.reduce(
        (sum, m) => sum + m.responseTime,
        0,
      ),
      cacheHits: 0, // Would be tracked separately in production
      cacheMisses: 0, // Would be tracked separately in production
      databaseQueries: conversation.messages.length * 2, // Estimate
    };

    return {
      averageResponseTime,
      systemResponseTime,
      aiConfidenceScore,
      errorRate,
      successRate,
      resourceUsage,
    };
  }

  // Additional helper methods
  private generateSessionTitle(context: ConversationContext): string {
    const interface_type = context.interfaceType === "external" ? "Paciente" : "Equipe";
    const date = new Date().toLocaleDateString("pt-BR");
    const time = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `Chat ${interface_type} - ${date} ${time}`;
  }

  private mapSessionData(data: unknown): ConversationSession {
    return {
      id: data.id,
      userId: data.user_id,
      clinicId: data.clinic_id,
      sessionType: data.session_type,
      title: data.title,
      status: data.status,
      context: data.context,
      metadata: data.metadata,
      messages: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private readonly mapMessageData = (data: unknown): ConversationMessage => ({
    id: data.id,
    sessionId: data.session_id,
    role: data.role,
    content: data.content,
    tokensUsed: data.tokens_used || 0,
    modelUsed: data.model_used,
    responseTime: data.response_time_ms || 0,
    confidence: data.confidence_score,
    complianceFlags: data.compliance_flags || [],
    metadata: data.metadata || {},
    createdAt: new Date(data.created_at),
  });

  private calculateDuration(result: unknown): number {
    if (result.updatedAt && result.createdAt) {
      return (
        new Date(result.updatedAt).getTime()
        - new Date(result.createdAt).getTime()
      );
    }
    return 0;
  }

  private calculateParticipantCount(_result: unknown): number {
    // In a chat session, typically 2 participants (user + assistant)
    return 2;
  }

  private containsPositiveKeywords(content: string): boolean {
    const positiveKeywords = [
      "obrigado",
      "obrigada",
      "excelente",
      "ótimo",
      "bom",
      "satisfeito",
      "feliz",
      "ajudou",
    ];
    return positiveKeywords.some((keyword) => content.includes(keyword));
  }

  private containsNegativeKeywords(content: string): boolean {
    const negativeKeywords = [
      "problema",
      "erro",
      "ruim",
      "insatisfeito",
      "dificuldade",
      "não funciona",
      "frustrado",
    ];
    return negativeKeywords.some((keyword) => content.includes(keyword));
  }

  private extractEmotions(_messages: ConversationMessage[]): EmotionScore[] {
    // Simplified emotion detection
    return [
      { emotion: "trust", score: 0.6, confidence: 0.7 },
      { emotion: "anticipation", score: 0.4, confidence: 0.6 },
      { emotion: "joy", score: 0.3, confidence: 0.5 },
    ];
  }

  private calculateSatisfactionScore(
    conversation: ConversationSession,
  ): number {
    // Simplified satisfaction calculation
    const messageCount = conversation.messages.length;
    const avgResponseTime = conversation.messages
      .filter((m) => m.role === "assistant")
      .reduce((sum, m, _, arr) => sum + m.responseTime / arr.length, 0);

    let score = 0.7; // Base score

    // Adjust based on conversation length (longer = more engaged)
    if (messageCount > 10) {
      score += 0.1;
    }
    if (messageCount > 20) {
      score += 0.1;
    }

    // Adjust based on response time (faster = better)
    if (avgResponseTime < 1000) {
      score += 0.1;
    } else if (avgResponseTime > 3000) {
      score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  private assessGoalAchievement(conversation: ConversationSession): number {
    // Simplified goal achievement assessment
    const hasResolution = conversation.messages.some(
      (m) =>
        m.content.toLowerCase().includes("resolvido")
        || m.content.toLowerCase().includes("agendado")
        || m.content.toLowerCase().includes("confirmado"),
    );

    return hasResolution ? 0.8 : 0.4;
  }

  private async checkPatientConsent(_patientId: string): Promise<boolean> {
    // Implementation would check patient consent records
    return true; // Placeholder
  }

  private async generateOverview(
    conversation: ConversationSession,
  ): Promise<string> {
    const messageCount = conversation.messages.length;
    const duration = this.calculateDuration(conversation);
    const interface_type = conversation.context.interfaceType === "external"
      ? "paciente"
      : "equipe";

    return (
      `Conversa de ${interface_type} com ${messageCount} mensagens durante ${
        Math.round(
          duration / 1000 / 60,
        )
      } minutos. `
      + `Contexto: ${conversation.context.emergencyContext ? "emergencial" : "rotineiro"}.`
    );
  }

  private async extractUserGoals(
    userMessages: ConversationMessage[],
  ): Promise<string[]> {
    // Simplified goal extraction based on common patterns
    const goals: string[] = [];

    userMessages.forEach((message) => {
      const content = message.content.toLowerCase();
      if (content.includes("agendar")) {
        goals.push("Agendamento de consulta");
      }
      if (content.includes("cancelar")) {
        goals.push("Cancelamento");
      }
      if (content.includes("informação")) {
        goals.push("Obter informações");
      }
      if (content.includes("dúvida")) {
        goals.push("Esclarecer dúvidas");
      }
    });

    return [...new Set(goals)]; // Remove duplicates
  }

  private async assessOutcomes(
    _conversation: ConversationSession,
    analytics: ConversationAnalytics,
  ): Promise<string[]> {
    const outcomes: string[] = [];

    if (analytics.engagementMetrics.goalAchievement > 0.6) {
      outcomes.push("Objetivo do usuário alcançado");
    }

    if (analytics.sentimentAnalysis.overall === "positive") {
      outcomes.push("Experiência positiva do usuário");
    }

    if (analytics.engagementMetrics.escalationTriggered) {
      outcomes.push("Escalação para atendimento humano");
    }

    return outcomes;
  }

  private async generateNextSteps(
    _conversation: ConversationSession,
    analytics: ConversationAnalytics,
  ): Promise<string[]> {
    const steps: string[] = [];

    if (analytics.engagementMetrics.escalationTriggered) {
      steps.push("Acompanhar escalação com equipe médica");
    }

    if (analytics.complianceMetrics.lgpdCompliant === false) {
      steps.push("Revisar conformidade LGPD");
    }

    if (analytics.engagementMetrics.userSatisfaction < 0.7) {
      steps.push("Implementar melhorias na experiência do usuário");
    }

    return steps;
  }

  private async generateAIRecommendations(
    _conversation: ConversationSession,
    analytics: ConversationAnalytics,
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (analytics.performanceMetrics.averageResponseTime > 2000) {
      recommendations.push("Otimizar tempo de resposta do sistema");
    }

    if (analytics.performanceMetrics.aiConfidenceScore < 0.7) {
      recommendations.push("Melhorar modelo de IA para maior precisão");
    }

    return recommendations;
  }

  private async assessSafety(
    conversation: ConversationSession,
    analytics: ConversationAnalytics,
  ): Promise<SafetyAssessment> {
    const emergencyDetected = conversation.messages.some((m) =>
      m.complianceFlags.includes("emergency_detected")
    );

    const riskLevel = emergencyDetected
      ? "high"
      : analytics.engagementMetrics.escalationTriggered
      ? "medium"
      : "low";

    const concerns: string[] = [];
    const recommendations: string[] = [];
    const immediateActions: string[] = [];

    if (emergencyDetected) {
      concerns.push("Situação de emergência detectada");
      immediateActions.push("Contatar serviços de emergência");
      recommendations.push("Seguir protocolo de emergência");
    }

    return {
      riskLevel,
      concerns,
      recommendations,
      immediateActions,
      monitoringRequired: riskLevel !== "low",
    };
  }

  private anonymizeExportData(exportData: unknown): void {
    // Remove or hash sensitive information
    if (exportData.session) {
      exportData.session.userId = this.hashValue(exportData.session.userId);
      exportData.session.messages?.forEach((message: unknown) => {
        // Remove or anonymize personal information from message content
        message.content = this.anonymizeText(message.content);
      });
    }
  }

  private hashValue(value: string): string {
    // Simple hash function - use proper crypto in production
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.codePointAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private anonymizeText(text: string): string {
    // Remove common PII patterns - implement proper anonymization in production
    return text
      .replaceAll(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "***.***.***-**") // CPF
      .replaceAll(/\b\d{11}\b/g, "***********") // Phone numbers
      .replaceAll(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        "***@***.***",
      ); // Email
  }
}
