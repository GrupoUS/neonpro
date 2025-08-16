/**
 * Conflict Detection API Route
 * Story 2.2: Intelligent conflict detection and resolution
 *
 * POST /api/scheduling/conflicts/detect
 * Detects scheduling conflicts for a proposed appointment
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { AuditLogger } from '@/lib/auth/audit/audit-logger';
import { ConflictDetectionService } from '@/lib/scheduling/conflict-resolution';

type ConflictDetectionRequest = {
  appointmentStart: string; // ISO string
  appointmentEnd: string; // ISO string
  professionalId: string;
  treatmentType: string;
  roomId?: string;
  equipmentIds?: string[];
  patientId?: string;
};

export async function POST(request: NextRequest) {
  const auditLogger = new AuditLogger();

  try {
    // Get user session
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: ConflictDetectionRequest = await request.json();

    // Validate required fields
    if (
      !(
        body.appointmentStart &&
        body.appointmentEnd &&
        body.professionalId &&
        body.treatmentType
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: appointmentStart, appointmentEnd, professionalId, treatmentType',
        },
        { status: 400 },
      );
    }

    // Validate date format
    const startDate = new Date(body.appointmentStart);
    const endDate = new Date(body.appointmentEnd);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 format.' },
        { status: 400 },
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 },
      );
    }

    // Initialize conflict resolution service
    const conflictService = new ConflictDetectionService();

    // Detect conflicts
    const result = await conflictService.detectConflicts(
      startDate,
      endDate,
      body.professionalId,
      body.treatmentType,
      body.roomId,
      body.equipmentIds,
    );

    // Log the conflict detection
    await auditLogger.logActivity(
      'conflict_detection_api',
      `Conflict detection performed for ${body.treatmentType} appointment`,
      {
        userId: session.user.id,
        professionalId: body.professionalId,
        treatmentType: body.treatmentType,
        conflictCount: result.conflicts.length,
        processingTimeMs: result.processingTimeMs,
        hasConflicts: result.hasConflicts,
      },
    );

    // Return results
    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        processingTime: result.processingTimeMs,
        timestamp: new Date().toISOString(),
        apiVersion: '2.2.0',
      },
    });
  } catch (error) {
    await auditLogger.logError('Conflict detection API failed', error);

    return NextResponse.json(
      {
        error: 'Internal server error during conflict detection',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 },
    );
  }
}

// Options handler for CORS
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
