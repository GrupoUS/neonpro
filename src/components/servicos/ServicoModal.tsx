
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ServicoForm from './ServicoForm';

interface ServicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    nome_servico: string;
    preco: string;
  };
  setFormData: (data: { nome_servico: string; preco: string }) => void;
  isEditing: boolean;
}

const ServicoModal: React.FC<ServicoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
        </DialogHeader>
        <ServicoForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          isEditing={isEditing}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServicoModal;
