import { type NextRequest, NextResponse } from 'next/server';
import { equipmentMaintenanceService } from '@/app/lib/services/equipment-maintenance-service';
import { updateEquipmentSchema } from '@/app/lib/validations/maintenance';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const equipment = await equipmentMaintenanceService.getEquipment(params.id);

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Verify equipment belongs to specified clinic
    if (equipment.clinic_id !== clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(equipment);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // First verify equipment exists and belongs to clinic
    const existingEquipment = await equipmentMaintenanceService.getEquipment(
      params.id
    );
    if (!existingEquipment || existingEquipment.clinic_id !== clinicId) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = updateEquipmentSchema.parse(body);

    const equipment = await equipmentMaintenanceService.updateEquipment(
      params.id,
      validatedData
    );

    return NextResponse.json(equipment);
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid equipment data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update equipment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // First verify equipment exists and belongs to clinic
    const existingEquipment = await equipmentMaintenanceService.getEquipment(
      params.id
    );
    if (!existingEquipment || existingEquipment.clinic_id !== clinicId) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to out_of_service
    await equipmentMaintenanceService.updateEquipment(params.id, {
      status: 'out_of_service',
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete equipment' },
      { status: 500 }
    );
  }
}
