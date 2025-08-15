import { type NextRequest, NextResponse } from 'next/server';
import { equipmentMaintenanceService } from '@/app/lib/services/equipment-maintenance-service';
import {
  createMaintenanceScheduleSchema,
  updateMaintenanceScheduleSchema,
} from '@/app/lib/validations/maintenance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract equipment_id from query params
    const equipmentId = searchParams.get('equipment_id');
    if (!equipmentId) {
      return NextResponse.json(
        { error: 'equipment_id é obrigatório' },
        { status: 400 }
      );
    }

    // Build filters from query params
    const filters: any = {};

    const maintenanceTypes = searchParams.getAll('maintenance_type');
    if (maintenanceTypes.length) {
      filters.maintenance_type = maintenanceTypes;
    }

    if (searchParams.get('is_active') !== null) {
      filters.is_active = searchParams.get('is_active') === 'true';
    }

    if (searchParams.get('upcoming_only') === 'true') {
      filters.upcoming_only = true;
    }

    if (searchParams.get('overdue_only') === 'true') {
      filters.overdue_only = true;
    }

    const schedules =
      await equipmentMaintenanceService.getEquipmentSchedules(equipmentId);

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Maintenance Schedules API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createMaintenanceScheduleSchema.parse(body);

    const schedule =
      await equipmentMaintenanceService.createMaintenanceSchedule(
        validatedData
      );

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Create Maintenance Schedule Error:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid schedule data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create maintenance schedule' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract schedule_id from query params
    const scheduleId = searchParams.get('schedule_id');
    if (!scheduleId) {
      return NextResponse.json(
        { error: 'schedule_id é obrigatório' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = updateMaintenanceScheduleSchema.parse(body);

    const schedule =
      await equipmentMaintenanceService.updateMaintenanceSchedule(
        scheduleId,
        validatedData
      );

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Update Maintenance Schedule Error:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid schedule data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update maintenance schedule' },
      { status: 500 }
    );
  }
}
