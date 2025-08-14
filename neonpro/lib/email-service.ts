import { Resend } from 'resend'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// FIXED: Removed direct import of 'next/headers' to avoid client-side errors

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html_content: string
  text_content?: string
  variables: string[]
}

export interface EmailData {
  to: string
  template: string
  variables: Record<string, string>
  from?: string
  reply_to?: string
}

export interface BulkEmailData {
  template: string
  recipients: Array<{
    email: string
    variables: Record<string, string>
  }>
  from?: string
  reply_to?: string
}

class EmailService {
  private supabase: any = null
  private defaultFrom = process.env.DEFAULT_FROM_EMAIL || 'neonpro@example.com'
  private defaultReplyTo = process.env.DEFAULT_REPLY_TO_EMAIL

  // Initialize Supabase client with dynamic cookies import
  private async getSupabaseClient() {
    if (this.supabase) {
      return this.supabase
    }

    // Check if we're on the server side
    if (typeof window === 'undefined') {
      try {
        // Dynamic import to avoid client-side errors
        const { cookies } = await import('next/headers')
        this.supabase = createServerComponentClient({ cookies })
      } catch (error) {
        console.error('Error importing next/headers:', error)
        // Fallback to basic client without cookies
        const { createClient } = await import('@supabase/supabase-js')
        this.supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
      }
    } else {
      // Client-side fallback
      const { createClient } = await import('@supabase/supabase-js')
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }

    return this.supabase
  }

  async getTemplate(templateName: string): Promise<EmailTemplate | null> {
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', templateName)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching email template:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getTemplate:', error)
      return null
    }
  }

  private replaceVariables(content: string, variables: Record<string, string>): string {
    let result = content
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, value || '')
    })

    return result
  }

  async sendEmail({
    to,
    template: templateName,
    variables,
    from = this.defaultFrom,
    reply_to = this.defaultReplyTo
  }: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Get template
      const template = await this.getTemplate(templateName)
      if (!template) {
        return { success: false, error: `Template '${templateName}' not found` }
      }

      // Replace variables in subject and content
      const subject = this.replaceVariables(template.subject, variables)
      const html = this.replaceVariables(template.html_content, variables)
      const text = template.text_content 
        ? this.replaceVariables(template.text_content, variables)
        : undefined

      // Send email via Resend
      const { data, error } = await resend.emails.send({
        from,
        to: [to],
        subject,
        html,
        text,
        reply_to
      })

      if (error) {
        console.error('Resend error:', error)
        return { success: false, error: error.message }
      }

      console.log('Email sent successfully:', data?.id)
      return { success: true, messageId: data?.id }

    } catch (error) {
      console.error('Error sending email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async sendBulkEmails({
    template: templateName,
    recipients,
    from = this.defaultFrom,
    reply_to = this.defaultReplyTo
  }: BulkEmailData): Promise<{
    success: boolean
    results: Array<{ email: string; success: boolean; messageId?: string; error?: string }>
  }> {
    try {
      // Get template
      const template = await this.getTemplate(templateName)
      if (!template) {
        return {
          success: false,
          results: recipients.map(r => ({
            email: r.email,
            success: false,
            error: `Template '${templateName}' not found`
          }))
        }
      }

      // Send emails in parallel with concurrency limit
      const results = await Promise.allSettled(
        recipients.map(async (recipient) => {
          const subject = this.replaceVariables(template.subject, recipient.variables)
          const html = this.replaceVariables(template.html_content, recipient.variables)
          const text = template.text_content 
            ? this.replaceVariables(template.text_content, recipient.variables)
            : undefined

          const { data, error } = await resend.emails.send({
            from,
            to: [recipient.email],
            subject,
            html,
            text,
            reply_to
          })

          return {
            email: recipient.email,
            success: !error,
            messageId: data?.id,
            error: error?.message
          }
        })
      )

      const processedResults = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return {
            email: recipients[index].email,
            success: false,
            error: result.reason?.message || 'Failed to send'
          }
        }
      })

      const overallSuccess = processedResults.every(r => r.success)

      return {
        success: overallSuccess,
        results: processedResults
      }

    } catch (error) {
      console.error('Error sending bulk emails:', error)
      return {
        success: false,
        results: recipients.map(r => ({
          email: r.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      }
    }
  }

  async sendAppointmentConfirmation({
    patientEmail,
    patientName,
    appointmentDate,
    appointmentTime,
    serviceName,
    professionalName,
    clinicName = 'NeonPro'
  }: {
    patientEmail: string
    patientName: string
    appointmentDate: string
    appointmentTime: string
    serviceName: string
    professionalName: string
    clinicName?: string
  }) {
    return this.sendEmail({
      to: patientEmail,
      template: 'appointment_confirmation',
      variables: {
        patient_name: patientName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        service_name: serviceName,
        professional_name: professionalName,
        clinic_name: clinicName
      }
    })
  }

  async sendAppointmentReminder({
    patientEmail,
    patientName,
    appointmentDate,
    appointmentTime,
    serviceName,
    professionalName,
    clinicName = 'NeonPro'
  }: {
    patientEmail: string
    patientName: string
    appointmentDate: string
    appointmentTime: string
    serviceName: string
    professionalName: string
    clinicName?: string
  }) {
    return this.sendEmail({
      to: patientEmail,
      template: 'appointment_reminder',
      variables: {
        patient_name: patientName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        service_name: serviceName,
        professional_name: professionalName,
        clinic_name: clinicName
      }
    })
  }

  async sendAppointmentCancellation({
    patientEmail,
    patientName,
    appointmentDate,
    appointmentTime,
    cancellationReason = 'Solicitação da clínica',
    clinicName = 'NeonPro'
  }: {
    patientEmail: string
    patientName: string
    appointmentDate: string
    appointmentTime: string
    cancellationReason?: string
    clinicName?: string
  }) {
    return this.sendEmail({
      to: patientEmail,
      template: 'appointment_cancellation',
      variables: {
        patient_name: patientName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        cancellation_reason: cancellationReason,
        clinic_name: clinicName
      }
    })
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test by getting templates
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('email_templates')
        .select('id')
        .limit(1)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Singleton instance
const emailService = new EmailService()
export default emailService

// Utility functions for common use cases
export async function sendAppointmentNotificationEmail(
  appointmentId: string,
  type: 'confirmation' | 'reminder' | 'cancellation',
  cancellationReason?: string
) {
  try {
    // This would typically fetch appointment details from the database
    // For now, this is a placeholder that would be implemented with actual data fetching
    console.log(`Sending ${type} email for appointment ${appointmentId}`)
    
    // The actual implementation would:
    // 1. Fetch appointment details from database
    // 2. Fetch patient email and preferences
    // 3. Check if email notifications are enabled
    // 4. Send appropriate email using emailService methods
    
    return { success: true }
  } catch (error) {
    console.error(`Error sending ${type} email:`, error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Background job function for sending reminder emails
export async function sendScheduledReminders() {
  try {
    // This would be called by a cron job to send reminder emails
    // Implementation would:
    // 1. Query appointments that need reminders
    // 2. Check user notification preferences
    // 3. Send emails using emailService.sendAppointmentReminder
    
    console.log('Processing scheduled reminder emails')
    return { success: true, processed: 0 }
  } catch (error) {
    console.error('Error sending scheduled reminders:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}