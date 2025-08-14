-- ====================================
-- 05 - Virtual Assistant Setup
-- ====================================
-- Criação das tabelas para o assistente virtual com isolamento de dados por usuário

-- Tabela para conversas do assistente virtual
CREATE TABLE IF NOT EXISTS assistant_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Nova Conversa',
    context JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT assistant_conversations_user_id_idx UNIQUE (user_id, id)
);

-- Tabela para mensagens do assistente virtual
CREATE TABLE IF NOT EXISTS assistant_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    processing_time INTEGER DEFAULT 0, -- em milissegundos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT assistant_messages_conversation_idx UNIQUE (conversation_id, id),
    CONSTRAINT assistant_messages_user_id_idx UNIQUE (user_id, id)
);

-- Tabela para preferências do assistente virtual por usuário
CREATE TABLE IF NOT EXISTS assistant_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ai_model TEXT DEFAULT 'gpt-4o-mini',
    language TEXT DEFAULT 'pt-BR',
    response_style TEXT DEFAULT 'professional' CHECK (response_style IN ('professional', 'casual', 'technical')),
    max_context_messages INTEGER DEFAULT 20,
    enable_suggestions BOOLEAN DEFAULT true,
    enable_analytics BOOLEAN DEFAULT true,
    custom_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Um registro de preferências por usuário
    CONSTRAINT assistant_preferences_user_unique UNIQUE (user_id)
);

-- Tabela para logs de ações do assistente (auditoria e análise)
CREATE TABLE IF NOT EXISTS assistant_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES assistant_conversations(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    data_accessed JSONB DEFAULT '{}',
    query_executed TEXT,
    response_summary TEXT,
    tokens_used INTEGER DEFAULT 0,
    processing_time INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- RLS (Row Level Security) Policies
-- ====================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para assistant_conversations
CREATE POLICY "Users can view own conversations"
    ON assistant_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
    ON assistant_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
    ON assistant_conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
    ON assistant_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para assistant_messages
CREATE POLICY "Users can view own messages"
    ON assistant_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
    ON assistant_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
    ON assistant_messages FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
    ON assistant_messages FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para assistant_preferences
CREATE POLICY "Users can view own preferences"
    ON assistant_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON assistant_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON assistant_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
    ON assistant_preferences FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para assistant_logs
CREATE POLICY "Users can view own logs"
    ON assistant_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
    ON assistant_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ====================================
-- Índices para Performance
-- ====================================

-- Índices para assistant_conversations
CREATE INDEX IF NOT EXISTS assistant_conversations_user_id_idx ON assistant_conversations(user_id);
CREATE INDEX IF NOT EXISTS assistant_conversations_status_idx ON assistant_conversations(user_id, status);
CREATE INDEX IF NOT EXISTS assistant_conversations_created_at_idx ON assistant_conversations(user_id, created_at DESC);

-- Índices para assistant_messages
CREATE INDEX IF NOT EXISTS assistant_messages_conversation_id_idx ON assistant_messages(conversation_id);
CREATE INDEX IF NOT EXISTS assistant_messages_user_id_idx ON assistant_messages(user_id);
CREATE INDEX IF NOT EXISTS assistant_messages_created_at_idx ON assistant_messages(conversation_id, created_at ASC);

-- Índices para assistant_logs
CREATE INDEX IF NOT EXISTS assistant_logs_user_id_idx ON assistant_logs(user_id);
CREATE INDEX IF NOT EXISTS assistant_logs_conversation_id_idx ON assistant_logs(conversation_id);
CREATE INDEX IF NOT EXISTS assistant_logs_created_at_idx ON assistant_logs(user_id, created_at DESC);

-- ====================================
-- Triggers para Updated_at
-- ====================================

-- Trigger para assistant_conversations
CREATE OR REPLACE FUNCTION update_assistant_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assistant_conversations_updated_at
    BEFORE UPDATE ON assistant_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_assistant_conversations_updated_at();

-- Trigger para assistant_preferences
CREATE OR REPLACE FUNCTION update_assistant_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assistant_preferences_updated_at
    BEFORE UPDATE ON assistant_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_assistant_preferences_updated_at();

-- ====================================
-- Função para inicializar preferências padrão
-- ====================================

CREATE OR REPLACE FUNCTION initialize_assistant_preferences_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO assistant_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar preferências automaticamente quando um usuário é criado
-- (assumindo que temos uma tabela de perfis de usuário)
-- CREATE TRIGGER initialize_assistant_preferences
--     AFTER INSERT ON user_profiles
--     FOR EACH ROW
--     EXECUTE FUNCTION initialize_assistant_preferences_for_user();

-- ====================================
-- Comentários das Tabelas
-- ====================================

COMMENT ON TABLE assistant_conversations IS 'Conversas do assistente virtual, isoladas por usuário';
COMMENT ON TABLE assistant_messages IS 'Mensagens das conversas do assistente virtual';
COMMENT ON TABLE assistant_preferences IS 'Preferências do assistente virtual por usuário';
COMMENT ON TABLE assistant_logs IS 'Logs de auditoria das ações do assistente virtual';

COMMENT ON COLUMN assistant_conversations.context IS 'Contexto da conversa (dados do negócio, preferências, etc.)';
COMMENT ON COLUMN assistant_messages.metadata IS 'Metadados da mensagem (modelo usado, configurações, etc.)';
COMMENT ON COLUMN assistant_logs.data_accessed IS 'Dados que foram acessados durante a ação';
COMMENT ON COLUMN assistant_logs.query_executed IS 'Query SQL executada (para auditoria)';