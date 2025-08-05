import { Resend } from 'resend'

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
export const EMAIL_CONFIG = {
  from: 'NeonPro <noreply@neonpro.app>',
  domain: 'neonpro.app', // Replace with your domain
} as const

// Email templates types
export type EmailTemplate = 
  | 'invoice-created'
  | 'invoice-paid'
  | 'invoice-overdue'
  | 'payment-received'
  | 'payment-failed'

// Email data interfaces
export interface InvoiceEmailData {
  recipientEmail: string
  recipientName: string
  invoiceNumber: string
  invoiceAmount: number
  invoiceDate: string
  dueDate: string
  downloadUrl?: string
  companyName?: string
  companyEmail?: string
}

export interface PaymentEmailData {
  recipientEmail: string
  recipientName: string
  amount: number
  currency: string
  transactionId: string
  invoiceNumber?: string
  paidAt: string
}

// Email sender utility
export const sendEmail = async ({
  to,
  subject,
  html,
  attachments,
}: {
  to: string | string[]
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}) => {
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      attachments,
    })
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

// Alias for compatibility
export const sendInvoiceEmail = sendEmail;
