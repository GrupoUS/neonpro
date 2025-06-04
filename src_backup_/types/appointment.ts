export interface Agendamento {
  id: string;
  paciente_id: string;
  medico_nome: string;
  medico_especialidade?: string;
  data_agendamento: string; // YYYY-MM-DD format
  hora_inicio: string; // HH:MM:SS format
  hora_fim: string; // HH:MM:SS format
  tipo_consulta: TipoConsulta;
  status: StatusAgendamento;
  observacoes?: string;
  valor_consulta?: number;
  forma_pagamento?: FormaPagamento;
  convenio_nome?: string;
  numero_carteirinha?: string;
  sala?: string;
  telefone_contato?: string;
  criado_por?: string;
  created_at: string;
  updated_at: string;
  
  // Dados do paciente (join)
  paciente?: {
    id: string;
    nome: string;
    telefone?: string;
    email?: string;
  };
}

export type TipoConsulta = 'consulta' | 'retorno' | 'procedimento' | 'emergencia';

export type StatusAgendamento = 
  | 'agendado' 
  | 'confirmado' 
  | 'em_andamento' 
  | 'concluido' 
  | 'cancelado' 
  | 'faltou';

export type FormaPagamento = 
  | 'dinheiro' 
  | 'cartao_debito' 
  | 'cartao_credito' 
  | 'pix' 
  | 'convenio';

export interface CreateAgendamentoData {
  paciente_id: string;
  medico_nome: string;
  medico_especialidade?: string;
  data_agendamento: string;
  hora_inicio: string;
  hora_fim: string;
  tipo_consulta: TipoConsulta;
  status?: StatusAgendamento;
  observacoes?: string;
  valor_consulta?: number;
  forma_pagamento?: FormaPagamento;
  convenio_nome?: string;
  numero_carteirinha?: string;
  sala?: string;
  telefone_contato?: string;
}

export interface UpdateAgendamentoData extends Partial<CreateAgendamentoData> {
  id: string;
}

export interface AgendamentoFilters {
  data_inicio?: string;
  data_fim?: string;
  medico_nome?: string;
  status?: StatusAgendamento;
  tipo_consulta?: TipoConsulta;
  paciente_nome?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: StatusAgendamento;
  tipo: TipoConsulta;
  agendamento: Agendamento;
}

// Opções para dropdowns
export const TIPOS_CONSULTA_OPTIONS = [
  { value: 'consulta', label: 'Consulta' },
  { value: 'retorno', label: 'Retorno' },
  { value: 'procedimento', label: 'Procedimento' },
  { value: 'emergencia', label: 'Emergência' },
] as const;

export const STATUS_AGENDAMENTO_OPTIONS = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'faltou', label: 'Faltou' },
] as const;

export const FORMAS_PAGAMENTO_OPTIONS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'pix', label: 'PIX' },
  { value: 'convenio', label: 'Convênio' },
] as const;

// Cores para o calendário baseadas no status
export const STATUS_COLORS = {
  agendado: '#f59e0b', // amber
  confirmado: '#10b981', // emerald
  em_andamento: '#3b82f6', // blue
  concluido: '#6b7280', // gray
  cancelado: '#ef4444', // red
  faltou: '#f97316', // orange
} as const;

// Utility functions
export const formatTime = (time: string): string => {
  if (!time) return '';
  return time.substring(0, 5); // Remove seconds, keep HH:MM
};

export const formatDateTime = (date: string, time: string): Date => {
  return new Date(`${date}T${time}`);
};

export const getStatusColor = (status: StatusAgendamento): string => {
  return STATUS_COLORS[status] || STATUS_COLORS.agendado;
};

export const getStatusLabel = (status: StatusAgendamento): string => {
  const option = STATUS_AGENDAMENTO_OPTIONS.find(opt => opt.value === status);
  return option?.label || status;
};

export const getTipoConsultaLabel = (tipo: TipoConsulta): string => {
  const option = TIPOS_CONSULTA_OPTIONS.find(opt => opt.value === tipo);
  return option?.label || tipo;
};
