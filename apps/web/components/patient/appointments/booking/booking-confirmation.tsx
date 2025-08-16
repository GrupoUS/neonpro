'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Smartphone,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  category: string;
};

type Professional = {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  avatar_url: string | null;
};

type TimeSlot = {
  datetime: string;
  professional_id?: string;
  professional_name?: string;
};

type BookingConfirmationProps = {
  service: Service;
  professional: Professional | null;
  timeSlot: TimeSlot;
  notes: string;
  specialRequests: string[];
  onConfirm: () => Promise<void>;
  onBack: () => void;
  className?: string;
};

type NotificationPreferences = {
  emailConfirmation: boolean;
  smsConfirmation: boolean;
  emailReminder: boolean;
  smsReminder: boolean;
};

export function BookingConfirmation({
  service,
  professional,
  timeSlot,
  notes,
  specialRequests,
  onConfirm,
  onBack,
  className = '',
}: BookingConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>({
      emailConfirmation: true,
      smsConfirmation: false,
      emailReminder: true,
      smsReminder: false,
    });

  const formatAppointmentDate = () => {
    const date = new Date(timeSlot.datetime);
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatAppointmentTime = () => {
    const date = new Date(timeSlot.datetime);
    return format(date, 'HH:mm', { locale: ptBR });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleConfirm = async () => {
    if (!agreedToTerms) {
      setConfirmationError(
        'Você deve aceitar os termos e condições para prosseguir.'
      );
      return;
    }

    setIsConfirming(true);
    setConfirmationError('');

    try {
      await onConfirm();
    } catch (_error) {
      setConfirmationError('Erro ao confirmar agendamento. Tente novamente.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleNotificationChange = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="mb-2 font-semibold text-gray-900 text-xl">
          Confirmar Agendamento
        </h2>
        <p className="text-gray-600">
          Revise os detalhes do seu agendamento antes de confirmar
        </p>
      </div>

      {/* Appointment Summary */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
            <CheckCircle2 className="h-5 w-5" />
            Resumo do Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {/* Service Information */}
          <div className="flex items-start space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
              <Badge className="mt-1 capitalize" variant="outline">
                {service.category}
              </Badge>
              <div className="mt-2 flex items-center gap-4 text-gray-600 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration_minutes} minutos</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>R$ {service.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Information */}
          <div className="flex items-start space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full">
              {professional ? (
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    alt={`Foto de ${professional.name}`}
                    src={professional.avatar_url || undefined}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {getInitials(professional.name)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <User className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {professional
                  ? professional.name
                  : 'Qualquer profissional disponível'}
              </h3>
              {professional && professional.specialties.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {professional.specialties.slice(0, 2).map((specialty) => (
                    <Badge
                      className="text-xs"
                      key={specialty}
                      variant="secondary"
                    >
                      {specialty}
                    </Badge>
                  ))}
                  {professional.specialties.length > 2 && (
                    <Badge className="text-xs" variant="secondary">
                      +{professional.specialties.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Date and Time */}
          <div className="flex items-start space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 capitalize">
                {formatAppointmentDate()}
              </h3>
              <div className="mt-1 flex items-center gap-1 font-medium text-green-600 text-lg">
                <Clock className="h-5 w-5" />
                <span>{formatAppointmentTime()}</span>
              </div>
            </div>
          </div>

          {/* Notes and Special Requests */}
          {(notes.trim() || specialRequests.length > 0) && (
            <>
              <Separator />
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Observações e Solicitações
                  </h3>
                  {specialRequests.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {specialRequests.map((request, index) => (
                        <div className="text-gray-700 text-sm" key={index}>
                          • {request}
                        </div>
                      ))}
                    </div>
                  )}
                  {notes.trim() && (
                    <div className="rounded-md bg-gray-50 p-3 text-gray-700 text-sm">
                      {notes.split('\n').map((line, index) => (
                        <div key={index}>{line || <br />}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferências de Notificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium text-gray-900">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Confirmação do Agendamento
              </h4>
              <div className="ml-6 space-y-2">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={notificationPrefs.emailConfirmation}
                    id="email-confirmation"
                    onCheckedChange={(checked) =>
                      handleNotificationChange(
                        'emailConfirmation',
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    className="flex items-center gap-2 text-sm"
                    htmlFor="email-confirmation"
                  >
                    <Mail className="h-4 w-4" />
                    Por e-mail
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={notificationPrefs.smsConfirmation}
                    id="sms-confirmation"
                    onCheckedChange={(checked) =>
                      handleNotificationChange(
                        'smsConfirmation',
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    className="flex items-center gap-2 text-sm"
                    htmlFor="sms-confirmation"
                  >
                    <Smartphone className="h-4 w-4" />
                    Por SMS
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium text-gray-900">
                <Clock className="h-4 w-4 text-blue-500" />
                Lembretes da Consulta
              </h4>
              <div className="ml-6 space-y-2">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={notificationPrefs.emailReminder}
                    id="email-reminder"
                    onCheckedChange={(checked) =>
                      handleNotificationChange(
                        'emailReminder',
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    className="flex items-center gap-2 text-sm"
                    htmlFor="email-reminder"
                  >
                    <Mail className="h-4 w-4" />
                    Por e-mail (24h antes)
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={notificationPrefs.smsReminder}
                    id="sms-reminder"
                    onCheckedChange={(checked) =>
                      handleNotificationChange(
                        'smsReminder',
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    className="flex items-center gap-2 text-sm"
                    htmlFor="sms-reminder"
                  >
                    <Smartphone className="h-4 w-4" />
                    Por SMS (2h antes)
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={agreedToTerms}
              className="mt-1"
              id="terms-agreement"
              onCheckedChange={(checked) =>
                setAgreedToTerms(checked as boolean)
              }
            />
            <Label
              className="cursor-pointer text-gray-700 text-sm"
              htmlFor="terms-agreement"
            >
              Li e aceito os{' '}
              <button className="font-medium text-blue-600 hover:underline">
                termos e condições
              </button>{' '}
              e a{' '}
              <button className="font-medium text-blue-600 hover:underline">
                política de privacidade
              </button>{' '}
              da clínica. Autorizo o tratamento dos meus dados pessoais conforme
              a Lei Geral de Proteção de Dados (LGPD).
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {confirmationError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            {confirmationError}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 pt-4 sm:flex-row">
        <Button
          className="w-full sm:w-auto"
          disabled={isConfirming}
          onClick={onBack}
          variant="outline"
        >
          Voltar
        </Button>
        <Button
          className="w-full bg-green-600 hover:bg-green-700 sm:flex-1"
          disabled={isConfirming || !agreedToTerms}
          onClick={handleConfirm}
        >
          {isConfirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar Agendamento
            </>
          )}
        </Button>
      </div>

      {/* Important Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-blue-700">
          <strong>Importante:</strong> Após a confirmação, você receberá as
          notificações selecionadas. Para cancelar ou reagendar, entre em
          contato conosco com pelo menos 24 horas de antecedência.
        </AlertDescription>
      </Alert>
    </div>
  );
}
