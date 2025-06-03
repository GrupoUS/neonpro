import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Transacao,
  CreateTransacaoData,
  CATEGORIAS_RECEITA,
  CATEGORIAS_DESPESA,
  CategoriaReceita,
  CategoriaDespesa
} from '@/types/transaction';

interface TransactionFormProps {
  transaction?: Transacao | null;
  onSubmit: (data: CreateTransacaoData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateTransacaoData>({
    descricao: '',
    valor: 0,
    tipo: 'receita',
    categoria: CATEGORIAS_RECEITA[0],
    data_transacao: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        descricao: transaction.descricao,
        valor: transaction.valor,
        tipo: transaction.tipo,
        categoria: transaction.categoria,
        data_transacao: transaction.data_transacao.split('T')[0],
        observacoes: transaction.observacoes || ''
      });
    }
  }, [transaction]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (formData.valor <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    if (!formData.data_transacao) {
      newErrors.data_transacao = 'Data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleInputChange = (field: keyof CreateTransacaoData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getCategoriesByType = (tipo: 'receita' | 'despesa') => {
    return tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados da Transação */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Transação</CardTitle>
          <CardDescription>
            Informações básicas sobre a movimentação financeira
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Ex: Consulta - João Silva"
                className={errors.descricao ? 'border-red-500' : ''}
              />
              {errors.descricao && (
                <p className="text-sm text-red-500">{errors.descricao}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => handleInputChange('valor', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className={errors.valor ? 'border-red-500' : ''}
              />
              {errors.valor && (
                <p className="text-sm text-red-500">{errors.valor}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => {
                  const tipoValue = value as 'receita' | 'despesa';
                  handleInputChange('tipo', tipoValue);
                  // Reset categoria quando tipo mudar
                  const newCategories = getCategoriesByType(tipoValue);
                  handleInputChange('categoria', newCategories[0]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => handleInputChange('categoria', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {getCategoriesByType(formData.tipo).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_transacao">Data da Transação *</Label>
            <Input
              id="data_transacao"
              type="date"
              value={formData.data_transacao}
              onChange={(e) => handleInputChange('data_transacao', e.target.value)}
              className={errors.data_transacao ? 'border-red-500' : ''}
            />
            {errors.data_transacao && (
              <p className="text-sm text-red-500">{errors.data_transacao}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ''}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais sobre a transação..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : transaction ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
