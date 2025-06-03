-- Criar tabela de configurações da clínica
CREATE TABLE IF NOT EXISTS public.clinicas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_clinica VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    especialidades TEXT[],
    horario_funcionamento JSONB,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clinicas_user_id ON public.clinicas(user_id);
CREATE INDEX IF NOT EXISTS idx_clinicas_cnpj ON public.clinicas(cnpj);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas sua própria clínica
CREATE POLICY "Users can view own clinic" ON public.clinicas
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram sua própria clínica
CREATE POLICY "Users can insert own clinic" ON public.clinicas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem sua própria clínica
CREATE POLICY "Users can update own clinic" ON public.clinicas
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários deletem sua própria clínica
CREATE POLICY "Users can delete own clinic" ON public.clinicas
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER handle_clinicas_updated_at
    BEFORE UPDATE ON public.clinicas
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Garantir que cada usuário tenha apenas uma clínica
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinicas_unique_user ON public.clinicas(user_id);
