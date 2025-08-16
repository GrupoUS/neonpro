// =====================================================
// NeonPro Resource Management API
// Story 2.4: Smart Resource Management - API Routes
// =====================================================

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { ResourceManager } from '@/lib/resources/resource-manager';

// =====================================================
// GET /api/resources - List resources with filters
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Validate required parameters
    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    // Create Supabase client and verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Initialize resource manager and fetch resources
    const resourceManager = new ResourceManager();
    const filters: any = {};

    if (type) {
      filters.type = type;
    }
    if (status) {
      filters.status = status;
    }
    if (category) {
      filters.category = category;
    }

    const resources = await resourceManager.getResources(clinicId, filters);

    return NextResponse.json({
      success: true,
      data: resources,
      count: resources.length,
      filters,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch resources',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/resources - Create new resource
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, type, clinic_id } = body;
    if (!(name && type && clinic_id)) {
      return NextResponse.json(
        { error: 'name, type, and clinic_id are required' },
        { status: 400 }
      );
    }

    // Create Supabase client and verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Initialize resource manager and create resource
    const resourceManager = new ResourceManager();
    const resourceData = {
      ...body,
      created_by: user.id,
      updated_by: user.id,
      status: body.status || 'available',
    };

    const newResource = await resourceManager.createResource(resourceData);

    return NextResponse.json(
      {
        success: true,
        data: newResource,
        message: 'Resource created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create resource',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT /api/resources - Update resource
// =====================================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Resource id is required' },
        { status: 400 }
      );
    }

    // Create Supabase client and verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Initialize resource manager and update resource
    const resourceManager = new ResourceManager();
    const updatedResource = await resourceManager.updateResource(id, {
      ...updates,
      updated_by: user.id,
    });

    return NextResponse.json({
      success: true,
      data: updatedResource,
      message: 'Resource updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update resource',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE /api/resources - Delete resource
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('id');

    // Validate required parameters
    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource id is required' },
        { status: 400 }
      );
    }

    // Create Supabase client and verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Initialize resource manager and delete resource
    const resourceManager = new ResourceManager();
    await resourceManager.deleteResource(resourceId);

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to delete resource',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
