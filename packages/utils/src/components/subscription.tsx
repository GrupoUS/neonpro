/**
 * Subscription Components for NeonPro Healthcare System
 * React components for subscription management and feature gating
 */
import type React from "react";

// Constants
const DAYS_IN_WEEK = 7;
const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;
const MILLISECONDS_IN_SECOND = 1000;
const WEEK_IN_MILLISECONDS =
  DAYS_IN_WEEK *
  HOURS_IN_DAY *
  MINUTES_IN_HOUR *
  SECONDS_IN_MINUTE *
  MILLISECONDS_IN_SECOND;

interface SubscriptionStatusCardProps {
  subscription: {
    status: "active" | "expired" | "cancelled" | "pending";
    planType: "basic" | "premium" | "enterprise";
    expiresAt?: Date;
  };
  variant?: "default" | "premium" | "enterprise";
}

interface FeatureGateProps {
  feature: string;
  isAvailable: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface SubscriptionNotificationsProps {
  subscription: {
    status: "active" | "expired" | "cancelled" | "pending";
    expiresAt?: Date;
  };
}

const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
  subscription,
  variant = "default",
}) => (
  <div
    className="subscription-card"
    data-testid="subscription-status-card"
    data-variant={variant}
  >
    <div className="status">Status: {subscription.status}</div>
    <div className="plan">Plan: {subscription.planType}</div>
    {subscription.expiresAt && (
      <div className="expires">
        Expires: {subscription.expiresAt.toLocaleDateString()}
      </div>
    )}
  </div>
);

const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  isAvailable,
  children,
  fallback,
}) => {
  if (isAvailable) {
    return (
      <div data-feature={feature} data-testid="feature-gate">
        <div data-testid="feature-content">{children}</div>
      </div>
    );
  }

  return (
    <div data-feature={feature} data-testid="feature-gate">
      <div data-testid="feature-fallback">
        {fallback || "Feature not available"}
      </div>
    </div>
  );
};

const SubscriptionNotifications: React.FC<SubscriptionNotificationsProps> = ({
  subscription,
}) => {
  const isExpiringSoon =
    subscription.expiresAt &&
    new Date(subscription.expiresAt).getTime() - Date.now() <
      WEEK_IN_MILLISECONDS;

  if (subscription.status === "expired" || isExpiringSoon) {
    return (
      <div data-testid="subscription-notification" role="alert">
        <div>Your subscription is expiring soon</div>
      </div>
    );
  }

  return;
};

export {
  FeatureGate,
  type FeatureGateProps,
  SubscriptionNotifications,
  type SubscriptionNotificationsProps,
  SubscriptionStatusCard,
  type SubscriptionStatusCardProps,
};
