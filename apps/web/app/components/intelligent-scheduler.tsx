"use client";

import { AISchedulingEngine } from "@/lib/ai-scheduling";
import type {
  AppointmentSlot,
  Conflict,
  OptimizationRecommendation,
  Patient,
  SchedulingRequest,
  SchedulingResult,
  Staff,
  TreatmentType,
} from "@neonpro/core-services/scheduling";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface IntelligentSchedulerProps {
  patientId?: string;
  treatmentTypes: TreatmentType[];
  staff: Staff[];
  patients: Patient[];
  onAppointmentScheduled: (result: SchedulingResult) => void;
  onError: (error: string) => void;
}

/**
 * AI-Powered Intelligent Scheduler Component
 * Features: Real-time optimization, conflict detection, smart suggestions
 * Target: 60% scheduling time reduction with sub-second response
 */
export const IntelligentScheduler: React.FC<IntelligentSchedulerProps> = ({
  patientId,
  treatmentTypes,
  staff,
  patients,
  onAppointmentScheduled,
  onError,
}) => {
  // State management for AI scheduling
  const [isScheduling, setIsScheduling] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>();
  const [selectedTreatment, setSelectedTreatment] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>(
    patientId || "",
  );
  const [preferredDate, setPreferredDate] = useState<Date>(new Date());
  const [urgencyLevel, setUrgencyLevel] = useState<
    "low" | "medium" | "high" | "emergency"
  >("medium");
  const [flexibilityDays, setFlexibilityDays] = useState<number>(7);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [recommendations, setRecommendations] = useState<
    OptimizationRecommendation[]
  >([]);
  const [processingTime, setProcessingTime] = useState<number>(0);

  // Initialize AI scheduling engine
  const aiEngine = useMemo(() => {
    return new AISchedulingEngine();
  }, []);

  // Real-time slot loading with AI pre-filtering
  const loadAvailableSlots = useCallback(async () => {
    if (!(selectedTreatment && selectedPatient)) {
      return;
    }

    setIsScheduling(true);
    const startTime = performance.now();

    try {
      // Simulate loading available slots (would be API call)
      const mockSlots: AppointmentSlot[] = (() => {
        const slots: AppointmentSlot[] = [];
        const now = new Date();

        for (let i = 0; i < 20; i++) {
          const slotDate = new Date(now);
          slotDate.setDate(now.getDate() + Math.floor(i / 8));
          slotDate.setHours(9 + (i % 8), 0, 0, 0);

          slots.push({
            id: `slot-${i}`,
            start: slotDate,
            end: new Date(slotDate.getTime() + 60 * 60 * 1000), // 1 hour
            duration: 60,
            isAvailable: true,
            staffId: staff[i % staff.length]?.id || "staff-1",
            treatmentTypeId: selectedTreatment,
            conflictScore: Math.random() * 0.3,
            optimizationScore: 0.7 + Math.random() * 0.3,
          });
        }
        return slots;
      })();

      // AI-powered slot optimization
      const treatment = treatmentTypes.find((t) => t.id === selectedTreatment);
      if (treatment) {
        const result = await aiEngine.generateRecommendations(
          mockSlots.map((slot) => ({
            start: slot.start,
            end: slot.end,
            available: true,
            professional_id: slot.staffId,
            room_id: "default",
          })),
        );

        // Convert recommendations back to AppointmentSlots
        const optimizedSlots = result.recommendations.map((rec) => ({
          id: `slot-${rec.slot.start.getTime()}`,
          start: rec.slot.start,
          end: rec.slot.end,
          duration: Math.round(
            (rec.slot.end.getTime() - rec.slot.start.getTime()) / 60_000,
          ),
          staffId: rec.professional.id,
          treatmentTypeId: selectedTreatment,
          isAvailable: true,
          conflictScore: (100 - rec.confidence_score) / 100,
          optimizationScore: rec.confidence_score / 100,
        }));

        setAvailableSlots(optimizedSlots);
      }

      const endTime = performance.now();
      setProcessingTime(endTime - startTime);
    } catch {
      onError("Failed to load available slots");
    } finally {
      setIsScheduling(false);
    }
  }, [
    selectedTreatment,
    selectedPatient,
    treatmentTypes,
    aiEngine,
    onError,
    staff,
  ]);

  // AI-powered appointment scheduling
  const scheduleAppointment = useCallback(
    async (slot: AppointmentSlot) => {
      if (!(selectedTreatment && selectedPatient)) {
        return;
      }

      setIsScheduling(true);
      const startTime = performance.now();

      try {
        const request: SchedulingRequest = {
          patientId: selectedPatient,
          treatmentTypeId: selectedTreatment,
          preferredDate,
          urgency: urgencyLevel,
          flexibilityWindow: flexibilityDays,
        };

        const startDate = request.preferredDate || new Date();
        const result = await aiEngine.optimizeSchedule({
          patient_id: request.patientId,
          treatment_id: request.treatmentTypeId,
          preferred_date_range: {
            start: startDate,
            end: new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
          },
          priority: request.urgency === "high" ? "high" : "medium",
          flexibility_hours: 24,
        });

        const mockSchedulingResult = {
          success: result.success,
          appointmentSlot: result.success ? slot : undefined,
          conflicts: [],
          optimizationRecommendations: result.recommendations?.map((rec) => ({
            type: "time_adjustment" as const,
            impact: "efficiency" as const,
            description: `High confidence scheduling option (${rec.confidence_score}% accuracy)`,
            expectedImprovement: rec.confidence_score,
          })) || [],
          confidenceScore: result.success
            ? (result.recommendations?.[0]?.confidence_score || 85) / 100
            : 0,
        };

        setSchedulingResult(mockSchedulingResult);
        setConflicts(mockSchedulingResult.conflicts || []);
        setRecommendations(
          mockSchedulingResult.optimizationRecommendations || [],
        );

        if (mockSchedulingResult.success) {
          onAppointmentScheduled(mockSchedulingResult);
        }

        const endTime = performance.now();
        setProcessingTime(endTime - startTime);
      } catch {
        onError("Failed to schedule appointment");
      } finally {
        setIsScheduling(false);
      }
    },
    [
      selectedTreatment,
      selectedPatient,
      preferredDate,
      urgencyLevel,
      flexibilityDays,
      aiEngine,
      onAppointmentScheduled,
      onError,
    ],
  );

  // Auto-load slots when parameters change
  useEffect(() => {
    const debounceTimer = setTimeout(loadAvailableSlots, 300);
    return () => clearTimeout(debounceTimer);
  }, [loadAvailableSlots]);

  // Real-time event handling
  // Update UI based on recommended actions
  // Removed unused handleOptimizationResults function

  return (
    <div className="intelligent-scheduler mx-auto max-w-6xl rounded-lg bg-white p-6 shadow-lg">
      {/* Header with AI Status */}
      <div className="mb-6 border-b pb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl text-gray-900">
            AI-Powered Scheduling
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600 text-sm">
              <div
                className={`mr-2 h-2 w-2 rounded-full ${
                  isScheduling ? "animate-pulse bg-yellow-400" : "bg-green-400"
                }`}
              />
              {isScheduling ? "Processing..." : "Ready"}
            </div>
            {processingTime > 0 && (
              <div className="text-gray-500 text-sm">
                Last query: {processingTime.toFixed(0)}ms
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scheduling Form */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Patient Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Patient & Treatment</h3>

          <div>
            <label
              htmlFor="patient-select"
              className="mb-2 block font-medium text-gray-700 text-sm"
            >
              Patient
            </label>
            <select
              id="patient-select"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!patientId}
              onChange={(e) => setSelectedPatient(e.target.value)}
              value={selectedPatient}
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="treatment-select"
              className="mb-2 block font-medium text-gray-700 text-sm"
            >
              Treatment Type
            </label>
            <select
              id="treatment-select"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSelectedTreatment(e.target.value)}
              value={selectedTreatment}
            >
              <option value="">Select Treatment</option>
              {treatmentTypes.map((treatment) => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.name} ({treatment.duration}min)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scheduling Preferences */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Preferences</h3>

          <div>
            <label
              htmlFor="preferred-date"
              className="mb-2 block font-medium text-gray-700 text-sm"
            >
              Preferred Date
            </label>
            <input
              id="preferred-date"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setPreferredDate(new Date(e.target.value))}
              type="date"
              value={preferredDate.toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label
              htmlFor="urgency-select"
              className="mb-2 block font-medium text-gray-700 text-sm"
            >
              Urgency Level
            </label>
            <select
              id="urgency-select"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) =>
                setUrgencyLevel(
                  e.target.value as "low" | "medium" | "high" | "emergency",
                )}
              value={urgencyLevel}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="flexibility-range"
              className="mb-2 block font-medium text-gray-700 text-sm"
            >
              Flexibility (days)
            </label>
            <input
              id="flexibility-range"
              className="w-full"
              max="14"
              min="0"
              onChange={(e) => setFlexibilityDays(Number.parseInt(e.target.value, 10))}
              type="range"
              value={flexibilityDays}
            />
            <div className="text-center text-gray-500 text-sm">
              ±{flexibilityDays} days
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">AI Insights</h3>

          {selectedPatient && selectedTreatment && (
            <div className="space-y-2 rounded-lg bg-blue-50 p-4">
              <div className="text-sm">
                <span className="font-medium">No-show Risk:</span>
                <span
                  className={`ml-2 rounded px-2 py-1 text-xs ${
                    (patients.find((p) => p.id === selectedPatient)
                        ?.noShowProbability || 0) > 0.3
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {(
                    (patients.find((p) => p.id === selectedPatient)
                      ?.noShowProbability || 0.1) * 100
                  ).toFixed(1)}
                  %
                </span>
              </div>

              <div className="text-sm">
                <span className="font-medium">Optimal Duration:</span>
                <span className="ml-2 text-gray-700">
                  {treatmentTypes.find((t) => t.id === selectedTreatment)
                    ?.averageDuration
                    || treatmentTypes.find((t) => t.id === selectedTreatment)
                      ?.duration
                    || 0}
                  min
                </span>
              </div>

              <div className="text-sm">
                <span className="font-medium">Best Times:</span>
                <span className="ml-2 text-gray-700">
                  Morning slots have 15% higher success rate
                </span>
              </div>
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="rounded-lg bg-yellow-50 p-4">
              <h4 className="mb-2 font-medium text-yellow-800">
                Potential Conflicts
              </h4>
              <div className="space-y-1">
                {conflicts.slice(0, 3).map((conflict, index) => (
                  <div className="text-sm text-yellow-700" key={index}>
                    • {conflict.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available Slots - Real-time Visualization */}
      {availableSlots.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-4 font-semibold text-gray-900">
            Available Slots (AI-Optimized)
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableSlots.slice(0, 9).map((slot) => {
              const staffMember = staff.find((s) => s.id === slot.staffId);
              const isRecommended = slot.optimizationScore > 0.8;

              return (
                <button
                  className={`w-full cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                    isRecommended
                      ? "border-green-400 bg-green-50 ring-2 ring-green-200"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  key={slot.id}
                  onClick={() => scheduleAppointment(slot)}
                  type="button"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium text-gray-900">
                      {slot.start.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    {isRecommended && (
                      <div className="rounded-full bg-green-100 px-2 py-1 text-green-800 text-xs">
                        AI Recommended
                      </div>
                    )}
                  </div>

                  <div className="mb-1 font-semibold text-gray-900 text-lg">
                    {slot.start.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>

                  <div className="mb-2 text-gray-600 text-sm">
                    {staffMember?.name || "Staff Member"}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="text-gray-500">
                      Duration: {slot.duration}min
                    </div>
                    <div
                      className={`rounded px-2 py-1 ${
                        slot.conflictScore < 0.2
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {(slot.optimizationScore * 100).toFixed(0)}% match
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {availableSlots.length > 9 && (
            <div className="mt-4 text-center">
              <button className="font-medium text-blue-600 text-sm hover:text-blue-800">
                View {availableSlots.length - 9} more slots
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scheduling Result */}
      {schedulingResult && (
        <div className="border-t pt-6">
          <div
            className={`rounded-lg p-4 ${
              schedulingResult.success
                ? "border border-green-200 bg-green-50"
                : "border border-red-200 bg-red-50"
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <h3
                className={`font-semibold ${
                  schedulingResult.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {schedulingResult.success
                  ? "Appointment Scheduled!"
                  : "Scheduling Failed"}
              </h3>
              <div
                className={`text-sm ${
                  schedulingResult.success ? "text-green-600" : "text-red-600"
                }`}
              >
                Confidence: {(schedulingResult.confidenceScore * 100).toFixed(1)}%
              </div>
            </div>

            {schedulingResult.success && schedulingResult.appointmentSlot && (
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {schedulingResult.appointmentSlot.start.toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </div>
                <div>
                  <span className="font-medium">Time:</span>{" "}
                  {schedulingResult.appointmentSlot.start.toLocaleTimeString(
                    "en-US",
                    {
                      hour: "numeric",
                      minute: "2-digit",
                    },
                  )}
                </div>
                <div>
                  <span className="font-medium">Staff:</span> {staff.find(
                    (s) => s.id === schedulingResult.appointmentSlot?.staffId,
                  )?.name}
                </div>
              </div>
            )}

            {/* Optimization Recommendations */}
            {recommendations.length > 0 && (
              <div className="mt-4 border-gray-200 border-t pt-4">
                <h4 className="mb-2 font-medium text-gray-800">
                  AI Recommendations
                </h4>
                <div className="space-y-1">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <div className="text-gray-600 text-sm" key={index}>
                      • {rec.description} (+{rec.expectedImprovement.toFixed(1)}
                      % efficiency)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isScheduling && (
        <div className="py-8 text-center">
          <div className="inline-flex items-center">
            <div className="mr-3 h-6 w-6 animate-spin rounded-full border-blue-600 border-b-2" />
            <span className="text-gray-600">
              AI is optimizing your schedule...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
