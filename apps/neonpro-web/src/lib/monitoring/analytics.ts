// Monitoring and analytics utilities
export const logAnalyticsEvent = (event: any) => {
  console.log("[ANALYTICS]", event);
};

export const trackMFAVerification = (data: any) => {
  console.log("[MFA TRACKING]", data);
};
