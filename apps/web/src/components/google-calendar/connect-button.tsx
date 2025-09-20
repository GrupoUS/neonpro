import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface GoogleCalendarConnectButtonProps {
  userId: string;
  clinicId: string;
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function GoogleCalendarConnectButton({
  userId,
  clinicId,
  isConnected = false,
  onConnect,
  onDisconnect,
}: GoogleCalendarConnectButtonProps) {
  const [lgpdConsent, setLgpdConsent] = useState(false);

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/google-calendar/connect?userId=${userId}&clinicId=${clinicId}&lgpdConsent=${lgpdConsent}`,
      );

      if (!response.ok) {
        throw new Error("Failed to get auth URL");
      }

      const data = await response.json();
      return data.authUrl;
    },
    onSuccess: (authUrl) => {
      window.location.href = authUrl;
    },
    onError: (error) => {
      console.error("Error connecting to Google Calendar:", error);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/google-calendar/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, clinicId }),
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      return response.json();
    },
    onSuccess: () => {
      onDisconnect?.();
    },
    onError: (error) => {
      console.error("Error disconnecting Google Calendar:", error);
    },
  });

  const handleConnect = () => {
    connectMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  if (isConnected) {
    return (
      <Card className="border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">
              Google Calendar Conectado
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={disconnectMutation.isPending}
          >
            {disconnectMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Desconectar
          </Button>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Sua conta do Google Calendar está conectada e sincronizando
            compromissos automaticamente.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Conectar Google Calendar</span>
        </CardTitle>
        <CardDescription>
          Sincronize seus compromissos automaticamente com o Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Ao conectar sua conta do Google Calendar, você concorda com o
            compartilhamento de dados de agendamento entre o NeonPro e o Google
            Calendar, em conformidade com a LGPD.
          </AlertDescription>
        </Alert>

        <div className="flex items-center space-x-2">
          <Switch
            id="lgpd-consent"
            checked={lgpdConsent}
            onCheckedChange={setLgpdConsent}
          />
          <Label htmlFor="lgpd-consent" className="text-sm">
            Eu concordo com o compartilhamento de dados conforme a LGPD (Lei
            Geral de Proteção de Dados)
          </Label>
        </div>

        <Button
          onClick={handleConnect}
          disabled={!lgpdConsent || connectMutation.isPending}
          className="w-full"
        >
          {connectMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Calendar className="mr-2 h-4 w-4" />
          Conectar com Google Calendar
        </Button>

        {connectMutation.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Não foi possível conectar ao Google Calendar. Por favor, tente
              novamente.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
