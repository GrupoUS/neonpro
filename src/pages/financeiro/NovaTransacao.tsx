
import React from 'react';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const NovaTransacao: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to="/financeiro" 
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nova Transação</h1>
          <p className="text-muted-foreground mt-1">
            Registre uma nova entrada ou saída financeira
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Formulário em desenvolvimento
          </h3>
          <p className="text-muted-foreground">
            O formulário de nova transação será implementado em breve.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NovaTransacao;
