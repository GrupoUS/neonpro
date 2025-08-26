/**
 * Subscription Components for NeonPro Healthcare System
 * React components for subscription management and feature gating
 */
import type React from "react";

export type SubscriptionStatusCardProps = {
	subscription: {
		status: "active" | "expired" | "cancelled" | "pending";
		planType: "basic" | "premium" | "enterprise";
		expiresAt?: Date;
	};
	variant?: "default" | "premium" | "enterprise";
};

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
	subscription,
	variant = "default",
}) => {
	return (
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
};

export type FeatureGateProps = {
	feature: string;
	isAvailable: boolean;
	children: React.ReactNode;
	fallback?: React.ReactNode;
};

export const FeatureGate: React.FC<FeatureGateProps> = ({
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

export type SubscriptionNotificationsProps = {
	subscription: {
		status: "active" | "expired" | "cancelled" | "pending";
		expiresAt?: Date;
	};
};

export const SubscriptionNotifications: React.FC<
	SubscriptionNotificationsProps
> = ({ subscription }) => {
	const isExpiringSoon =
		subscription.expiresAt &&
		new Date(subscription.expiresAt).getTime() - Date.now() <
			7 * 24 * 60 * 60 * 1000; // 7 days

	if (subscription.status === "expired" || isExpiringSoon) {
		return (
			<div data-testid="subscription-notification" role="alert">
				<div>Your subscription is expiring soon</div>
			</div>
		);
	}

	return null;
};
