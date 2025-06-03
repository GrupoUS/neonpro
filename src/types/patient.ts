// Types for patient management module

export interface Paciente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  endereco?: string;
  observacoes?: string;
  cpf?: string;
  rg?: string;
  estado_civil?: string;
  profissao?: string;
  contato_emergencia?: string;
  telefone_emergencia?: string;
  convenio?: string;
  numero_convenio?: string;
  foto_url?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface HistoricoMedico {
  id: string;
  paciente_id: string;
  data_consulta: string;
  tipo_consulta: string;
  medico_responsavel?: string;
  sintomas?: string;
  diagnostico?: string;
  tratamento_prescrito?: string;
  medicamentos?: string;
  observacoes?: string;
  proxima_consulta?: string;
  created_at: string;
  updated_at: string;
}

export interface CondicaoMedica {
  id: string;
  paciente_id: string;
  tipo: 'alergia' | 'doenca_cronica' | 'cirurgia_anterior' | 'medicamento_continuo';
  descricao: string;
  data_inicio?: string;
  data_fim?: string;
  ativo: boolean;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ArquivoPaciente {
  id: string;
  paciente_id: string;
  nome_arquivo: string;
  tipo_arquivo: 'exame' | 'receita' | 'documento' | 'foto';
  url_arquivo: string;
  tamanho_arquivo?: number;
  mime_type?: string;
  descricao?: string;
  data_upload: string;
  created_at: string;
}

export interface CreatePacienteData {
  nome: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  endereco?: string;
  observacoes?: string;
  cpf?: string;
  rg?: string;
  estado_civil?: string;
  profissao?: string;
  contato_emergencia?: string;
  telefone_emergencia?: string;
  convenio?: string;
  numero_convenio?: string;
  foto_url?: string;
  ativo?: boolean;
}

export interface UpdatePacienteData extends Partial<CreatePacienteData> {
  id: string;
}

export interface PatientFilters {
  search?: string;
  ativo?: boolean;
  convenio?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface PatientStats {
  total: number;
  ativos: number;
  inativos: number;
  novosEstesMes: number;
  comConvenio: number;
}
