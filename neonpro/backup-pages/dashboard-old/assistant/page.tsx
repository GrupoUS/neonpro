"use client";

import { useState } from 'react';
import { DashboardLayout } from '@/components/navigation/dashboard-layout';
import { AssistantChat } from '@/components/assistant/assistant-chat';
import { ConversationSidebar } from '@/components/assistant/conversation-sidebar';
import { useAuth } from '@/contexts/auth-context';

export default function AssistantPage() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Assistente Virtual" }
  ];

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleNewConversation = () => {
    setSelectedConversationId(undefined);
  };

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="flex h-[calc(100vh-140px)] gap-6">
        {/* Sidebar com conversas */}
        <div className="w-80 flex-shrink-0">
          <ConversationSidebar
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Chat principal */}
        <div className="flex-1">
          <AssistantChat
            conversationId={selectedConversationId}
            onConversationChange={setSelectedConversationId}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}