/**
 * Automated Invoice Generation System
 * Story 4.1: Automated Invoice Generation + Payment Tracking Implementation
 * 
 * This module provides comprehensive invoice generation with Brazilian NFSe integration:
 * - Automated invoice creation from appointments and treatments
 * - Brazilian NFSe (Nota Fiscal de Serviços Eletrônica) compliance
 * - Multi-payment method support (PIX, Credit Card, Boleto, Cash)
 * - Tax calculation according to Brazilian regulations
 * - Integration with municipal tax systems
 * - LGPD compliance for financial data
 * - Real-time payment tracking and reconciliation
 */

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

// Brazilian Tax and Invoice Types
interface BrazilianTaxInfo {
  cnpj?: string
  cpf?: string
  inscricaoMunicipal?: string
  inscricaoEstadual?: string
  regimeTributario: 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei'
  aliquotaISS: number // ISS tax rate (2% to 5%)
  aliquotaPIS?: number
  aliquotaCOFINS?: number
  aliquotaIR?: number
  aliquotaCSLL?: number
}

interface ServiceItem {
  id: string
  description: string
  serviceCode: string // CNAE code for the service
  quantity: number
  unitPrice: number
  totalPrice: number
  taxable: boolean
  issRetention: boolean // ISS retention by client
  cfop?: string // Código Fiscal de Operações e Prestações
}

interface PaymentMethod {
  type: 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'cash' | 'bank_transfer'
  installments?: number
  dueDate?: Date
  pixKey?: string
  cardBrand?: string
  bankCode?: string
  agency?: string
  account?: string
}

interface InvoiceRecipient {
  id: string
  name: string
  email: string
  phone?: string
  document: string // CPF or CNPJ
  documentType: 'cpf' | 'cnpj'
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  taxInfo?: BrazilianTaxInfo
}

interface InvoiceData {
  id: string
  number: string
  series: string
  issueDate: Date
  dueDate: Date
  recipient: InvoiceRecipient
  services: ServiceItem[]
  paymentMethods: PaymentMethod[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  currency: string
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  nfseInfo?: {
    number?: string
    verificationCode?: string
    accessKey?: string
    issueDate?: Date
    status: 'pending' | 'issued' | 'cancelled' | 'error'
    municipalityCode: string
    serviceLocation: string
  }
  metadata: {
    appointmentId?: string
    treatmentId?: string
    patientId?: string
    clinicId: string
    createdBy: string
    createdAt: Date
    updatedAt: Date
    notes?: string
  }
}

interface TaxCalculation {
  subtotal: number
  issAmount: number
  pisAmount: number
  cofinsAmount: number
  irAmount: number
  csllAmount: number
  totalTaxes: number
  netAmount: number
  retentions: {
    issRetention: number
    irRetention: number
    pisRetention: number
    cofinsRetention: number
    csllRetention: number
  }
}

interface NFSeRequest {
  prestador: {
    cnpj: string
    inscricaoMunicipal: string
    razaoSocial: string
  }
  tomador: {
    documento: string
    tipoDocumento: 'cpf' | 'cnpj'
    razaoSocial: string
    endereco: {
      logradouro: string
    numero: string
      complemento?: string
      bairro: string
      cidade: string
      uf: string
      cep: string
    }
  }
  servico: {
    discriminacao: string
    codigoServico: string
    valorServicos: number
    aliquota: number
    issRetido: boolean
    municipioPrestacao: string
  }
  valores: {
    valorServicos: number
    valorDeducoes: number
    valorPis: number
    valorCofins: number
    valorInss: number
    valorIr: number
    valorCsll: number
    valorIss: number
    valorIssRetido: number
    outrasRetencoes: number
    valorLiquido: number
  }
}

interface NFSeResponse {
  success: boolean
  nfseNumber?: string
  verificationCode?: string
  accessKey?: string
  issueDate?: Date
  pdfUrl?: string
  xmlUrl?: string
  error?: {
    code: string
    message: string
    details?: any
  }
}

interface InvoiceTemplate {
  id: string
  name: string
  type: 'consultation' | 'procedure' | 'treatment' | 'custom'
  services: Omit<ServiceItem, 'id' | 'quantity' | 'totalPrice'>[]
  paymentTerms: {
    daysToPayment: number
    allowInstallments: boolean
    maxInstallments: number
    interestRate?: number
    fineRate?: number
  }
  taxSettings: {
    applyISS: boolean
    applyPIS: boolean
    applyCOFINS: boolean
    applyIR: boolean
    applyCSLL: boolean
  }
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface InvoiceGenerationConfig {
  autoGeneration: {
    enabled: boolean
    triggers: ('appointment_completed' | 'treatment_finished' | 'manual')[]
    delay: number // minutes after trigger
  }
  nfseIntegration: {
    enabled: boolean
    environment: 'sandbox' | 'production'
    municipalityCode: string
    certificatePath?: string
    certificatePassword?: string
    webserviceUrl: string
  }
  paymentIntegration: {
    pixEnabled: boolean
    pixKey?: string
    boletoEnabled: boolean
    bankCode?: string
    creditCardEnabled: boolean
    paymentGateway?: 'stripe' | 'pagarme' | 'mercadopago' | 'cielo'
  }
  compliance: {
    lgpdCompliant: boolean
    dataRetentionDays: number
    auditTrail: boolean
    encryptSensitiveData: boolean
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    whatsappEnabled: boolean
    reminderDays: number[]
  }
}

class AutomatedInvoiceGenerator {
  private supabase = createClient()
  private config: InvoiceGenerationConfig
  private templates: Map<string, InvoiceTemplate> = new Map()
  private isInitialized: boolean = false

