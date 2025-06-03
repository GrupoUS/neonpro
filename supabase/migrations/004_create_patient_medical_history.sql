-- Criar tabela de histórico médico dos pacientes
CREATE TABLE IF NOT EXISTS public.historico_medico (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    data_consulta DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_consulta VARCHAR(100) NOT NULL,
    medico_responsavel VARCHAR(255),
    sintomas TEXT,
    diagnostico TEXT,
    tratamento_prescrito TEXT,
    medicamentos TEXT,
    observacoes TEXT,
    proxima_consulta DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de arquivos/documentos dos pacientes
CREATE TABLE IF NOT EXISTS public.arquivos_pacientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_arquivo VARCHAR(50) NOT NULL, -- 'exame', 'receita', 'documento', 'foto'
    url_arquivo TEXT NOT NULL,
    tamanho_arquivo INTEGER,
    mime_type VARCHAR(100),
    descricao TEXT,
    data_upload DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de alergias e condições médicas
CREATE TABLE IF NOT EXISTS public.condicoes_medicas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'alergia', 'doenca_cronica', 'cirurgia_anterior', 'medicamento_continuo'
    descricao TEXT NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_historico_medico_paciente ON public.historico_medico(paciente_id);
CREATE INDEX IF NOT EXISTS idx_historico_medico_data ON public.historico_medico(data_consulta DESC);
CREATE INDEX IF NOT EXISTS idx_arquivos_pacientes_paciente ON public.arquivos_pacientes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_arquivos_pacientes_tipo ON public.arquivos_pacientes(tipo_arquivo);
CREATE INDEX IF NOT EXISTS idx_condicoes_medicas_paciente ON public.condicoes_medicas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_condicoes_medicas_tipo ON public.condicoes_medicas(tipo);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.historico_medico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arquivos_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condicoes_medicas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para histórico médico
CREATE POLICY "Users can view medical history" ON public.historico_medico FOR SELECT USING (true);
CREATE POLICY "Users can insert medical history" ON public.historico_medico FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update medical history" ON public.historico_medico FOR UPDATE USING (true);
CREATE POLICY "Users can delete medical history" ON public.historico_medico FOR DELETE USING (true);

-- Políticas RLS para arquivos de pacientes
CREATE POLICY "Users can view patient files" ON public.arquivos_pacientes FOR SELECT USING (true);
CREATE POLICY "Users can insert patient files" ON public.arquivos_pacientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update patient files" ON public.arquivos_pacientes FOR UPDATE USING (true);
CREATE POLICY "Users can delete patient files" ON public.arquivos_pacientes FOR DELETE USING (true);

-- Políticas RLS para condições médicas
CREATE POLICY "Users can view medical conditions" ON public.condicoes_medicas FOR SELECT USING (true);
CREATE POLICY "Users can insert medical conditions" ON public.condicoes_medicas FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update medical conditions" ON public.condicoes_medicas FOR UPDATE USING (true);
CREATE POLICY "Users can delete medical conditions" ON public.condicoes_medicas FOR DELETE USING (true);

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER handle_historico_medico_updated_at
    BEFORE UPDATE ON public.historico_medico
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_condicoes_medicas_updated_at
    BEFORE UPDATE ON public.condicoes_medicas
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Adicionar campos extras à tabela de pacientes para informações médicas básicas
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS rg VARCHAR(20);
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(20);
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS profissao VARCHAR(100);
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS contato_emergencia VARCHAR(255);
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS telefone_emergencia VARCHAR(20);
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS convenio VARCHAR(100);
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS numero_convenio VARCHAR(50);
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Criar índice para busca por CPF
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON public.pacientes(cpf);

-- Inserir alguns dados de exemplo para histórico médico
INSERT INTO public.historico_medico (paciente_id, tipo_consulta, sintomas, diagnostico, tratamento_prescrito)
SELECT 
    p.id,
    'Consulta Inicial',
    'Paciente relata cansaço e dores nas articulações',
    'Suspeita de artrite',
    'Repouso e anti-inflamatório'
FROM public.pacientes p
WHERE p.nome = 'João Silva'
LIMIT 1;

INSERT INTO public.condicoes_medicas (paciente_id, tipo, descricao, ativo)
SELECT 
    p.id,
    'alergia',
    'Alergia a dipirona',
    true
FROM public.pacientes p
WHERE p.nome = 'Maria Santos'
LIMIT 1;
