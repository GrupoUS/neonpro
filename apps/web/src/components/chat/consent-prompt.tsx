// Phase 3.5 — T038: Consent prompt
import { useI18n } from '@/i18n/i18n';

export function ConsentPrompt({ onAccept }: { onAccept?: () => void }) {
  const { t } = useI18n();
  return (
    <div className='p-3 rounded border bg-yellow-50 text-yellow-800'>
      <p className='mb-2'>
        {t('chat.consent_notice') || 'Para continuar, confirme o consentimento para uso de dados.'}
      </p>
      <button className='px-3 py-1 rounded bg-yellow-600 text-white' onClick={onAccept}>
        {t('chat.consent_accept') || 'Aceitar'}
      </button>
    </div>
  );
}

export default ConsentPrompt;
