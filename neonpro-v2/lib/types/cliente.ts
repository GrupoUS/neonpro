export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  observacoes?: string;
  status: "ativo" | "inativo";
  created_at: string;
  updated_at: string;
  user_id: string; // Para RLS (Row Level Security)
}

export interface CreateClienteData {
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  observacoes?: string;
  status?: "ativo" | "inativo";
}

export interface UpdateClienteData extends Partial<CreateClienteData> {
  id: string;
}
