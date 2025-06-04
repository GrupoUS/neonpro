
import React from 'react';
import { Plus, DollarSign, UserPlus } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      title: 'Novo Agendamento',
      icon: <Plus className="w-5 h-5" />,
      href: '/agenda/novo',
      primary: true,
    },
    {
      title: 'Novo Paciente',
      icon: <UserPlus className="w-5 h-5" />,
      href: '/clientes/novo',
      primary: false,
    },
    {
      title: 'Registrar Entrada/Saída',
      icon: <DollarSign className="w-5 h-5" />,
      href: '/financeiro/novo',
      primary: false,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-elegant border border-gray-100">
      <h2 className="text-lg font-serif font-semibold text-dark-blue mb-6">Ações Rápidas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className={`
              flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-medium transition-all duration-300
              ${action.primary
                ? 'gradient-gold text-white hover:shadow-lg transform hover:scale-105'
                : 'bg-light-gray/20 text-dark-blue hover:bg-light-gray/30 border border-light-gray/30'
              }
            `}
          >
            {action.icon}
            <span>{action.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
