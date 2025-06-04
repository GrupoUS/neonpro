
export interface ChatSession {
  id: string;
  user_id: string;
  titulo: string;
  contexto: Record<string, any>;
  configuracoes: Record<string, any>;
  status: 'ativo' | 'inativo' | 'arquivado';
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  tipo: 'user' | 'assistant' | 'system';
  conteudo: string;
  metadata: Record<string, any>;
  timestamp: string;
  processed: boolean;
  tokens_used: number;
}

export interface ChatbotConfig {
  id: string;
  user_id: string;
  openrouter_api_key?: string;
  modelo_preferido: string;
  temperatura: number;
  max_tokens: number;
  personalidade: Record<string, any>;
  comandos_customizados: any[];
  automacoes_ativas: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatbotAnalytics {
  id: string;
  user_id: string;
  session_id?: string;
  evento: string;
  dados: Record<string, any>;
  timestamp: string;
}

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
