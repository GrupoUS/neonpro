// Types for user feedback and continuous improvement system

// Import types from other compliance modules
import type { ComplianceFramework, ViolationSeverity, } from '../types'

// Re-export for use by other modules
export type { ComplianceFramework, ViolationSeverity, }

export interface UserFeedback {
  id: string
  type:
    | 'bug_report'
    | 'feature_request'
    | 'improvement_suggestion'
    | 'usability_issue'
    | 'performance_concern'
  category: 'dashboard' | 'reporting' | 'testing' | 'workflows' | 'audit_prep' | 'general'
  framework?: ComplianceFramework
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'triaged' | 'in_progress' | 'resolved' | 'closed'
  submittedBy: string
  submittedAt: Date
  context?: {
    page?: string
    feature?: string
    userAgent?: string
    sessionId?: string
    errorLogs?: string[]
    screenshots?: string[]
  }
  impact?: {
    affectedUsers?: number
    businessImpact?: 'minimal' | 'moderate' | 'significant' | 'critical'
    frequencyOfOccurrence?: 'rare' | 'occasional' | 'frequent' | 'constant'
  }
  resolution?: {
    resolvedBy?: string
    resolvedAt?: Date
    solution?: string
    preventionMeasures?: string[]
    followUpRequired?: boolean
  }
  tags: string[]
  votes: {
    upvotes: number
    downvotes: number
    voters: string[]
  }
  comments: FeedbackComment[]
  relatedImprovements?: string[] // IDs of related improvements
}

export interface FeedbackComment {
  id: string
  feedbackId: string
  authorId: string
  authorName: string
  content: string
  createdAt: Date
  type: 'comment' | 'status_update' | 'resolution_note'
}

export interface ImprovementInitiative {
  id: string
  title: string
  description: string
  type:
    | 'feature_enhancement'
    | 'bug_fix'
    | 'performance_optimization'
    | 'user_experience'
    | 'process_improvement'
  category: 'dashboard' | 'reporting' | 'testing' | 'workflows' | 'audit_prep' | 'system'
  framework?: ComplianceFramework
  status: 'proposed' | 'approved' | 'in_development' | 'testing' | 'deployed' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  initiatedBy: string
  initiatedAt: Date
  estimatedEffort: {
    hours: number
    difficulty: 'trivial' | 'easy' | 'moderate' | 'hard' | 'expert'
    resources: string[]
  }
  businessValue: {
    impact: 'low' | 'medium' | 'high' | 'critical'
    affectedUsers: number
    expectedBenefit: string
  }
  implementation: {
    assignedTo?: string
    startDate?: Date
    targetDate?: Date
    completedDate?: Date
    actualEffort?: number
    deliverables: string[]
    milestones: ImprovementMilestone[]
  }
  relatedFeedback: string[] // Feedback IDs that led to this improvement
  successMetrics: ImprovementMetric[]
  retrospective?: {
    whatWorked: string[]
    whatDidntWork: string[]
    lessonsLearned: string[]
    futureImprovements: string[]
  }
}

export interface ImprovementMilestone {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  dueDate: Date
  completedDate?: Date
  deliverables: string[]
  dependencies?: string[]
}

export interface ImprovementMetric {
  id: string
  name: string
  description: string
  type: 'performance' | 'usability' | 'satisfaction' | 'adoption' | 'efficiency'
  baselineValue: number
  targetValue: number
  currentValue?: number
  unit: string
  measurementMethod: string
  measurementFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  collectionDate?: Date[]
  values?: { date: Date; value: number }[]
}

export interface FeedbackAnalysis {
  period: {
    startDate: Date
    endDate: Date
  }
  totalFeedback: number
  feedbackByType: Record<UserFeedback['type'], number>
  feedbackByCategory: Record<UserFeedback['category'], number>
  feedbackBySeverity: Record<UserFeedback['severity'], number>
  feedbackByStatus: Record<UserFeedback['status'], number>
  topIssues: {
    issue: string
    count: number
    category: string
    averageSeverity: string
    trends: 'increasing' | 'decreasing' | 'stable'
  }[]
  satisfactionScore: {
    overall: number
    byCategory: Record<UserFeedback['category'], number>
    trend: 'improving' | 'declining' | 'stable'
    trendValue: number
  }
  resolutionMetrics: {
    averageResolutionTime: number // in hours
    resolutionRate: number // percentage
    resolutionTimeByCategory: Record<UserFeedback['category'], number>
  }
  improvementOpportunities: {
    area: string
    category: string
    impact: 'high' | 'medium' | 'low'
    effort: 'low' | 'medium' | 'high'
    priority: number
    relatedFeedback: string[]
  }[]
  userEngagement: {
    activeReporters: number
    averageFeedbackPerUser: number
    mostActiveCategories: string[]
    peakReportingTimes: string[]
  }
}

