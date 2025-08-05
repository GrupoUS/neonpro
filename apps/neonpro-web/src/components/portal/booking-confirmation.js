"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BookingConfirmation;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var use_translation_1 = require("@/app/lib/i18n/use-translation");
function BookingConfirmation(_a) {
  var service = _a.service,
    professional = _a.professional,
    timeSlot = _a.timeSlot,
    notes = _a.notes,
    onConfirm = _a.onConfirm,
    isLoading = _a.isLoading;
  var t = (0, use_translation_1.useTranslation)().t;
  var formatDate = (dateTime) =>
    new Date(dateTime).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  var formatTime = (dateTime) =>
    new Date(dateTime).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          {t("booking.steps.confirmation.title")}
        </h2>
        <p className="text-muted-foreground">{t("booking.confirmation.subtitle")}</p>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Check className="h-5 w-5" />
            {t("booking.confirmation.summary")}
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-6">
          {/* Service Details */}
          {service && (
            <div className="flex items-start gap-3">
              <lucide_react_1.Sparkles className="h-5 w-5 text-primary mt-1" />
              <div className="space-y-1">
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <lucide_react_1.Clock className="h-3 w-3" />
                    {service.duration_minutes}min
                  </span>
                  {service.price && (
                    <span className="flex items-center gap-1 text-green-600">
                      <lucide_react_1.DollarSign className="h-3 w-3" />
                      R$ {service.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <separator_1.Separator />

          {/* Professional Details */}
          {professional && (
            <div className="flex items-start gap-3">
              <lucide_react_1.User className="h-5 w-5 text-primary mt-1" />
              <div className="space-y-1">
                <p className="font-medium">{professional.name}</p>
                <badge_1.Badge variant="secondary" className="text-xs">
                  {t("professionals.specialties.".concat(professional.specialty))}
                </badge_1.Badge>
                {professional.license_number && (
                  <p className="text-xs text-muted-foreground">{professional.license_number}</p>
                )}
              </div>
            </div>
          )}

          <separator_1.Separator />

          {/* Date & Time */}
          {timeSlot && (
            <div className="flex items-start gap-3">
              <lucide_react_1.Calendar className="h-5 w-5 text-primary mt-1" />
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
              <separator_1.Separator />
              <div className="flex items-start gap-3">
                <lucide_react_1.FileText className="h-5 w-5 text-primary mt-1" />
                <div className="space-y-1">
                  <p className="font-medium">{t("booking.confirmation.notes")}</p>
                  <p className="text-sm text-muted-foreground">{notes}</p>
                </div>
              </div>
            </>
          )}
        </card_1.CardContent>
      </card_1.Card>

      {/* Confirmation Button */}
      <card_1.Card className="bg-primary/5">
        <card_1.CardContent className="p-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">{t("booking.confirmation.terms")}</p>
            <button_1.Button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full md:w-auto px-8"
              size="lg"
            >
              {isLoading
                ? <>
                    <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("booking.confirmation.confirming")}
                  </>
                : <>
                    <lucide_react_1.Check className="mr-2 h-4 w-4" />
                    {t("booking.confirmation.confirm")}
                  </>}
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
