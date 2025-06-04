
import React from 'react';
import { Calendar, Clock, User, Plus } from 'lucide-react';

const Agenda: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie todos os agendamentos
          </p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Agenda em desenvolvimento
          </h3>
          <p className="text-muted-foreground">
            A visualização da agenda será implementada em breve.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
