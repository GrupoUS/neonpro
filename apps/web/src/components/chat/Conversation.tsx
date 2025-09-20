import { useI18n } from '@/i18n/i18n';

export type ConversationMessage = {
  id: string;
  role: 'user' | 'assistant' | string;
  text: string;
};
export type ConversationProps = {
  messages: ConversationMessage[];
  onReset?: () => void;
};

export function Conversation({ messages, onReset }: ConversationProps) {
  const { t } = useI18n();
  const label = t('chat.reset_history');
  return (
    <div>
      <ul aria-label='conversation-thread'>
        {messages.map(m => <li key={m.id}>{m.text}</li>)}
      </ul>
      <button onClick={() => onReset?.()} aria-label={label}>
        {label}
      </button>
    </div>
  );
}
