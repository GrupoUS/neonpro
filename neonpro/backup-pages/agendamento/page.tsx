/**
 * Intelligent Scheduling System - Main Page
 * NeonPro Healthcare Management
 * 
 * Complete scheduling system with calendar view, appointment management,
 * conflict detection, and professional availability management
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Settings, 
  Plus, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  CalendarDays,
  Activity,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CalendarView from '@/components/scheduling/calendar-view';
import AppointmentForm from '@/components/scheduling/appointment-form';
import ProfessionalScheduleManager from '@/components/scheduling/professional-schedule-manager';
import ConflictDetection from '@/components/scheduling/conflict-detection';
import { useToast } from '@/hooks/use-toast';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

// Types
interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  service_type_id: string;
  status: string;
  start_time: string;
  end_time: string;
  notes?: string;
  priority: number;
  patients: {
    id: string;
    full_name: string;
    phone?: string;
  };
  professionals: {
    id: string;
    full_name: string;
    color: string;
  };
  service_types: {
    id: string;
    name: string;
    duration_minutes: number;
    color: string;
  };
}

const SchedulingSystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Handle appointment click
  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentForm(true);
  }, []);

  // Handle time slot click
  const handleTimeSlotClick = useCallback((date: Date, time: string, professionalId?: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedProfessional(professionalId || null);
    setSelectedAppointment(null);
    setShowAppointmentForm(true);
  }, []);

  // Handle create appointment
  const handleCreateAppointment = useCallback(() => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedProfessional(null);
    setSelectedAppointment(null);
    setShowAppointmentForm(true);
  }, []);

  // Handle appointment success
  const handleAppointmentSuccess = useCallback((appointmentId: string) => {
    toast({
      title: "Agendamento criado com sucesso!",
      description: `Agendamento ${appointmentId.slice(0, 8)}... foi criado com sucesso.`,
    });
    setShowAppointmentForm(false);
    setSelectedAppointment(null);
  }, [toast]);

  // Handle appointment form cancel
  const handleFormCancel = useCallback(() => {
    setShowAppointmentForm(false);
    setSelectedAppointment(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedProfessional(null);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
                Sistema de Agendamento Inteligente
              </h1>
              <p className="text-gray-600 mt-2">
                Gestão completa de agendamentos com detecção de conflitos em tempo real
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <Activity className="w-4 h-4 mr-2" />
                Sistema Ativo
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Agendamentos Hoje</p>
                    <p className="text-2xl font-bold text-blue-600">24</p>
                    <p className="text-xs text-gray-500">+2 desde ontem</p>
                  </div>
                  <CalendarIcon className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confirmados</p>
                    <p className="text-2xl font-bold text-green-600">18</p>
                    <p className="text-xs text-gray-500">75% confirmação</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conflitos</p>
                    <p className="text-2xl font-bold text-red-600">2</p>
                    <p className="text-xs text-gray-500">Resolvidos: 3</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                    <p className="text-2xl font-bold text-purple-600">82%</p>
                    <p className="text-xs text-gray-500">Meta: 85%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b">
                  <TabsList className="grid w-full grid-cols-5 rounded-none h-auto">
                    <TabsTrigger 
                      value="calendar" 
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      Agenda
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="professionals" 
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
                    >
                      <UserCheck className="w-4 h-4" />
                      Profissionais
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="conflicts" 
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Conflitos
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="reports" 
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Relatórios
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="settings" 
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700"
                    >
                      <Settings className="w-4 h-4" />
                      Configurações
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Calendar Tab */}
                <TabsContent value="calendar" className="p-6 space-y-6">
                  <CalendarView
                    onAppointmentClick={handleAppointmentClick}
                    onTimeSlotClick={handleTimeSlotClick}
                    onCreateAppointment={handleCreateAppointment}
                  />
                </TabsContent>

                {/* Professionals Tab */}
                <TabsContent value="professionals" className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Gestão de Profissionais</h2>
                      <p className="text-gray-600">Configure disponibilidade e horários de trabalho</p>
                    </div>
                  </div>
                  <ProfessionalScheduleManager />
                </TabsContent>

                {/* Conflicts Tab */}
                <TabsContent value="conflicts" className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Detecção de Conflitos</h2>
                      <p className="text-gray-600">Monitore e resolva conflitos de agendamento</p>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Sistema de Detecção Ativo</AlertTitle>
                    <AlertDescription>
                      O sistema está monitorando automaticamente todos os agendamentos para detectar conflitos em tempo real.
                    </AlertDescription>
                  </Alert>

                  <Card>
                    <CardHeader>
                      <CardTitle>Conflitos Ativos</CardTitle>
                      <CardDescription>Lista de conflitos que necessitam resolução</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhum conflito detectado
                        </h3>
                        <p className="text-gray-500">
                          Todos os agendamentos estão organizados sem conflitos no momento.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports" className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Relatórios e Analytics</h2>
                      <p className="text-gray-600">Análise de performance e ocupação</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Taxa de Ocupação
                        </CardTitle>
                        <CardDescription>Últimos 30 dias</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                          <p className="text-3xl font-bold text-blue-600 mb-2">82%</p>
                          <p className="text-gray-500">Taxa média de ocupação</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Horários Populares
                        </CardTitle>
                        <CardDescription>Padrões de agendamento</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">09:00 - 10:00</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded">
                                <div className="w-4/5 h-2 bg-blue-500 rounded"></div>
                              </div>
                              <span className="text-sm text-gray-600">80%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">14:00 - 15:00</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded">
                                <div className="w-3/5 h-2 bg-blue-500 rounded"></div>
                              </div>
                              <span className="text-sm text-gray-600">60%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">16:00 - 17:00</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded">
                                <div className="w-4/5 h-2 bg-blue-500 rounded"></div>
                              </div>
                              <span className="text-sm text-gray-600">85%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
                      <p className="text-gray-600">Configurações gerais e preferências</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notificações</CardTitle>
                        <CardDescription>Configure lembretes e alertas</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">WhatsApp Reminders</p>
                            <p className="text-sm text-gray-500">Lembretes via WhatsApp Business</p>
                          </div>
                          <Badge variant="outline">Em desenvolvimento</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">SMS Notifications</p>
                            <p className="text-sm text-gray-500">Confirmações por SMS</p>
                          </div>
                          <Badge variant="outline">Em desenvolvimento</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Alerts</p>
                            <p className="text-sm text-gray-500">Alertas por email</p>
                          </div>
                          <Badge variant="default">Ativo</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Integrações</CardTitle>
                        <CardDescription>Conecte com sistemas externos</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">WhatsApp Business API</p>
                            <p className="text-sm text-gray-500">Confirmações automáticas</p>
                          </div>
                          <Badge variant="outline">Configurar</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Sala de Espera Virtual</p>
                            <p className="text-sm text-gray-500">Status em tempo real</p>
                          </div>
                          <Badge variant="outline">Em desenvolvimento</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Appointment Form Dialog */}
          <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sr-only">
                <DialogTitle>
                  {selectedAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                </DialogTitle>
                <DialogDescription>
                  Formulário para criar ou editar agendamentos
                </DialogDescription>
              </DialogHeader>
              
              <AppointmentForm
                selectedDate={selectedDate || undefined}
                selectedTime={selectedTime || undefined}
                selectedProfessional={selectedProfessional || undefined}
                editingAppointment={selectedAppointment ? {
                  id: selectedAppointment.id,
                  patient_id: selectedAppointment.patient_id,
                  professional_id: selectedAppointment.professional_id,
                  service_type_id: selectedAppointment.service_type_id,
                  start_time: selectedAppointment.start_time,
                  end_time: selectedAppointment.end_time,
                  notes: selectedAppointment.notes,
                  internal_notes: '',
                  priority: selectedAppointment.priority,
                } : undefined}
                onSuccess={handleAppointmentSuccess}
                onCancel={handleFormCancel}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* React Query DevTools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default SchedulingSystemPage;