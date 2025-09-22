// Phase 3.5 — T035: Chat input component
import { AIPrompt } from '@/components/ui/ai-chat';
import { useI18n } from '@/i18n/i18n';

export function ChatInput({
  disabled,onSubmit,
}: {
  disabled?: boolean;
  onSubmit?: (text: string) => void;
}) {
  const { t } = useI18n();
  const placeholder = t('chat.placeholder') || 'Digite sua pergunta...';
  return (
    <AIPrompt
      disabled={disabled}
      onSubmit={onSubmit}
      placeholder={placeholder}
    />
  );
}

export default ChatInput;
