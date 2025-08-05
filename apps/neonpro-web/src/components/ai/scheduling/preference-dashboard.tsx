"use client";

import type {
  BrainIcon,
  ClockIcon,
  HistoryIcon,
  TargetIcon,
  TrendingUpIcon,
  UserIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PatientPreferences {
  time_preferences: {
    preferred_times: string[];
    avoided_times: string[];
    flexibility_score: number;
  };
  staff_preferences: {
    preferred_staff: string[];
    staff_satisfaction_scores: Record<string, number>;
  };
  treatment_preferences: {
    preferred_treatment_sequences: string[];
    time_between_treatments: number;
  };
}

interface ConfidenceMetrics {
  overall_confidence: number;
  preference_reliability: number;
  data_completeness: number;
}

interface LearnedPatterns {
  time_preferences: Array<{
    pattern: string;
    confidence: number;
    frequency: number;
  }>;
  staff_preferences: Array<{
    staff_id: string;
    staff_name: string;
    preference_strength: number;
    interaction_count: number;
  }>;
  treatment_preferences: Array<{
    treatment_type: string;
    preference_score: number;
    optimal_timing: string;
  }>;
  scheduling_behaviors: Array<{
    behavior: string;
    frequency: number;
    reliability: number;
  }>;
}

export default function PatientPreferenceDashboard() {
  const [patientId, setPatientId] = useState("");
  const [includeHistory, setIncludeHistory] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<PatientPreferences | null>(null);
  const [confidenceMetrics, setConfidenceMetrics] = useState<ConfidenceMetrics | null>(null);
  const [learnedPatterns, setLearnedPatterns] = useState<LearnedPatterns | null>(null);
  const [learningHistory, setLearningHistory] = useState<any[]>([]);

  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const loadPatientPreferences = async () => {
    if (!patientId) {
      setError("Please enter a patient ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/ai/scheduling/preferences?patient_id=${patientId}&include_history=${includeHistory}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load patient preferences");
      }

      setPreferences(data.data.patient_preferences);
      setConfidenceMetrics(data.data.confidence_metrics);
      setLearnedPatterns(data.data.learned_patterns);

      if (includeHistory && data.data.learning_history) {
        setLearningHistory(data.data.learning_history);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patient preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePatientPreferences = async (learningData: any) => {
    setIsUpdatingPreferences(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const response = await fetch("/api/ai/scheduling/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: patientId,
          learning_data: learningData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update preferences");
      }

      setUpdateSuccess(true);
      // Reload preferences to see updates
      await loadPatientPreferences();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to update preferences");
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainIcon className="h-5 w-5" />
            Patient Preference Learning Dashboard
          </CardTitle>
          <CardDescription>
            View and manage AI-learned patient scheduling preferences and behavioral patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input
                id="patient-id"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="include-history"
                  checked={includeHistory}
                  onChange={(e) => setIncludeHistory(e.target.checked)}
                />
                <Label htmlFor="include-history" className="text-sm">
                  Include learning history
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={loadPatientPreferences} disabled={isLoading} className="w-full">
                {isLoading ? "Loading..." : "Load Preferences"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {updateSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription>Patient preferences updated successfully!</AlertDescription>
            </Alert>
          )}

          {updateError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription>{updateError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {preferences && confidenceMetrics && learnedPatterns && (
        <div className="space-y-6">
          {/* Confidence Metrics Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TargetIcon className="h-5 w-5" />
                AI Learning Confidence Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Confidence</span>
                    <span
                      className={`text-sm font-bold ${getConfidenceColor(confidenceMetrics.overall_confidence)}`}
                    >
                      {Math.round(confidenceMetrics.overall_confidence * 100)}%
                    </span>
                  </div>
                  <Progress value={confidenceMetrics.overall_confidence * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Preference Reliability</span>
                    <span
                      className={`text-sm font-bold ${getConfidenceColor(confidenceMetrics.preference_reliability)}`}
                    >
                      {Math.round(confidenceMetrics.preference_reliability * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={confidenceMetrics.preference_reliability * 100}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Data Completeness</span>
                    <span
                      className={`text-sm font-bold ${getConfidenceColor(confidenceMetrics.data_completeness)}`}
                    >
                      {Math.round(confidenceMetrics.data_completeness * 100)}%
                    </span>
                  </div>
                  <Progress value={confidenceMetrics.data_completeness * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learned Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5" />
                Learned Behavioral Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="time" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="time">Time Preferences</TabsTrigger>
                  <TabsTrigger value="staff">Staff Preferences</TabsTrigger>
                  <TabsTrigger value="treatment">Treatment Patterns</TabsTrigger>
                  <TabsTrigger value="behavior">Scheduling Behaviors</TabsTrigger>
                </TabsList>

                <TabsContent value="time" className="space-y-3">
                  {learnedPatterns.time_preferences.map((pattern, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{pattern.pattern}</div>
                        <div className="text-sm text-gray-600">
                          Observed {pattern.frequency} times
                        </div>
                      </div>
                      <Badge className={getConfidenceColor(pattern.confidence)}>
                        {Math.round(pattern.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="staff" className="space-y-3">
                  {learnedPatterns.staff_preferences.map((staff, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{staff.staff_name}</div>
                          <div className="text-sm text-gray-600">
                            {staff.interaction_count} interactions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          Preference: {Math.round(staff.preference_strength * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">ID: {staff.staff_id}</div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="treatment" className="space-y-3">
                  {learnedPatterns.treatment_preferences.map((treatment, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{treatment.treatment_type}</div>
                        <div className="text-sm text-gray-600">
                          Optimal timing: {treatment.optimal_timing}
                        </div>
                      </div>
                      <Badge className={getConfidenceColor(treatment.preference_score)}>
                        {Math.round(treatment.preference_score * 100)}% preference
                      </Badge>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="behavior" className="space-y-3">
                  {learnedPatterns.scheduling_behaviors.map((behavior, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{behavior.behavior}</div>
                        <div className="text-sm text-gray-600">
                          Frequency: {behavior.frequency}%
                        </div>
                      </div>
                      <Badge className={getConfidenceColor(behavior.reliability)}>
                        {Math.round(behavior.reliability * 100)}% reliable
                      </Badge>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Learning History */}
          {includeHistory && learningHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HistoryIcon className="h-5 w-5" />
                  Learning History
                </CardTitle>
                <CardDescription>
                  Timeline of AI learning updates and preference changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {learningHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-3 border-l-4 border-l-blue-500 bg-blue-50"
                    >
                      <div>
                        <div className="font-medium">{entry.learning_type}</div>
                        <div className="text-sm text-gray-600">{entry.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="outline">{entry.impact_level}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
