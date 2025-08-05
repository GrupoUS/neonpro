Object.defineProperty(exports, "__esModule", { value: true });
exports.trackMFAVerification = exports.logAnalyticsEvent = void 0;
// Monitoring and analytics utilities
var logAnalyticsEvent = (event) => {
  console.log("[ANALYTICS]", event);
};
exports.logAnalyticsEvent = logAnalyticsEvent;
var trackMFAVerification = (data) => {
  console.log("[MFA TRACKING]", data);
};
exports.trackMFAVerification = trackMFAVerification;
