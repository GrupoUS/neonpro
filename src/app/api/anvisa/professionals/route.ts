/**
 * ANVISA Professionals API Route
 * Handles professional compliance, certification, and authorization tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { anvisaAPI } from '@/lib/api/anvisa';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    const professionalId = searchParams.get('professional_id');
    const procedureCode = searchParams.get('procedure_code');
    const action = searchParams.get('action');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    // Handle specific actions
    if (action === 'verify_authorization' && professionalId && procedureCode) {
      const isAuthorized = await anvisaAPI.verifyProfessionalAuthorization(
        professionalId,
        procedureCode
      );
      return NextResponse.json({
        success: true,
        data: {
          professional_id: professionalId,
          procedure_code: procedureCode,
          is_authorized: isAuthorized,
        },
        meta: { type: 'authorization_verification' },
      });
    }

    if (action === 'update_compliance_score' && professionalId) {
      const complianceScore =
        await anvisaAPI.updateProfessionalComplianceScore(professionalId);
      return NextResponse.json({
        success: true,
        data: {
          professional_id: professionalId,
          compliance_score: complianceScore,
        },
        meta: { type: 'compliance_score_update' },
      });
    }

    // Default: get all professionals
    const professionals = await anvisaAPI.getProfessionals(clinicId);
    return NextResponse.json({
      success: true,
      data: professionals,
      meta: { total: professionals.length },
    });
  } catch (error) {
    console.error('Error in ANVISA professionals GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professionals data' },
      { status: 500 }
    );
  }
}
