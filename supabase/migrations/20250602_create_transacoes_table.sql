-- Criar tabela de transações financeiras
CREATE TABLE IF NOT EXISTS public.transacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    categoria VARCHAR(100) NOT NULL,
    data_transacao DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON public.transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON public.transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON public.transacoes(data_transacao);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON public.transacoes(categoria);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas suas próprias transações
CREATE POLICY "Users can view own transactions" ON public.transacoes
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram suas próprias transações
CREATE POLICY "Users can insert own transactions" ON public.transacoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias transações
CREATE POLICY "Users can update own transactions" ON public.transacoes
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários deletem suas próprias transações
CREATE POLICY "Users can delete own transactions" ON public.transacoes
    FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER handle_transacoes_updated_at
    BEFORE UPDATE ON public.transacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Inserir algumas transações de exemplo (opcional)
INSERT INTO public.transacoes (user_id, descricao, valor, tipo, categoria, data_transacao, observacoes)
SELECT 
    auth.uid(),
    'Procedimento de Botox - Cliente Ana Silva',
    1200.00,
    'receita',
    'Procedimentos Estéticos',
    CURRENT_DATE - INTERVAL '1 day',
    'Procedimento realizado com sucesso'
WHERE auth.uid() IS NOT NULL;

INSERT INTO public.transacoes (user_id, descricao, valor, tipo, categoria, data_transacao, observacoes)
SELECT 
    auth.uid(),
    'Compra de insumos - Seringas e agulhas',
    450.00,
    'despesa',
    'Insumos e Materiais',
    CURRENT_DATE - INTERVAL '2 days',
    'Compra para estoque'
WHERE auth.uid() IS NOT NULL;

INSERT INTO public.transacoes (user_id, descricao, valor, tipo, categoria, data_transacao, observacoes)
SELECT 
    auth.uid(),
    'Procedimento de Preenchimento - Cliente Maria',
    800.00,
    'receita',
    'Procedimentos Estéticos',
    CURRENT_DATE - INTERVAL '3 days',
    'Preenchimento labial'
WHERE auth.uid() IS NOT NULL;
