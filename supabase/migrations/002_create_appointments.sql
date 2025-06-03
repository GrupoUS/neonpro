-- Create appointments table
CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    medico_nome VARCHAR(255) NOT NULL,
    medico_especialidade VARCHAR(255),
    data_agendamento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    tipo_consulta VARCHAR(100) NOT NULL DEFAULT 'consulta', -- consulta, retorno, procedimento, emergencia
    status VARCHAR(50) NOT NULL DEFAULT 'agendado', -- agendado, confirmado, em_andamento, concluido, cancelado, faltou
    observacoes TEXT,
    valor_consulta DECIMAL(10,2),
    forma_pagamento VARCHAR(100), -- dinheiro, cartao_debito, cartao_credito, pix, convenio
    convenio_nome VARCHAR(255),
    numero_carteirinha VARCHAR(100),
    sala VARCHAR(50),
    telefone_contato VARCHAR(20),
    criado_por UUID, -- referência ao usuário que criou
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente_id ON public.agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON public.agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON public.agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_medico ON public.agendamentos(medico_nome);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora ON public.agendamentos(data_agendamento, hora_inicio);

-- Enable Row Level Security (RLS)
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Usuários autenticados podem ver todos os agendamentos" ON public.agendamentos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir agendamentos" ON public.agendamentos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar agendamentos" ON public.agendamentos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar agendamentos" ON public.agendamentos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agendamentos_updated_at 
    BEFORE UPDATE ON public.agendamentos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for testing
INSERT INTO public.agendamentos (
    paciente_id,
    medico_nome,
    medico_especialidade,
    data_agendamento,
    hora_inicio,
    hora_fim,
    tipo_consulta,
    status,
    observacoes,
    valor_consulta,
    sala
) VALUES 
-- Note: These will need real paciente_id values after patients are created
(
    (SELECT id FROM public.pacientes LIMIT 1),
    'Dr. João Silva',
    'Cardiologia',
    CURRENT_DATE + INTERVAL '1 day',
    '09:00:00',
    '09:30:00',
    'consulta',
    'agendado',
    'Consulta de rotina - check-up cardiológico',
    150.00,
    'Sala 1'
),
(
    (SELECT id FROM public.pacientes LIMIT 1),
    'Dra. Maria Santos',
    'Dermatologia',
    CURRENT_DATE + INTERVAL '2 days',
    '14:00:00',
    '14:30:00',
    'retorno',
    'confirmado',
    'Retorno para avaliação de tratamento',
    100.00,
    'Sala 2'
);

COMMENT ON TABLE public.agendamentos IS 'Tabela para gerenciar agendamentos de consultas e procedimentos médicos';
COMMENT ON COLUMN public.agendamentos.tipo_consulta IS 'Tipo: consulta, retorno, procedimento, emergencia';
COMMENT ON COLUMN public.agendamentos.status IS 'Status: agendado, confirmado, em_andamento, concluido, cancelado, faltou';
COMMENT ON COLUMN public.agendamentos.forma_pagamento IS 'Forma de pagamento: dinheiro, cartao_debito, cartao_credito, pix, convenio';
