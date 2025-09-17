// Phase 3.5 — T039: Rate limit notice
import { useI18n } from '@/i18n/i18n';

export function RateLimitNotice() {
  const { t } = useI18n();
  return (
    <div className="p-3 rounded border bg-red-50 text-red-800">
      {t('chat.rate_limit') || 'Muitas solicitações. Tente novamente em breve.'}
    </div>
  );
}

export default RateLimitNotice;
