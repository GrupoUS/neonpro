/**
 * TASK-001: Foundation Setup & Baseline
 * Feature Flag Management Component
 *
 * Provides UI for managing feature flags, gradual rollouts, and A/B testing
 * for safe enhancement implementation with rollback capability.
 */

"use client";

import type { useState, useEffect } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Switch } from "@/components/ui/switch";
import type { Badge } from "@/components/ui/badge";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AlertTriangle,
  CheckCircle,
  Flag,
  Settings,
  Users,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import type { toast } from "sonner";

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  environment: "development" | "staging" | "production";
  epic_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface RolloutPlan {
  id: string;
  feature_flag_id: string;
  target_percentage: number;
  start_date: string;
  estimated_completion: string;
  status: "pending" | "in_progress" | "completed" | "paused";
}

export function FeatureFlagManager() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [rolloutPlans, setRolloutPlans] = useState<RolloutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Load feature flags on component mount
  useEffect(() => {
    loadFeatureFlags();
    loadRolloutPlans();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      const response = await fetch("/api/monitoring/feature-flags");
      if (response.ok) {
        const data = await response.json();
        setFlags(data.flags || []);
      }
    } catch (error) {
      console.error("Error loading feature flags:", error);
      toast.error("Failed to load feature flags");
    } finally {
      setLoading(false);
    }
  };

  const loadRolloutPlans = async () => {
    try {
      const response = await fetch("/api/monitoring/rollout-plans");
      if (response.ok) {
        const data = await response.json();
        setRolloutPlans(data.plans || []);
      }
    } catch (error) {
      console.error("Error loading rollout plans:", error);
    }
  };

  const toggleFlag = async (flagId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/monitoring/feature-flags/${flagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setFlags((prev) => prev.map((flag) => (flag.id === flagId ? { ...flag, enabled } : flag)));
        toast.success(`Feature flag ${enabled ? "enabled" : "disabled"}`);
      } else {
        throw new Error("Failed to update feature flag");
      }
    } catch (error) {
      console.error("Error toggling feature flag:", error);
      toast.error("Failed to update feature flag");
    }
  };

  const updateRolloutPercentage = async (flagId: string, percentage: number) => {
    try {
      const response = await fetch(`/api/monitoring/feature-flags/${flagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollout_percentage: percentage }),
      });

      if (response.ok) {
        setFlags((prev) =>
          prev.map((flag) =>
            flag.id === flagId ? { ...flag, rollout_percentage: percentage } : flag,
          ),
        );
        toast.success(`Rollout updated to ${percentage}%`);
      } else {
        throw new Error("Failed to update rollout percentage");
      }
    } catch (error) {
      console.error("Error updating rollout:", error);
      toast.error("Failed to update rollout percentage");
    }
  };

  const quickRollout = (flagId: string, percentage: number) => {
    updateRolloutPercentage(flagId, percentage);
  };

  const getStatusBadge = (flag: FeatureFlag) => {
    if (!flag.enabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    if (flag.rollout_percentage === 0) {
      return <Badge variant="outline">Ready</Badge>;
    }
    if (flag.rollout_percentage === 100) {
      return <Badge variant="default">Full Rollout</Badge>;
    }
    return <Badge variant="secondary">Gradual ({flag.rollout_percentage}%)</Badge>;
  };

  const getEnvironmentBadge = (environment: string) => {
    const variants = {
      development: "outline" as const,
      staging: "secondary" as const,
      production: "default" as const,
    };
    return <Badge variant={variants[environment as keyof typeof variants]}>{environment}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading feature flags...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Flag className="h-6 w-6 mr-2" />
            Feature Flag Manager
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage feature flags, gradual rollouts, and A/B testing for safe enhancement deployment
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Flag className="h-4 w-4 mr-2" />
          Create Flag
        </Button>
      </div>

      <Tabs defaultValue="flags" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="rollouts">Rollout Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="flags" className="space-y-4">
          {flags.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Feature Flags</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first feature flag to start managing gradual rollouts
                </p>
                <Button onClick={() => setIsCreating(true)}>Create First Flag</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {flags.map((flag) => (
                <Card key={flag.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{flag.name}</CardTitle>
                        <CardDescription>{flag.description}</CardDescription>
                        <div className="flex gap-2">
                          {getEnvironmentBadge(flag.environment)}
                          {getStatusBadge(flag)}
                          {flag.epic_id && <Badge variant="outline">Epic {flag.epic_id}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`toggle-${flag.id}`} className="text-sm">
                          {flag.enabled ? "Enabled" : "Disabled"}
                        </Label>
                        <Switch
                          id={`toggle-${flag.id}`}
                          checked={flag.enabled}
                          onCheckedChange={(enabled) => toggleFlag(flag.id, enabled)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {flag.enabled && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-medium">Rollout Percentage</Label>
                            <span className="text-sm text-muted-foreground">
                              {flag.rollout_percentage}%
                            </span>
                          </div>
                          <Progress value={flag.rollout_percentage} className="mb-2" />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => quickRollout(flag.id, 0)}
                              disabled={flag.rollout_percentage === 0}
                            >
                              0%
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => quickRollout(flag.id, 10)}
                              disabled={flag.rollout_percentage === 10}
                            >
                              10%
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => quickRollout(flag.id, 50)}
                              disabled={flag.rollout_percentage === 50}
                            >
                              50%
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => quickRollout(flag.id, 100)}
                              disabled={flag.rollout_percentage === 100}
                            >
                              100%
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rollouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rollout Plans</CardTitle>
              <CardDescription>
                Manage scheduled rollouts and gradual deployment strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rolloutPlans.length === 0 ? (
                <div className="text-center py-6">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Rollout Plans</h3>
                  <p className="text-muted-foreground">
                    Rollout plans will appear here when you schedule gradual deployments
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rolloutPlans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Target: {plan.target_percentage}%</h4>
                          <p className="text-sm text-muted-foreground">
                            Started: {new Date(plan.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge>{plan.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flag Analytics</CardTitle>
              <CardDescription>
                Monitor feature flag performance and user adoption metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Feature flag analytics and A/B testing results will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
