import { useI18n } from '@/i18n/i18n';

export type ImageAttachmentProps = {
  consent: boolean;
  onAttach?: () => void;
};

export function ImageAttachment({ consent, onAttach }: ImageAttachmentProps) {
  const { t } = useI18n();
  return (
    <div>
      {!consent && <p role='alert'>{t('chat.consent_required')}</p>}
      <button
        onClick={() => onAttach?.()}
        disabled={!consent}
        aria-label={t('chat.attach_image')}
      >
        {t('chat.attach_image')}
      </button>
    </div>
  );
}
