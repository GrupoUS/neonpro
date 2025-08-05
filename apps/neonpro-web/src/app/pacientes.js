"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Pacientes;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var NeonGradientCard_1 = require("@/components/ui/NeonGradientCard");
var CosmicGlowButton_1 = require("@/components/ui/CosmicGlowButton");
var utils_1 = require("@/lib/utils");
// Dados mock para pacientes
var pacientesData = {
  patients: [
    {
      id: 1,
      name: "Maria Silva Santos",
      email: "maria.silva@email.com",
      phone: "(11) 99999-9999",
      cpf: "123.456.789-00",
      birthDate: new Date("1985-03-15"),
      address: "Rua das Flores, 123 - São Paulo, SP",
      lastVisit: new Date("2024-01-10"),
      status: "ativo",
      plan: "Premium",
      consultations: 15,
      gender: "Feminino",
    },
    {
      id: 2,
      name: "João Carlos Oliveira",
      email: "joao.oliveira@email.com",
      phone: "(11) 88888-8888",
      cpf: "987.654.321-00",
      birthDate: new Date("1978-07-22"),
      address: "Av. Paulista, 456 - São Paulo, SP",
      lastVisit: new Date("2024-01-08"),
      status: "ativo",
      plan: "Básico",
      consultations: 8,
      gender: "Masculino",
    },
    {
      id: 3,
      name: "Ana Paula Costa",
      email: "ana.costa@email.com",
      phone: "(11) 77777-7777",
      cpf: "456.789.123-00",
      birthDate: new Date("1992-11-30"),
      address: "Rua Augusta, 789 - São Paulo, SP",
      lastVisit: new Date("2023-12-20"),
      status: "inativo",
      plan: "Standard",
      consultations: 3,
      gender: "Feminino",
    },
    {
      id: 4,
      name: "Pedro Henrique Lima",
      email: "pedro.lima@email.com",
      phone: "(11) 66666-6666",
      cpf: "789.123.456-00",
      birthDate: new Date("1988-09-12"),
      address: "Rua Oscar Freire, 321 - São Paulo, SP",
      lastVisit: new Date("2024-01-12"),
      status: "ativo",
      plan: "Premium",
      consultations: 22,
      gender: "Masculino",
    },
  ],
  stats: {
    total: 1247,
    active: 1156,
    inactive: 91,
    newThisMonth: 23,
  },
};
var statusConfig = {
  ativo: {
    color: "success",
    label: "Ativo",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
    textColor: "text-success",
  },
  inativo: {
    color: "danger",
    label: "Inativo",
    bgColor: "bg-danger/10",
    borderColor: "border-danger/30",
    textColor: "text-danger",
  },
};
var planConfig = {
  Básico: { color: "secondary", gradient: "secondary" },
  Standard: { color: "accent", gradient: "accent" },
  Premium: { color: "warning", gradient: "warning" },
};
var PatientCard = function (_a) {
  var patient = _a.patient,
    index = _a.index;
  var statusInfo = statusConfig[patient.status];
  var planInfo = planConfig[patient.plan];
  var age = new Date().getFullYear() - patient.birthDate.getFullYear();
  return (
    <framer_motion_1.motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{
        scale: 1.02,
        y: -5,
        transition: {
          duration: 0.2,
          type: "spring",
          stiffness: 400,
          damping: 17,
        },
      }}
    >
      <NeonGradientCard_1.NeonGradientCard gradient={planInfo.gradient} className="group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <lucide_react_1.User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{patient.name}</h3>
              <p className="text-gray-400 text-sm">
                {patient.gender} • {age} anos
              </p>
              <div
                className={"inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 "
                  .concat(statusInfo.bgColor, " ")
                  .concat(statusInfo.borderColor, " border")}
              >
                <span className={statusInfo.textColor}>{statusInfo.label}</span>
              </div>
            </div>
          </div>
          <div
            className={"px-3 py-1 rounded-full bg-"
              .concat(planInfo.color, "/20 border border-")
              .concat(planInfo.color, "/30")}
          >
            <span className={"text-sm font-medium text-".concat(planInfo.color)}>
              {patient.plan}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-300">
              <lucide_react_1.Mail className="h-4 w-4 text-accent" />
              <span className="text-sm">{patient.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <lucide_react_1.Phone className="h-4 w-4 text-accent" />
              <span className="text-sm">{patient.phone}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-300">
              <lucide_react_1.Calendar className="h-4 w-4 text-accent" />
              <span className="text-sm">
                Última visita: {(0, utils_1.formatDate)(patient.lastVisit)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <lucide_react_1.Activity className="h-4 w-4 text-accent" />
              <span className="text-sm">{patient.consultations} consultas</span>
            </div>
          </div>
        </div>

        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <lucide_react_1.MapPin className="h-4 w-4 text-accent" />
            <span className="text-gray-400 text-sm">Endereço</span>
          </div>
          <p className="text-white text-sm">{patient.address}</p>
        </div>

        <div className="flex space-x-2">
          <CosmicGlowButton_1.CosmicGlowButton
            variant="primary"
            size="sm"
            className="flex-1 flex items-center justify-center"
          >
            <lucide_react_1.Eye className="h-4 w-4 mr-1" />
            Visualizar
          </CosmicGlowButton_1.CosmicGlowButton>
          <CosmicGlowButton_1.CosmicGlowButton
            variant="secondary"
            size="sm"
            className="flex-1 flex items-center justify-center"
          >
            <lucide_react_1.Edit className="h-4 w-4 mr-1" />
            Editar
          </CosmicGlowButton_1.CosmicGlowButton>
          <CosmicGlowButton_1.CosmicGlowButton
            variant="success"
            size="sm"
            className="flex-1 flex items-center justify-center"
          >
            <lucide_react_1.Calendar className="h-4 w-4 mr-1" />
            Agendar
          </CosmicGlowButton_1.CosmicGlowButton>
        </div>
      </NeonGradientCard_1.NeonGradientCard>
    </framer_motion_1.motion.div>
  );
};
var StatCard = function (_a) {
  var Icon = _a.icon,
    title = _a.title,
    value = _a.value,
    gradient = _a.gradient,
    subtitle = _a.subtitle;
  return (
    <NeonGradientCard_1.NeonGradientCard gradient={gradient} className="group">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <framer_motion_1.motion.p
            className="text-3xl font-bold text-white"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {value}
          </framer_motion_1.motion.p>
          {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
          <Icon className="h-8 w-8 text-accent" />
        </div>
      </div>
    </NeonGradientCard_1.NeonGradientCard>
  );
};
function Pacientes() {
  var _a = (0, react_1.useState)(""),
    searchTerm = _a[0],
    setSearchTerm = _a[1];
  var _b = (0, react_1.useState)("todos"),
    filterStatus = _b[0],
    setFilterStatus = _b[1];
  var _c = (0, react_1.useState)("todos"),
    filterPlan = _c[0],
    setFilterPlan = _c[1];
  var filteredPatients = pacientesData.patients.filter(function (patient) {
    var matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
    var matchesStatus = filterStatus === "todos" || patient.status === filterStatus;
    var matchesPlan = filterPlan === "todos" || patient.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-background-position-spin">
      <div className="container mx-auto px-6 py-8">
        <framer_motion_1.motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Pacientes NEONPROV1</h1>
          <p className="text-gray-400">Gerencie informações dos pacientes</p>
        </framer_motion_1.motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={lucide_react_1.Users}
            title="Total de Pacientes"
            value={pacientesData.stats.total}
            gradient="primary"
            subtitle="Registrados no sistema"
          />
          <StatCard
            icon={lucide_react_1.UserPlus}
            title="Pacientes Ativos"
            value={pacientesData.stats.active}
            gradient="success"
            subtitle="Com consultas recentes"
          />
          <StatCard
            icon={lucide_react_1.Activity}
            title="Pacientes Inativos"
            value={pacientesData.stats.inactive}
            gradient="danger"
            subtitle="Sem consultas há 3+ meses"
          />
          <StatCard
            icon={lucide_react_1.Calendar}
            title="Novos Este Mês"
            value={pacientesData.stats.newThisMonth}
            gradient="accent"
            subtitle="Cadastrados em janeiro"
          />
        </div>

        {/* Controles de filtro */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="md:col-span-2">
            <NeonGradientCard_1.NeonGradientCard gradient="secondary">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={function (e) {
                    return setSearchTerm(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </NeonGradientCard_1.NeonGradientCard>
          </div>

          <NeonGradientCard_1.NeonGradientCard gradient="accent">
            <div className="relative">
              <lucide_react_1.Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={function (e) {
                  return setFilterStatus(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </NeonGradientCard_1.NeonGradientCard>

          <NeonGradientCard_1.NeonGradientCard gradient="warning">
            <div className="relative">
              <lucide_react_1.FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterPlan}
                onChange={function (e) {
                  return setFilterPlan(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
              >
                <option value="todos">Todos os Planos</option>
                <option value="Básico">Básico</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
          </NeonGradientCard_1.NeonGradientCard>

          <CosmicGlowButton_1.CosmicGlowButton
            variant="success"
            className="h-full flex items-center justify-center"
          >
            <lucide_react_1.Plus className="h-5 w-5 mr-2" />
            Novo Paciente
          </CosmicGlowButton_1.CosmicGlowButton>
        </div>

        {/* Lista de pacientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.AnimatePresence>
            {filteredPatients.map(function (patient, index) {
              return <PatientCard key={patient.id} patient={patient} index={index} />;
            })}
          </framer_motion_1.AnimatePresence>
        </div>

        {filteredPatients.length === 0 && (
          <framer_motion_1.motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <NeonGradientCard_1.NeonGradientCard gradient="primary" className="max-w-md mx-auto">
              <lucide_react_1.Users className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum paciente encontrado</h3>
              <p className="text-gray-400 mb-4">
                Não há pacientes que correspondam aos filtros selecionados.
              </p>
              <CosmicGlowButton_1.CosmicGlowButton variant="primary">
                Cadastrar Novo Paciente
              </CosmicGlowButton_1.CosmicGlowButton>
            </NeonGradientCard_1.NeonGradientCard>
          </framer_motion_1.motion.div>
        )}
      </div>
    </div>
  );
}
