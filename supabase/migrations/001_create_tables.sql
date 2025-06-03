-- Criar tabela de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  data_nascimento DATE,
  endereco TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_servico VARCHAR(255) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  duracao INTEGER, -- duração em minutos
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES servicos(id) ON DELETE CASCADE,
  data_agendamento DATE NOT NULL,
  hora_agendamento TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'agendado', -- agendado, confirmado, cancelado, concluido
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_servico ON agendamentos(servico_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome);
CREATE INDEX IF NOT EXISTS idx_servicos_nome ON servicos(nome_servico);

-- Habilitar RLS (Row Level Security)
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (permitir todas as operações por enquanto)
CREATE POLICY "Permitir todas as operações em pacientes" ON pacientes FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações em servicos" ON servicos FOR ALL USING (true);
CREATE POLICY "Permitir todas as operações em agendamentos" ON agendamentos FOR ALL USING (true);

-- Inserir alguns dados de exemplo
