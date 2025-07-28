"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Download, Eye, Plus, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
// import { CreateSegmentSchema } from '@/lib/validations/segmentation';

const CreateSegmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  criteria: z.array(
    z.object({
      field: z.string(),
      operator: z.string(),
      value: z.string(),
      logicalOperator: z.enum(["AND", "OR"]).optional(),
    })
  ),
  ai_model_config: z.object({
    model_type: z.string(),
    confidence_threshold: z.number(),
    update_frequency: z.string(),
  }),
});

interface SegmentCriteria {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOperator?: "AND" | "OR";
}

interface SegmentPreview {
  estimatedSize: number;
  characteristics: {
    averageAge: number;
    genderDistribution: { male: number; female: number; other: number };
    locationDistribution: Record<string, number>;
    servicePreferences: Record<string, number>;
  };
}

export default function SegmentBuilder() {
  const [segmentName, setSegmentName] = useState("");
  const [segmentDescription, setSegmentDescription] = useState("");
  const [criteria, setCriteria] = useState<SegmentCriteria[]>([
    { id: "1", field: "", operator: "", value: "" },
  ]);
  const [preview, setPreview] = useState<SegmentPreview | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const fieldOptions = [
    { value: "age", label: "Age" },
    { value: "gender", label: "Gender" },
    { value: "location", label: "Location" },
    { value: "service_history", label: "Service History" },
    { value: "appointment_frequency", label: "Appointment Frequency" },
    { value: "last_visit", label: "Last Visit" },
    { value: "total_spent", label: "Total Spent" },
    { value: "preferred_practitioner", label: "Preferred Practitioner" },
    { value: "communication_preference", label: "Communication Preference" },
    { value: "membership_status", label: "Membership Status" },
  ];

  const operatorOptions = {
    age: [
      { value: "equals", label: "Equals" },
      { value: "greater_than", label: "Greater than" },
      { value: "less_than", label: "Less than" },
      { value: "between", label: "Between" },
    ],
    gender: [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not equals" },
    ],
    location: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
      { value: "starts_with", label: "Starts with" },
    ],
    service_history: [
      { value: "contains", label: "Contains" },
      { value: "not_contains", label: "Does not contain" },
      { value: "count_greater_than", label: "Count greater than" },
    ],
    appointment_frequency: [
      { value: "greater_than", label: "Greater than" },
      { value: "less_than", label: "Less than" },
      { value: "equals", label: "Equals" },
    ],
    last_visit: [
      { value: "within_days", label: "Within last X days" },
      { value: "before_days", label: "Before X days ago" },
      { value: "between_dates", label: "Between dates" },
    ],
    total_spent: [
      { value: "greater_than", label: "Greater than" },
      { value: "less_than", label: "Less than" },
      { value: "between", label: "Between" },
    ],
    preferred_practitioner: [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not equals" },
    ],
    communication_preference: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
    ],
    membership_status: [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not equals" },
    ],
  };

  const addCriteria = () => {
    const newCriteria: SegmentCriteria = {
      id: Date.now().toString(),
      field: "",
      operator: "",
      value: "",
      logicalOperator: "AND",
    };
    setCriteria([...criteria, newCriteria]);
  };

  const removeCriteria = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  const updateCriteria = (
    id: string,
    field: keyof SegmentCriteria,
    value: string
  ) => {
    setCriteria(
      criteria.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const validateSegment = () => {
    const errors: string[] = [];

    if (!segmentName.trim()) {
      errors.push("Segment name is required");
    }

    if (criteria.length === 0) {
      errors.push("At least one criteria is required");
    }

    criteria.forEach((criterion, index) => {
      if (!criterion.field) {
        errors.push(`Criteria ${index + 1}: Field is required`);
      }
      if (!criterion.operator) {
        errors.push(`Criteria ${index + 1}: Operator is required`);
      }
      if (!criterion.value) {
        errors.push(`Criteria ${index + 1}: Value is required`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const generatePreview = async () => {
    if (!validateSegment()) return;

    setIsBuilding(true);
    try {
      // Simulate API call for segment preview
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock preview data
      const mockPreview: SegmentPreview = {
        estimatedSize: Math.floor(Math.random() * 500) + 50,
        characteristics: {
          averageAge: Math.floor(Math.random() * 20) + 25,
          genderDistribution: {
            male: Math.floor(Math.random() * 40) + 30,
            female: Math.floor(Math.random() * 40) + 30,
            other: Math.floor(Math.random() * 10) + 5,
          },
          locationDistribution: {
            "São Paulo": Math.floor(Math.random() * 40) + 30,
            "Rio de Janeiro": Math.floor(Math.random() * 30) + 20,
            "Belo Horizonte": Math.floor(Math.random() * 20) + 15,
            Other: Math.floor(Math.random() * 15) + 10,
          },
          servicePreferences: {
            "Facial Treatments": Math.floor(Math.random() * 35) + 25,
            "Body Treatments": Math.floor(Math.random() * 30) + 20,
            "Aesthetic Procedures": Math.floor(Math.random() * 25) + 15,
            "Wellness Services": Math.floor(Math.random() * 20) + 10,
          },
        },
      };

      setPreview(mockPreview);
    } catch (error) {
      console.error("Failed to generate preview:", error);
    } finally {
      setIsBuilding(false);
    }
  };

  const saveSegment = async () => {
    if (!validateSegment()) return;

    try {
      const segmentData = {
        name: segmentName,
        description: segmentDescription,
        criteria: criteria.filter((c) => c.field && c.operator && c.value),
        ai_model_config: {
          model_type: "demographic_clustering",
          confidence_threshold: 0.8,
          update_frequency: "daily",
        },
      };

      const validatedData = CreateSegmentSchema.parse(segmentData);

      const response = await fetch("/api/segmentation/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) throw new Error("Failed to save segment");

      // Reset form
      setSegmentName("");
      setSegmentDescription("");
      setCriteria([{ id: "1", field: "", operator: "", value: "" }]);
      setPreview(null);
      setValidationErrors([]);

      alert("Segment saved successfully!");
    } catch (error) {
      console.error("Failed to save segment:", error);
      alert("Failed to save segment. Please try again.");
    }
  };

  const exportSegment = () => {
    const exportData = {
      name: segmentName,
      description: segmentDescription,
      criteria,
      preview,
      createdAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `segment-${segmentName.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Segment Builder Header */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Segment Builder</CardTitle>
          <CardDescription>
            Create targeted patient segments using drag-and-drop criteria
            builder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="segment-name">Segment Name</Label>
              <Input
                id="segment-name"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                placeholder="e.g., High-Value Customers"
              />
            </div>
            <div>
              <Label htmlFor="segment-description">Description</Label>
              <Textarea
                id="segment-description"
                value={segmentDescription}
                onChange={(e) => setSegmentDescription(e.target.value)}
                placeholder="Describe this segment..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Criteria</CardTitle>
          <CardDescription>
            Define the conditions that determine segment membership
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {criteria.map((criterion, index) => (
            <div key={criterion.id} className="border rounded-lg p-4 space-y-4">
              {index > 0 && (
                <div className="flex items-center gap-2">
                  <Select
                    value={criterion.logicalOperator || "AND"}
                    onValueChange={(value: "AND" | "OR") =>
                      updateCriteria(criterion.id, "logicalOperator", value)
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Field</Label>
                  <Select
                    value={criterion.field}
                    onValueChange={(value) =>
                      updateCriteria(criterion.id, "field", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Operator</Label>
                  <Select
                    value={criterion.operator}
                    onValueChange={(value) =>
                      updateCriteria(criterion.id, "operator", value)
                    }
                    disabled={!criterion.field}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {criterion.field &&
                        operatorOptions[
                          criterion.field as keyof typeof operatorOptions
                        ]?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Value</Label>
                  <Input
                    value={criterion.value}
                    onChange={(e) =>
                      updateCriteria(criterion.id, "value", e.target.value)
                    }
                    placeholder="Enter value"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCriteria(criterion.id)}
                    disabled={criteria.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addCriteria} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Criteria
          </Button>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Preview</CardTitle>
          <CardDescription>
            Preview segment size and characteristics before saving
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={generatePreview} disabled={isBuilding}>
              <Eye className="h-4 w-4 mr-2" />
              {isBuilding ? "Generating..." : "Generate Preview"}
            </Button>
          </div>

          {preview && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {preview.estimatedSize}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Estimated Patients
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {preview.characteristics.averageAge}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Age
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-2">
                      Gender Distribution
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Male</span>
                        <span>
                          {preview.characteristics.genderDistribution.male}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Female</span>
                        <span>
                          {preview.characteristics.genderDistribution.female}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-2">Top Services</div>
                    <div className="space-y-1">
                      {Object.entries(
                        preview.characteristics.servicePreferences
                      )
                        .slice(0, 2)
                        .map(([service, percentage]) => (
                          <div
                            key={service}
                            className="flex justify-between text-sm"
                          >
                            <span className="truncate">{service}</span>
                            <span>{percentage}%</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={saveSegment} disabled={!preview}>
          Save Segment
        </Button>
        <Button variant="outline" onClick={exportSegment} disabled={!preview}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" disabled={!preview}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}
