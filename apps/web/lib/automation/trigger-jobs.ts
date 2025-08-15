import { TriggerClient } from '@trigger.dev/sdk';

// Initialize Trigger.dev client
const client = new TriggerClient({
  id: 'neonpro',
  apiKey: process.env.TRIGGER_API_KEY!,
  apiUrl: process.env.TRIGGER_API_URL,
});

import type {
  AppointmentJobPayload,
  InvoiceJobPayload,
} from '@/trigger/client';

/**
 * 🤖 NeonPro Background Jobs Automation
 *
 * Utilitários para facilitar o uso dos jobs do Trigger.dev
 * na aplicação NeonPro existente. Integra com APIs atuais.
 */

export class NeonProAutomation {
  /**
   * 📧 Enviar confirmação de consulta automaticamente
   * Integra com o sistema de appointments existente
   */
  static async sendAppointmentConfirmation(params: {
    appointmentId: string;
    patientEmail: string;
    patientName: string;
    clinicName: string;
    clinicId: string;
    appointmentDate: string;
    appointmentTime: string;
    professionalName: string;
    serviceName: string;
  }) {
    try {
      const payload: AppointmentJobPayload = {
        appointmentId: params.appointmentId,
        recipientEmail: params.patientEmail,
        recipientName: params.patientName,
        clinicName: params.clinicName,
        clinicId: params.clinicId,
        appointmentDate: params.appointmentDate,
        appointmentTime: params.appointmentTime,
        professionalName: params.professionalName,
        serviceName: params.serviceName,
      };

      const handle = await client.sendEvent({
        name: 'appointment-confirmation-email',
        payload,
      });

      console.log('✅ Appointment confirmation job triggered', {
        jobId: handle.id,
        appointmentId: params.appointmentId,
      });

      return {
        success: true,
        jobId: handle.id,
        appointmentId: params.appointmentId,
      };
    } catch (error) {
      console.error('❌ Failed to trigger appointment confirmation', error);
      throw new Error(
        `Failed to send appointment confirmation: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * ⏰ Agendar lembrete de consulta (24h antes)
   * Auto-schedule para reduzir no-shows
   */
  static async scheduleAppointmentReminder(params: {
    appointmentId: string;
    patientEmail: string;
    patientName: string;
    clinicName: string;
    clinicId: string;
    appointmentDate: string;
    appointmentTime: string;
    professionalName: string;
    serviceName: string;
    reminderDate?: Date; // Quando enviar (padrão: 24h antes)
  }) {
    try {
      const payload: AppointmentJobPayload = {
        appointmentId: params.appointmentId,
        recipientEmail: params.patientEmail,
        recipientName: params.patientName,
        clinicName: params.clinicName,
        clinicId: params.clinicId,
        appointmentDate: params.appointmentDate,
        appointmentTime: params.appointmentTime,
        professionalName: params.professionalName,
        serviceName: params.serviceName,
      };

      // Calcular quando enviar lembrete (24h antes por padrão)
      let scheduleFor = params.reminderDate;
      if (!scheduleFor) {
        const appointmentDateTime = new Date(
          `${params.appointmentDate}T${params.appointmentTime}`
        );
        scheduleFor = new Date(
          appointmentDateTime.getTime() - 24 * 60 * 60 * 1000
        ); // 24h antes
      }

      const handle = await client.sendEvent({
        name: 'appointment-reminder-email',
        payload,
        options: {
          delay: scheduleFor,
        },
      });

      console.log('✅ Appointment reminder scheduled', {
        jobId: handle.id,
        appointmentId: params.appointmentId,
        scheduledFor: scheduleFor,
      });

      return {
        success: true,
        jobId: handle.id,
        appointmentId: params.appointmentId,
        scheduledFor: scheduleFor,
      };
    } catch (error) {
      console.error('❌ Failed to schedule appointment reminder', error);
      throw new Error(
        `Failed to schedule reminder: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * 💰 Enviar fatura por email automaticamente
   * Integra com sistema de billing existente
   */
  static async sendInvoiceEmail(params: {
    invoiceId: string;
    patientEmail: string;
    patientName: string;
    clinicName: string;
    clinicId: string;
    amount: number;
    dueDate: string;
    invoiceUrl?: string;
  }) {
    try {
      const payload: InvoiceJobPayload = {
        invoiceId: params.invoiceId,
        recipientEmail: params.patientEmail,
        recipientName: params.patientName,
        clinicName: params.clinicName,
        clinicId: params.clinicId,
        amount: params.amount,
        dueDate: params.dueDate,
        invoiceUrl: params.invoiceUrl,
      };

      const handle = await client.sendEvent({
        name: 'invoice-email-delivery',
        payload,
      });

      console.log('✅ Invoice email job triggered', {
        jobId: handle.id,
        invoiceId: params.invoiceId,
        amount: params.amount,
      });

      return {
        success: true,
        jobId: handle.id,
        invoiceId: params.invoiceId,
        amount: params.amount,
      };
    } catch (error) {
      console.error('❌ Failed to trigger invoice email', error);
      throw new Error(
        `Failed to send invoice: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * 📱 Enviar lembrete de pagamento
   * Para faturas vencidas ou próximas do vencimento
   */
  static async sendPaymentReminder(params: {
    invoiceId: string;
    patientEmail: string;
    patientName: string;
    clinicName: string;
    clinicId: string;
    amount: number;
    dueDate: string;
    invoiceUrl?: string;
    delayDays?: number; // Quantos dias esperar antes de enviar
  }) {
    try {
      const payload: InvoiceJobPayload = {
        invoiceId: params.invoiceId,
        recipientEmail: params.patientEmail,
        recipientName: params.patientName,
        clinicName: params.clinicName,
        clinicId: params.clinicId,
        amount: params.amount,
        dueDate: params.dueDate,
        invoiceUrl: params.invoiceUrl,
      };

      let scheduleOptions = {};
      if (params.delayDays) {
        const delayDate = new Date();
        delayDate.setDate(delayDate.getDate() + params.delayDays);
        scheduleOptions = { delay: delayDate };
      }

      const handle = await client.sendEvent({
        name: 'payment-reminder-email',
        payload,
        options: scheduleOptions,
      });

      console.log('✅ Payment reminder job triggered', {
        jobId: handle.id,
        invoiceId: params.invoiceId,
        delayDays: params.delayDays,
      });

      return {
        success: true,
        jobId: handle.id,
        invoiceId: params.invoiceId,
        scheduledFor: params.delayDays ? `+${params.delayDays} days` : 'now',
      };
    } catch (error) {
      console.error('❌ Failed to trigger payment reminder', error);
      throw new Error(
        `Failed to send payment reminder: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * 🎯 Auto-trigger para nova consulta agendada
   * Chamado automaticamente quando uma consulta é criada
   */
  static async onNewAppointmentCreated(appointmentData: {
    appointmentId: string;
    patientEmail: string;
    patientName: string;
    clinicName: string;
    clinicId: string;
    appointmentDate: string;
    appointmentTime: string;
    professionalName: string;
    serviceName: string;
  }) {
    const results = {
      confirmation: null as any,
      reminder: null as any,
    };

    try {
      // 1. Enviar confirmação imediatamente
      results.confirmation =
        await NeonProAutomation.sendAppointmentConfirmation(appointmentData);

      // 2. Agendar lembrete para 24h antes
      results.reminder =
        await NeonProAutomation.scheduleAppointmentReminder(appointmentData);

      console.log('✅ New appointment automation completed', {
        appointmentId: appointmentData.appointmentId,
        confirmationJobId: results.confirmation.jobId,
        reminderJobId: results.reminder.jobId,
      });

      return results;
    } catch (error) {
      console.error('❌ Failed to complete appointment automation', error);
      return results;
    }
  }

  /**
   * 💰 Auto-trigger para nova fatura criada
   * Chamado automaticamente quando uma fatura é gerada
   */
  static async onNewInvoiceCreated(invoiceData: {
    invoiceId: string;
    patientEmail: string;
    patientName: string;
    clinicName: string;
    clinicId: string;
    amount: number;
    dueDate: string;
    invoiceUrl?: string;
  }) {
    const results = {
      invoiceEmail: null as any,
      paymentReminder: null as any,
    };

    try {
      // 1. Enviar fatura imediatamente
      results.invoiceEmail =
        await NeonProAutomation.sendInvoiceEmail(invoiceData);

      // 2. Agendar lembrete de pagamento para 1 dia após vencimento
      const dueDate = new Date(invoiceData.dueDate);
      const reminderDate = new Date(dueDate.getTime() + 24 * 60 * 60 * 1000); // 1 dia após vencimento

      results.paymentReminder = await NeonProAutomation.sendPaymentReminder({
        ...invoiceData,
        delayDays: Math.ceil(
          (reminderDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      });

      console.log('✅ New invoice automation completed', {
        invoiceId: invoiceData.invoiceId,
        amount: invoiceData.amount,
        invoiceJobId: results.invoiceEmail.jobId,
        reminderJobId: results.paymentReminder.jobId,
      });

      return results;
    } catch (error) {
      console.error('❌ Failed to complete invoice automation', error);
      return results;
    }
  }
}
