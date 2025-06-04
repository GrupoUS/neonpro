import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatNavButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const ChatNavButton = ({ isOpen, onClick }: ChatNavButtonProps) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="flex items-center gap-2"
    >
      {isOpen ? (
        <X className="h-4 w-4" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
      Assistente IA
    </Button>
  );
};

export default ChatNavButton;
