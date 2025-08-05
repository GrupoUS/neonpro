// =====================================================
// Resource Allocation Form Component
// Story 2.4: Smart Resource Management - Frontend
// =====================================================

"use client";

import type { AlertTriangleIcon, CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import type React from "react";
import { useEffect, useState } from "react";
import type { toast } from "sonner";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Textarea } from "@/components/ui/textarea";

// =====================================================
// Types
// =====================================================

interface Resource {
  id: string;
  name: string;
  type: string;
  category?: string;
  location?: string;
  status: string;
  capacity: number;
  cost_per_hour?: number;
}

interface ConflictSuggestion {
  resource_id: string;
  resource_name: string;
  alternative_time?: string;
  reason: string;
  confidence_score: number;
}

interface AllocationFormData {
  resource_id: string;
  appointment_id?: string;
  start_time: string;
  end_time: string;
  allocation_type: string;
  notes?: string;
}

// =====================================================
// Resource Allocation Form
// =====================================================

interface ResourceAllocationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  defaultValues?: Partial<AllocationFormData>;
  onSuccess?: () => void;
}

export default function ResourceAllocationForm({
  open,
  onOpenChange,
  clinicId,
  defaultValues,
  onSuccess,
}: ResourceAllocationFormProps) {
  const [formData, setFormData] = useState<AllocationFormData>({
    resource_id: "",
    start_time: "",
    end_time: "",
    allocation_type: "appointment",
    notes: "",
  });
  const [resources, setResources] = useState<Resource[]>([]);
  const [conflicts, setConflicts] = useState<ConflictSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // =====================================================
  // Effects
  // =====================================================

  useEffect(() => {
    if (open) {
      fetchResources();
      if (defaultValues) {
        setFormData((prev) => ({ ...prev, ...defaultValues }));
      }
    }
  }, [open, defaultValues]);

  useEffect(() => {
    if (formData.resource_id && formData.start_time && formData.end_time) {
      checkConflicts();
    }
  }, [formData.resource_id, formData.start_time, formData.end_time]);

  // =====================================================
  // Data Fetching
  // =====================================================

  const fetchResources = async () => {
    try {
      const response = await fetch(`/api/resources?clinic_id=${clinicId}&status=available`);
      const data = await response.json();

      if (data.success) {
        setResources(data.data);
      } else {
        toast.error("Failed to fetch available resources");
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Error loading resources");
    }
  };

  const checkConflicts = async () => {
    try {
      setChecking(true);
      const response = await fetch("/api/resources/allocations/conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource_id: formData.resource_id,
          start_time: formData.start_time,
          end_time: formData.end_time,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConflicts(data.data.conflicts || []);
      }
    } catch (error) {
      console.error("Error checking conflicts:", error);
    } finally {
      setChecking(false);
    }
  };

  // =====================================================
  // Form Handlers
  // =====================================================

  const handleInputChange = (field: keyof AllocationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.resource_id || !formData.start_time || !formData.end_time) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (conflicts.length > 0) {
      toast.error("Please resolve conflicts before creating allocation");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/resources/allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: clinicId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Resource allocation created successfully");
        onOpenChange(false);
        onSuccess?.();
        resetForm();
      } else {
        toast.error(data.error || "Failed to create allocation");
      }
    } catch (error) {
      console.error("Error creating allocation:", error);
      toast.error("Error creating allocation");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      resource_id: "",
      start_time: "",
      end_time: "",
      allocation_type: "appointment",
      notes: "",
    });
    setConflicts([]);
  };

  // =====================================================
  // UI Helpers
  // =====================================================

  const getSelectedResource = () => {
    return resources.find((r) => r.id === formData.resource_id);
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return "";
    return new Date(dateTime).toLocaleString();
  };

  const getConflictSeverity = (confidence: number) => {
    if (confidence >= 0.8) return "high";
    if (confidence >= 0.5) return "medium";
    return "low";
  };

  // =====================================================
  // Render Components
  // =====================================================

  const ConflictAlert = ({ conflict }: { conflict: ConflictSuggestion }) => (
    <div
      className={`p-3 rounded-md border ${
        getConflictSeverity(conflict.confidence_score) === "high"
          ? "bg-red-50 border-red-200"
          : getConflictSeverity(conflict.confidence_score) === "medium"
            ? "bg-yellow-50 border-yellow-200"
            : "bg-blue-50 border-blue-200"
      }`}
    >
      <div className="flex items-start space-x-2">
        <AlertTriangleIcon
          className={`h-5 w-5 mt-0.5 ${
            getConflictSeverity(conflict.confidence_score) === "high"
              ? "text-red-500"
              : getConflictSeverity(conflict.confidence_score) === "medium"
                ? "text-yellow-500"
                : "text-blue-500"
          }`}
        />
        <div className="flex-1">
          <div className="font-medium text-sm">Conflict with {conflict.resource_name}</div>
          <div className="text-sm text-gray-600 mt-1">{conflict.reason}</div>
          {conflict.alternative_time && (
            <div className="text-sm text-blue-600 mt-1">
              <strong>Suggested:</strong> {formatDateTime(conflict.alternative_time)}
            </div>
          )}
          <div className="mt-2">
            <Badge
              variant={
                getConflictSeverity(conflict.confidence_score) === "high"
                  ? "destructive"
                  : getConflictSeverity(conflict.confidence_score) === "medium"
                    ? "secondary"
                    : "default"
              }
            >
              {Math.round(conflict.confidence_score * 100)}% confidence
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  // =====================================================
  // Main Render
  // =====================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Resource Allocation</DialogTitle>
          <DialogDescription>
            Allocate a resource for an appointment or maintenance period
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resource Selection */}
          <div className="space-y-2">
            <Label htmlFor="resource">Resource *</Label>
            <Select
              value={formData.resource_id}
              onValueChange={(value) => handleInputChange("resource_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a resource" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name} ({resource.type})
                    {resource.location && ` - ${resource.location}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getSelectedResource() && (
              <div className="text-sm text-gray-600 mt-2">
                <div>Type: {getSelectedResource()?.type}</div>
                <div>Capacity: {getSelectedResource()?.capacity}</div>
                {getSelectedResource()?.cost_per_hour && (
                  <div>Cost: ${getSelectedResource()?.cost_per_hour}/hour</div>
                )}
              </div>
            )}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleInputChange("start_time", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleInputChange("end_time", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Allocation Type */}
          <div className="space-y-2">
            <Label htmlFor="allocation_type">Allocation Type</Label>
            <Select
              value={formData.allocation_type}
              onValueChange={(value) => handleInputChange("allocation_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select allocation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Appointment ID (if applicable) */}
          {formData.allocation_type === "appointment" && (
            <div className="space-y-2">
              <Label htmlFor="appointment_id">Appointment ID</Label>
              <Input
                id="appointment_id"
                value={formData.appointment_id || ""}
                onChange={(e) => handleInputChange("appointment_id", e.target.value)}
                placeholder="Optional - link to specific appointment"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes or instructions"
              rows={3}
            />
          </div>

          {/* Conflict Checking */}
          {checking && (
            <div className="text-center py-4 text-gray-600">Checking for conflicts...</div>
          )}

          {/* Conflicts Display */}
          {conflicts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600 flex items-center">
                  <AlertTriangleIcon className="h-5 w-5 mr-2" />
                  Scheduling Conflicts Detected
                </CardTitle>
                <CardDescription>
                  Please review and resolve these conflicts before proceeding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {conflicts.map((conflict, index) => (
                  <ConflictAlert key={index} conflict={conflict} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Duration and Cost Calculation */}
          {formData.start_time && formData.end_time && getSelectedResource() && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Duration:</strong>{" "}
                    {Math.round(
                      (new Date(formData.end_time).getTime() -
                        new Date(formData.start_time).getTime()) /
                        (1000 * 60),
                    )}{" "}
                    minutes
                  </div>
                  {getSelectedResource()?.cost_per_hour && (
                    <div>
                      <strong>Estimated Cost:</strong> $
                      {Math.round(
                        ((new Date(formData.end_time).getTime() -
                          new Date(formData.start_time).getTime()) /
                          (1000 * 60 * 60)) *
                          (getSelectedResource()?.cost_per_hour || 0) *
                          100,
                      ) / 100}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading || conflicts.length > 0}>
            {loading ? "Creating..." : "Create Allocation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
