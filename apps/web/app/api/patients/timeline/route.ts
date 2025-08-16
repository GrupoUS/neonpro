/**
 * Medical Timeline API Route
 * Handles medical history timeline operations
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { medicalTimelineService } from '@/lib/patients/medical-timeline';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const action = searchParams.get('action');

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'timeline': {
        const eventTypes = searchParams.get('eventTypes')?.split(',');
        const categories = searchParams.get('categories')?.split(',');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const professionals = searchParams.get('professionals')?.split(',');
        const severity = searchParams.get('severity')?.split(',');

        const filter = {
          ...(eventTypes && { eventTypes }),
          ...(categories && { categories }),
          ...(startDate &&
            endDate && {
              dateRange: {
                start: new Date(startDate),
                end: new Date(endDate),
              },
            }),
          ...(professionals && { professionals }),
          ...(severity && { severity }),
          includePhotos: searchParams.get('includePhotos') === 'true',
          includeAttachments: searchParams.get('includeAttachments') === 'true',
        };

        const timeline = await medicalTimelineService.getPatientTimeline(
          patientId,
          filter
        );
        return NextResponse.json({ timeline }, { status: 200 });
      }

      case 'milestones': {
        const milestones =
          await medicalTimelineService.getTreatmentMilestones(patientId);
        return NextResponse.json({ milestones }, { status: 200 });
      }

      case 'summary': {
        const period =
          (searchParams.get('period') as
            | 'week'
            | 'month'
            | 'quarter'
            | 'year') || 'month';
        const summary = await medicalTimelineService.getTimelineSummary(
          patientId,
          period
        );
        return NextResponse.json({ summary }, { status: 200 });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'addEvent': {
        const {
          patientId,
          eventType,
          title,
          description,
          date,
          category,
          severity,
          professionalId,
          metadata,
        } = data;

        if (!(patientId && eventType && title && date)) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const newEvent = await medicalTimelineService.addTimelineEvent({
          patientId,
          eventType,
          title,
          description,
          date: new Date(date),
          category: category || 'medical',
          severity,
          professionalId,
          metadata,
        });

        return NextResponse.json({ event: newEvent }, { status: 201 });
      }

      case 'addNote': {
        const { eventId, note, author, type, visibility } = data;

        if (!(eventId && note && author)) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const progressNote = await medicalTimelineService.addProgressNote(
          eventId,
          {
            note,
            date: new Date(),
            author,
            type: type || 'observation',
            visibility: visibility || 'professional',
          }
        );

        return NextResponse.json({ note: progressNote }, { status: 201 });
      }

      case 'addPhotos': {
        const { eventId: photoEventId, comparisonType, notes, quality } = data;

        if (!(photoEventId && comparisonType)) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const beforeAfterPhotos =
          await medicalTimelineService.addBeforeAfterPhotos(photoEventId, {
            comparisonType,
            notes,
            quality: quality || 100,
          });

        return NextResponse.json(
          { photos: beforeAfterPhotos },
          { status: 201 }
        );
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'updateEvent': {
        const { eventId, updates } = data;

        if (!eventId) {
          return NextResponse.json(
            { error: 'Event ID is required' },
            { status: 400 }
          );
        }

        // Convert date string to Date object if present
        if (updates.date) {
          updates.date = new Date(updates.date);
        }

        const updatedEvent = await medicalTimelineService.updateTimelineEvent(
          eventId,
          updates
        );
        return NextResponse.json({ event: updatedEvent }, { status: 200 });
      }

      case 'updateMilestone': {
        const { milestoneId, progress, notes } = data;

        if (!milestoneId || progress === undefined) {
          return NextResponse.json(
            { error: 'Milestone ID and progress are required' },
            { status: 400 }
          );
        }

        const updatedMilestone =
          await medicalTimelineService.updateMilestoneProgress(
            milestoneId,
            progress,
            notes
          );

        return NextResponse.json(
          { milestone: updatedMilestone },
          { status: 200 }
        );
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
