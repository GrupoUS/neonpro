'use client';

import { useState } from 'react';
import { whatsappClient, type WhatsAppResponse } from '@/lib/whatsapp/client';

interface UseWhatsAppReturn {
  sendMessage: (to: string, message: string) => Promise<WhatsAppResponse>;
  sendAppointmentConfirmation: (to: string, clientName: string, service: string, date: string, time: string) => Promise<WhatsAppResponse>;
  sendAppointmentReminder: (to: string, clientName: string, service: string, date: string, time: string) => Promise<WhatsAppResponse>;
  sendPromotionalMessage: (to: string, clientName: string, promotion: string) => Promise<WhatsAppResponse>;
  testConnection: () => Promise<WhatsAppResponse>;
  isLoading: boolean;
  error: string | null;
}

export function useWhatsApp(): UseWhatsAppReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async <T extends any[]>(
    fn: (...args: T) => Promise<WhatsAppResponse>,
    ...args: T
  ): Promise<WhatsAppResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fn(...args);
      
      if (!result.success) {
        setError(result.error || 'Erro ao enviar mensagem');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (to: string, message: string): Promise<WhatsAppResponse> => {
    return handleRequest(whatsappClient.sendTextMessage.bind(whatsappClient), to, message);
  };

  const sendAppointmentConfirmation = async (
    to: string,
    clientName: string,
    service: string,
    date: string,
    time: string
  ): Promise<WhatsAppResponse> => {
    return handleRequest(
      whatsappClient.sendAppointmentConfirmation.bind(whatsappClient),
      to,
      clientName,
      service,
      date,
      time
    );
  };

  const sendAppointmentReminder = async (
    to: string,
    clientName: string,
    service: string,
    date: string,
    time: string
  ): Promise<WhatsAppResponse> => {
    return handleRequest(
      whatsappClient.sendAppointmentReminder.bind(whatsappClient),
      to,
      clientName,
      service,
      date,
      time
    );
  };

  const sendPromotionalMessage = async (
    to: string,
    clientName: string,
    promotion: string
  ): Promise<WhatsAppResponse> => {
    return handleRequest(
      whatsappClient.sendPromotionalMessage.bind(whatsappClient),
      to,
      clientName,
      promotion
    );
  };

  const testConnection = async (): Promise<WhatsAppResponse> => {
    return handleRequest(whatsappClient.testConnection.bind(whatsappClient));
  };

  return {
    sendMessage,
    sendAppointmentConfirmation,
    sendAppointmentReminder,
    sendPromotionalMessage,
    testConnection,
    isLoading,
    error
  };
}
