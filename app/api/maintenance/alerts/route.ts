import { equipmentMaintenanceService } from '@/app/lib/services/equipment-maintenance-service';
import { createMaintenanceAlertSchema } from '@/app/lib/validations/maintenance';
import { NextRequest, NextResponse } from 'next/server';

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

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Build filters from query params
    const filters: any = {};
    
    const equipmentId = searchParams.get('equipment_id');
    if (equipmentId) filters.equipment_id = equipmentId;
    
    const alertTypes = searchParams.getAll('alert_type');
    if (alertTypes.length) filters.alert_type = alertTypes;
    
    const severities = searchParams.getAll('severity');
    if (severities.length) filters.severity = severities;
    
    if (searchParams.get('is_active') !== null) {
      filters.is_active = searchParams.get('is_active') === 'true';
    }
    
    if (searchParams.get('is_acknowledged') !== null) {
      filters.is_acknowledged = searchParams.get('is_acknowledged') === 'true';
    }

    const result = await equipmentMaintenanceService.getMaintenanceAlerts(
      clinicId,
      Object.keys(filters).length ? filters : undefined,
      { page, limit }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Maintenance Alerts API Error:', error);
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
    const validatedData = createMaintenanceAlertSchema.parse(body);

    const alert = await equipmentMaintenanceService.createMaintenanceAlert(validatedData);

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Create Maintenance Alert Error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid alert data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create maintenance alert' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract alert_id and action from query params
    const alertId = searchParams.get('alert_id');
    const action = searchParams.get('action'); // 'acknowledge' or 'resolve'
    
    if (!alertId || !action) {
      return NextResponse.json(
        { error: 'alert_id e action são obrigatórios' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    let result;
    
    if (action === 'acknowledge') {
      const { acknowledged_by, notes } = body;
      result = await equipmentMaintenanceService.acknowledgeAlert(alertId, acknowledged_by, notes);
    } else if (action === 'resolve') {
      const { resolved_by, notes } = body;
      if (!resolved_by || !notes) {
        return NextResponse.json(
          { error: 'resolved_by e notes são obrigatórios para resolver alertas' },
          { status: 400 }
        );
      }
      result = await equipmentMaintenanceService.resolveAlert(alertId, resolved_by, notes);
    } else {
      return NextResponse.json(
        { error: 'action deve ser "acknowledge" ou "resolve"' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Update Maintenance Alert Error:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance alert' },
      { status: 500 }
    );
  }
}
