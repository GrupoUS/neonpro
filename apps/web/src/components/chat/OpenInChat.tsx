import { useI18n } from '@/i18n/i18n';

export type OpenInChatProps = {
  getPrefill: () => string;
  onOpen?: (prefill: string) => void;
};

export function OpenInChat({ getPrefill, onOpen }: OpenInChatProps) {
  const { t } = useI18n();
  const handleOpen = () => {
    const prefill = getPrefill();
    onOpen?.(prefill);
  };

  return (
    <div>
      <button onClick={handleOpen} aria-label={t('chat.open_in_chat')}>{t('chat.open_in_chat')}</button>
    </div>
  );
}
