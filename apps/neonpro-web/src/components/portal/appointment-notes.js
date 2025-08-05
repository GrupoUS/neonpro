"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppointmentNotes;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var textarea_1 = require("@/components/ui/textarea");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var use_translation_1 = require("@/app/lib/i18n/use-translation");
var alert_1 = require("@/components/ui/alert");
function AppointmentNotes(_a) {
  var notes = _a.notes,
    onNotesChange = _a.onNotesChange,
    _b = _a.maxLength,
    maxLength = _b === void 0 ? 1000 : _b,
    serviceInstructions = _a.serviceInstructions;
  var t = (0, use_translation_1.useTranslation)().t;
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{t("booking.steps.notes.title")}</h2>
        <p className="text-muted-foreground">{t("booking.notes.subtitle")}</p>
      </div>

      {serviceInstructions && (
        <alert_1.Alert>
          <lucide_react_1.AlertCircle className="h-4 w-4" />
          <alert_1.AlertDescription>
            <strong>{t("booking.notes.preparation")}:</strong> {serviceInstructions}
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.FileText className="h-5 w-5" />
            {t("booking.notes.title")}
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="space-y-2">
            <label_1.Label htmlFor="notes">{t("booking.notes.placeholder")}</label_1.Label>
            <textarea_1.Textarea
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
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
