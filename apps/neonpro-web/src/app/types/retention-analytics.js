"use strict";
// Retention Analytics Types
// Generated for NeonPro - FASE 4
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetentionStrategyStatus =
  exports.RetentionOutcome =
  exports.InterventionPriority =
  exports.CommunicationChannel =
  exports.RetentionActionType =
  exports.RetentionStrategyType =
  exports.ChurnModelType =
  exports.ChurnRiskLevel =
    void 0;
var ChurnRiskLevel;
(function (ChurnRiskLevel) {
  ChurnRiskLevel["LOW"] = "low";
  ChurnRiskLevel["MEDIUM"] = "medium";
  ChurnRiskLevel["HIGH"] = "high";
})(ChurnRiskLevel || (exports.ChurnRiskLevel = ChurnRiskLevel = {}));
var ChurnModelType;
(function (ChurnModelType) {
  ChurnModelType["BASIC"] = "basic";
  ChurnModelType["ADVANCED"] = "advanced";
  ChurnModelType["ML_ENHANCED"] = "ml_enhanced";
})(ChurnModelType || (exports.ChurnModelType = ChurnModelType = {}));
var RetentionStrategyType;
(function (RetentionStrategyType) {
  RetentionStrategyType["PROACTIVE"] = "proactive";
  RetentionStrategyType["REACTIVE"] = "reactive";
  RetentionStrategyType["PREDICTIVE"] = "predictive";
})(RetentionStrategyType || (exports.RetentionStrategyType = RetentionStrategyType = {}));
var RetentionActionType;
(function (RetentionActionType) {
  RetentionActionType["EMAIL"] = "email";
  RetentionActionType["CALL"] = "call";
  RetentionActionType["SMS"] = "sms";
  RetentionActionType["PUSH_NOTIFICATION"] = "push_notification";
})(RetentionActionType || (exports.RetentionActionType = RetentionActionType = {}));
var CommunicationChannel;
(function (CommunicationChannel) {
  CommunicationChannel["EMAIL"] = "email";
  CommunicationChannel["PHONE"] = "phone";
  CommunicationChannel["SMS"] = "sms";
  CommunicationChannel["WHATSAPP"] = "whatsapp";
  CommunicationChannel["IN_APP"] = "in_app";
})(CommunicationChannel || (exports.CommunicationChannel = CommunicationChannel = {}));
var InterventionPriority;
(function (InterventionPriority) {
  InterventionPriority["LOW"] = "low";
  InterventionPriority["MEDIUM"] = "medium";
  InterventionPriority["HIGH"] = "high";
  InterventionPriority["CRITICAL"] = "critical";
})(InterventionPriority || (exports.InterventionPriority = InterventionPriority = {}));
var RetentionOutcome;
(function (RetentionOutcome) {
  RetentionOutcome["SUCCESS"] = "success";
  RetentionOutcome["FAILED"] = "failed";
  RetentionOutcome["PENDING"] = "pending";
  RetentionOutcome["PARTIAL"] = "partial";
})(RetentionOutcome || (exports.RetentionOutcome = RetentionOutcome = {}));
var RetentionStrategyStatus;
(function (RetentionStrategyStatus) {
  RetentionStrategyStatus["DRAFT"] = "draft";
  RetentionStrategyStatus["ACTIVE"] = "active";
  RetentionStrategyStatus["PAUSED"] = "paused";
  RetentionStrategyStatus["COMPLETED"] = "completed";
  RetentionStrategyStatus["CANCELLED"] = "cancelled";
})(RetentionStrategyStatus || (exports.RetentionStrategyStatus = RetentionStrategyStatus = {}));
