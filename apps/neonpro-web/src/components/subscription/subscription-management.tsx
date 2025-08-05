"use client";

import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Separator } from "@/components/ui/separator";
import type { useSubscription } from "@/hooks/use-subscription";
import type { useSubscriptionStatus } from "@/hooks/use-subscription-status";
import type {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Shield,
  Users,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { SubscriptionStatusIndicator } from "./status-indicator";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    description: "Perfect for small clinics just getting started",
    features: [
      "Up to 100 patients",
      "Basic appointment scheduling",
      "Patient records management",
      "Email notifications",
      "Basic reports",
    ],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    description: "Everything you need to grow your clinic",
    features: [
      "Unlimited patients",
      "Advanced scheduling",
      "Treatment plans",
      "Financial tracking",
      "Advanced analytics",
      "SMS notifications",
      "Custom forms",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    description: "For large clinics and multi-location practices",
    features: [
      "Everything in Professional",
      "Multi-location support",
      "Team collaboration",
      "Advanced integrations",
      "Custom branding",
      "Priority support",
      "API access",
    ],
    popular: false,
  },
];

export function SubscriptionManagement() {
  const { subscription, refreshSubscription } = useSubscription();
  const {
    hasAccess,
    isActive,
    isTrialing,
    isPastDue,
    inGracePeriod,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    status,
  } = useSubscriptionStatus();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    if (!priceId) {
      alert("Price ID not configured for this plan");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/subscription?canceled=true`,
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to start checkout process. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/subscription`,
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
      alert("Failed to open billing portal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check for success/cancel parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success")) {
      refreshSubscription();
    }
  }, [refreshSubscription]);

  const currentPlan = plans.find((plan) => plan.priceId === subscription.priceId);

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <SubscriptionStatusIndicator showFullCard className="h-fit" />

        {hasAccess && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentPlan ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{currentPlan.name}</h3>
                      <p className="text-sm text-muted-foreground">${currentPlan.price}/month</p>
                    </div>
                    {currentPlan.popular && <Badge variant="default">Popular</Badge>}
                  </div>

                  {currentPeriodEnd && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {cancelAtPeriodEnd ? "Expires" : "Renews"} on{" "}
                        {currentPeriodEnd.toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Plan details not available</p>
              )}

              <Button
                onClick={handleManageBilling}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Manage Billing
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Grace Period Warning */}
      {inGracePeriod && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Required</AlertTitle>
          <AlertDescription>
            Your subscription payment is overdue. Please update your payment method to continue
            accessing premium features.
            <Button onClick={handleManageBilling} size="sm" variant="outline" className="ml-2">
              Update Payment
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Trial Info */}
      {isTrialing && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Free Trial Active</AlertTitle>
          <AlertDescription>
            You're currently on a free trial.
            {currentPeriodEnd && (
              <> Your trial expires on {currentPeriodEnd.toLocaleDateString("pt-BR")}.</>
            )}{" "}
            Upgrade now to continue accessing all features after your trial ends.
          </AlertDescription>
        </Alert>
      )}

      {/* Available Plans */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Choose Your Plan</h2>
          <p className="text-muted-foreground">
            {hasAccess
              ? "Upgrade or change your subscription plan"
              : "Select a plan to get started with NeonPro"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = plan.priceId === subscription.priceId;

            return (
              <Card key={plan.id} className={`relative ${plan.popular ? "border-primary" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="default">Most Popular</Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {isCurrentPlan && <Badge variant="secondary">Current</Badge>}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Separator />

                  <Button
                    onClick={() => handleSubscribe(plan.priceId!)}
                    disabled={isLoading || isCurrentPlan || !plan.priceId}
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {isCurrentPlan ? "Current Plan" : hasAccess ? "Switch Plan" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Why Choose NeonPro?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Patient Management</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete patient records, appointment history, and treatment tracking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Smart Scheduling</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced appointment scheduling with automated reminders.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Detailed reports and insights to grow your clinic business.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Secure & Compliant</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                HIPAA-compliant platform with enterprise-grade security.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
