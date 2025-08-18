"use client";

import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AISchedulingEngine } from "@/lib/ai-scheduling";
import type {
  SchedulingRequest,
  SchedulingResult,
  AppointmentSlot,
  TreatmentType,
  Staff,
  Patient,
  Conflict,
  OptimizationRecommendation,
  DynamicSchedulingEvent,
} from "@neonpro/core-services/scheduling";

interface IntelligentSchedulerProps {
  tenantId: string;
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
  tenantId,
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
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>(patientId || "");
  const [preferredDate, setPreferredDate] = useState<Date>(new Date());
  const [urgencyLevel, setUrgencyLevel] = useState<"low" | "medium" | "high" | "emergency">(
    "medium",
  );
  const [flexibilityDays, setFlexibilityDays] = useState<number>(7);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [processingTime, setProcessingTime] = useState<number>(0);

  // Initialize AI scheduling engine
  const aiEngine = useMemo(() => {
    return new AISchedulingEngine({
      optimizationGoals: {
        patientSatisfaction: 0.3,
        staffUtilization: 0.25,
        revenueMaximization: 0.25,
        timeEfficiency: 0.2,
      },
      constraints: {
        maxBookingLookAhead: 90,
        minAdvanceBooking: 1,
        emergencySlotReservation: 0.1,
      },
      aiModels: {
        noShowPrediction: true,
        durationPrediction: true,
        demandForecasting: true,
        resourceOptimization: true,
      },
    });
  }, []);

  // Real-time slot loading with AI pre-filtering
  const loadAvailableSlots = useCallback(async () => {
    if (!selectedTreatment || !selectedPatient) return;

    setIsScheduling(true);
    const startTime = performance.now();

    try {
      // Simulate loading available slots (would be API call)
      const mockSlots: AppointmentSlot[] = generateMockSlots();

      // AI-powered pre-filtering for optimal candidates
      const treatment = treatmentTypes.find((t) => t.id === selectedTreatment);
      if (treatment) {
        const filteredSlots = await aiEngine.intelligentSlotFiltering(
          mockSlots,
          {
            patientId: selectedPatient,
            treatmentTypeId: selectedTreatment,
            preferredDate,
            urgency: urgencyLevel,
            flexibilityWindow: flexibilityDays,
          } as SchedulingRequest,
          [treatment],
        );

        setAvailableSlots(filteredSlots);
      }

      const endTime = performance.now();
      setProcessingTime(endTime - startTime);
    } catch (error) {
      onError("Failed to load available slots");
    } finally {
      setIsScheduling(false);
    }
  }, [
    selectedTreatment,
    selectedPatient,
    preferredDate,
    urgencyLevel,
    flexibilityDays,
    treatmentTypes,
    aiEngine,
    onError,
  ]);

