/**
 * ANVISA Procedure Details API Route
 * Handles individual procedure tracking, status updates, and compliance documentation
 */

import { NextRequest, NextResponse } from 'next/server';
import { anvisaAPI } from '@/lib/api/anvisa';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const procedure = await anvisaAPI.getProcedureDetails(params.id);

    if (!procedure) {
      return NextResponse.json(
        { error: 'Procedure not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: procedure,
    });
  } catch (error) {
    console.error('Error fetching procedure details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch procedure details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updateData = await request.json();
    const updatedProcedure = await anvisaAPI.updateProcedure(
      params.id,
      updateData
    );

    return NextResponse.json({
      success: true,
      data: updatedProcedure,
    });
  } catch (error) {
    console.error('Error updating procedure:', error);
    return NextResponse.json(
      { error: 'Failed to update procedure' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await anvisaAPI.deleteProcedure(params.id);

    return NextResponse.json({
      success: true,
      message: 'Procedure deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting procedure:', error);
    return NextResponse.json(
      { error: 'Failed to delete procedure' },
      { status: 500 }
    );
  }
}
