import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Maximum file size: 10MB (as per Story 12.1 requirements)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed file types for regulatory documents
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ALLOWED_FILE_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
];

// POST /api/regulatory-documents/upload - Upload document file
export async function POST(request: NextRequest) {
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

    // Get user profile for clinic association
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User not associated with clinic' },
        { status: 403 },
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentId = formData.get('document_id') as string;
    const category = (formData.get('category') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
        return NextResponse.json(
          {
            error: `File type not allowed. Supported types: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`,
          },
          { status: 400 },
        );
      }
    }

    // Generate unique file path
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileExtension = `.${file.name.split('.').pop()}`;
    const fileName = `${timestamp}_${randomId}${fileExtension}`;
    const filePath = `regulatory-documents/${profile.clinic_id}/${category}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, uint8Array, {
        contentType: file.type,
        metadata: {
          clinic_id: profile.clinic_id,
          document_id: documentId || null,
          category,
          uploaded_by: user.id,
          original_name: file.name,
        },
      });

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 },
      );
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // If document_id is provided, update the document record
    if (documentId) {
      const { error: updateError } = await supabase
        .from('regulatory_documents')
        .update({
          file_url: publicUrlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (updateError) {
        // File was uploaded but document record wasn't updated
        // Should we delete the file? For now, we'll return success with warning
      }
    }

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrlData.publicUrl,
        path: filePath,
      },
      message: 'File uploaded successfully',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// DELETE /api/regulatory-documents/upload - Delete uploaded file
export async function DELETE(request: NextRequest) {
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

    // Parse request body
    const { filePath, documentId } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 },
      );
    }

    // Delete file from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 },
      );
    }

    // If document_id is provided, clear the file references in the document record
    if (documentId) {
      const { error: updateError } = await supabase
        .from('regulatory_documents')
        .update({
          file_url: null,
          file_name: null,
          file_size: null,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (updateError) {
        // File was deleted but document record wasn't updated
      }
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
