// NFe Individual Document API Endpoint
// Story 5.5: Get, update, and delete individual NFe documents

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { nfeService } from '@/lib/services/tax/nfe-service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch NFe document
    const { data: nfeDocument, error: fetchError } = await supabase
      .from('nfe_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !nfeDocument) {
      return NextResponse.json(
        { error: 'NFe document not found' },
        { status: 404 }
      );
    }

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, name')
      .eq('id', nfeDocument.clinic_id)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: nfeDocument
    });

  } catch (error) {
    console.error('NFe fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Fetch existing NFe document
    const { data: existingNfe, error: fetchError } = await supabase
      .from('nfe_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingNfe) {
      return NextResponse.json(
        { error: 'NFe document not found' },
        { status: 404 }
      );
    }

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, name')
      .eq('id', existingNfe.clinic_id)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update NFe document
    const { data: updatedNfe, error: updateError } = await supabase
      .from('nfe_documents')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating NFe document:', updateError);
      return NextResponse.json(
        { error: 'Failed to update NFe document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedNfe
    });

  } catch (error) {
    console.error('NFe update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch existing NFe document
    const { data: existingNfe, error: fetchError } = await supabase
      .from('nfe_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingNfe) {
      return NextResponse.json(
        { error: 'NFe document not found' },
        { status: 404 }
      );
    }

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, name')
      .eq('id', existingNfe.clinic_id)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if NFe can be deleted (only draft status can be deleted)
    if (existingNfe.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft NFe documents can be deleted' },
        { status: 400 }
      );
    }

    // Delete NFe document
    const { error: deleteError } = await supabase
      .from('nfe_documents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting NFe document:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete NFe document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'NFe document deleted successfully'
    });

  } catch (error) {
    console.error('NFe delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}