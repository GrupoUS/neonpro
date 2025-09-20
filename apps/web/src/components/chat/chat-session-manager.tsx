// Phase 3.5 — T037: Chat session manager
import { useChatSession } from "@/hooks/use-chat-session";
import { nanoid } from "nanoid";
import { useMemo } from "react";
import ChatContainer from "./chat-container";

export function ChatSessionManager() {
  const sessionId = useMemo(() => nanoid(), []);
  const { data } = useChatSession(sessionId, { mock: true });
  return (
    <div>
      <div className="text-xs opacity-60">Session: {data?.id ?? sessionId}</div>
      <ChatContainer />
    </div>
  );
}

export default ChatSessionManager;
