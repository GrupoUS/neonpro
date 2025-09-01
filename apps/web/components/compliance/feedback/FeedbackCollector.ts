// User feedback collection system for compliance components
import { createClient } from '@supabase/supabase-js';
import type { 
  UserFeedback, 
  FeedbackComment, 
  FeedbackCollectionConfig,
  UserSatisfactionSurvey,
  SurveyResponse,
  ComplianceFramework 
} from './types';

export class FeedbackCollector {
  private supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  private config: FeedbackCollectionConfig;
  private activeListeners: Map<string, () => void> = new Map();

  constructor(config: FeedbackCollectionConfig) {
    this.config = config;
    this.initializeFeedbackCollection();
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(feedback: Omit<UserFeedback, 'id' | 'submittedAt' | 'status' | 'votes' | 'comments'>): Promise<UserFeedback> {
    console.log(`📝 Submitting feedback: ${feedback.title} (${feedback.type})`);

    const newFeedback: UserFeedback = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      submittedAt: new Date(),
      status: 'submitted',
      votes: { upvotes: 0, downvotes: 0, voters: [] },
      comments: []
    };

    try {
      // Store in database
      await this.storeFeedback(newFeedback);

      // Apply auto-triaging if enabled
      if (this.config.autoTriaging.enabled) {
        await this.applyAutoTriaging(newFeedback);
      }

      // Send notifications for critical feedback
      if (newFeedback.severity === 'critical' || newFeedback.priority === 'urgent') {
        await this.sendCriticalFeedbackAlert(newFeedback);
      }

      // Track submission analytics
      await this.trackFeedbackSubmission(newFeedback);

      console.log(`✅ Feedback submitted successfully: ${newFeedback.id}`);
      return newFeedback;

    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * Add comment to existing feedback
   */
  async addComment(feedbackId: string, comment: Omit<FeedbackComment, 'id' | 'feedbackId' | 'createdAt'>): Promise<FeedbackComment> {
    const newComment: FeedbackComment = {
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      feedbackId,
      createdAt: new Date()
    };

    await this.storeComment(newComment);
    
    console.log(`💬 Comment added to feedback ${feedbackId}`);
    return newComment;
  }

  /**
   * Vote on feedback (upvote/downvote)
   */
  async voteFeedback(feedbackId: string, userId: string, voteType: 'upvote' | 'downvote'): Promise<UserFeedback> {
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error(`Feedback not found: ${feedbackId}`);
    }

    // Remove existing vote if present
    const existingVoteIndex = feedback.votes.voters.indexOf(userId);
    if (existingVoteIndex > -1) {
      feedback.votes.voters.splice(existingVoteIndex, 1);
      // Decrease previous vote count
      if (Math.random() > 0.5) { // Mock: determine if was upvote or downvote
        feedback.votes.upvotes = Math.max(0, feedback.votes.upvotes - 1);
      } else {
        feedback.votes.downvotes = Math.max(0, feedback.votes.downvotes - 1);
      }
    }

    // Add new vote
    feedback.votes.voters.push(userId);
    if (voteType === 'upvote') {
      feedback.votes.upvotes++;
    } else {
      feedback.votes.downvotes++;
    }

    await this.updateFeedback(feedback);
    
    console.log(`👍 ${voteType} added to feedback ${feedbackId}`);
    return feedback;
  }

  /**
   * Create and deploy satisfaction survey
   */
  async createSatisfactionSurvey(survey: Omit<UserSatisfactionSurvey, 'id' | 'createdAt' | 'responses' | 'analysis'>): Promise<UserSatisfactionSurvey> {
    const newSurvey: UserSatisfactionSurvey = {
      ...survey,
      id: `survey_${Date.now()}`,
      createdAt: new Date(),
      responses: []
    };

    await this.storeSurvey(newSurvey);
    
    // Deploy survey to target audience
    if (newSurvey.status === 'active') {
      await this.deploySurvey(newSurvey);
    }

    console.log(`📊 Satisfaction survey created: ${newSurvey.title}`);
    return newSurvey;
  }

  /**
   * Submit survey response
   */
  async submitSurveyResponse(response: Omit<SurveyResponse, 'id' | 'submittedAt'>): Promise<SurveyResponse> {
    const newResponse: SurveyResponse = {
      ...response,
      id: `response_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      submittedAt: new Date()
    };

    await this.storeSurveyResponse(newResponse);
    
    console.log(`📝 Survey response submitted for survey ${response.surveyId}`);
    return newResponse;
  }

  /**
   * Trigger contextual feedback collection
   */
  async triggerContextualFeedback(context: {
    trigger: 'error' | 'task_completion' | 'time_spent' | 'session_end';
    page?: string;
    feature?: string;
    sessionData?: any;
    errorData?: any;
  }): Promise<void> {
    console.log(`🎯 Triggering contextual feedback collection: ${context.trigger}`);

    // Check if trigger is enabled in config
    const shouldTrigger = this.shouldTriggerFeedback(context.trigger, context);
    if (!shouldTrigger) {
      return;
    }

    // Show appropriate feedback collection UI
    switch (context.trigger) {
      case 'error':
        await this.showErrorFeedbackModal(context);
        break;
      case 'task_completion':
        await this.showTaskCompletionRating(context);
        break;
      case 'time_spent':
        await this.showUsabilityFeedbackWidget(context);
        break;
      case 'session_end':
        await this.showSessionEndSurvey(context);
        break;
    }
  }

  /**
   * Get feedback by ID
   */
  async getFeedback(feedbackId: string): Promise<UserFeedback | null> {
    try {
      // In production, this would query the database
      // For now, return mock data or null
      return null;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return null;
    }
  }

  /**
   * Get all feedback with filters
   */
  async getFeedbackList(filters?: {
    type?: UserFeedback['type'];
    category?: UserFeedback['category'];
    status?: UserFeedback['status'];
    severity?: UserFeedback['severity'];
    submittedBy?: string;
    dateRange?: { start: Date; end: Date };
    framework?: ComplianceFramework;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{ feedback: UserFeedback[]; total: number }> {
    try {
      // Mock implementation - would query database with filters
      return { feedback: [], total: 0 };
    } catch (error) {
      console.error('Error fetching feedback list:', error);
      return { feedback: [], total: 0 };
    }
  }

  /**
   * Update feedback status
   */
  async updateFeedbackStatus(
    feedbackId: string, 
    status: UserFeedback['status'],
    resolution?: UserFeedback['resolution']
  ): Promise<UserFeedback> {
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error(`Feedback not found: ${feedbackId}`);
    }

    feedback.status = status;
    if (resolution) {
      feedback.resolution = resolution;
    }

    await this.updateFeedback(feedback);
    
    console.log(`🔄 Feedback status updated: ${feedbackId} → ${status}`);
    return feedback;
  }

  /**
   * Initialize feedback collection listeners
   */
  private initializeFeedbackCollection(): void {
    console.log('🚀 Initializing feedback collection system');

    // Error tracking listener
    if (this.config.triggerConditions.errorOccurrence) {
      this.setupErrorTracking();
    }

    // Time spent tracking
    if (this.config.triggerConditions.timeSpent > 0) {
      this.setupTimeSpentTracking();
    }

    // Session end tracking
    if (this.config.triggerConditions.sessionEnd) {
      this.setupSessionEndTracking();
    }

    // Task completion tracking
    if (this.config.triggerConditions.taskCompletion) {
      this.setupTaskCompletionTracking();
    }

    console.log('✅ Feedback collection listeners initialized');
  }

  /**
   * Check if feedback should be triggered
   */
  private shouldTriggerFeedback(trigger: string, context: any): boolean {
    switch (trigger) {
      case 'error':
        return this.config.triggerConditions.errorOccurrence;
      case 'task_completion':
        return this.config.triggerConditions.taskCompletion;
      case 'time_spent':
        return context.timeSpent >= this.config.triggerConditions.timeSpent;
      case 'session_end':
        return this.config.triggerConditions.sessionEnd;
      default:
        return false;
    }
  }

  /**
   * Apply auto-triaging rules to new feedback
   */
  private async applyAutoTriaging(feedback: UserFeedback): Promise<void> {
    for (const rule of this.config.autoTriaging.rules) {
      if (this.evaluateTriagingRule(rule.condition, feedback)) {
        await this.executeTriagingAction(rule.action, rule.value, feedback);
      }
    }
  }

  /**
   * Evaluate triaging rule condition
   */
  private evaluateTriagingRule(condition: string, feedback: UserFeedback): boolean {
    // Mock evaluation logic - would implement actual rule parsing
    if (condition.includes('severity=critical')) {
      return feedback.severity === 'critical';
    }
    if (condition.includes('type=bug_report')) {
      return feedback.type === 'bug_report';
    }
    if (condition.includes('category=dashboard')) {
      return feedback.category === 'dashboard';
    }
    return false;
  }

  /**
   * Execute triaging action
   */
  private async executeTriagingAction(action: string, value: string, feedback: UserFeedback): Promise<void> {
    switch (action) {
      case 'assign':
        // Would assign to specific team member
        console.log(`🎯 Auto-assigned feedback ${feedback.id} to ${value}`);
        break;
      case 'prioritize':
        feedback.priority = value as UserFeedback['priority'];
        console.log(`⚡ Auto-prioritized feedback ${feedback.id} as ${value}`);
        break;
      case 'escalate':
        console.log(`🚨 Auto-escalated feedback ${feedback.id} to ${value}`);
        break;
      case 'auto_close':
        feedback.status = 'closed';
        console.log(`✅ Auto-closed feedback ${feedback.id}`);
        break;
    }
  }

  // UI trigger methods (would integrate with actual UI components)
  private async showErrorFeedbackModal(context: any): Promise<void> {
    console.log('🔧 Showing error feedback modal');
    // Would show modal UI for error feedback
  }

  private async showTaskCompletionRating(context: any): Promise<void> {
    console.log('⭐ Showing task completion rating');
    // Would show rating UI after task completion
  }

  private async showUsabilityFeedbackWidget(context: any): Promise<void> {
    console.log('📋 Showing usability feedback widget');
    // Would show feedback widget
  }

  private async showSessionEndSurvey(context: any): Promise<void> {
    console.log('📊 Showing session end survey');
    // Would show end-of-session survey
  }

  // Event listener setup methods
  private setupErrorTracking(): void {
    const originalError = window.onerror;
    window.onerror = (message, filename, lineno, colno, error) => {
      this.triggerContextualFeedback({
        trigger: 'error',
        errorData: { message, filename, lineno, colno, error }
      });
      if (originalError) {
        return originalError(message, filename, lineno, colno, error);
      }
      return false;
    };
  }

  private setupTimeSpentTracking(): void {
    let startTime = Date.now();
    setInterval(() => {
      const timeSpent = (Date.now() - startTime) / (1000 * 60); // minutes
      if (timeSpent >= this.config.triggerConditions.timeSpent) {
        this.triggerContextualFeedback({
          trigger: 'time_spent',
          sessionData: { timeSpent }
        });
        startTime = Date.now(); // Reset timer
      }
    }, 60_000); // Check every minute
  }

  private setupSessionEndTracking(): void {
    window.addEventListener('beforeunload', () => {
      this.triggerContextualFeedback({
        trigger: 'session_end',
        sessionData: { endTime: new Date() }
      });
    });
  }

  private setupTaskCompletionTracking(): void {
    // Would integrate with task completion events from compliance workflows
    document.addEventListener('compliance-task-completed', (event: any) => {
      this.triggerContextualFeedback({
        trigger: 'task_completion',
        feature: event.detail?.taskType,
        sessionData: event.detail
      });
    });
  }

  // Database operations (mock implementations)
  private async storeFeedback(feedback: UserFeedback): Promise<void> {
    console.log(`💾 Storing feedback: ${feedback.id}`);
    // Would store in Supabase
  }

  private async updateFeedback(feedback: UserFeedback): Promise<void> {
    console.log(`🔄 Updating feedback: ${feedback.id}`);
    // Would update in Supabase
  }

  private async storeComment(comment: FeedbackComment): Promise<void> {
    console.log(`💾 Storing comment: ${comment.id}`);
    // Would store in Supabase
  }

  private async storeSurvey(survey: UserSatisfactionSurvey): Promise<void> {
    console.log(`💾 Storing survey: ${survey.id}`);
    // Would store in Supabase
  }

  private async storeSurveyResponse(response: SurveyResponse): Promise<void> {
    console.log(`💾 Storing survey response: ${response.id}`);
    // Would store in Supabase
  }

  private async deploySurvey(survey: UserSatisfactionSurvey): Promise<void> {
    console.log(`🚀 Deploying survey: ${survey.title}`);
    // Would trigger survey display to target audience
  }

  private async sendCriticalFeedbackAlert(feedback: UserFeedback): Promise<void> {
    console.log(`🚨 Sending critical feedback alert: ${feedback.title}`);
    // Would send notifications via email, Slack, etc.
  }

  private async trackFeedbackSubmission(feedback: UserFeedback): Promise<void> {
    console.log(`📊 Tracking feedback submission: ${feedback.type} - ${feedback.category}`);
    // Would track analytics
  }
}