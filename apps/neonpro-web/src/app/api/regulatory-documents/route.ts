import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { z } from "zod";

// Request validation schemas
const CreateDocumentSchema = z.object({
  document_type: z.string().min(1, "Document type is required"),
  document_category: z.string().min(1, "Document category is required"),
  authority: z.string().min(1, "Authority is required"),
  document_number: z.string().optional(),
  issue_date: z.string().min(1, "Issue date is required"),
  expiration_date: z.string().optional(),
  status: z.enum(["valid", "expiring", "expired", "pending"]).default("pending"),
  file_url: z.string().optional(),
  file_name: z.string().optional(),
  file_size: z.number().optional(),
  version: z.string().default("v1.0"),
  associated_professional_id: z.string().uuid().optional(),
  associated_equipment_id: z.string().uuid().optional(),
});

const ListDocumentsSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .optional(),
  limit: z
    .string()
    .transform((val) => Math.min(parseInt(val) || 10, 50))
    .optional(),
  category: z.string().optional(),
  status: z.enum(["valid", "expiring", "expired", "pending"]).optional(),
  search: z.string().optional(),
});

// GET /api/regulatory-documents - List documents with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const {
      page = 1,
      limit = 10,
      category,
      status,
      search,
    } = ListDocumentsSchema.parse(queryParams);

    // Build query with filters
    let query = supabase
      .from("regulatory_documents")
      .select(`
        *,
        regulation_categories!inner(name, authority_name),
        document_versions(id, version, created_at)
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq("document_category", category);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `document_type.ilike.%${search}%,document_number.ilike.%${search}%,file_name.ilike.%${search}%`,
      );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: documents, error, count } = await query;

    if (error) {
      console.error("Error fetching regulatory documents:", error);
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      documents: documents || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/regulatory-documents - Create new regulatory document
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const requestBody = await request.json();
    const validatedData = CreateDocumentSchema.parse(requestBody);

    // Get user profile to associate with clinic
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: "User not associated with clinic" }, { status: 403 });
    }

    // Insert document
    const { data: document, error } = await supabase
      .from("regulatory_documents")
      .insert({
        ...validatedData,
        clinic_id: profile.clinic_id,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        regulation_categories!inner(name, authority_name)
      `)
      .single();

    if (error) {
      console.error("Error creating regulatory document:", error);
      return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
    }

    // Create initial document version if file was uploaded
    if (validatedData.file_url) {
      await supabase.from("document_versions").insert({
        document_id: document.id,
        version: validatedData.version,
        file_url: validatedData.file_url,
        change_reason: "Initial document upload",
        created_by: user.id,
      });
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid document data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
