/**
 * ANVISA Professional Details API Route
 * Handles specific professional compliance, certification updates, and authorization management
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

    const professional = await anvisaAPI.getProfessionalDetails(params.id);

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: professional,
    });
  } catch (error) {
    console.error('Error fetching professional details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professional details' },
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
    const updatedProfessional = await anvisaAPI.updateProfessionalCompliance(
      params.id,
      updateData
    );

    return NextResponse.json({
      success: true,
      data: updatedProfessional,
    });
  } catch (error) {
    console.error('Error updating professional:', error);
    return NextResponse.json(
      { error: 'Failed to update professional' },
      { status: 500 }
    );
  }
}
