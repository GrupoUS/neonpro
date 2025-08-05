'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Agenda;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var NeonGradientCard_1 = require("@/components/ui/NeonGradientCard");
var CosmicGlowButton_1 = require("@/components/ui/CosmicGlowButton");
var utils_1 = require("@/lib/utils");
// Dados mock para a agenda
var agendaData = {
    appointments: [
        {
            id: 1,
            patient: 'Maria Silva',
            phone: '(11) 99999-9999',
            date: new Date('2024-01-15T09:00:00'),
            type: 'Consulta Inicial',
            status: 'confirmado',
            room: 'Sala 01',
            doctor: 'Dr. João Oliveira'
        },
        {
            id: 2,
            patient: 'Carlos Santos',
            phone: '(11) 88888-8888',
            date: new Date('2024-01-15T10:30:00'),
            type: 'Retorno',
            status: 'pendente',
            room: 'Sala 02',
            doctor: 'Dra. Ana Costa'
        },
        {
            id: 3,
            patient: 'Fernanda Lima',
            phone: '(11) 77777-7777',
            date: new Date('2024-01-15T14:00:00'),
            type: 'Exame',
            status: 'confirmado',
            room: 'Sala 03',
            doctor: 'Dr. Pedro Silva'
        },
        {
            id: 4,
            patient: 'Roberto Costa',
            phone: '(11) 66666-6666',
            date: new Date('2024-01-15T15:30:00'),
            type: 'Consulta',
            status: 'cancelado',
            room: 'Sala 01',
            doctor: 'Dr. João Oliveira'
        }
    ],
    timeSlots: [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
    ]
};
var statusConfig = {
    confirmado: {
        color: 'success',
        icon: lucide_react_1.CheckCircle,
        label: 'Confirmado',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/30',
        textColor: 'text-success'
    },
    pendente: {
        color: 'warning',
        icon: lucide_react_1.AlertCircle,
        label: 'Pendente',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/30',
        textColor: 'text-warning'
    },
    cancelado: {
        color: 'danger',
        icon: lucide_react_1.XCircle,
        label: 'Cancelado',
        bgColor: 'bg-danger/10',
        borderColor: 'border-danger/30',
        textColor: 'text-danger'
    }
};
var AppointmentCard = function (_a) {
    var appointment = _a.appointment, index = _a.index;
    var statusInfo = statusConfig[appointment.status];
    var StatusIcon = statusInfo.icon;
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{
            scale: 1.02,
            y: -5,
            transition: {
                duration: 0.2,
                type: 'spring',
                stiffness: 400,
                damping: 17
            }
        }}>
      <NeonGradientCard_1.NeonGradientCard gradient={statusInfo.color} className="group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <lucide_react_1.User className="h-6 w-6 text-primary"/>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{appointment.patient}</h3>
              <p className="text-gray-400 text-sm flex items-center">
                <lucide_react_1.Phone className="h-4 w-4 mr-1"/>
                {appointment.phone}
              </p>
            </div>
          </div>
          <div className={"px-3 py-1 rounded-full border ".concat(statusInfo.bgColor, " ").concat(statusInfo.borderColor)}>
            <div className="flex items-center space-x-1">
              <StatusIcon className={"h-4 w-4 ".concat(statusInfo.textColor)}/>
              <span className={"text-sm font-medium ".concat(statusInfo.textColor)}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <lucide_react_1.Clock className="h-4 w-4 text-accent"/>
            <span className="text-sm">{(0, utils_1.formatTime)(appointment.date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <lucide_react_1.MapPin className="h-4 w-4 text-accent"/>
            <span className="text-sm">{appointment.room}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Tipo de Consulta</p>
            <p className="text-white font-medium">{appointment.type}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Médico Responsável</p>
            <p className="text-accent font-medium">{appointment.doctor}</p>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <CosmicGlowButton_1.CosmicGlowButton variant="primary" size="sm" className="flex-1">
            Editar
          </CosmicGlowButton_1.CosmicGlowButton>
          <CosmicGlowButton_1.CosmicGlowButton variant="success" size="sm" className="flex-1">
            Confirmar
          </CosmicGlowButton_1.CosmicGlowButton>
          <CosmicGlowButton_1.CosmicGlowButton variant="danger" size="sm" className="flex-1">
            Cancelar
          </CosmicGlowButton_1.CosmicGlowButton>
        </div>
      </NeonGradientCard_1.NeonGradientCard>
    </framer_motion_1.motion.div>);
};
function Agenda() {
    var _a = (0, react_1.useState)(new Date()), selectedDate = _a[0], setSelectedDate = _a[1];
    var _b = (0, react_1.useState)('list'), viewMode = _b[0], setViewMode = _b[1];
    var _c = (0, react_1.useState)('todos'), filterStatus = _c[0], setFilterStatus = _c[1];
    var _d = (0, react_1.useState)(''), searchTerm = _d[0], setSearchTerm = _d[1];
    var filteredAppointments = agendaData.appointments.filter(function (appointment) {
        var matchesSearch = appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesStatus = filterStatus === 'todos' || appointment.status === filterStatus;
        return matchesSearch && matchesStatus;
    });
    return (<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-background-position-spin">
      <div className="container mx-auto px-6 py-8">
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Agenda NEONPROV1
          </h1>
          <p className="text-gray-400">
            Gerencie consultas e horários médicos
          </p>
        </framer_motion_1.motion.div>

        {/* Controles superiores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <NeonGradientCard_1.NeonGradientCard gradient="primary">
            <div className="flex items-center space-x-3">
              <lucide_react_1.Calendar className="h-6 w-6 text-primary"/>
              <div>
                <p className="text-gray-400 text-sm">Data Selecionada</p>
                <p className="text-white font-semibold">{(0, utils_1.formatDate)(selectedDate)}</p>
              </div>
            </div>
          </NeonGradientCard_1.NeonGradientCard>

          <NeonGradientCard_1.NeonGradientCard gradient="secondary">
            <div className="relative">
              <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
              <input type="text" placeholder="Buscar paciente..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"/>
            </div>
          </NeonGradientCard_1.NeonGradientCard>

          <NeonGradientCard_1.NeonGradientCard gradient="accent">
            <div className="relative">
              <lucide_react_1.Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
              <select value={filterStatus} onChange={function (e) { return setFilterStatus(e.target.value); }} className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
                <option value="todos">Todos os Status</option>
                <option value="confirmado">Confirmados</option>
                <option value="pendente">Pendentes</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </NeonGradientCard_1.NeonGradientCard>

          <CosmicGlowButton_1.CosmicGlowButton variant="success" className="h-full flex items-center justify-center">
            <lucide_react_1.Plus className="h-5 w-5 mr-2"/>
            Nova Consulta
          </CosmicGlowButton_1.CosmicGlowButton>
        </div>

        {/* Lista de consultas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.AnimatePresence>
            {filteredAppointments.map(function (appointment, index) { return (<AppointmentCard key={appointment.id} appointment={appointment} index={index}/>); })}
          </framer_motion_1.AnimatePresence>
        </div>

        {filteredAppointments.length === 0 && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <NeonGradientCard_1.NeonGradientCard gradient="primary" className="max-w-md mx-auto">
              <lucide_react_1.Calendar className="h-16 w-16 text-accent mx-auto mb-4"/>
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma consulta encontrada
              </h3>
              <p className="text-gray-400 mb-4">
                Não há consultas que correspondam aos filtros selecionados.
              </p>
              <CosmicGlowButton_1.CosmicGlowButton variant="primary">
                Agendar Nova Consulta
              </CosmicGlowButton_1.CosmicGlowButton>
            </NeonGradientCard_1.NeonGradientCard>
          </framer_motion_1.motion.div>)}
      </div>
    </div>);
}
