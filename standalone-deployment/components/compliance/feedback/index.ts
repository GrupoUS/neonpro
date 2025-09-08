// User feedback and continuous improvement system exports
export { FeedbackCollector } from "./FeedbackCollector";
export { ImprovementEngine } from "./ImprovementEngine";
export * from "./types";

// Default feedback collection configuration
export const defaultFeedbackConfig = {
  enabledChannels: {
    inApp: true,
    widget: true,
    modal: true,
    notification: false,
    email: false,
  },
  triggerConditions: {
    errorOccurrence: true,
    taskCompletion: true,
    timeSpent: 15, // 15 minutes
    userInactivity: false,
    sessionEnd: true,
  },
  ratingPrompts: {
    afterReportGeneration: true,
    afterWorkflowCompletion: true,
    afterAuditPreparation: true,
    periodic: {
      enabled: true,
      intervalDays: 7,
    },
  },
  categories: ["dashboard", "reporting", "testing", "workflows", "audit_prep", "general"],
  severityLevels: ["low", "medium", "high", "critical"],
  customFields: [],
  autoTriaging: {
    enabled: true,
    rules: [
      {
        condition: "severity=critical",
        action: "escalate",
        value: "compliance-team",
      },
      {
        condition: "type=bug_report AND severity=high",
        action: "assign",
        value: "dev-team",
      },
      {
        condition: "category=dashboard AND type=usability_issue",
        action: "prioritize",
        value: "high",
      },
    ],
  },
};

// Utility functions for feedback analysis
export const createFeedbackCollector = (config = defaultFeedbackConfig) => {
  return new FeedbackCollector(config);
};

export const createImprovementEngine = () => {
  return new ImprovementEngine();
};
