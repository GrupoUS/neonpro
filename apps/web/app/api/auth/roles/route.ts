/**
 * API Route: Role Management Endpoint
 * Story 1.2: Role-Based Access Control Implementation
 *
 * Provides REST API for role management operations
 * Requires owner/manager permissions for role modifications
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hasPermission } from '@/lib/auth/rbac/permissions';
import { authenticateRequest } from '@/lib/middleware/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * Request validation schemas
 */
const UpdateRoleSchema = z.object({
  userId: z.string().uuid(),
  newRole: z.enum(['owner', 'manager', 'staff', 'patient']),
  reason: z.string().optional(),
});

const GetUserRolesSchema = z.object({
  clinicId: z.string().uuid().optional(),
  role: z.enum(['owner', 'manager', 'staff', 'patient']).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

/**
 * GET /api/auth/roles
 *
 * Get users and their roles (with filtering)
 * Requires manager+ permissions
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);

    if (!(authResult.success && authResult.user)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check permissions - only managers and above can view roles
    const permissionCheck = await hasPermission(authResult.user, 'users:read');

    if (!permissionCheck.granted) {
      return NextResponse.json(
        {
          error: 'Insufficient permissions',
          reason: 'Manager or owner role required to view user roles',
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = {
      clinicId: url.searchParams.get('clinicId') || undefined,
      role: url.searchParams.get('role') || undefined,
      limit: Number.parseInt(url.searchParams.get('limit') || '50', 10),
      offset: Number.parseInt(url.searchParams.get('offset') || '0', 10),
    };

    // Validate query parameters
    const validationResult = GetUserRolesSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { clinicId, role, limit, offset } = validationResult.data;
    const supabase = createClient();

    // Build query
    let query = supabase
      .from('users')
      .select(
        `
        id,
        email,
        full_name,
        role,
        clinic_id,
        created_at,
        updated_at,
        last_login,
        is_active
      `
      )
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    if (role) {
      query = query.eq('role', role);
    }

    // For non-owners, restrict to same clinic
    if (authResult.user.role !== 'owner' && authResult.user.clinicId) {
      query = query.eq('clinic_id', authResult.user.clinicId);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Database error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: users || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Role management GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/roles
 *
 * Update user role
 * Requires owner permissions or manager permissions (with restrictions)
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);

    if (!(authResult.success && authResult.user)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request
    const validationResult = UpdateRoleSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request format',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { userId, newRole, reason } = validationResult.data;
    const currentUser = authResult.user;

    // Check basic permissions
    const permissionCheck = await hasPermission(currentUser, 'users:update');

    if (!permissionCheck.granted) {
      return NextResponse.json(
        {
          error: 'Insufficient permissions',
          reason: 'Manager or owner role required to update user roles',
        },
        { status: 403 }
      );
    }

    const supabase = createClient();

    // Get target user details
    const { data: targetUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email, role, clinic_id, full_name')
      .eq('id', userId)
      .single();

    if (fetchError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role change validation rules
    const roleHierarchy = {
      patient: 1,
      staff: 2,
      manager: 3,
      owner: 4,
    };

    const currentUserLevel =
      roleHierarchy[currentUser.role as keyof typeof roleHierarchy] || 0;
    const targetUserLevel =
      roleHierarchy[targetUser.role as keyof typeof roleHierarchy] || 0;
    const newRoleLevel =
      roleHierarchy[newRole as keyof typeof roleHierarchy] || 0;

    // Validation rules:
    // 1. Can't modify users with equal or higher role (except owners)
    // 2. Can't assign roles equal or higher than your own (except owners)
    // 3. Managers can only modify users in their clinic

    if (currentUser.role !== 'owner') {
      // Rule 1: Can't modify equal or higher role users
      if (targetUserLevel >= currentUserLevel) {
        return NextResponse.json(
          {
            error: 'Insufficient permissions',
            reason: 'Cannot modify users with equal or higher role',
          },
          { status: 403 }
        );
      }

      // Rule 2: Can't assign equal or higher roles
      if (newRoleLevel >= currentUserLevel) {
        return NextResponse.json(
          {
            error: 'Insufficient permissions',
            reason: 'Cannot assign roles equal or higher than your own',
          },
          { status: 403 }
        );
      }

      // Rule 3: Managers can only modify users in their clinic
      if (
        currentUser.role === 'manager' &&
        targetUser.clinic_id !== currentUser.clinicId
      ) {
        return NextResponse.json(
          {
            error: 'Insufficient permissions',
            reason: 'Can only modify users within your clinic',
          },
          { status: 403 }
        );
      }
    }

    // Prevent self-demotion for owners (safety check)
    if (
      currentUser.id === userId &&
      currentUser.role === 'owner' &&
      newRole !== 'owner'
    ) {
      return NextResponse.json(
        {
          error: 'Invalid operation',
          reason: 'Owners cannot demote themselves. Transfer ownership first.',
        },
        { status: 400 }
      );
    }

    // Update user role
    const { error: updateError } = await supabase
      .from('users')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Database error updating user role:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    // Log the role change for audit
    const auditLog = {
      user_id: currentUser.id,
      action: 'role_change',
      resource_type: 'user',
      resource_id: userId,
      permission_checked: 'users:update',
      granted: true,
      metadata: {
        target_user_email: targetUser.email,
        old_role: targetUser.role,
        new_role: newRole,
        reason: reason || 'No reason provided',
        performed_by: currentUser.email,
      },
      created_at: new Date().toISOString(),
    };

    await supabase.from('permission_audit_log').insert(auditLog);

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        userId,
        oldRole: targetUser.role,
        newRole,
        updatedBy: currentUser.email,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Role management PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
