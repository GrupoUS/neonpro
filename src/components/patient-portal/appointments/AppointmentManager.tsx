'use client';

import { useState } from 'react';
import { Calendar, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppointmentBooking } from './AppointmentBooking';
import { AppointmentList } from './AppointmentList';

type AppointmentView = 'list' | 'booking' | 'success';

interface AppointmentSuccessData {
  id: string;
  professional_name: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
}

export function AppointmentManager() {
  const [currentView, setCurrentView] = useState<AppointmentView>('list');
  const [successData, setSuccessData] = useState<AppointmentSuccessData | null>(null);

  const handleBookingSuccess = (appointment: any) => {
    setSuccessData({
      id: appointment.id,
      professional_name: appointment.professional?.name || 'Profissional',
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      duration_minutes: appointment.duration_minutes
    });
    setCurrentView('success');
  };

  const handleNewAppointment = () => {
    setCurrentView('booking');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSuccessData(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  if (currentView === 'success' && successData) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
              Agendamento Confirmado!
            </h2>
            
            <p className="text-green-700 dark:text-green-300 mb-6">
              Sua consulta foi agendada com sucesso. Você receberá uma confirmação por e-mail.
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Detalhes do Agendamento
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(successData.appointment_date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatTime(successData.appointment_time)} ({successData.duration_minutes} minutos)
                    </p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Profissional: <span className="font-medium text-gray-900 dark:text-white">
                      {successData.professional_name}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleBackToList} className="w-full max-w-xs">
                Ver Meus Agendamentos
              </Button>
              
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={handleNewAppointment}
                  className="text-green-600 hover:text-green-700 dark:text-green-400"
                >
                  Agendar Outra Consulta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>
                  <strong>Confirmação:</strong> Você receberá um e-mail de confirmação com todos os detalhes da consulta.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>
                  <strong>Reagendamento:</strong> Caso precise reagendar, faça-o com pelo menos 2 horas de antecedência.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>
                  <strong>Chegada:</strong> Recomendamos chegar 15 minutos antes do horário agendado.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>
                  <strong>Documentos:</strong> Não esqueça de trazer um documento de identificação com foto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === 'booking') {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div>
          <Button
            variant="ghost"
            onClick={handleBackToList}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← Voltar para Agendamentos
          </Button>
        </div>

        <AppointmentBooking
          clinicId="default" // This would come from context/props in a real implementation
          onSuccess={handleBookingSuccess}
          onCancel={handleBackToList}
        />
      </div>
    );
  }

  // Default view: appointment list
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                Bem-vindo ao Portal de Agendamentos
              </h1>
              <p className="text-blue-700 dark:text-blue-300">
                Gerencie suas consultas de forma prática e segura
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleNewAppointment}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Nova Consulta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleNewAppointment}>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Agendar Consulta
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Escolha data e horário disponível
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Consultas Hoje
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Veja seus agendamentos de hoje
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <ArrowRight className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Histórico
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consulte seu histórico completo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <AppointmentList onNewAppointment={handleNewAppointment} />
    </div>
  );
}