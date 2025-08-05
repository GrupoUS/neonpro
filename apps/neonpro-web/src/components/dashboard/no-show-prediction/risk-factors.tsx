// Story 11.2: Risk Factors Management Component
// Analyze and configure patient risk factors

"use client";

import type { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Icons } from "@/components/ui/icons";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { useToast } from "@/hooks/use-toast";

interface RiskFactor {
  id: string;
  patient_id: string;
  factor_type: string;
  factor_value: string;
  impact_weight: number;
  confidence_score: number;
  created_at: string;
  patient: {
    name: string;
    email: string;
  };
}

interface RiskFactorSummary {
  factor_type: string;
  count: number;
  total_impact: number;
  average_impact: number;
}

export default function RiskFactorsManagement() {
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [summary, setSummary] = useState<Record<string, RiskFactorSummary>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchRiskFactors();
  }, [filter]);
  const fetchRiskFactors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("factor_type", filter);
      }

      const response = await fetch(`/api/no-show-prediction/risk-factors?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch risk factors");
      }

      const data = await response.json();
      setRiskFactors(data.risk_factors || []);
      setSummary(data.summary || {});
    } catch (error) {
      console.error("Error fetching risk factors:", error);
      toast({
        title: "Error",
        description: "Failed to load risk factors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 0.8) return "text-red-600";
    if (impact >= 0.6) return "text-orange-600";
    if (impact >= 0.4) return "text-yellow-600";
    return "text-green-600";
  };

  const getRiskBadgeVariant = (impact: number) => {
    if (impact >= 0.8) return "destructive";
    if (impact >= 0.6) return "secondary";
    return "outline";
  };
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(summary).map(([factorType, data]) => (
          <Card key={factorType}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {factorType.replace("_", " ")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.count}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Avg Impact</span>
                <span className={`text-sm font-medium ${getImpactColor(data.average_impact)}`}>
                  {(data.average_impact * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={data.average_impact * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Factors</SelectItem>
                  <SelectItem value="appointment_history">Appointment History</SelectItem>
                  <SelectItem value="demographic">Demographics</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="scheduling">Scheduling Patterns</SelectItem>
                  <SelectItem value="financial">Financial Status</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchRiskFactors} variant="outline">
                <Icons.refresh className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            <Button variant="outline">
              <Icons.download className="mr-2 h-4 w-4" />
              Export Analysis
            </Button>
          </div>
        </CardContent>
      </Card>{" "}
      {/* Risk Factors List */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Factor Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of patient risk factors and their impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {riskFactors.map((factor) => (
                <div
                  key={factor.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        factor.impact_weight >= 0.8
                          ? "bg-red-500"
                          : factor.impact_weight >= 0.6
                            ? "bg-orange-500"
                            : factor.impact_weight >= 0.4
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{factor.patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {factor.factor_type.replace("_", " ")} • {factor.factor_value}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getImpactColor(factor.impact_weight)}`}>
                        {(factor.impact_weight * 100).toFixed(0)}% impact
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(factor.confidence_score * 100).toFixed(0)}% confidence
                      </p>
                    </div>
                    <Badge variant={getRiskBadgeVariant(factor.impact_weight)}>
                      {factor.impact_weight >= 0.8
                        ? "High Risk"
                        : factor.impact_weight >= 0.6
                          ? "Medium Risk"
                          : "Low Risk"}
                    </Badge>
                  </div>
                </div>
              ))}

              {riskFactors.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No risk factors found for the selected criteria
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Risk Factor Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Factor Configuration</CardTitle>
          <CardDescription>Adjust weights and thresholds for risk factor analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">Factor Weights</h4>
              {Object.entries(summary).map(([factorType, data]) => (
                <div key={factorType} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{factorType.replace("_", " ")}</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={data.average_impact * 100} className="w-20 h-2" />
                    <span className="text-xs font-medium w-10">
                      {(data.average_impact * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Threshold Settings</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>High Risk Threshold:</span>
                  <span className="text-red-600 font-medium">≥80%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium Risk Threshold:</span>
                  <span className="text-orange-600 font-medium">60-79%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Low Risk Threshold:</span>
                  <span className="text-green-600 font-medium">&lt;60%</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Icons.settings className="mr-2 h-4 w-4" />
                Configure Thresholds
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
