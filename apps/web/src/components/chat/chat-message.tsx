// Phase 3.5 — T034: Chat message bubble
import type { ChatMessage as Msg } from '@/components/ui/ai-chat/types';

export function ChatMessage({ message }: { message: Msg }) {
  const isUser = message.role === 'user';
  return (
    <div
      className={`rounded-md p-3 my-2 ${
        isUser ? 'bg-blue-50 text-blue-900' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className='text-xs opacity-70'>{isUser ? 'Você' : 'Assistente'}</div>
      <div className='whitespace-pre-wrap leading-relaxed'>{message.content}</div>
    </div>
  );
}

export default ChatMessage;
