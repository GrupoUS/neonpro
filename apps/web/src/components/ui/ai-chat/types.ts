// AI Chat Component Types for NeonPro Aesthetic Clinic
export interface AIPromptProps {
  onSubmit?: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // Model selection (KokonutUI ai-prompt pattern)
  model?: string;
  onModelChange?: (model: string) => void;
  models?: Array<{ value: string; label: string; disabled?: boolean }>;
  // Optionally hide the input and only show the selector
  showInput?: boolean;
}

export interface AIInputSearchProps {
  onSearch?: (query: string) => void;
  suggestions?: string[];
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export interface AILoadingProps {
  size?: 'sm' | 'default' | 'lg';
  message?: string;
  showMessage?: boolean;
  className?: string;
}

export interface AITextLoadingProps {
  message?: string;
  dotColor?: string;
  speed?: number;
  className?: string;
}

export interface AIVoiceProps {
  onVoiceInput?: (audioBlob: Blob) => void;
  onVoiceOutput?: () => void;
  isListening?: boolean;
  isPlaying?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  clientId?: string;
  metadata?: Record<string, any>;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  // Selected model id (matches API registry keys)
  model?: string;
}

export type ModelOption = { value: string; label: string; disabled?: boolean };

export interface ComplianceConfig {
  enablePIIRedaction: boolean;
  logRetentionDays: number;
  enableAuditTrail: boolean;
  maxTokensPerSession: number;
}
