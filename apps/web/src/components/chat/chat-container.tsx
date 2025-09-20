// Phase 3.5 — T036: Chat container
import { useAIChat } from "@/hooks/useAIChat";
import ChatInput from "./chat-input";
import ChatMessage from "./chat-message";

export function ChatContainer() {
  const { messages, sendMessage, isLoading } = useAIChat();
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div>
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
      </div>
      <div className="sticky bottom-2 bg-white/70 backdrop-blur rounded-md p-2 shadow">
        <ChatInput
          disabled={isLoading}
          onSubmit={(text) => sendMessage(text)}
        />
      </div>
    </div>
  );
}

export default ChatContainer;
