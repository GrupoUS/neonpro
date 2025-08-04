import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { validatePatientSession } from '@/lib/auth-advanced/patient-portal-validation';

// GET /api/patient-portal/waitlist
// Get patient's waitlist entries
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Validate patient session
    const sessionResult = await validatePatientSession(request);
    if (!sessionResult.success) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 401 }
      );
    }

    const { patientSession } = sessionResult;
    const patientId = patientSession.patient_id;

    // Get waitlist entries
    const { data: waitlistEntries, error } = await supabase
      .from('booking_waitlist')
      .select(`
        id,
        professional_id,
        procedure_id,
        preferred_date,
        preferred_time_start,
        preferred_time_end,
        status,
        priority,
        notes,
        created_at,
        professional:professionals(
          id,
          name,
          specialty
        ),
        procedure:procedures(
          id,
          name,
          duration_minutes,
          price
        )
      `)
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching waitlist:', error);
      return NextResponse.json(
        { error: 'Failed to fetch waitlist entries' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      waitlist_entries: waitlistEntries || [],
      total: waitlistEntries?.length || 0
    });

  } catch (error) {
    console.error('Waitlist GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/patient-portal/waitlist
// Join waitlist for unavailable time slots
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // Validate patient session
    const sessionResult = await validatePatientSession(request);
    if (!sessionResult.success) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 401 }
      );
    }

    const { patientSession } = sessionResult;
    const patientId = patientSession.patient_id;
    const clinicId = patientSession.clinic_id;

    // Validate required fields
    const {
      professional_id,
      procedure_id,
      preferred_date,
      preferred_time_start,
      preferred_time_end,
      notes
    } = body;

    if (!professional_id || !preferred_date) {
      return NextResponse.json(
        { error: 'Professional and preferred date are required' },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const targetDate = new Date(preferred_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      return NextResponse.json(
        { error: 'Cannot join waitlist for past dates' },
        { status: 400 }
      );
    }

    // Check if patient already has an active waitlist entry for this professional/date
    const { data: existingEntry } = await supabase
      .from('booking_waitlist')
      .select('id')
      .eq('patient_id', patientId)
      .eq('professional_id', professional_id)
      .eq('preferred_date', preferred_date)
      .eq('status', 'active')
      .single();

    if (existingEntry) {
      return NextResponse.json(
        { error: 'You are already on the waitlist for this professional and date' },
        { status: 409 }
      );
    }

    // Check waitlist capacity (prevent spam)
    const { data: patientWaitlistCount } = await supabase
      .from('booking_waitlist')
      .select('id', { count: 'exact' })
      .eq('patient_id', patientId)
      .eq('status', 'active');

    const maxWaitlistEntries = 5; // Configurable limit
    if ((patientWaitlistCount?.length || 0) >= maxWaitlistEntries) {
      return NextResponse.json(
        { error: `Maximum ${maxWaitlistEntries} active waitlist entries allowed` },
        { status: 400 }
      );
    }

    // Calculate priority based on date preference (sooner = higher priority)
    const daysFromNow = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const priority = Math.max(1, 100 - daysFromNow); // Closer dates get higher priority

    // Create waitlist entry
    const { data: waitlistEntry, error: createError } = await supabase
      .from('booking_waitlist')
      .insert({
        patient_id: patientId,
        clinic_id: clinicId,
        professional_id,
        procedure_id,
        preferred_date,
        preferred_time_start: preferred_time_start || '09:00',
        preferred_time_end: preferred_time_end || '18:00',
        status: 'active',
        priority,
        notes
      })
      .select(`
        id,
        preferred_date,
        preferred_time_start,
        preferred_time_end,
        priority,
        created_at,
        professional:professionals(
          id,
          name,
          specialty
        ),
        procedure:procedures(
          id,
          name,
          duration_minutes
        )
      `)
      .single();

    if (createError) {
      console.error('Error creating waitlist entry:', createError);
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      );
    }

    // Get position in waitlist
    const { data: positionData } = await supabase
      .from('booking_waitlist')
      .select('id')
      .eq('professional_id', professional_id)
      .eq('preferred_date', preferred_date)
      .eq('status', 'active')
      .gte('priority', priority)
      .lte('created_at', waitlistEntry.created_at);

    const position = positionData?.length || 1;

    return NextResponse.json({
      success: true,
      waitlist_entry: {
        ...waitlistEntry,
        position_in_queue: position
      },
      message: `Added to waitlist (position #${position}). We'll notify you when a slot becomes available.`
    });

  } catch (error) {
    console.error('Waitlist POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/patient-portal/waitlist/[id]
// Remove from waitlist
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(request.url);
    const waitlistId = url.pathname.split('/').pop();
    
    if (!waitlistId) {
      return NextResponse.json(
        { error: 'Waitlist ID is required' },
        { status: 400 }
      );
    }

    // Validate patient session
    const sessionResult = await validatePatientSession(request);
    if (!sessionResult.success) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 401 }
      );
    }

    const { patientSession } = sessionResult;
    const patientId = patientSession.patient_id;

    // Remove from waitlist
    const { data: removedEntry, error } = await supabase
      .from('booking_waitlist')
      .update({ status: 'cancelled' })
      .eq('id', waitlistId)
      .eq('patient_id', patientId)
      .select(`
        id,
        preferred_date,
        professional:professionals(name)
      `)
      .single();

    if (error || !removedEntry) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      removed_entry: removedEntry,
      message: 'Removed from waitlist successfully'
    });

  } catch (error) {
    console.error('Waitlist DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}