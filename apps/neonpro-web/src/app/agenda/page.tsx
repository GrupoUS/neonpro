"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Plus,
  RefreshCw,
  X,
  Check,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  MapPin,
  Phone,
  Grid3X3,
  List,
  Settings
} from 'lucide-react';

// NeonGradientCard Component - MANTENDO EXATO PADRÃO DO DASHBOARD
const NeonGradientCard = ({ children, className = '', ...props }: any) => (
  <Card className={`relative overflow-hidden border-0 bg-gradient-to-br from-slate-900/90 via-blue-900/20 to-slate-900/90 backdrop-blur-sm ${className}`} {...props}>
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-emerald-500/10 animate-background-position-spin" />
    <div className="relative z-10">
      {children}
    </div>
  </Card>
);

// CosmicGlowButton Component - MANTENDO EXATO PADRÃO DO DASHBOARD
const CosmicGlowButton = ({ children, variant = "default", className = "", ...props }: any) => {
  const baseClasses = "relative overflow-hidden font-medium transition-all duration-300 transform hover:scale-105";
  
  const variants = {
    default: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/25",
    emerald: "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg hover:shadow-emerald-500/25",
    amber: "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg hover:shadow-amber-500/25",
    red: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg hover:shadow-red-500/25",
    outline: "border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400"
  };

  return (
    <Button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-glow-slide" />
      <span className="relative z-10">{children}</span>
    </Button>
  );
};

const AgendaPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // calendar, timeline, grid
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Mock data for appointments - MANTENDO DADOS BRASILEIROS
  const appointments = [
    {
      id: 1,
      patient: "Maria Silva",
      treatment: "Harmonização Facial",
      time: "09:00",
      endTime: "11:00",
      duration: "2h",
      status: "confirmado",
      phone: "(11) 99999-1234",
      value: "R$ 1.200,00",
      notes: "Primeira sessão - Ácido Hialurônico",
      professional: "Dra. Ana Paula"
    },
    {
      id: 2,
      patient: "Ana Costa",
      treatment: "Botox Preventivo",
      time: "11:30",
      endTime: "12:30",
      duration: "1h",
      status: "pendente",
      phone: "(11) 99999-5678",
      value: "R$ 800,00",
      notes: "Região da testa e glabela",
      professional: "Dra. Carolina"
    },
    {
      id: 3,
      patient: "Julia Santos",
      treatment: "Preenchimento Labial",
      time: "14:00",
      endTime: "15:30",
      duration: "1h30",
      status: "confirmado",
      phone: "(11) 99999-9012",
      value: "R$ 900,00",
      notes: "Aumento de volume moderado",
      professional: "Dra. Ana Paula"
    },
    {
      id: 4,
      patient: "Carla Mendes",
      treatment: "Limpeza de Pele",
      time: "16:00",
      endTime: "17:00",
      duration: "1h",
      status: "concluido",
      phone: "(11) 99999-3456",
      value: "R$ 150,00",
      notes: "Limpeza profunda + hidratação",
      professional: "Esteticista Marina"
    }
  ];

  // KPIs - MANTENDO PADRÃO DE CORES DO DASHBOARD
  const kpis = [
    {
      title: "Agendamentos Hoje",
      value: "12",
      change: "+8%",
      trend: "up",
      icon: Calendar,
      color: "text-blue-400",
      gradient: "from-blue-500/20 to-blue-600/20"
    },
    {
      title: "Procedimentos Semana",
      value: "47",
      change: "+15%",
      trend: "up", 
      icon: Activity,
      color: "text-emerald-400",
      gradient: "from-emerald-500/20 to-emerald-600/20"
    },
    {
      title: "Taxa Ocupação",
      value: "85%",
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
      color: "text-amber-400",
      gradient: "from-amber-500/20 to-amber-600/20"
    },
    {
      title: "Receita Prevista",
      value: "R$ 18.500",
      change: "+22%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-400",
      gradient: "from-green-500/20 to-green-600/20"
    }
  ];

  // MANTENDO CORES EXATAS DO DASHBOARD
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'pendente':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'cancelado':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'concluido':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'confirmado': 'Confirmado',
      'pendente': 'Pendente',
      'cancelado': 'Cancelado', 
      'concluido': 'Concluído'
    };
    return labels[status] || status;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Componente de Calendário Mini
  const MiniCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const daysWithAppointments = [3, 7, 12, 15, 18, 22, 25, 28]; // Mock days with appointments
    
    const renderCalendarDays = () => {
      const days = [];
      
      // Empty cells for days before month starts
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8"></div>);
      }
      
      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate();
        const hasAppointments = daysWithAppointments.includes(day);
        
        days.push(
          <div
            key={day}
            className={`h-8 w-8 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all duration-200 ${
              isToday 
                ? 'bg-blue-600 text-white font-bold' 
                : hasAppointments
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            {day}
          </div>
        );
      }
      
      return days;
    };
    
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">
            {today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex space-x-1">
            <button className="p-1 hover:bg-slate-700/50 rounded">
              <ChevronLeft className="h-4 w-4 text-slate-400" />
            </button>
            <button className="p-1 hover:bg-slate-700/50 rounded">
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs text-slate-500 font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>
    );
  };  // Componente de Cartão de Agendamento
  const AppointmentCard = ({ appointment }: any) => (
    <div className="group relative p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 hover:scale-102">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                {appointment.patient}
              </h3>
              <p className="text-sm text-slate-400">{appointment.professional}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(appointment.status)}`}>
            {getStatusLabel(appointment.status)}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span className="text-white font-medium">{appointment.treatment}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Clock className="h-4 w-4" />
            <span>{appointment.time} - {appointment.endTime} ({appointment.duration})</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Phone className="h-4 w-4" />
            <span>{appointment.phone}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-emerald-400 font-bold">{appointment.value}</span>
          <div className="flex items-center space-x-2">
            <CosmicGlowButton variant="outline" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </CosmicGlowButton>
            <CosmicGlowButton variant="outline" className="h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
            </CosmicGlowButton>
          </div>
        </div>
        
        {appointment.notes && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <p className="text-xs text-slate-400">{appointment.notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 text-white">
      {/* Animated Background - MANTENDO EXATO PADRÃO DO DASHBOARD */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-emerald-600/10 animate-glow-scale" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Agenda de Procedimentos
            </h1>
            <p className="text-slate-400 mt-1">
              Gerencie agendamentos e procedimentos estéticos
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <CosmicGlowButton variant="outline" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </CosmicGlowButton>
            <CosmicGlowButton className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo Agendamento</span>
            </CosmicGlowButton>
          </div>
        </div>

        {/* KPIs - MANTENDO EXATO PADRÃO DO DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <NeonGradientCard key={index} className="group hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 font-medium">{kpi.title}</p>
                    <p className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                      {kpi.value}
                    </p>
                    <p className={`text-sm flex items-center space-x-1 ${kpi.color}`}>
                      <TrendingUp className="h-3 w-3" />
                      <span>{kpi.change}</span>
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${kpi.gradient} group-hover:scale-110 transition-transform`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </NeonGradientCard>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar paciente ou procedimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filters and View Mode */}
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="todos">Todos os Status</option>
              <option value="confirmado">Confirmados</option>
              <option value="pendente">Pendentes</option>
              <option value="concluido">Concluídos</option>
            </select>
            
            <div className="flex items-center space-x-1 bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded text-sm transition-all ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded text-sm transition-all ${
                  viewMode === 'timeline' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded text-sm transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* LAYOUT PRINCIPAL - DISPOSIÇÃO DIFERENTE DO DASHBOARD */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Coluna 1: Mini Calendário */}
          <div className="xl:col-span-1">
            <NeonGradientCard className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <span>Calendário</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MiniCalendar />
              </CardContent>
            </NeonGradientCard>
          </div>          {/* Coluna 2-3: Área Principal de Agendamentos */}
          <div className="xl:col-span-2">
            <NeonGradientCard>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Clock className="h-5 w-5 text-emerald-400" />
                    <span>{formatDate(selectedDate)}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <CosmicGlowButton variant="outline" className="h-10 w-10 p-0">
                      <ChevronLeft className="h-4 w-4" />
                    </CosmicGlowButton>
                    <CosmicGlowButton variant="outline" className="h-10 w-10 p-0">
                      <ChevronRight className="h-4 w-4" />
                    </CosmicGlowButton>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  {appointments.length} agendamentos para hoje
                </p>
              </CardHeader>
              <CardContent>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {appointments.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                ) : viewMode === 'timeline' ? (
                  <div className="space-y-4">
                    {appointments.map((appointment, index) => (
                      <div key={appointment.id} className="flex items-start space-x-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                          {index < appointments.length - 1 && (
                            <div className="w-px h-16 bg-slate-700 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-blue-400 font-mono text-sm">{appointment.time}</span>
                              <span className="font-semibold text-white">{appointment.patient}</span>
                              <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                                {getStatusLabel(appointment.status)}
                              </Badge>
                            </div>
                            <span className="text-emerald-400 font-medium">{appointment.value}</span>
                          </div>
                          <div className="text-sm text-slate-400 mb-2">
                            <span className="text-emerald-300">{appointment.treatment}</span> • {appointment.professional}
                          </div>
                          <div className="text-xs text-slate-500">{appointment.notes}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Calendar view - Grade de horários
                  <div className="space-y-2">
                    {Array.from({ length: 10 }, (_, i) => {
                      const hour = 9 + i;
                      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                      const appointment = appointments.find(apt => apt.time === timeSlot);
                      
                      return (
                        <div key={timeSlot} className="flex items-center space-x-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200">
                          <div className="text-sm font-mono text-blue-400 min-w-[60px]">
                            {timeSlot}
                          </div>
                          {appointment ? (
                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <User className="h-4 w-4 text-slate-400" />
                                <span className="font-medium text-white">{appointment.patient}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-emerald-300">{appointment.treatment}</span>
                                <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                                  {getStatusLabel(appointment.status)}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-emerald-400 font-medium">{appointment.value}</span>
                                <div className="flex items-center space-x-1">
                                  <CosmicGlowButton variant="outline" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4" />
                                  </CosmicGlowButton>
                                  <CosmicGlowButton variant="outline" className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4" />
                                  </CosmicGlowButton>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-center py-4 text-slate-500">
                              <span className="text-sm">Horário disponível</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </NeonGradientCard>
          </div>

          {/* Coluna 4: Painel Lateral */}
          <div className="xl:col-span-1 space-y-6">
            {/* Ações Rápidas */}
            <NeonGradientCard>
              <CardHeader>
                <CardTitle className="text-white">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CosmicGlowButton className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </CosmicGlowButton>
                <CosmicGlowButton variant="amber" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reagendar
                </CosmicGlowButton>
                <CosmicGlowButton variant="emerald" className="w-full justify-start">
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar Presença
                </CosmicGlowButton>
                <CosmicGlowButton variant="red" className="w-full justify-start">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </CosmicGlowButton>
              </CardContent>
            </NeonGradientCard>

            {/* Próximos Agendamentos */}
            <NeonGradientCard>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Users className="h-5 w-5 text-emerald-400" />
                  <span>Próximos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white text-sm">{appointment.patient}</span>
                      <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-3 w-3" />
                        <span>{appointment.treatment}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-emerald-400">{appointment.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </NeonGradientCard>

            {/* Estatísticas Rápidas */}
            <NeonGradientCard>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Activity className="h-5 w-5 text-amber-400" />
                  <span>Resumo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="text-lg font-bold text-emerald-300">8</div>
                    <div className="text-xs text-emerald-400">Confirmados</div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                    <div className="text-lg font-bold text-amber-300">3</div>
                    <div className="text-xs text-amber-400">Pendentes</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 text-center">
                  <div className="text-xl font-bold text-emerald-300">R$ 4.850</div>
                  <div className="text-xs text-slate-400">Total Previsto</div>
                </div>
              </CardContent>
            </NeonGradientCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaPage;