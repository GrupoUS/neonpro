import { AIPrompt } from "@/components/ui/ai-chat";
import { useI18n } from "@/i18n/i18n";

export type PromptInputProps = {
  placeholder?: string;
  disabled?: boolean;
  onSubmit?: (text: string) => void;
};

export default function PromptInput({
  placeholder,
  disabled,
  onSubmit,
}: PromptInputProps) {
  const { t } = useI18n();
  const ph = placeholder ?? t("chat.placeholder");
  return <AIPrompt onSubmit={onSubmit} placeholder={ph} disabled={disabled} />;
}
