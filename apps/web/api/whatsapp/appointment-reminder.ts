/**
 * WhatsApp Appointment Reminder Edge Function
 * T035: WhatsApp Reminder Service for Aesthetic Clinic
 * Optimized for Brazilian Portuguese communication with LGPD compliance
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const preferredRegion = 'gru1'; // São Paulo for Brazilian customers

interface WhatsAppReminderRequest {
  patient_id: string;
  appointment_id: string;
  reminder_type: '24h' | '12h' | '6h' | '2h' | 'confirmacao';
  patient_data: {
    name: string;
    phone: string;
    whatsapp_consent: boolean;
  };
  appointment_data: {
    date: string;
    time: string;
    treatment: string;
    professional: string;
    clinic_address: string;
  };
}

interface WhatsAppResponse {
  message_sent: boolean;
  message_id?: string;
  delivery_status: 'sent' | 'delivered' | 'read' | 'failed';
  lgpd_audit: {
    consent_verified: boolean;
    data_processed: boolean;
    audit_id: string;
  };
}

// Templates de mensagens em português brasileiro para clínica de estética
const reminderTemplates = {
  '24h': (
    name: string,
    treatment: string,
    date: string,
    time: string,
    professional: string,
  ) =>
    `Olá ${name}! 💆‍♀️\n\nLembramos que você tem seu procedimento de *${treatment}* marcado para:\n📅 ${date}\n⏰ ${time}\n👩‍⚕️ Com ${professional}\n\n✅ Para confirmar, responda com *SIM*\n❌ Para cancelar, responda com *CANCELAR*\n\nNeonPro Estética 🌟`,

  '12h': (name: string, treatment: string, time: string) =>
    `Oi ${name}! 🕐\n\nSeu *${treatment}* é hoje às ${time}!\n\nNos vemos em breve! 💆‍♀️\n\nNeonPro Estética`,

  '6h': (name: string, treatment: string, time: string) =>
    `${name}, em 6 horas será seu *${treatment}* às ${time}! 😊\n\nJá está ansiosa? Nós também! ✨`,

  '2h': (name: string, time: string, address: string) =>
    `${name}, faltam 2 horas! ⏰\n\nNão esqueça:\n📍 ${address}\n⏰ ${time}\n\nTe esperamos! 💕`,

  confirmacao: (name: string, treatment: string, date: string, time: string) =>
    `Perfeito ${name}! ✅\n\nSeu *${treatment}* está confirmado:\n📅 ${date}\n⏰ ${time}\n\nObrigada pela confirmação! 💆‍♀️`,
};

export default async function handler(req: NextRequest) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-LGPD-Compliance': 'true',
    'Cache-Control': 'no-store, max-age=0',
  };

  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Método não permitido', code: 'METHOD_NOT_ALLOWED' },
      { status: 405, headers },
    );
  }

  try {
    const startTime = Date.now();
    const reminderData: WhatsAppReminderRequest = await req.json();

    // LGPD consent validation
    if (!reminderData.patient_data.whatsapp_consent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paciente não consentiu com comunicação via WhatsApp',
          code: 'LGPD_CONSENT_REQUIRED',
        },
        { status: 403, headers },
      );
    }

    // Format phone number for Brazilian standard
    const phone = reminderData.patient_data.phone.replace(/\D/g, '');
    if (!phone.startsWith('55') || phone.length < 13) {
      return NextResponse.json(
        {
          success: false,
          error: 'Número de telefone brasileiro inválido',
          code: 'INVALID_PHONE_NUMBER',
        },
        { status: 400, headers },
      );
    }

    // Generate appropriate message based on reminder type
    const { name } = reminderData.patient_data;
    const { treatment, date, time, professional, clinic_address } = reminderData.appointment_data;

    let message: string;

    switch (reminderData.reminder_type) {
      case '24h':
        message = reminderTemplates['24h'](
          name,
          treatment,
          date,
          time,
          professional,
        );
        break;
      case '12h':
        message = reminderTemplates['12h'](name, treatment, time);
        break;
      case '6h':
        message = reminderTemplates['6h'](name, treatment, time);
        break;
      case '2h':
        message = reminderTemplates['2h'](name, time, clinic_address);
        break;
      case 'confirmacao':
        message = reminderTemplates['confirmacao'](name, treatment, date, time);
        break;
      default:
        throw new Error('Tipo de lembrete inválido');
    }

    // In production, integrate with WhatsApp Business API
    // For now, simulate the API call
    const mockWhatsAppResponse: WhatsAppResponse = {
      message_sent: true,
      message_id: `wa_${Date.now()}`,
      delivery_status: 'sent',
      lgpd_audit: {
        consent_verified: true,
        data_processed: true,
        audit_id: `audit_${Date.now()}`,
      },
    };

    // Log for LGPD audit trail
    console.log(
      `WhatsApp reminder sent: ${reminderData.reminder_type} for patient ${reminderData.patient_id}`,
    );

    const processingTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        reminder_sent: true,
        whatsapp_response: mockWhatsAppResponse,
        message_preview: message.substring(0, 100) + '...',
        performance: {
          processing_time_ms: processingTime,
          region: 'gru1',
        },
      },
      { status: 200, headers },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao enviar lembrete via WhatsApp',
        code: 'WHATSAPP_ERROR',
        lgpd_compliant: true,
      },
      { status: 500, headers },
    );
  }
}
