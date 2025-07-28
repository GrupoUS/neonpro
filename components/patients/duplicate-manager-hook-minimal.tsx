"use client";

import { Button } from "@/components/ui/button";
import React from "react";

export interface DuplicateManagerHookMinimalProps {
  duplicates: Array<{
    id: string;
    confidence: number;
    patient1: {
      id: string;
      name: string;
      email: string;
    };
    patient2: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export default function DuplicateManagerHookMinimal({
  duplicates,
}: DuplicateManagerHookMinimalProps) {
  // Test minimal hook usage
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Hook Minimal Duplicate Manager</h2>

      {duplicates.map((duplicate) => (
        <div key={duplicate.id} className="border p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              Confidence: {Math.round(duplicate.confidence * 100)}%
            </span>
            <Button
              variant={selectedId === duplicate.id ? "default" : "outline"}
              onClick={() => setSelectedId(duplicate.id)}
            >
              {selectedId === duplicate.id ? "Selected" : "Select"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border p-3 rounded">
              <h4 className="font-medium">{duplicate.patient1.name}</h4>
              <p className="text-sm text-muted-foreground">
                {duplicate.patient1.email}
              </p>
            </div>
            <div className="border p-3 rounded">
              <h4 className="font-medium">{duplicate.patient2.name}</h4>
              <p className="text-sm text-muted-foreground">
                {duplicate.patient2.email}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
