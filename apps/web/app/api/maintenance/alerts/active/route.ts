import { type NextRequest, NextResponse } from 'next/server';
import { equipmentMaintenanceService } from '@/app/lib/services/equipment-maintenance-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract clinic_id from query params
    const clinicId = searchParams.get('clinic_id');
    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id é obrigatório' },
        { status: 400 }
      );
    }

    // Build filters from query params
    const filters: any = {};

    const equipmentId = searchParams.get('equipment_id');
    if (equipmentId) filters.equipment_id = equipmentId;

    const alertTypes = searchParams.getAll('alert_type');
    if (alertTypes.length) filters.alert_type = alertTypes;

    const severities = searchParams.getAll('severity');
    if (severities.length) filters.severity = severities;

    if (searchParams.get('is_acknowledged') !== null) {
      filters.is_acknowledged = searchParams.get('is_acknowledged') === 'true';
    }

    const alerts = await equipmentMaintenanceService.getActiveAlerts(
      clinicId,
      Object.keys(filters).length ? filters : undefined
    );

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Active Alerts API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