  // AI-powered appointment scheduling
  const scheduleAppointment = useCallback(
    async (slot: AppointmentSlot) => {
      if (!selectedTreatment || !selectedPatient) return;

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

        const result = await aiEngine.scheduleAppointment(
          request,
          [slot],
          staff,
          patients,
          treatmentTypes,
        );

        setSchedulingResult(result);
        setConflicts(result.conflicts || []);
        setRecommendations(result.optimizationRecommendations || []);

        if (result.success) {
          onAppointmentScheduled(result);
        }

        const endTime = performance.now();
        setProcessingTime(endTime - startTime);
      } catch (error) {
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
      staff,
      patients,
      treatmentTypes,
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
  const handleRealtimeEvent = useCallback(
    async (event: DynamicSchedulingEvent) => {
      const actions = await aiEngine.handleDynamicEvent(event, availableSlots, staff);

      // Update UI based on recommended actions
      if (actions.length > 0) {
        console.log("Real-time optimization actions:", actions);
        // Trigger re-loading of slots if needed
        if (actions.some((action) => action.type === "reschedule")) {
          await loadAvailableSlots();
        }
      }
    },
    [aiEngine, availableSlots, staff, loadAvailableSlots],
  );

  // Generate mock slots for demonstration
  function generateMockSlots(): AppointmentSlot[] {
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
  }
  return (
    <div className="intelligent-scheduler bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header with AI Status */}
      <div className="mb-6 border-b pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">AI-Powered Scheduling</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${isScheduling ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`}
              />
              {isScheduling ? "Processing..." : "Ready"}
            </div>
            {processingTime > 0 && (
              <div className="text-sm text-gray-500">Last query: {processingTime.toFixed(0)}ms</div>
            )}
          </div>
        </div>
      </div>

      {/* Scheduling Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Patient Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Patient & Treatment</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!patientId}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Type</label>
            <select
              value={selectedTreatment}
              onChange={(e) => setSelectedTreatment(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
            <input
              type="date"
              value={preferredDate.toISOString().split("T")[0]}
              onChange={(e) => setPreferredDate(new Date(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flexibility (days)
            </label>
            <input
              type="range"
              min="0"
              max="14"
              value={flexibilityDays}
              onChange={(e) => setFlexibilityDays(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-500 text-center">±{flexibilityDays} days</div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">AI Insights</h3>

          {selectedPatient && selectedTreatment && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="text-sm">
                <span className="font-medium">No-show Risk:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs ${
                    patients.find((p) => p.id === selectedPatient)?.noShowProbability > 0.3
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {(
                    (patients.find((p) => p.id === selectedPatient)?.noShowProbability || 0.1) * 100
                  ).toFixed(1)}
                  %
                </span>
              </div>

              <div className="text-sm">
                <span className="font-medium">Optimal Duration:</span>
                <span className="ml-2 text-gray-700">
                  {treatmentTypes.find((t) => t.id === selectedTreatment)?.averageDuration ||
                    treatmentTypes.find((t) => t.id === selectedTreatment)?.duration ||
                    0}
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
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Potential Conflicts</h4>
              <div className="space-y-1">
                {conflicts.slice(0, 3).map((conflict, index) => (
                  <div key={index} className="text-sm text-yellow-700">
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
          <h3 className="font-semibold text-gray-900 mb-4">Available Slots (AI-Optimized)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSlots.slice(0, 9).map((slot) => {
              const staffMember = staff.find((s) => s.id === slot.staffId);
              const isRecommended = slot.optimizationScore > 0.8;

              return (
                <div
                  key={slot.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    isRecommended
                      ? "border-green-400 bg-green-50 ring-2 ring-green-200"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => scheduleAppointment(slot)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">
                      {slot.start.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    {isRecommended && (
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        AI Recommended
                      </div>
                    )}
                  </div>

                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {slot.start.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {staffMember?.name || "Staff Member"}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="text-gray-500">Duration: {slot.duration}min</div>
                    <div
                      className={`px-2 py-1 rounded ${
                        slot.conflictScore < 0.2
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {(slot.optimizationScore * 100).toFixed(0)}% match
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {availableSlots.length > 9 && (
            <div className="text-center mt-4">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3
                className={`font-semibold ${
                  schedulingResult.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {schedulingResult.success ? "Appointment Scheduled!" : "Scheduling Failed"}
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
              <div className="text-sm space-y-1">
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {schedulingResult.appointmentSlot.start.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div>
                  <span className="font-medium">Time:</span>{" "}
                  {schedulingResult.appointmentSlot.start.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                <div>
                  <span className="font-medium">Staff:</span>{" "}
                  {staff.find((s) => s.id === schedulingResult.appointmentSlot?.staffId)?.name}
                </div>
              </div>
            )}

            {/* Optimization Recommendations */}
            {recommendations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">AI Recommendations</h4>
                <div className="space-y-1">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {rec.description} (+{rec.expectedImprovement.toFixed(1)}% efficiency)
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
        <div className="text-center py-8">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">AI is optimizing your schedule...</span>
          </div>
        </div>
      )}
    </div>
  );
};
