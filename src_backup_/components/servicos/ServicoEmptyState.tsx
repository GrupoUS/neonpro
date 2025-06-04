
import React from 'react';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServicoEmptyStateProps {
  onAddFirst: () => void;
}

const ServicoEmptyState: React.FC<ServicoEmptyStateProps> = ({ onAddFirst }) => {
  return (
    <div className="text-center py-12">
      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        Nenhum serviço cadastrado
      </h3>
      <p className="text-muted-foreground mb-4">
        Comece adicionando os serviços que sua clínica oferece.
      </p>
      <Button
        onClick={onAddFirst}
        className="bg-gold hover:bg-gold/90 text-sacha-dark-blue"
      >
        Adicionar Primeiro Serviço
      </Button>
    </div>
  );
};

export default ServicoEmptyState;
