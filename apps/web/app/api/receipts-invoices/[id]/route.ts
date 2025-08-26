import { ReceiptInvoiceManager } from "@/lib/payments/receipts/receipt-invoice-manager";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

// Validation schemas
const SendEmailSchema = z.object({
  recipientEmail: z.string().email().optional(),
  customMessage: z.string().optional(),
});

const RegenerateSchema = z.object({
  templateOptions: z
    .object({
      template: z
        .enum(["modern", "classic", "minimal", "corporate"])
        .default("modern"),
      colors: z
        .object({
          primary: z.string(),
          secondary: z.string(),
          accent: z.string(),
        })
        .optional(),
      fonts: z
        .object({
          header: z.string(),
          body: z.string(),
        })
        .optional(),
    })
    .optional(),
});

// Initialize services
function getReceiptInvoiceManager() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const companyInfo = {
    name: process.env.COMPANY_NAME || "NeonPro",
    cnpj: process.env.COMPANY_CNPJ || "00.000.000/0001-00",
    address: process.env.COMPANY_ADDRESS || "Rua Example, 123",
    city: process.env.COMPANY_CITY || "São Paulo",
    state: process.env.COMPANY_STATE || "SP",
    zipCode: process.env.COMPANY_ZIP_CODE || "01000-000",
    phone: process.env.COMPANY_PHONE,
    email: process.env.COMPANY_EMAIL,
    website: process.env.COMPANY_WEBSITE,
    logo: process.env.COMPANY_LOGO,
  };

  const nfseConfig = {
    enabled: process.env.NFSE_ENABLED === "true",
    provider: (process.env.NFSE_PROVIDER as any) || "ginfes",
    certificatePath: process.env.NFSE_CERTIFICATE_PATH,
    certificatePassword: process.env.NFSE_CERTIFICATE_PASSWORD,
    serviceCode: process.env.NFSE_SERVICE_CODE,
    cityCode: process.env.NFSE_CITY_CODE,
    environment: (process.env.NFSE_ENVIRONMENT as any) || "sandbox",
  };

  const emailConfig = {
    enabled: process.env.EMAIL_ENABLED !== "false",
    smtp: {
      host: process.env.SMTP_HOST || "localhost",
      port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    },
    from: process.env.SMTP_FROM || "noreply@neonpro.com",
    templates: {
      receipt: {
        subject: "Recibo {{documentNumber}} - {{companyName}}",
        html: `
          <h2>Recibo de Pagamento</h2>
          <p>Olá {{customerName}},</p>
          <p>Segue em anexo o recibo {{documentNumber}} no valor de {{total}}.</p>
          <p>{{customMessage}}</p>
          <p>Atenciosamente,<br>{{companyName}}</p>
        `,
      },
      invoice: {
        subject: "Fatura {{documentNumber}} - {{companyName}}",
        html: `
          <h2>Nova Fatura</h2>
          <p>Olá {{customerName}},</p>
          <p>Segue em anexo a fatura {{documentNumber}} no valor de {{total}}.</p>
          <p>Data de vencimento: {{dueDate}}</p>
          <p>{{customMessage}}</p>
          <p>Atenciosamente,<br>{{companyName}}</p>
        `,
      },
    },
  };

  return new ReceiptInvoiceManager(
    supabaseUrl,
    supabaseKey,
    companyInfo,
    nfseConfig,
    emailConfig,
  );
}

// GET - Get document details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Check authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const documentId = id;

    const manager = getReceiptInvoiceManager();
    const document = await manager.getDocument(documentId);

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// POST - Perform actions on document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Check authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const documentId = id;
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (!action) {
      return NextResponse.json(
        { error: "Action parameter is required" },
        { status: 400 },
      );
    }

    const manager = getReceiptInvoiceManager();

    switch (action) {
      case "send-email": {
        const body = await request.json();
        const validatedData = SendEmailSchema.parse(body);

        const result = await manager.sendEmail(
          documentId,
          validatedData.recipientEmail,
          validatedData.customMessage,
        );

        return NextResponse.json({
          success: result.success,
          data: {
            messageId: result.messageId,
            error: result.error,
          },
        });
      }

      case "regenerate-pdf": {
        const body = await request.json();
        const validatedData = RegenerateSchema.parse(body);

        // Get document data
        const document = await manager.getDocument(documentId);

        // Regenerate PDF with new template options
        const templateOptions = {
          template: validatedData.templateOptions?.template || "modern",
          colors: validatedData.templateOptions?.colors || {
            primary: "#2563eb",
            secondary: "#64748b",
            accent: "#10b981",
          },
          fonts: validatedData.templateOptions?.fonts || {
            header: "Helvetica-Bold",
            body: "Helvetica",
          },
        };

        const result = await manager.generatePDF(
          document.data,
          templateOptions,
        );

        return NextResponse.json({
          success: result.success,
          data: {
            documentId: result.documentId,
            error: result.error,
          },
        });
      }

      case "generate-nfse": {
        // Get document data
        const document = await manager.getDocument(documentId);

        if (document.type !== "invoice") {
          return NextResponse.json(
            { error: "NFSe can only be generated for invoices" },
            {
              status: 400,
            },
          );
        }

        const result = await manager.generateNFSe(document.data);

        return NextResponse.json({
          success: result.success,
          data: {
            documentId: result.documentId,
            nfseNumber: result.nfseNumber,
            error: result.error,
          },
        });
      }

      case "download-pdf": {
        // Get document
        const { data: document, error } = await supabase
          .from("receipts_invoices")
          .select("pdf_path, number, type")
          .eq("id", documentId)
          .single();

        if (error || !document) {
          return NextResponse.json(
            { error: "Document not found" },
            { status: 404 },
          );
        }

        if (!document.pdf_path) {
          return NextResponse.json(
            { error: "PDF not available" },
            { status: 404 },
          );
        }

        // Download PDF from storage
        const { data: pdfData, error: downloadError } = await supabase.storage
          .from("documents")
          .download(document.pdf_path);

        if (downloadError) {
          return NextResponse.json(
            { error: "Failed to download PDF" },
            { status: 500 },
          );
        }

        const pdfBuffer = Buffer.from(await pdfData.arrayBuffer());

        return new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${document.type}-${document.number}.pdf"`,
          },
        });
      }

      case "mark-paid": {
        const result = await manager.updateStatus(documentId, "paid");

        return NextResponse.json({
          success: true,
          data: result,
        });
      }

      case "mark-overdue": {
        const result = await manager.updateStatus(documentId, "overdue");

        return NextResponse.json({
          success: true,
          data: result,
        });
      }

      case "cancel": {
        const result = await manager.updateStatus(documentId, "cancelled");

        return NextResponse.json({
          success: true,
          data: result,
        });
      }

      default: {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// PUT - Update document details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Check authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const documentId = id;
    const body = await request.json();

    // Update document data
    const { data, error } = await supabase
      .from("receipts_invoices")
      .update({
        data: supabase.raw(`data || '${JSON.stringify(body)}'::jsonb`),
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Check authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const documentId = id;

    // Get document to check if it can be deleted
    const { data: document, error: fetchError } = await supabase
      .from("receipts_invoices")
      .select("status, pdf_path")
      .eq("id", documentId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    // Only allow deletion of draft documents
    if (document.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft documents can be deleted" },
        { status: 400 },
      );
    }

    // Delete PDF from storage
    if (document.pdf_path) {
      await supabase.storage.from("documents").remove([document.pdf_path]);
    }

    // Delete document
    const { error: deleteError } = await supabase
      .from("receipts_invoices")
      .delete()
      .eq("id", documentId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
