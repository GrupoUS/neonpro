import { useI18n } from "@/i18n/i18n";

export type ResponseSummaryProps = {
  summary: string;
  lastUpdated: number; // timestamp ms
  onRefine?: () => void;
};

function timeSince(ts: number, t: (k: string) => string) {
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return t("chat.freshness.less_than_min");
  if (diffMin === 1) return t("chat.freshness.one_min");
  return t("chat.freshness.many_min").replace("{min}", String(diffMin));
}

export function ResponseSummary({
  summary,
  lastUpdated,
  onRefine,
}: ResponseSummaryProps) {
  const { t } = useI18n();
  return (
    <div>
      <p aria-label="summary-text">{summary}</p>
      <p aria-label="freshness">{timeSince(lastUpdated, t)}</p>
      <button onClick={() => onRefine?.()} aria-label={t("chat.refine")}>
        {t("chat.refine")}
      </button>
    </div>
  );
}