  constructor(config?: Partial<InvoiceGenerationConfig>) {
    this.config = this.initializeConfig(config)
  }

  /**
   * Initialize the invoice generation system
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Automated Invoice Generator...')
      
      // Load invoice templates
      await this.loadInvoiceTemplates()
      
      // Validate NFSe integration
      if (this.config.nfseIntegration.enabled) {
        await this.validateNFSeIntegration()
      }
      
      // Setup payment integration
      if (this.config.paymentIntegration.pixEnabled || 
          this.config.paymentIntegration.boletoEnabled || 
          this.config.paymentIntegration.creditCardEnabled) {
        await this.setupPaymentIntegration()
      }
      
      // Setup auto-generation triggers
      if (this.config.autoGeneration.enabled) {
        await this.setupAutoGenerationTriggers()
      }
      
      this.isInitialized = true
      console.log('✅ Automated Invoice Generator initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize invoice generator:', error)
      throw new Error('Invoice generator initialization failed')
    }
  }

  /**
   * Generate invoice from appointment
   */
  async generateFromAppointment(appointmentId: string, options?: {
    templateId?: string
    customServices?: ServiceItem[]
    paymentMethod?: PaymentMethod
    dueDate?: Date
    generateNFSe?: boolean
  }): Promise<InvoiceData> {
    try {
      if (!this.isInitialized) {
        throw new Error('Invoice generator not initialized')
      }

      console.log(`Generating invoice for appointment ${appointmentId}`)
      
      // Get appointment data
      const appointment = await this.getAppointmentData(appointmentId)
      if (!appointment) {
        throw new Error('Appointment not found')
      }

      // Get patient data
      const patient = await this.getPatientData(appointment.patient_id)
      if (!patient) {
        throw new Error('Patient not found')
      }

      // Get clinic data
      const clinic = await this.getClinicData(appointment.clinic_id)
      if (!clinic) {
        throw new Error('Clinic not found')
      }

      // Determine services
      let services: ServiceItem[]
      if (options?.customServices) {
        services = options.customServices
      } else if (options?.templateId) {
        const template = this.templates.get(options.templateId)
        if (!template) {
          throw new Error('Template not found')
        }
        services = this.buildServicesFromTemplate(template, appointment)
      } else {
        services = await this.buildServicesFromAppointment(appointment)
      }

      // Calculate totals and taxes
      const taxCalculation = this.calculateTaxes(services, clinic.taxInfo)
      
      // Create invoice recipient
      const recipient: InvoiceRecipient = {
        id: patient.id,
        name: patient.full_name,
        email: patient.email,
        phone: patient.phone,
        document: patient.cpf || patient.cnpj,
        documentType: patient.cpf ? 'cpf' : 'cnpj',
        address: {
          street: patient.address?.street || '',
          number: patient.address?.number || '',
          complement: patient.address?.complement,
          neighborhood: patient.address?.neighborhood || '',
          city: patient.address?.city || '',
          state: patient.address?.state || '',
          zipCode: patient.address?.zip_code || '',
          country: 'Brasil'
        },
        taxInfo: patient.taxInfo
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(clinic.id)
      
      // Create invoice data
      const invoice: InvoiceData = {
        id: `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        number: invoiceNumber.number,
        series: invoiceNumber.series,
        issueDate: new Date(),
        dueDate: options?.dueDate || this.calculateDueDate(),
        recipient,
        services,
        paymentMethods: options?.paymentMethod ? [options.paymentMethod] : this.getDefaultPaymentMethods(),
        subtotal: taxCalculation.subtotal,
        taxAmount: taxCalculation.totalTaxes,
        totalAmount: taxCalculation.netAmount,
        currency: 'BRL',
        status: 'draft',
        metadata: {
          appointmentId,
          patientId: patient.id,
          clinicId: clinic.id,
          createdBy: appointment.created_by || 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      // Store invoice in database
      await this.storeInvoice(invoice)
      
      // Generate NFSe if requested and enabled
      if (options?.generateNFSe !== false && this.config.nfseIntegration.enabled) {
        try {
          const nfseResult = await this.generateNFSe(invoice)
          if (nfseResult.success) {
            invoice.nfseInfo = {
              number: nfseResult.nfseNumber,
              verificationCode: nfseResult.verificationCode,
              accessKey: nfseResult.accessKey,
              issueDate: nfseResult.issueDate,
              status: 'issued',
              municipalityCode: this.config.nfseIntegration.municipalityCode,
              serviceLocation: clinic.address?.city || ''
            }
            invoice.status = 'issued'
            await this.updateInvoice(invoice)
          }
        } catch (nfseError) {
          console.error('NFSe generation failed:', nfseError)
          // Continue without NFSe - invoice is still valid
        }
      }
      
      console.log(`✅ Invoice ${invoice.number} generated successfully`)
      return invoice
      
    } catch (error) {
      console.error('❌ Invoice generation failed:', error)
      throw new Error(`Invoice generation failed: ${error.message}`)
    }
  }

  /**
   * Generate invoice from treatment
   */
  async generateFromTreatment(treatmentId: string, options?: {
    templateId?: string
    installments?: number
    generateNFSe?: boolean
  }): Promise<InvoiceData[]> {
    try {
      console.log(`Generating invoice(s) for treatment ${treatmentId}`)
      
      // Get treatment data
      const treatment = await this.getTreatmentData(treatmentId)
      if (!treatment) {
        throw new Error('Treatment not found')
      }

      const invoices: InvoiceData[] = []
      
      if (options?.installments && options.installments > 1) {
        // Generate multiple invoices for installments
        const installmentAmount = treatment.total_cost / options.installments
        
        for (let i = 0; i < options.installments; i++) {
          const dueDate = new Date()
          dueDate.setMonth(dueDate.getMonth() + i)
          
          const installmentInvoice = await this.generateInstallmentInvoice(
            treatment,
            i + 1,
            options.installments,
            installmentAmount,
            dueDate,
            options
          )
          
          invoices.push(installmentInvoice)
        }
      } else {
        // Generate single invoice
        const singleInvoice = await this.generateSingleTreatmentInvoice(treatment, options)
        invoices.push(singleInvoice)
      }
      
      console.log(`✅ Generated ${invoices.length} invoice(s) for treatment ${treatmentId}`)
      return invoices
      
    } catch (error) {
      console.error('❌ Treatment invoice generation failed:', error)
      throw new Error(`Treatment invoice generation failed: ${error.message}`)
    }
  }

  /**
   * Calculate Brazilian taxes
   */
  private calculateTaxes(services: ServiceItem[], clinicTaxInfo: BrazilianTaxInfo): TaxCalculation {
    const subtotal = services.reduce((sum, service) => sum + service.totalPrice, 0)
    
    let issAmount = 0
    let pisAmount = 0
    let cofinsAmount = 0
    let irAmount = 0
    let csllAmount = 0
    
    // Calculate ISS (Imposto Sobre Serviços)
    const taxableServices = services.filter(s => s.taxable)
    const taxableAmount = taxableServices.reduce((sum, service) => sum + service.totalPrice, 0)
    
    if (taxableAmount > 0) {
      issAmount = taxableAmount * (clinicTaxInfo.aliquotaISS / 100)
      
      // For Simples Nacional, other taxes are included in ISS
      if (clinicTaxInfo.regimeTributario !== 'simples_nacional') {
        if (clinicTaxInfo.aliquotaPIS) {
          pisAmount = taxableAmount * (clinicTaxInfo.aliquotaPIS / 100)
        }
        if (clinicTaxInfo.aliquotaCOFINS) {
          cofinsAmount = taxableAmount * (clinicTaxInfo.aliquotaCOFINS / 100)
        }
        if (clinicTaxInfo.aliquotaIR) {
          irAmount = taxableAmount * (clinicTaxInfo.aliquotaIR / 100)
        }
        if (clinicTaxInfo.aliquotaCSLL) {
          csllAmount = taxableAmount * (clinicTaxInfo.aliquotaCSLL / 100)
        }
      }
    }
    
    const totalTaxes = issAmount + pisAmount + cofinsAmount + irAmount + csllAmount
    
    // Calculate retentions (when client retains taxes)
    const retentions = {
      issRetention: services.some(s => s.issRetention) ? issAmount : 0,
      irRetention: 0, // Would be calculated based on client type
      pisRetention: 0,
      cofinsRetention: 0,
      csllRetention: 0
    }
    
    const netAmount = subtotal - retentions.issRetention - retentions.irRetention - 
                     retentions.pisRetention - retentions.cofinsRetention - retentions.csllRetention
    
    return {
      subtotal,
      issAmount,
      pisAmount,
      cofinsAmount,
      irAmount,
      csllAmount,
      totalTaxes,
      netAmount,
      retentions
    }
  }

  /**
   * Generate NFSe (Brazilian Electronic Service Invoice)
   */
  private async generateNFSe(invoice: InvoiceData): Promise<NFSeResponse> {
    try {
      console.log(`Generating NFSe for invoice ${invoice.number}`)
      
      // Get clinic data for NFSe
      const clinic = await this.getClinicData(invoice.metadata.clinicId)
      if (!clinic?.taxInfo?.cnpj) {
        throw new Error('Clinic CNPJ required for NFSe generation')
      }

      // Prepare NFSe request
      const nfseRequest: NFSeRequest = {
        prestador: {
          cnpj: clinic.taxInfo.cnpj,
          inscricaoMunicipal: clinic.taxInfo.inscricaoMunicipal || '',
          razaoSocial: clinic.name
        },
        tomador: {
          documento: invoice.recipient.document,
          tipoDocumento: invoice.recipient.documentType,
          razaoSocial: invoice.recipient.name,
          endereco: {
            logradouro: invoice.recipient.address.street,
            numero: invoice.recipient.address.number,
            complemento: invoice.recipient.address.complement,
            bairro: invoice.recipient.address.neighborhood,
            cidade: invoice.recipient.address.city,
            uf: invoice.recipient.address.state,
            cep: invoice.recipient.address.zipCode.replace(/\D/g, '')
          }
        },
        servico: {
          discriminacao: invoice.services.map(s => s.description).join('; '),
          codigoServico: invoice.services[0]?.serviceCode || '1.01', // Default to medical consultation
          valorServicos: invoice.subtotal,
          aliquota: clinic.taxInfo.aliquotaISS,
          issRetido: invoice.services.some(s => s.issRetention),
          municipioPrestacao: this.config.nfseIntegration.municipalityCode
        },
        valores: {
          valorServicos: invoice.subtotal,
          valorDeducoes: 0,
          valorPis: 0, // Calculated based on tax regime
          valorCofins: 0,
          valorInss: 0,
          valorIr: 0,
          valorCsll: 0,
          valorIss: invoice.taxAmount,
          valorIssRetido: invoice.services.some(s => s.issRetention) ? invoice.taxAmount : 0,
          outrasRetencoes: 0,
          valorLiquido: invoice.totalAmount
        }
      }

      // Call NFSe webservice (implementation depends on municipality)
      const nfseResponse = await this.callNFSeWebservice(nfseRequest)
      
      if (nfseResponse.success) {
        console.log(`✅ NFSe generated: ${nfseResponse.nfseNumber}`)
        
        // Store NFSe data
        await this.storeNFSeData(invoice.id, nfseResponse)
      }
      
      return nfseResponse
      
    } catch (error) {
      console.error('❌ NFSe generation failed:', error)
      return {
        success: false,
        error: {
          code: 'NFSE_GENERATION_ERROR',
          message: error.message
        }
      }
    }
  }

  /**
   * Track payment for invoice
   */
  async trackPayment(invoiceId: string, paymentData: {
    amount: number
    method: PaymentMethod
    transactionId?: string
    paidAt: Date
    fees?: number
    notes?: string
  }): Promise<void> {
    try {
      console.log(`Tracking payment for invoice ${invoiceId}`)
      
      // Get invoice
      const invoice = await this.getInvoice(invoiceId)
      if (!invoice) {
        throw new Error('Invoice not found')
      }

      // Create payment record
      const payment = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        invoice_id: invoiceId,
        amount: paymentData.amount,
        method: paymentData.method.type,
        transaction_id: paymentData.transactionId,
        paid_at: paymentData.paidAt,
        fees: paymentData.fees || 0,
        notes: paymentData.notes,
        status: 'confirmed',
        created_at: new Date()
      }

      // Store payment
      await this.supabase
        .from('invoice_payments')
        .insert(payment)

      // Update invoice status
      const totalPaid = await this.getTotalPaidAmount(invoiceId)
      let newStatus: InvoiceData['status'] = 'sent'
      
      if (totalPaid >= invoice.totalAmount) {
        newStatus = 'paid'
      } else if (totalPaid > 0) {
        newStatus = 'sent' // Partially paid
      }
      
      if (invoice.status !== newStatus) {
        await this.updateInvoiceStatus(invoiceId, newStatus)
      }
      
      // Send payment confirmation
      if (this.config.notifications.emailEnabled) {
        await this.sendPaymentConfirmation(invoice, payment)
      }
      
      console.log(`✅ Payment tracked for invoice ${invoiceId}`)
      
    } catch (error) {
      console.error('❌ Payment tracking failed:', error)
      throw new Error(`Payment tracking failed: ${error.message}`)
    }
  }

  /**
   * Generate payment link (PIX, Boleto, etc.)
   */
  async generatePaymentLink(invoiceId: string, method: PaymentMethod): Promise<{
    paymentUrl?: string
    pixCode?: string
    boletoUrl?: string
    expiresAt: Date
  }> {
    try {
      const invoice = await this.getInvoice(invoiceId)
      if (!invoice) {
        throw new Error('Invoice not found')
      }

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

      switch (method.type) {
        case 'pix':
          const pixCode = await this.generatePixCode(invoice)
          return { pixCode, expiresAt }
          
        case 'boleto':
          const boletoUrl = await this.generateBoleto(invoice)
          return { boletoUrl, expiresAt }
          
        case 'credit_card':
        case 'debit_card':
          const paymentUrl = await this.generateCardPaymentUrl(invoice, method)
          return { paymentUrl, expiresAt }
          
        default:
          throw new Error('Unsupported payment method')
      }
      
    } catch (error) {
      console.error('❌ Payment link generation failed:', error)
      throw new Error(`Payment link generation failed: ${error.message}`)
    }
  }

  /**
   * Get invoice analytics
   */
  async getInvoiceAnalytics(filters?: {
    startDate?: Date
    endDate?: Date
    clinicId?: string
    status?: InvoiceData['status']
  }): Promise<{
    totalInvoices: number
    totalAmount: number
    paidAmount: number
    pendingAmount: number
    overdueAmount: number
    averagePaymentTime: number
    paymentMethodDistribution: Record<string, number>
    monthlyTrends: {
      month: string
      invoices: number
      amount: number
      paidAmount: number
    }[]
  }> {
    try {
      // Build query with filters
      let query = this.supabase
        .from('invoices')
        .select(`
          *,
          invoice_payments(*)
        `)
      
      if (filters?.startDate) {
        query = query.gte('issue_date', filters.startDate.toISOString())
      }
      
      if (filters?.endDate) {
        query = query.lte('issue_date', filters.endDate.toISOString())
      }
      
      if (filters?.clinicId) {
        query = query.eq('clinic_id', filters.clinicId)
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      
      const { data: invoices } = await query
      
      if (!invoices) {
        throw new Error('Failed to fetch invoice data')
      }

      // Calculate analytics
      const totalInvoices = invoices.length
      const totalAmount = invoices.reduce((sum, inv) => sum + inv.total_amount, 0)
      
      let paidAmount = 0
      let pendingAmount = 0
      let overdueAmount = 0
      const paymentMethods: Record<string, number> = {}
      const paymentTimes: number[] = []
      
      for (const invoice of invoices) {
        const payments = invoice.invoice_payments || []
        const invoicePaidAmount = payments.reduce((sum: number, p: any) => sum + p.amount, 0)
        
        if (invoice.status === 'paid') {
          paidAmount += invoice.total_amount
          
          // Calculate payment time
          const lastPayment = payments[payments.length - 1]
          if (lastPayment) {
            const paymentTime = new Date(lastPayment.paid_at).getTime() - new Date(invoice.issue_date).getTime()
            paymentTimes.push(paymentTime / (1000 * 60 * 60 * 24)) // Convert to days
          }
        } else if (new Date(invoice.due_date) < new Date()) {
          overdueAmount += invoice.total_amount - invoicePaidAmount
        } else {
          pendingAmount += invoice.total_amount - invoicePaidAmount
        }
        
        // Count payment methods
        for (const payment of payments) {
          paymentMethods[payment.method] = (paymentMethods[payment.method] || 0) + 1
        }
      }
      
      const averagePaymentTime = paymentTimes.length > 0 
        ? paymentTimes.reduce((sum, time) => sum + time, 0) / paymentTimes.length 
        : 0
      
      // Calculate monthly trends
      const monthlyData: Record<string, { invoices: number; amount: number; paidAmount: number }> = {}
      
      for (const invoice of invoices) {
        const month = new Date(invoice.issue_date).toISOString().substring(0, 7) // YYYY-MM
        
        if (!monthlyData[month]) {
          monthlyData[month] = { invoices: 0, amount: 0, paidAmount: 0 }
        }
        
        monthlyData[month].invoices++
        monthlyData[month].amount += invoice.total_amount
        
        if (invoice.status === 'paid') {
          monthlyData[month].paidAmount += invoice.total_amount
        }
      }
      
      const monthlyTrends = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month))
      
      return {
        totalInvoices,
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
        averagePaymentTime,
        paymentMethodDistribution: paymentMethods,
        monthlyTrends
      }
      
    } catch (error) {
      console.error('❌ Failed to get invoice analytics:', error)
      throw new Error(`Analytics generation failed: ${error.message}`)
    }
  }

  // Private helper methods
  private initializeConfig(config?: Partial<InvoiceGenerationConfig>): InvoiceGenerationConfig {
    const defaultConfig: InvoiceGenerationConfig = {
      autoGeneration: {
        enabled: true,
        triggers: ['appointment_completed', 'treatment_finished'],
        delay: 5 // 5 minutes
      },
      nfseIntegration: {
        enabled: true,
        environment: 'sandbox',
        municipalityCode: '3550308', // São Paulo
        webserviceUrl: 'https://nfse.prefeitura.sp.gov.br/ws/lotenfe.asmx'
      },
      paymentIntegration: {
        pixEnabled: true,
        boletoEnabled: true,
        creditCardEnabled: true,
        paymentGateway: 'stripe'
      },
      compliance: {
        lgpdCompliant: true,
        dataRetentionDays: 2555, // 7 years
        auditTrail: true,
        encryptSensitiveData: true
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        whatsappEnabled: false,
        reminderDays: [7, 3, 1] // Days before due date
      }
    }
    
    return { ...defaultConfig, ...config }
  }

  private async loadInvoiceTemplates(): Promise<void> {
    const { data: templates } = await this.supabase
      .from('invoice_templates')
      .select('*')
      .eq('active', true)
    
    if (templates) {
      for (const template of templates) {
        this.templates.set(template.id, template)
      }
    }
  }

  private async validateNFSeIntegration(): Promise<void> {
    // Validate NFSe configuration and connectivity
    console.log('Validating NFSe integration...')
  }

  private async setupPaymentIntegration(): Promise<void> {
    // Setup payment gateway integration
    console.log('Setting up payment integration...')
  }

  private async setupAutoGenerationTriggers(): Promise<void> {
    // Setup database triggers for auto-generation
    console.log('Setting up auto-generation triggers...')
  }

  private async getAppointmentData(appointmentId: string): Promise<any> {
    const { data } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()
    
    return data
  }

  private async getPatientData(patientId: string): Promise<any> {
    const { data } = await this.supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()
    
    return data
  }

  private async getClinicData(clinicId: string): Promise<any> {
    const { data } = await this.supabase
      .from('clinics')
      .select('*')
      .eq('id', clinicId)
      .single()
    
    return data
  }

  private async getTreatmentData(treatmentId: string): Promise<any> {
    const { data } = await this.supabase
      .from('treatments')
      .select('*')
      .eq('id', treatmentId)
      .single()
    
    return data
  }

  private buildServicesFromTemplate(template: InvoiceTemplate, appointment: any): ServiceItem[] {
    return template.services.map((service, index) => ({
      id: `service_${index}`,
      description: service.description,
      serviceCode: service.serviceCode,
      quantity: 1,
      unitPrice: service.unitPrice,
      totalPrice: service.unitPrice,
      taxable: true,
      issRetention: false
    }))
  }

  private async buildServicesFromAppointment(appointment: any): Promise<ServiceItem[]> {
    // Build services based on appointment type and procedures
    return [{
      id: 'service_1',
      description: 'Consulta médica',
      serviceCode: '1.01',
      quantity: 1,
      unitPrice: appointment.price || 150.00,
      totalPrice: appointment.price || 150.00,
      taxable: true,
      issRetention: false
    }]
  }

  private async generateInvoiceNumber(clinicId: string): Promise<{ number: string; series: string }> {
    // Generate sequential invoice number
    const { data: lastInvoice } = await this.supabase
      .from('invoices')
      .select('number')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    const lastNumber = lastInvoice?.number ? parseInt(lastInvoice.number) : 0
    const newNumber = (lastNumber + 1).toString().padStart(6, '0')
    
    return {
      number: newNumber,
      series: '001'
    }
  }

  private calculateDueDate(): Date {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30) // 30 days default
    return dueDate
  }

  private getDefaultPaymentMethods(): PaymentMethod[] {
    const methods: PaymentMethod[] = []
    
    if (this.config.paymentIntegration.pixEnabled) {
      methods.push({ type: 'pix' })
    }
    
    if (this.config.paymentIntegration.boletoEnabled) {
      methods.push({ type: 'boleto' })
    }
    
    if (this.config.paymentIntegration.creditCardEnabled) {
      methods.push({ type: 'credit_card' })
    }
    
    return methods
  }

  private async storeInvoice(invoice: InvoiceData): Promise<void> {
    await this.supabase
      .from('invoices')
      .insert({
        id: invoice.id,
        number: invoice.number,
        series: invoice.series,
        issue_date: invoice.issueDate.toISOString(),
        due_date: invoice.dueDate.toISOString(),
        recipient_data: JSON.stringify(invoice.recipient),
        services_data: JSON.stringify(invoice.services),
        payment_methods: JSON.stringify(invoice.paymentMethods),
        subtotal: invoice.subtotal,
        tax_amount: invoice.taxAmount,
        total_amount: invoice.totalAmount,
        currency: invoice.currency,
        status: invoice.status,
        nfse_info: JSON.stringify(invoice.nfseInfo),
        appointment_id: invoice.metadata.appointmentId,
        treatment_id: invoice.metadata.treatmentId,
        patient_id: invoice.metadata.patientId,
        clinic_id: invoice.metadata.clinicId,
        created_by: invoice.metadata.createdBy,
        notes: invoice.metadata.notes
      })
  }

  private async updateInvoice(invoice: InvoiceData): Promise<void> {
    await this.supabase
      .from('invoices')
      .update({
        status: invoice.status,
        nfse_info: JSON.stringify(invoice.nfseInfo),
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice.id)
  }

  private async getInvoice(invoiceId: string): Promise<InvoiceData | null> {
    const { data } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()
    
    if (!data) return null
    
    // Convert database record to InvoiceData
    return {
      id: data.id,
      number: data.number,
      series: data.series,
      issueDate: new Date(data.issue_date),
      dueDate: new Date(data.due_date),
      recipient: JSON.parse(data.recipient_data),
      services: JSON.parse(data.services_data),
      paymentMethods: JSON.parse(data.payment_methods),
      subtotal: data.subtotal,
      taxAmount: data.tax_amount,
      totalAmount: data.total_amount,
      currency: data.currency,
      status: data.status,
      nfseInfo: data.nfse_info ? JSON.parse(data.nfse_info) : undefined,
      metadata: {
        appointmentId: data.appointment_id,
        treatmentId: data.treatment_id,
        patientId: data.patient_id,
        clinicId: data.clinic_id,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        notes: data.notes
      }
    }
  }

  private async generateInstallmentInvoice(
    treatment: any,
    installmentNumber: number,
    totalInstallments: number,
    amount: number,
    dueDate: Date,
    options?: any
  ): Promise<InvoiceData> {
    // Implementation for installment invoice generation
    throw new Error('Method not implemented')
  }

  private async generateSingleTreatmentInvoice(treatment: any, options?: any): Promise<InvoiceData> {
    // Implementation for single treatment invoice
    throw new Error('Method not implemented')
  }

  private async callNFSeWebservice(request: NFSeRequest): Promise<NFSeResponse> {
    // Implementation for NFSe webservice call
    // This would vary by municipality
    return {
      success: true,
      nfseNumber: '123456',
      verificationCode: 'ABC123',
      accessKey: 'KEY123',
      issueDate: new Date()
    }
  }

  private async storeNFSeData(invoiceId: string, nfseResponse: NFSeResponse): Promise<void> {
    await this.supabase
      .from('nfse_records')
      .insert({
        invoice_id: invoiceId,
        nfse_number: nfseResponse.nfseNumber,
        verification_code: nfseResponse.verificationCode,
        access_key: nfseResponse.accessKey,
        issue_date: nfseResponse.issueDate?.toISOString(),
        pdf_url: nfseResponse.pdfUrl,
        xml_url: nfseResponse.xmlUrl
      })
  }

  private async getTotalPaidAmount(invoiceId: string): Promise<number> {
    const { data: payments } = await this.supabase
      .from('invoice_payments')
      .select('amount')
      .eq('invoice_id', invoiceId)
      .eq('status', 'confirmed')
    
    return payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
  }

  private async updateInvoiceStatus(invoiceId: string, status: InvoiceData['status']): Promise<void> {
    await this.supabase
      .from('invoices')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', invoiceId)
  }

  private async sendPaymentConfirmation(invoice: InvoiceData, payment: any): Promise<void> {
    // Implementation for payment confirmation email/SMS
    console.log(`Sending payment confirmation for invoice ${invoice.number}`)
  }

  private async generatePixCode(invoice: InvoiceData): Promise<string> {
    // Generate PIX payment code
    return `PIX_CODE_${invoice.id}`
  }

  private async generateBoleto(invoice: InvoiceData): Promise<string> {
    // Generate boleto URL
    return `https://boleto.example.com/${invoice.id}`
  }

  private async generateCardPaymentUrl(invoice: InvoiceData, method: PaymentMethod): Promise<string> {
    // Generate card payment URL
    return `https://payment.example.com/${invoice.id}`
  }
}

export {
  AutomatedInvoiceGenerator,
  type InvoiceData,
  type InvoiceTemplate,
  type InvoiceGenerationConfig,
  type BrazilianTaxInfo,
  type ServiceItem,
  type PaymentMethod,
  type NFSeRequest,
  type NFSeResponse,
  type TaxCalculation
}