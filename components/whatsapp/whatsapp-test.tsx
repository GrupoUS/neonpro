'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWhatsApp } from '@/hooks/use-whatsapp';
import { MessageCircle, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function WhatsAppTest() {
  const { 
    sendMessage, 
    sendAppointmentConfirmation, 
    testConnection, 
    isLoading, 
    error 
  } = useWhatsApp();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [clientName, setClientName] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleTestConnection = async () => {
    const result = await testConnection();
    if (result.success) {
      setLastResult('✅ Conexão WhatsApp testada com sucesso!');
    } else {
      setLastResult(`❌ Erro na conexão: ${result.error}`);
    }
  };

  const handleSendMessage = async () => {
    if (!phoneNumber || !message) {
      setLastResult('❌ Preencha o número e a mensagem');
      return;
    }

    const result = await sendMessage(phoneNumber, message);
    if (result.success) {
      setLastResult(`✅ Mensagem enviada! ID: ${result.messageId}`);
      setMessage('');
    } else {
      setLastResult(`❌ Erro ao enviar: ${result.error}`);
    }
  };

  const handleSendAppointmentConfirmation = async () => {
    if (!phoneNumber || !clientName || !service || !date || !time) {
      setLastResult('❌ Preencha todos os campos do agendamento');
      return;
    }

    const result = await sendAppointmentConfirmation(phoneNumber, clientName, service, date, time);
    if (result.success) {
      setLastResult(`✅ Confirmação de agendamento enviada! ID: ${result.messageId}`);
    } else {
      setLastResult(`❌ Erro ao enviar confirmação: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Teste WhatsApp Business API
          </CardTitle>
          <CardDescription>
            Teste a integração com WhatsApp Business para envio de notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Teste de Conexão */}
          <div className="space-y-2">
            <Label>Teste de Conexão</Label>
            <Button 
              onClick={handleTestConnection} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Testar Conexão WhatsApp
            </Button>
          </div>

          {/* Configuração do Número */}
          <div className="space-y-2">
            <Label htmlFor="phone">Número de Telefone (com código do país)</Label>
            <Input
              id="phone"
              placeholder="Ex: +5511999999999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          {/* Envio de Mensagem Simples */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Mensagem Simples</h3>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !phoneNumber || !message}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Mensagem
            </Button>
          </div>

          {/* Confirmação de Agendamento */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Confirmação de Agendamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  placeholder="Ex: Maria Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Serviço</Label>
                <Input
                  id="service"
                  placeholder="Ex: Limpeza de Pele"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={handleSendAppointmentConfirmation} 
              disabled={isLoading || !phoneNumber || !clientName || !service || !date || !time}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Confirmação de Agendamento
            </Button>
          </div>

          {/* Resultado */}
          {(lastResult || error) && (
            <Alert className={error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              {error ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription className={error ? "text-red-800" : "text-green-800"}>
                {error || lastResult}
              </AlertDescription>
            </Alert>
          )}

          {/* Informações de Desenvolvimento */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Modo Desenvolvimento</h4>
            <p className="text-blue-700 text-sm">
              No modo desenvolvimento, as mensagens são simuladas e exibidas no console. 
              Para usar em produção, configure as variáveis de ambiente:
            </p>
            <ul className="text-blue-700 text-sm mt-2 list-disc list-inside">
              <li>WHATSAPP_API_KEY</li>
              <li>WHATSAPP_PHONE_NUMBER</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
