
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useServicos } from '@/hooks/useServicos';
import ServicoTable from '@/components/servicos/ServicoTable';
import ServicoModal from '@/components/servicos/ServicoModal';
import ServicoEmptyState from '@/components/servicos/ServicoEmptyState';
import { Button } from '@/components/ui/button';

interface Servico {
  id: string;
  user_id: string;
  nome_servico: string;
  preco: number;
  created_at: string;
}

const Servicos: React.FC = () => {
  const { user } = useAuth();
  const { servicos, loading, createServico, updateServico, deleteServico } = useServicos();
  
  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [formData, setFormData] = useState({
    nome_servico: '',
    preco: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const servicoData = {
      nome_servico: formData.nome_servico,
      preco: parseFloat(formData.preco)
    };

    let success = false;
    if (editingServico) {
      success = await updateServico(editingServico.id, servicoData);
    } else {
      success = await createServico(servicoData);
    }

    if (success) {
      setFormData({ nome_servico: '', preco: '' });
      setShowModal(false);
      setEditingServico(null);
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
    
    await deleteServico(id);
  };

  const openNewModal = () => {
    setEditingServico(null);
    setFormData({ nome_servico: '', preco: '' });
    setShowModal(true);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neon-brand">Serviços</h1>
          <p className="text-neon-subtitle mt-1">
            Gerencie os serviços oferecidos pela clínica
          </p>
        </div>
        <Button
          onClick={openNewModal}
          className="btn-neon-gradient"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Lista de Serviços */}
      <div className="card-neon">
        {servicos.length === 0 ? (
          <ServicoEmptyState onAddFirst={openNewModal} />
        ) : (
          <ServicoTable
            servicos={servicos}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modal */}
      <ServicoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingServico}
      />
    </div>
  );
};

export default Servicos;
