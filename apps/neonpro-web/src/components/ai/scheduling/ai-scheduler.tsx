"use client";

import React, { useState, useEffect } from "react";
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
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Badge } from "@/components/ui/badge";
import type { CalendarIcon, ClockIcon, UserIcon, TrendingUpIcon, SparklesIcon } from "lucide-react";
import type { Alert, AlertDescription } from "@/components/ui/alert";

interface OptimizedSlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  confidence_score: number;
  staff_id: string;
  staff_name: string;
  optimization_factors: {
    patient_preference_score: number;
    staff_efficiency_score: number;
    clinic_capacity_score: number;
    historical_success_rate: number;
  };
  reasons: string[];
}

interface OptimizationMetadata {
  total_slots_analyzed: number;
  ai_confidence_range: {
    min: number;
    max: number;
    average: number;
  };
  patient_preference_influence: number;
  staff_efficiency_influence: number;
}

export default function AISchedulingOptimizer() {
  const [patientId, setPatientId] = useState("");
  const [treatmentType, setTreatmentType] = useState("");
  const [preferredDateStart, setPreferredDateStart] = useState("");
  const [preferredDateEnd, setPreferredDateEnd] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [staffPreference, setStaffPreference] = useState("");
  const [priority, setPriority] = useState("normal");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizedSlots, setOptimizedSlots] = useState<OptimizedSlot[]>([]);
  const [metadata, setMetadata] = useState<OptimizationMetadata | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const handleOptimizeScheduling = async () => {
    if (!patientId || !treatmentType || !preferredDateStart || !preferredDateEnd) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/scheduling/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: patientId,
          treatment_type: treatmentType,
          preferred_date_range: {
            start: preferredDateStart,
            end: preferredDateEnd,
          },
          duration_minutes: parseInt(durationMinutes),
          staff_preference: staffPreference || undefined,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to optimize scheduling");
      }

      setOptimizedSlots(data.data.suggested_slots);
      setMetadata(data.data.optimization_metadata);
      setRecommendations(data.data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to optimize scheduling");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "bg-green-100 text-green-800";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            AI-Powered Scheduling Optimizer
          </CardTitle>
          <CardDescription>
            Leverage machine learning to find optimal appointment slots based on patient
            preferences, staff efficiency, and clinic capacity patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Patient and Treatment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="treatment-type">Treatment Type</Label>
              <Select value={treatmentType} onValueChange={setTreatmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="dental_cleaning">Dental Cleaning</SelectItem>
                  <SelectItem value="root_canal">Root Canal</SelectItem>
                  <SelectItem value="filling">Filling</SelectItem>
                  <SelectItem value="crown">Crown Procedure</SelectItem>
                  <SelectItem value="extraction">Tooth Extraction</SelectItem>
                  <SelectItem value="checkup">Regular Checkup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-start">Preferred Start Date</Label>
              <Input
                id="date-start"
                type="datetime-local"
                value={preferredDateStart}
                onChange={(e) => setPreferredDateStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-end">Preferred End Date</Label>
              <Input
                id="date-end"
                type="datetime-local"
                value={preferredDateEnd}
                onChange={(e) => setPreferredDateEnd(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staff-preference">Staff Preference (Optional)</Label>
              <Input
                id="staff-preference"
                value={staffPreference}
                onChange={(e) => setStaffPreference(e.target.value)}
                placeholder="Enter preferred staff ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="normal">Normal Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleOptimizeScheduling} disabled={isLoading} className="w-full">
            {isLoading ? "Optimizing..." : "Find Optimal Slots"}
          </Button>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {optimizedSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              AI Optimization Results
            </CardTitle>
            <CardDescription>
              Recommended appointment slots based on AI analysis of multiple factors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metadata Summary */}
            {metadata && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metadata.total_slots_analyzed}</div>
                  <div className="text-sm text-gray-600">Slots Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(metadata.ai_confidence_range.average * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(metadata.patient_preference_influence * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Patient Influence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(metadata.staff_efficiency_influence * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Staff Efficiency</div>
                </div>
              </div>
            )}

            {/* Optimized Slots */}
            <div className="space-y-3">
              {optimizedSlots.map((slot, index) => (
                <Card key={slot.slot_id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getConfidenceColor(slot.confidence_score)}`}>
                          {Math.round(slot.confidence_score * 100)}% Confidence
                        </Badge>
                        {index === 0 && (
                          <Badge className="bg-blue-100 text-blue-800">AI Recommended</Badge>
                        )}
                      </div>
                      <Button size="sm">Book Appointment</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{formatTime(slot.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">to {formatTime(slot.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{slot.staff_name}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Patient Score: </span>
                        <span className="font-medium">
                          {Math.round(slot.optimization_factors.patient_preference_score * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Staff Score: </span>
                        <span className="font-medium">
                          {Math.round(slot.optimization_factors.staff_efficiency_score * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Capacity Score: </span>
                        <span className="font-medium">
                          {Math.round(slot.optimization_factors.clinic_capacity_score * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success Rate: </span>
                        <span className="font-medium">
                          {Math.round(slot.optimization_factors.historical_success_rate * 100)}%
                        </span>
                      </div>
                    </div>

                    {slot.reasons.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <strong>Why this slot:</strong> {slot.reasons.join(", ")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4" />
                    AI Recommendations
                  </h4>
                  <ul className="text-sm space-y-1 text-blue-800">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
