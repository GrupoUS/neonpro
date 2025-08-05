import type { createClient } from "@supabase/supabase-js";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import type { z } from "zod";

// Validation Schemas
const CompanyInfoSchema = z.object({
  name: z.string(),
  cnpj: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logo: z.string().optional(), // Base64 or URL
});

const CustomerInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  document: z.string(), // CPF or CNPJ
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
});

const InvoiceItemSchema = z.object({
  description: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  total: z.number().positive(),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.number().min(0).default(0),
});

const ReceiptDataSchema = z.object({
  id: z.string(),
  number: z.string(),
  type: z.enum(["receipt", "invoice"]),
  date: z.date(),
  dueDate: z.date().optional(),
  customer: CustomerInfoSchema,
  items: z.array(InvoiceItemSchema),
  subtotal: z.number().positive(),
  taxTotal: z.number().min(0).default(0),
  total: z.number().positive(),
  paymentMethod: z.string().optional(),
  paymentDate: z.date().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

const NFSeConfigSchema = z.object({
  enabled: z.boolean().default(false),
  provider: z.enum(["ginfes", "issnet", "webiss", "simpliss"]),
  certificatePath: z.string().optional(),
  certificatePassword: z.string().optional(),
  serviceCode: z.string().optional(),
  cityCode: z.string().optional(),
  environment: z.enum(["production", "sandbox"]).default("sandbox"),
});

const EmailConfigSchema = z.object({
  enabled: z.boolean().default(true),
  smtp: z.object({
    host: z.string(),
    port: z.number(),
    secure: z.boolean(),
    auth: z.object({
      user: z.string(),
      pass: z.string(),
    }),
  }),
  from: z.string().email(),
  templates: z.object({
    receipt: z.object({
      subject: z.string(),
      html: z.string(),
    }),
    invoice: z.object({
      subject: z.string(),
      html: z.string(),
    }),
  }),
});

// Types
type CompanyInfo = z.infer<typeof CompanyInfoSchema>;
type CustomerInfo = z.infer<typeof CustomerInfoSchema>;
type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
type ReceiptData = z.infer<typeof ReceiptDataSchema>;
type NFSeConfig = z.infer<typeof NFSeConfigSchema>;
type EmailConfig = z.infer<typeof EmailConfigSchema>;

interface GenerationResult {
  success: boolean;
  documentId: string;
  pdfBuffer?: Buffer;
  nfseNumber?: string;
  error?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface TemplateOptions {
  template: "modern" | "classic" | "minimal" | "corporate";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    header: string;
    body: string;
  };
}

/**
 * Receipt and Invoice Management System
 * Handles PDF generation, NFSe integration, and email delivery
 */
export class ReceiptInvoiceManager {
  private supabase: ReturnType<typeof createClient>;
  private companyInfo: CompanyInfo;
  private nfseConfig: NFSeConfig;
  private emailConfig: EmailConfig;
  private emailTransporter?: nodemailer.Transporter;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    companyInfo: CompanyInfo,
    nfseConfig: NFSeConfig,
    emailConfig: EmailConfig,
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.companyInfo = CompanyInfoSchema.parse(companyInfo);
    this.nfseConfig = NFSeConfigSchema.parse(nfseConfig);
    this.emailConfig = EmailConfigSchema.parse(emailConfig);

    if (this.emailConfig.enabled) {
      this.setupEmailTransporter();
    }
  }

  /**
   * Generate PDF receipt or invoice
   */
  async generatePDF(
    data: ReceiptData,
    options: TemplateOptions = {
      template: "modern",
      colors: { primary: "#2563eb", secondary: "#64748b", accent: "#10b981" },
      fonts: { header: "Helvetica-Bold", body: "Helvetica" },
    },
  ): Promise<GenerationResult> {
    try {
      const validatedData = ReceiptDataSchema.parse(data);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));

      await new Promise<void>((resolve) => {
        doc.on("end", resolve);

        // Generate PDF content based on template
        this.generatePDFContent(doc, validatedData, options);

        doc.end();
      });

      const pdfBuffer = Buffer.concat(chunks);

      // Save to database
      const { data: savedDoc, error } = await this.supabase
        .from("receipts_invoices")
        .insert({
          id: validatedData.id,
          number: validatedData.number,
          type: validatedData.type,
          customer_id: validatedData.customer.id,
          data: validatedData,
          pdf_path: `receipts/${validatedData.id}.pdf`,
          status: validatedData.status,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Upload PDF to storage
      const { error: uploadError } = await this.supabase.storage
        .from("documents")
        .upload(`receipts/${validatedData.id}.pdf`, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      return {
        success: true,
        documentId: validatedData.id,
        pdfBuffer,
      };
    } catch (error) {
      console.error("PDF generation error:", error);
      return {
        success: false,
        documentId: data.id,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate NFSe (Brazilian electronic service invoice)
   */
  async generateNFSe(data: ReceiptData): Promise<GenerationResult> {
    try {
      if (!this.nfseConfig.enabled) {
        throw new Error("NFSe integration is not enabled");
      }

      const validatedData = ReceiptDataSchema.parse(data);

      // Generate NFSe based on provider
      const nfseResult = await this.processNFSe(validatedData);

      // Update database with NFSe information
      const { error } = await this.supabase
        .from("receipts_invoices")
        .update({
          nfse_number: nfseResult.nfseNumber,
          nfse_status: "issued",
          nfse_issued_at: new Date().toISOString(),
        })
        .eq("id", validatedData.id);

      if (error) throw error;

      return {
        success: true,
        documentId: validatedData.id,
        nfseNumber: nfseResult.nfseNumber,
      };
    } catch (error) {
      console.error("NFSe generation error:", error);
      return {
        success: false,
        documentId: data.id,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send receipt/invoice via email
   */
  async sendEmail(
    documentId: string,
    recipientEmail?: string,
    customMessage?: string,
  ): Promise<EmailResult> {
    try {
      if (!this.emailConfig.enabled || !this.emailTransporter) {
        throw new Error("Email delivery is not configured");
      }

      // Get document data
      const { data: document, error } = await this.supabase
        .from("receipts_invoices")
        .select("*")
        .eq("id", documentId)
        .single();

      if (error || !document) {
        throw new Error("Document not found");
      }

      // Get PDF from storage
      const { data: pdfData, error: downloadError } = await this.supabase.storage
        .from("documents")
        .download(document.pdf_path);

      if (downloadError) throw downloadError;

      const pdfBuffer = Buffer.from(await pdfData.arrayBuffer());

      // Prepare email
      const template = this.emailConfig.templates[document.type as "receipt" | "invoice"];
      const recipient = recipientEmail || document.data.customer.email;

      const mailOptions = {
        from: this.emailConfig.from,
        to: recipient,
        subject: template.subject.replace("{{number}}", document.number),
        html: this.processEmailTemplate(template.html, document.data, customMessage),
        attachments: [
          {
            filename: `${document.type}-${document.number}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      };

      const result = await this.emailTransporter.sendMail(mailOptions);

      // Update delivery status
      await this.supabase
        .from("receipts_invoices")
        .update({
          email_sent_at: new Date().toISOString(),
          email_recipient: recipient,
          status: "sent",
        })
        .eq("id", documentId);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("Email sending error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get receipt/invoice by ID
   */
  async getDocument(id: string) {
    const { data, error } = await this.supabase
      .from("receipts_invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * List receipts/invoices with filters
   */
  async listDocuments(
    filters: {
      type?: "receipt" | "invoice";
      status?: string;
      customerId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    let query = this.supabase.from("receipts_invoices").select("*", { count: "exact" });

    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.customerId) {
      query = query.eq("customer_id", filters.customerId);
    }

    if (filters.dateFrom) {
      query = query.gte("created_at", filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
      query = query.lte("created_at", filters.dateTo.toISOString());
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      documents: data,
      total: count || 0,
    };
  }

  /**
   * Update document status
   */
  async updateStatus(id: string, status: "draft" | "sent" | "paid" | "overdue" | "cancelled") {
    const { data, error } = await this.supabase
      .from("receipts_invoices")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Private methods
  private setupEmailTransporter() {
    this.emailTransporter = nodemailer.createTransporter(this.emailConfig.smtp);
  }

  private generatePDFContent(doc: PDFKit.PDFDocument, data: ReceiptData, options: TemplateOptions) {
    const { colors, fonts } = options;

    // Header
    if (this.companyInfo.logo) {
      // Add logo if available
      // doc.image(this.companyInfo.logo, 50, 50, { width: 100 });
    }

    doc
      .fontSize(20)
      .font(fonts.header)
      .fillColor(colors.primary)
      .text(this.companyInfo.name, 50, 50);

    doc
      .fontSize(10)
      .font(fonts.body)
      .fillColor(colors.secondary)
      .text(
        `${this.companyInfo.address}, ${this.companyInfo.city} - ${this.companyInfo.state}`,
        50,
        80,
      )
      .text(`CEP: ${this.companyInfo.zipCode} | CNPJ: ${this.companyInfo.cnpj}`, 50, 95);

    // Document title and number
    const title = data.type === "receipt" ? "RECIBO" : "FATURA";
    doc
      .fontSize(16)
      .font(fonts.header)
      .fillColor(colors.primary)
      .text(title, 400, 50)
      .text(`Nº ${data.number}`, 400, 70);

    // Date
    doc
      .fontSize(10)
      .font(fonts.body)
      .fillColor(colors.secondary)
      .text(`Data: ${format(data.date, "dd/MM/yyyy", { locale: ptBR })}`, 400, 90);

    if (data.dueDate) {
      doc.text(`Vencimento: ${format(data.dueDate, "dd/MM/yyyy", { locale: ptBR })}`, 400, 105);
    }

    // Customer info
    doc.fontSize(12).font(fonts.header).fillColor(colors.primary).text("CLIENTE:", 50, 140);

    doc
      .fontSize(10)
      .font(fonts.body)
      .fillColor("#000")
      .text(data.customer.name, 50, 160)
      .text(`Documento: ${data.customer.document}`, 50, 175)
      .text(`Email: ${data.customer.email}`, 50, 190);

    if (data.customer.address) {
      doc.text(`Endereço: ${data.customer.address}`, 50, 205);
    }

    // Items table
    const tableTop = 250;
    doc.fontSize(10).font(fonts.header).fillColor(colors.primary);

    // Table headers
    doc
      .text("DESCRIÇÃO", 50, tableTop)
      .text("QTD", 300, tableTop)
      .text("VALOR UNIT.", 350, tableTop)
      .text("TOTAL", 450, tableTop);

    // Table line
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .strokeColor(colors.secondary)
      .stroke();

    // Items
    let currentY = tableTop + 25;
    doc.fontSize(9).font(fonts.body).fillColor("#000");

    data.items.forEach((item) => {
      doc
        .text(item.description, 50, currentY, { width: 240 })
        .text(item.quantity.toString(), 300, currentY)
        .text(`R$ ${item.unitPrice.toFixed(2)}`, 350, currentY)
        .text(`R$ ${item.total.toFixed(2)}`, 450, currentY);

      currentY += 20;
    });

    // Totals
    const totalsY = currentY + 20;
    doc.fontSize(10).font(fonts.body).fillColor("#000");

    if (data.taxTotal > 0) {
      doc
        .text(`Subtotal: R$ ${data.subtotal.toFixed(2)}`, 350, totalsY)
        .text(`Impostos: R$ ${data.taxTotal.toFixed(2)}`, 350, totalsY + 15);
    }

    doc
      .fontSize(12)
      .font(fonts.header)
      .fillColor(colors.primary)
      .text(`TOTAL: R$ ${data.total.toFixed(2)}`, 350, totalsY + (data.taxTotal > 0 ? 35 : 15));

    // Payment info
    if (data.paymentMethod) {
      doc
        .fontSize(10)
        .font(fonts.body)
        .fillColor("#000")
        .text(`Forma de pagamento: ${data.paymentMethod}`, 50, totalsY + 50);
    }

    if (data.paymentDate) {
      doc.text(
        `Data do pagamento: ${format(data.paymentDate, "dd/MM/yyyy", { locale: ptBR })}`,
        50,
        totalsY + 65,
      );
    }

    // Notes and terms
    if (data.notes) {
      doc
        .fontSize(9)
        .font(fonts.body)
        .fillColor(colors.secondary)
        .text("Observações:", 50, totalsY + 90)
        .text(data.notes, 50, totalsY + 105, { width: 500 });
    }

    if (data.terms) {
      doc
        .fontSize(8)
        .font(fonts.body)
        .fillColor(colors.secondary)
        .text("Termos e condições:", 50, doc.page.height - 100)
        .text(data.terms, 50, doc.page.height - 85, { width: 500 });
    }
  }

  private async processNFSe(data: ReceiptData): Promise<{ nfseNumber: string }> {
    // This is a placeholder for NFSe integration
    // Each provider (Ginfes, ISSNet, WebISS, etc.) has different APIs
    // Implementation would depend on the specific provider

    const nfseNumber = `NFSe-${Date.now()}`;

    // TODO: Implement actual NFSe provider integration
    // - Generate XML according to provider specifications
    // - Sign with digital certificate
    // - Send to provider API
    // - Handle response and store NFSe number

    return { nfseNumber };
  }

  private processEmailTemplate(
    template: string,
    data: ReceiptData,
    customMessage?: string,
  ): string {
    let processed = template
      .replace(/{{customerName}}/g, data.customer.name)
      .replace(/{{documentNumber}}/g, data.number)
      .replace(/{{documentType}}/g, data.type === "receipt" ? "recibo" : "fatura")
      .replace(/{{total}}/g, `R$ ${data.total.toFixed(2)}`)
      .replace(/{{date}}/g, format(data.date, "dd/MM/yyyy", { locale: ptBR }))
      .replace(/{{companyName}}/g, this.companyInfo.name);

    if (customMessage) {
      processed = processed.replace(/{{customMessage}}/g, customMessage);
    }

    return processed;
  }
}

// Export types for external use
export type {
  CompanyInfo,
  CustomerInfo,
  InvoiceItem,
  ReceiptData,
  NFSeConfig,
  EmailConfig,
  GenerationResult,
  EmailResult,
  TemplateOptions,
};
