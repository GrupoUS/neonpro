import AIChatContainer from "@/components/organisms/ai-chat-container";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/ai-chat")({
  component: Page,
});

function Page() {
  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto">
        <AIChatContainer
          context="procedures"
          userRole="professional"
          lgpdCompliant={true}
          showVoiceControls={true}
          showSearchSuggestions={true}
        />
      </div>
    </div>
  );
}
