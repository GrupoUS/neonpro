
import React from 'react';
import { Button } from '@/components/ui/button';

interface ServicoFormData {
  nome_servico: string;
  preco: string;
}

interface ServicoFormProps {
  formData: ServicoFormData;
  setFormData: (data: ServicoFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  onCancel: () => void;
}

const ServicoForm: React.FC<ServicoFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isEditing,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Nome do Serviço
        </label>
        <input
          type="text"
          value={formData.nome_servico}
          onChange={(e) => setFormData({ ...formData, nome_servico: e.target.value })}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          placeholder="Ex: Limpeza de Pele"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Preço (R$)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.preco}
          onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          placeholder="0,00"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-gold hover:bg-gold/90 text-sacha-dark-blue"
        >
          {isEditing ? 'Atualizar' : 'Criar'} Serviço
        </Button>
      </div>
    </form>
  );
};

export default ServicoForm;
