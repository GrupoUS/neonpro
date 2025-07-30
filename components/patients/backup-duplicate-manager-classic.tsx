"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, Users } from "lucide-react";
import React from "react";

interface Patient {
  id: string;
  name: string;
  birthDate: string;
  email?: string;
  phone?: string;
}

interface DuplicateGroup {
  id: string;
  confidence: number;
  patients: Patient[];
  suggestedPrimary: string;
}

interface Props {
  duplicates: DuplicateGroup[];
  onMerge: (groupId: string, primaryId: string, secondaryIds: string[]) => void;
  onDismiss: (groupId: string) => void;
}

export default function DuplicateManagerClassic({
  duplicates,
  onMerge,
  onDismiss,
}: Props) {
  // Using React.useState with tuple access instead of destructuring
  const selectedGroupState = React.useState<string | null>(null);
  const selectedGroup = selectedGroupState[0];
  const setSelectedGroup = selectedGroupState[1];

  const selectedPrimaryState = React.useState<string>("");
  const selectedPrimary = selectedPrimaryState[0];
  const setSelectedPrimary = selectedPrimaryState[1];

  const processingState = React.useState<boolean>(false);
  const processing = processingState[0];
  const setProcessing = processingState[1];

  const handleMerge = React.useCallback(async () => {
    if (!selectedGroup || !selectedPrimary) return;

    setProcessing(true);
    try {
      const group = duplicates.find((g) => g.id === selectedGroup);
      if (group) {
        const secondaryIds = group.patients
          .filter((p) => p.id !== selectedPrimary)
          .map((p) => p.id);
        await onMerge(selectedGroup, selectedPrimary, secondaryIds);
        setSelectedGroup(null);
        setSelectedPrimary("");
      }
    } finally {
      setProcessing(false);
    }
  }, [selectedGroup, selectedPrimary, duplicates, onMerge]);

  if (duplicates.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No duplicates found
          </h3>
          <p className="text-gray-500">
            Great! Your patient records are clean.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold">
          Found {duplicates.length} potential duplicate
          {duplicates.length > 1 ? "s" : ""}
        </h2>
      </div>

      {duplicates.map((group) => (
        <Card key={group.id} className="border-amber-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Potential Duplicate Group
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800"
              >
                {Math.round(group.confidence * 100)}% confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.patients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPrimary === patient.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPrimary(patient.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{patient.name}</h4>
                    {group.suggestedPrimary === patient.id && (
                      <Badge variant="default" className="text-xs">
                        Suggested Primary
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Birth Date: {patient.birthDate}</p>
                    {patient.email && <p>Email: {patient.email}</p>}
                    {patient.phone && <p>Phone: {patient.phone}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onDismiss(group.id)}
                disabled={processing}
              >
                Not a duplicate
              </Button>

              <div className="flex items-center gap-2">
                {selectedPrimary && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ArrowRight className="h-4 w-4" />
                    <span>Merge into selected record</span>
                  </div>
                )}
                <Button
                  onClick={() => {
                    setSelectedGroup(group.id);
                    handleMerge();
                  }}
                  disabled={!selectedPrimary || processing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processing ? "Merging..." : "Merge Records"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
