"use client";

import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Checkbox } from "@/components/ui/checkbox";
import type { Label } from "@/components/ui/label";
import type { Separator } from "@/components/ui/separator";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
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
} from "lucide-react";
import type { useState } from "react";

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  category: string;
}

interface Professional {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  avatar_url: string | null;
}

interface TimeSlot {
  datetime: string;
  professional_id?: string;
  professional_name?: string;
}

interface BookingConfirmationProps {
  service: Service;
  professional: Professional | null;
  timeSlot: TimeSlot;
  notes: string;
  specialRequests: string[];
  onConfirm: () => Promise<void>;
  onBack: () => void;
  className?: string;
}

interface NotificationPreferences {
  emailConfirmation: boolean;
  smsConfirmation: boolean;
  emailReminder: boolean;
  smsReminder: boolean;
}

export function BookingConfirmation({
  service,
  professional,
  timeSlot,
  notes,
  specialRequests,
  onConfirm,
  onBack,
  className = "",
}: BookingConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string>("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
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
    return format(date, "HH:mm", { locale: ptBR });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleConfirm = async () => {
    if (!agreedToTerms) {
      setConfirmationError("Você deve aceitar os termos e condições para prosseguir.");
      return;
    }

    setIsConfirming(true);
    setConfirmationError("");

    try {
      await onConfirm();
    } catch (error) {
      console.error("Error confirming booking:", error);
      setConfirmationError("Erro ao confirmar agendamento. Tente novamente.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirmar Agendamento</h2>
        <p className="text-gray-600">Revise os detalhes do seu agendamento antes de confirmar</p>
      </div>

      {/* Appointment Summary */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
            <CheckCircle2 className="h-5 w-5" />
            Resumo do Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Service Information */}
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
              <Badge variant="outline" className="mt-1 capitalize">
                {service.category}
              </Badge>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
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
            <div className="flex items-center justify-center w-12 h-12 rounded-full">
              {professional ? (
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={professional.avatar_url || undefined}
                    alt={`Foto de ${professional.name}`}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {getInitials(professional.name)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <User className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {professional ? professional.name : "Qualquer profissional disponível"}
              </h3>
              {professional && professional.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {professional.specialties.slice(0, 2).map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {professional.specialties.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
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
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 capitalize">{formatAppointmentDate()}</h3>
              <div className="flex items-center gap-1 mt-1 text-lg font-medium text-green-600">
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
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Observações e Solicitações</h3>
                  {specialRequests.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {specialRequests.map((request, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          • {request}
                        </div>
                      ))}
                    </div>
                  )}
                  {notes.trim() && (
                    <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                      {notes.split("\n").map((line, index) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Confirmação do Agendamento
              </h4>
              <div className="space-y-2 ml-6">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="email-confirmation"
                    checked={notificationPrefs.emailConfirmation}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("emailConfirmation", checked as boolean)
                    }
                  />
                  <Label htmlFor="email-confirmation" className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    Por e-mail
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="sms-confirmation"
                    checked={notificationPrefs.smsConfirmation}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("smsConfirmation", checked as boolean)
                    }
                  />
                  <Label htmlFor="sms-confirmation" className="flex items-center gap-2 text-sm">
                    <Smartphone className="h-4 w-4" />
                    Por SMS
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Lembretes da Consulta
              </h4>
              <div className="space-y-2 ml-6">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="email-reminder"
                    checked={notificationPrefs.emailReminder}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("emailReminder", checked as boolean)
                    }
                  />
                  <Label htmlFor="email-reminder" className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    Por e-mail (24h antes)
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="sms-reminder"
                    checked={notificationPrefs.smsReminder}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("smsReminder", checked as boolean)
                    }
                  />
                  <Label htmlFor="sms-reminder" className="flex items-center gap-2 text-sm">
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
              id="terms-agreement"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="terms-agreement" className="text-sm text-gray-700 cursor-pointer">
              Li e aceito os{" "}
              <button className="text-blue-600 hover:underline font-medium">
                termos e condições
              </button>{" "}
              e a{" "}
              <button className="text-blue-600 hover:underline font-medium">
                política de privacidade
              </button>{" "}
              da clínica. Autorizo o tratamento dos meus dados pessoais conforme a Lei Geral de
              Proteção de Dados (LGPD).
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {confirmationError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{confirmationError}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isConfirming}
          className="w-full sm:w-auto"
        >
          Voltar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isConfirming || !agreedToTerms}
          className="w-full sm:flex-1 bg-green-600 hover:bg-green-700"
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
          <strong>Importante:</strong> Após a confirmação, você receberá as notificações
          selecionadas. Para cancelar ou reagendar, entre em contato conosco com pelo menos 24 horas
          de antecedência.
        </AlertDescription>
      </Alert>
    </div>
  );
}
