/**
 * Waiting Room Component
 * Displays patients waiting for telemedicine consultations
 */

import { createFileRoute } from '@tanstack/react-router';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Headphones,
  Phone,
  Shield,
  Timer,
  UserCheck,
  Users,
  Video,
} from 'lucide-react';

import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/telemedicine/waiting-room')({
  component: WaitingRoom,
});

function WaitingRoom() {
  // Mock data - will be replaced with real tRPC calls
  const waitingPatients = [
    {
      id: 'patient-1',
      name: 'Maria Silva',
      appointmentTime: '14:30',
      waitTime: 5,
      status: 'ready',
      avatar: null,
      connectionQuality: 'excellent',
      deviceStatus: 'verified',
      consentStatus: 'signed',
      priority: 'normal',
      type: 'follow-up',
    },
    {
      id: 'patient-2',
      name: 'João Santos',
      appointmentTime: '15:00',
      waitTime: 2,
      status: 'connecting',
      avatar: null,
      connectionQuality: 'good',
      deviceStatus: 'pending',
      consentStatus: 'pending',
      priority: 'urgent',
      type: 'first-consultation',
    },
    {
      id: 'patient-3',
      name: 'Ana Costa',
      appointmentTime: '15:30',
      waitTime: 0,
      status: 'waiting',
      avatar: null,
      connectionQuality: 'poor',
      deviceStatus: 'verified',
      consentStatus: 'signed',
      priority: 'normal',
      type: 'routine',
    },
  ];

  const getInitials = (_name: [a-zA-Z][a-zA-Z]*) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (_status: [a-zA-Z][a-zA-Z]*) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'connecting':
        return 'bg-blue-100 text-blue-800';
      case 'waiting':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectionIcon = (_quality: [a-zA-Z][a-zA-Z]*) => {
    switch (quality) {
      case 'excellent':
        return <div className='w-2 h-2 bg-green-500 rounded-full'></div>;
      case 'good':
        return <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>;
      case 'poor':
        return <div className='w-2 h-2 bg-red-500 rounded-full'></div>;
      default:
        return <div className='w-2 h-2 bg-gray-500 rounded-full'></div>;
    }
  };

  const getPriorityBadge = (_priority: [a-zA-Z][a-zA-Z]*) => {
    if (priority === 'urgent') {
      return (
        <Badge variant='destructive' className='text-xs'>
          Urgente
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Sala de Espera</h1>
          <p className='text-muted-foreground'>
            {waitingPatients.length} pacientes aguardando consulta
          </p>
        </div>

        <div className='flex items-center space-x-2'>
          <Button variant='outline' size='sm'>
            <Bell className='h-4 w-4 mr-2' />
            Notificações
          </Button>
          <Button size='sm'>
            <Video className='h-4 w-4 mr-2' />
            Chamar Próximo
          </Button>
        </div>
      </div>

      {/* System Status Alert */}
      <Alert>
        <Shield className='h-4 w-4' />
        <AlertDescription>
          Sistema de telemedicina operando normalmente. Conexão WebRTC estável • Compliance CFM
          ativo • LGPD em conformidade
        </AlertDescription>
      </Alert>

      {/* Waiting Patients */}
      <div className='grid gap-4'>
        {waitingPatients.map(patient => (
          <Card key={patient.id} className='hover:shadow-md transition-shadow'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                {/* Patient Info */}
                <div className='flex items-center space-x-4'>
                  <Avatar className='h-12 w-12'>
                    <AvatarImage src={patient.avatar || undefined} />
                    <AvatarFallback className='bg-blue-100 text-blue-700'>
                      {getInitials(patient.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className='space-y-1'>
                    <div className='flex items-center space-x-2'>
                      <h3 className='font-semibold'>{patient.name}</h3>
                      {getPriorityBadge(patient.priority)}
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Agendado para {patient.appointmentTime} • {patient.type}
                    </p>

                    {/* Status Indicators */}
                    <div className='flex items-center space-x-4 mt-2'>
                      <div className='flex items-center space-x-1'>
                        <Timer className='h-3 w-3 text-muted-foreground' />
                        <span className='text-xs text-muted-foreground'>
                          {patient.waitTime}min aguardando
                        </span>
                      </div>

                      <div className='flex items-center space-x-1'>
                        {getConnectionIcon(patient.connectionQuality)}
                        <span className='text-xs text-muted-foreground capitalize'>
                          {patient.connectionQuality}
                        </span>
                      </div>

                      <div className='flex items-center space-x-1'>
                        {patient.deviceStatus === 'verified'
                          ? <CheckCircle className='h-3 w-3 text-green-500' />
                          : <AlertCircle className='h-3 w-3 text-yellow-500' />}
                        <span className='text-xs text-muted-foreground'>
                          Dispositivo {patient.deviceStatus === 'verified'
                            ? 'OK'
                            : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions and Status */}
                <div className='flex items-center space-x-4'>
                  {/* Status Badge */}
                  <div className='text-center'>
                    <Badge
                      className={`${getStatusColor(patient.status)} mb-2`}
                      variant='outline'
                    >
                      {patient.status === 'ready' && 'Pronto'}
                      {patient.status === 'connecting' && 'Conectando'}
                      {patient.status === 'waiting' && 'Aguardando'}
                    </Badge>

                    {/* Consent Status */}
                    <div className='text-xs text-muted-foreground'>
                      {patient.consentStatus === 'signed'
                        ? (
                          <div className='flex items-center'>
                            <CheckCircle className='h-3 w-3 text-green-500 mr-1' />
                            Termo assinado
                          </div>
                        )
                        : (
                          <div className='flex items-center'>
                            <AlertCircle className='h-3 w-3 text-yellow-500 mr-1' />
                            Termo pendente
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex flex-col space-y-2'>
                    {patient.status === 'ready' && (
                      <Button size='sm' className='w-24'>
                        <Video className='h-4 w-4 mr-1' />
                        Iniciar
                      </Button>
                    )}

                    {patient.status === 'connecting' && (
                      <Button size='sm' variant='outline' className='w-24'>
                        <Phone className='h-4 w-4 mr-1' />
                        Conectar
                      </Button>
                    )}

                    {patient.status === 'waiting' && (
                      <Button size='sm' variant='outline' className='w-24'>
                        <Bell className='h-4 w-4 mr-1' />
                        Notificar
                      </Button>
                    )}

                    <Button size='sm' variant='ghost' className='w-24'>
                      <UserCheck className='h-4 w-4 mr-1' />
                      Detalhes
                    </Button>
                  </div>
                </div>
              </div>

              {/* Additional Info for Issues */}
              {(patient.connectionQuality === 'poor'
                || patient.deviceStatus === 'pending'
                || patient.consentStatus === 'pending') && (
                <>
                  <Separator className='my-4' />
                  <div className='flex items-center space-x-4 text-sm'>
                    {patient.connectionQuality === 'poor' && (
                      <div className='flex items-center text-orange-600'>
                        <AlertCircle className='h-4 w-4 mr-1' />
                        Conexão instável - aguardando estabilização
                      </div>
                    )}

                    {patient.deviceStatus === 'pending' && (
                      <div className='flex items-center text-blue-600'>
                        <Headphones className='h-4 w-4 mr-1' />
                        Verificando áudio/vídeo
                      </div>
                    )}

                    {patient.consentStatus === 'pending' && (
                      <div className='flex items-center text-purple-600'>
                        <Shield className='h-4 w-4 mr-1' />
                        Aguardando termo de consentimento
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {waitingPatients.length === 0 && (
        <Card>
          <CardContent className='text-center py-12'>
            <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>
              Nenhum paciente na fila
            </h3>
            <p className='text-muted-foreground'>
              Todos os pacientes foram atendidos ou não há consultas agendadas no momento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
