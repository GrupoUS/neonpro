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
const WEEK_IN_MILLISECONDS = DAYS_IN_WEEK
  * HOURS_IN_DAY
  * MINUTES_IN_HOUR
  * SECONDS_IN_MINUTE
  * MILLISECONDS_IN_SECOND;

interface SubscriptionStatusCardProps {
  subscription: {
    status: "active" | "expired" | "cancelled" | "pending";
    planType: "basic" | "premium" | "enterprise";
    expiresAt?: string | Date; // Support both string and Date formats
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
    expiresAt?: string | Date; // Support both string and Date formats
  };
}

const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
  subscription,
  variant = "default",
}) => {
  const formatExpirationDate = (expiresAt: string | Date | undefined): string | null => {
    if (!expiresAt) return null;

    try {
      const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
      if (isNaN(date.getTime())) {
        console.warn("Invalid expiration date:", expiresAt);
        return null;
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Failed to format expiration date:", error);
      return null;
    }
  };

  const formattedExpiration = formatExpirationDate(subscription.expiresAt);

  return (
    <div
      className="subscription-card"
      data-testid="subscription-status-card"
      data-variant={variant}
    >
      <div className="status">Status: {subscription.status}</div>
      <div className="plan">Plan: {subscription.planType}</div>
      {formattedExpiration && (
        <div className="expires">
          Expires: {formattedExpiration}
        </div>
      )}
    </div>
  );
};

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
  const checkExpirationStatus = () => {
    if (!subscription.expiresAt) {
      return { isExpiring: false, isExpired: false, daysUntilExpiry: null };
    }

    try {
      const expirationDate = subscription.expiresAt instanceof Date
        ? subscription.expiresAt
        : new Date(subscription.expiresAt);

      if (isNaN(expirationDate.getTime())) {
        console.warn("Invalid expiration date in subscription:", subscription.expiresAt);
        return { isExpiring: false, isExpired: false, daysUntilExpiry: null };
      }

      const now = new Date();
      const timeUntilExpiry = expirationDate.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(timeUntilExpiry / (1000 * 60 * 60 * 24));

      return {
        isExpiring: timeUntilExpiry > 0 && timeUntilExpiry < WEEK_IN_MILLISECONDS,
        isExpired: timeUntilExpiry <= 0,
        daysUntilExpiry: timeUntilExpiry > 0 ? daysUntilExpiry : 0,
      };
    } catch (error) {
      console.error("Failed to check expiration status:", error);
      return { isExpiring: false, isExpired: false, daysUntilExpiry: null };
    }
  };

  const { isExpiring, isExpired, daysUntilExpiry } = checkExpirationStatus();

  if (subscription.status === "expired" || isExpired) {
    return (
      <div data-testid="subscription-notification" role="alert" className="expired">
        <div>Your subscription has expired. Please renew to continue using premium features.</div>
      </div>
    );
  }

  if (isExpiring && daysUntilExpiry !== null) {
    return (
      <div data-testid="subscription-notification" role="alert" className="expiring">
        <div>
          Your subscription expires in {daysUntilExpiry}{" "}
          day{daysUntilExpiry === 1 ? "" : "s"}. Renew now to avoid service interruption.
        </div>
      </div>
    );
  }

  return null;
};

export {
  FeatureGate,
  type FeatureGateProps,
  SubscriptionNotifications,
  type SubscriptionNotificationsProps,
  SubscriptionStatusCard,
  type SubscriptionStatusCardProps,
};