export interface ContinuousImprovementReport {
  reportId: string
  period: {
    startDate: Date
    endDate: Date
  }
  overview: {
    completedInitiatives: number
    activeInitiatives: number
    proposedInitiatives: number
    totalValueDelivered: number
  }
  initiativesByStatus: Record<ImprovementInitiative['status'], number>
  initiativesByCategory: Record<ImprovementInitiative['category'], number>
  successMetrics: {
    metricName: string
    improvement: number
    unit: string
    trend: 'improving' | 'declining' | 'stable'
  }[]
  topAchievements: {
    title: string
    category: string
    impact: string
    usersSatisfied: number
  }[]
  lessonsLearned: string[]
  upcomingInitiatives: {
    title: string
    expectedDate: Date
    expectedImpact: string
  }[]
  recommendations: {
    area: string
    recommendation: string
    priority: 'high' | 'medium' | 'low'
    estimatedEffort: string
  }[]
}

export interface FeedbackCollectionConfig {
  enabledChannels: {
    inApp: boolean
    widget: boolean
    modal: boolean
    notification: boolean
    email: boolean
  }
  triggerConditions: {
    errorOccurrence: boolean
    taskCompletion: boolean
    timeSpent: number // minutes
    userInactivity: boolean
    sessionEnd: boolean
  }
  ratingPrompts: {
    afterReportGeneration: boolean
    afterWorkflowCompletion: boolean
    afterAuditPreparation: boolean
    periodic: {
      enabled: boolean
      intervalDays: number
    }
  }
  categories: UserFeedback['category'][]
  severityLevels: UserFeedback['severity'][]
  customFields: {
    name: string
    type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean'
    options?: string[]
    required: boolean
  }[]
  autoTriaging: {
    enabled: boolean
    rules: {
      condition: string
      action: 'assign' | 'prioritize' | 'escalate' | 'auto_close'
      value: string
    }[]
  }
}

export interface UserSatisfactionSurvey {
  id: string
  title: string
  description: string
  type: 'nps' | 'csat' | 'ces' | 'custom'
  status: 'draft' | 'active' | 'completed' | 'archived'
  createdAt: Date
  targetAudience: {
    allUsers: boolean
    userGroups?: string[]
    userRoles?: string[]
    frameworks?: ComplianceFramework[]
  }
  schedule: {
    frequency: 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
    startDate: Date
    endDate?: Date
    triggerEvents?: string[]
  }
  questions: SurveyQuestion[]
  responses: SurveyResponse[]
  analysis?: SurveyAnalysis
}

export interface SurveyQuestion {
  id: string
  type: 'rating' | 'text' | 'multiple_choice' | 'single_choice' | 'matrix' | 'ranking'
  question: string
  description?: string
  required: boolean
  options?: string[]
  scale?: {
    min: number
    max: number
    minLabel?: string
    maxLabel?: string
  }
}

export interface SurveyResponse {
  id: string
  surveyId: string
  respondentId: string
  submittedAt: Date
  answers: {
    questionId: string
    value: string | number | string[]
  }[]
  metadata?: {
    userRole?: string
    framework?: ComplianceFramework
    sessionDuration?: number
    completionTime?: number
  }
}

export interface SurveyAnalysis {
  totalResponses: number
  completionRate: number
  averageCompletionTime: number
  responsesByQuestion: {
    questionId: string
    question: string
    type: string
    statistics: {
      average?: number
      median?: number
      mode?: string | number
      distribution?: { value: string | number; count: number; percentage: number }[]
      sentiment?: 'positive' | 'neutral' | 'negative'
      themes?: string[]
    }
  }[]
  overallSatisfaction: {
    score: number
    trend: 'improving' | 'declining' | 'stable'
    benchmark: number
  }
  segmentAnalysis?: {
    segment: string
    score: number
    insights: string[]
  }[]
  actionItems: {
    priority: 'high' | 'medium' | 'low'
    area: string
    recommendation: string
    expectedImpact: string
  }[]
}
