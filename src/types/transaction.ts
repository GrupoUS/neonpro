export interface Transacao {
  id: string;
  user_id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data_transacao: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransacaoData {
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data_transacao: string;
  observacoes?: string;
}

export interface UpdateTransacaoData {
  descricao?: string;
  valor?: number;
  tipo?: 'receita' | 'despesa';
  categoria?: string;
  data_transacao?: string;
  observacoes?: string;
}

export const CATEGORIAS_RECEITA = [
  'Procedimentos Estéticos',
  'Consultas',
  'Tratamentos Faciais',
  'Botox',
  'Preenchimento',
  'Peeling',
  'Limpeza de Pele',
  'Outras Receitas'
] as const;

export const CATEGORIAS_DESPESA = [
  'Insumos e Materiais',
  'Equipamentos',
  'Aluguel',
  'Energia Elétrica',
  'Telefone/Internet',
  'Marketing',
  'Capacitação',
  'Impostos',
  'Outras Despesas'
] as const;

export type CategoriaReceita = typeof CATEGORIAS_RECEITA[number];
export type CategoriaDespesa = typeof CATEGORIAS_DESPESA[number];
