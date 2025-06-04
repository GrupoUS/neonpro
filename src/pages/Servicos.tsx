
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useServicos } from '@/hooks/useServicos';
import ServicoTable from '@/components/servicos/ServicoTable';
import ServicoModal from '@/components/servicos/ServicoModal';
import ServicoEmptyState from '@/components/servicos/ServicoEmptyState';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/supabase';

type ServiceRow = Database['public']['Tables']['services']['Row'];

const Servicos: React.FC = () => {
  const { user } = useAuth();
  const { servicos, loading, createServico, updateServico, deleteServico } = useServicos();
  
  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState<ServiceRow | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_minutes: '60',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const servicoData = {
      name: formData.name,
      price: parseFloat(formData.price),
      duration_minutes: parseInt(formData.duration_minutes) || 60,
      description: formData.description || undefined
    };

    let success = false;
    if (editingServico) {
      success = await updateServico(editingServico.id, servicoData);
    } else {
      success = await createServico(servicoData);
    }

    if (success) {
      setFormData({ name: '', price: '', duration_minutes: '60', description: '' });
      setShowModal(false);
      setEditingServico(null);
    }
  };

  const handleEdit = (servico: ServiceRow) => {
    setEditingServico(servico);
    setFormData({
      name: servico.name,
      price: servico.price.toString(),
      duration_minutes: servico.duration_minutes.toString(),
      description: servico.description || ''
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
    setFormData({ name: '', price: '', duration_minutes: '60', description: '' });
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
