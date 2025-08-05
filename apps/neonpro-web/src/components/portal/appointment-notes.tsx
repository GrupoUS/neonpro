"use client";

import type { AlertCircle, FileText } from "lucide-react";
import React from "react";
import type { useTranslation } from "@/app/lib/i18n/use-translation";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Label } from "@/components/ui/label";
import type { Textarea } from "@/components/ui/textarea";

interface AppointmentNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  maxLength?: number;
  serviceInstructions?: string;
}

export default function AppointmentNotes({
  notes,
  onNotesChange,
  maxLength = 1000,
  serviceInstructions,
}: AppointmentNotesProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{t("booking.steps.notes.title")}</h2>
        <p className="text-muted-foreground">{t("booking.notes.subtitle")}</p>
      </div>

      {serviceInstructions && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t("booking.notes.preparation")}:</strong> {serviceInstructions}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("booking.notes.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">{t("booking.notes.placeholder")}</Label>
            <Textarea
              id="notes"
              placeholder={t("booking.notes.example")}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              maxLength={maxLength}
              className="min-h-32"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("booking.notes.optional")}</span>
              <span>
                {notes.length}/{maxLength}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
