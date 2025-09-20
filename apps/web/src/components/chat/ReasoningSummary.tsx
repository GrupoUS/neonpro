import { useI18n } from "@/i18n/i18n";
import React from "react";

type AuditEvent = { event: string; enabled: boolean };
export type ReasoningSummaryProps = {
  summarized: string;
  onAudit?: (e: AuditEvent) => void;
};

export function ReasoningSummary({
  summarized,
  onAudit,
}: ReasoningSummaryProps) {
  const [open, setOpen] = React.useState(false);
  const { t } = useI18n();

  const toggle = () => {
    const next = !open;
    setOpen(next);
    onAudit?.({ event: "reasoning_view_toggled", enabled: next });
  };

  const label = open ? t("chat.hide_reasoning") : t("chat.show_reasoning");

  return (
    <div>
      <button onClick={toggle} aria-label={label}>
        {label}
      </button>
      {open ? <p aria-live="polite">{summarized}</p> : null}
    </div>
  );
}
