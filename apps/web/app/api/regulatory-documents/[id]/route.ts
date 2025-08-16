import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

// Request validation schemas
const UpdateDocumentSchema = z.object({
  document_type: z.string().min(1).optional(),
  document_category: z.string().min(1).optional(),
  authority: z.string().min(1).optional(),
  document_number: z.string().optional(),
  issue_date: z.string().optional(),
  expiration_date: z.string().optional(),
  status: z.enum(['valid', 'expiring', 'expired', 'pending']).optional(),
  file_url: z.string().optional(),
  file_name: z.string().optional(),
  file_size: z.number().optional(),
  version: z.string().optional(),
  associated_professional_id: z.string().uuid().optional(),
  associated_equipment_id: z.string().uuid().optional(),
});

// GET /api/regulatory-documents/[id] - Get single document by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch document with related data
    const { data: document, error } = await supabase
      .from('regulatory_documents')
      .select(
        `
        *,
        regulation_categories!inner(name, authority_name, description),
        document_versions(
          id,
          version,
          file_url,
          change_reason,
          created_by,
          created_at,
          profiles!document_versions_created_by_fkey(full_name)
        ),
        compliance_alerts(
          id,
          alert_type,
          alert_date,
          sent_at,
          acknowledged_at
        ),
        profiles!regulatory_documents_created_by_fkey(full_name),
        profiles!regulatory_documents_updated_by_fkey(full_name)
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 500 },
      );
    }

    return NextResponse.json({ document });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// PUT /api/regulatory-documents/[id] - Update document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Parse and validate request body
    const requestBody = await request.json();
    const validatedData = UpdateDocumentSchema.parse(requestBody);

    // Check if document exists and user has permission
    const { data: existingDoc, error: fetchError } = await supabase
      .from('regulatory_documents')
      .select('id, version, file_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 500 },
      );
    }

    // Update document
    const { data: document, error } = await supabase
      .from('regulatory_documents')
      .update({
        ...validatedData,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        regulation_categories!inner(name, authority_name)
      `,
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 },
      );
    }

    // Create new version if file was updated
    if (
      validatedData.file_url &&
      validatedData.file_url !== existingDoc.file_url
    ) {
      await supabase.from('document_versions').insert({
        document_id: id,
        version: validatedData.version || `v${Date.now()}`,
        file_url: validatedData.file_url,
        change_reason: requestBody.change_reason || 'Document updated',
        created_by: user.id,
      });
    }

    return NextResponse.json({ document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid document data', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// DELETE /api/regulatory-documents/[id] - Delete document
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if document exists
    const { data: existingDoc, error: fetchError } = await supabase
      .from('regulatory_documents')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 500 },
      );
    }

    // Delete document (cascade will handle related records)
    const { error } = await supabase
      .from('regulatory_documents')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
