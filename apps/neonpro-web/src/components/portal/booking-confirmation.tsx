"use client";

import React from "react";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Separator } from "@/components/ui/separator";
import type {
  Check,
  Calendar,
  Clock,
  User,
  Sparkles,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react";
import type { useTranslation } from "@/app/lib/i18n/use-translation";
import type { Service, Professional, AvailableTimeSlot } from "@/app/types/appointments";

interface BookingConfirmationProps {
  service?: Service;
  professional?: Professional;
  timeSlot?: AvailableTimeSlot;
  notes: string;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function BookingConfirmation({
  service,
  professional,
  timeSlot,
  notes,
  onConfirm,
  isLoading,
}: BookingConfirmationProps) {
  const { t } = useTranslation();

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          {t("booking.steps.confirmation.title")}
        </h2>
        <p className="text-muted-foreground">{t("booking.confirmation.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            {t("booking.confirmation.summary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Details */}
          {service && (
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-1" />
              <div className="space-y-1">
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {service.duration_minutes}min
                  </span>
                  {service.price && (
                    <span className="flex items-center gap-1 text-green-600">
                      <DollarSign className="h-3 w-3" />
                      R$ {service.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Professional Details */}
          {professional && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-primary mt-1" />
              <div className="space-y-1">
                <p className="font-medium">{professional.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {t(`professionals.specialties.${professional.specialty}`)}
                </Badge>
                {professional.license_number && (
                  <p className="text-xs text-muted-foreground">{professional.license_number}</p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Date & Time */}
          {timeSlot && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-1" />
              <div className="space-y-1">
                <p className="font-medium">{formatDate(timeSlot.start_time)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(timeSlot.start_time)} - {formatTime(timeSlot.end_time)}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-1" />
                <div className="space-y-1">
                  <p className="font-medium">{t("booking.confirmation.notes")}</p>
                  <p className="text-sm text-muted-foreground">{notes}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Button */}
      <Card className="bg-primary/5">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">{t("booking.confirmation.terms")}</p>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full md:w-auto px-8"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("booking.confirmation.confirming")}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t("booking.confirmation.confirm")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
