
interface Appointment {
  id: string;
  time: string;
  patient: string;
  service: string;
  professional: string;
  status: 'scheduled' | 'completed' | 'canceled';
}

export function AppointmentsList() {
  const appointments: Appointment[] = [
    {
      id: '1',
      time: '09:00',
      patient: 'Ana Silva',
      service: 'Limpeza de Pele',
      professional: 'Dra. Maria',
      status: 'scheduled',
    },
    {
      id: '2',
      time: '10:30',
      patient: 'Carlos Santos',
      service: 'Botox',
      professional: 'Dra. Maria',
      status: 'scheduled',
    },
    {
      id: '3',
      time: '14:00',
      patient: 'Lucia Oliveira',
      service: 'Preenchimento',
      professional: 'Dra. Patricia',
      status: 'completed',
    },
    {
      id: '4',
      time: '15:30',
      patient: 'Roberto Lima',
      service: 'Peeling',
      professional: 'Dra. Maria',
      status: 'scheduled',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'completed':
        return 'Concluído';
      case 'canceled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-elegant border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Próximos Agendamentos</h2>
          <a 
            href="/agenda" 
            className="text-gold hover:text-gold-light font-medium text-sm transition-colors duration-200"
          >
            Ver todos →
          </a>
        </div>
      </div>
      
      <div className="overflow-hidden">
        {appointments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {appointments.map((appointment, index) => (
              <div 
                key={appointment.id} 
                className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {appointment.time}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {appointment.patient}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.service} • {appointment.professional}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span 
                      className={`
                        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                        ${getStatusColor(appointment.status)}
                      `}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-gray-500">Nenhum agendamento para exibir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
