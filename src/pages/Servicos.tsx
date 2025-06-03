
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface Servico {
  id: string;
  user_id: string;
  nome_servico: string;
  preco: number;
  created_at: string;
}

const Servicos: React.FC = () => {
  const { user } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [formData, setFormData] = useState({
    nome_servico: '',
    preco: ''
  });

  useEffect(() => {
    if (user) {
      fetchServicos();
    }
  }, [user]);

  const fetchServicos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar serviços:', error);
        toast.error('Erro ao carregar serviços');
        return;
      }
      
      setServicos(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }
    
    try {
      const servicoData = {
        nome_servico: formData.nome_servico,
        preco: parseFloat(formData.preco),
        user_id: user.id
      };

      if (editingServico) {
        const { error } = await supabase
          .from('servicos')
          .update({
            nome_servico: servicoData.nome_servico,
            preco: servicoData.preco
          })
          .eq('id', editingServico.id);

        if (error) {
          console.error('Erro ao atualizar serviço:', error);
          toast.error('Erro ao atualizar serviço');
          return;
        }
        
        toast.success('Serviço atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('servicos')
          .insert([servicoData]);

        if (error) {
          console.error('Erro ao criar serviço:', error);
          toast.error('Erro ao criar serviço');
          return;
        }
        
        toast.success('Serviço criado com sucesso!');
      }

      setFormData({ nome_servico: '', preco: '' });
      setShowModal(false);
      setEditingServico(null);
      fetchServicos();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      toast.error('Erro ao salvar serviço');
    }
  };

  const handleEdit = (servico: Servico) => {
    setEditingServico(servico);
    setFormData({
      nome_servico: servico.nome_servico,
      preco: servico.preco.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir serviço:', error);
        toast.error('Erro ao excluir serviço');
        return;
      }
      
      toast.success('Serviço excluído com sucesso!');
      fetchServicos();
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast.error('Erro ao excluir serviço');
    }
  };

  const openNewModal = () => {
    setEditingServico(null);
    setFormData({ nome_servico: '', preco: '' });
    setShowModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os serviços oferecidos pela clínica
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-gold hover:bg-gold/90 text-sacha-dark-blue px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Serviço
        </button>
      </div>

      {/* Lista de Serviços */}
      <div className="bg-card rounded-xl border border-border p-6">
        {servicos.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum serviço cadastrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando os serviços que sua clínica oferece.
            </p>
            <button
              onClick={openNewModal}
              className="bg-gold hover:bg-gold/90 text-sacha-dark-blue px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Adicionar Primeiro Serviço
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {servicos.map((servico) => (
                  <tr key={servico.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-gold" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {servico.nome_servico}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-foreground">
                        <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                        {formatCurrency(servico.preco)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(servico.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(servico)}
                          className="text-gold hover:text-gold/80 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(servico.id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md mx-4 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gold hover:bg-gold/90 text-sacha-dark-blue px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingServico ? 'Atualizar' : 'Criar'} Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicos;
