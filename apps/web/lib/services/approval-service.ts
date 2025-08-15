// Approval Service
// Handles approval workflow operations for accounts payable

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface ApprovalLevel {
  id: string;
  level_order: number;
  level_name: string;
  min_amount: number;
  max_amount: number | null;
  required_approvers: number;
  approval_timeout_hours: number;
  can_be_skipped: boolean;
  auto_approve_below: number | null;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApprovalUser {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  approval_level_id: string;
  spending_limit: number | null;
  can_override: boolean;
  is_active: boolean;
  role: 'approver' | 'admin' | 'super_admin';
  department?: string;
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  accounts_payable_id: string;
  requester_id: string;
  requester_name: string;
  request_date: string;
  amount: number;
  current_level: number;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  reason: string;
  justification?: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalStep {
  id: string;
  approval_request_id: string;
  level_order: number;
  level_name: string;
  required_approvers: number;
  approved_count: number;
  status: 'pending' | 'approved' | 'rejected' | 'skipped' | 'escalated';
  deadline: string;
  created_at: string;
  completed_at?: string;
}

export interface ApprovalAction {
  id: string;
  approval_step_id: string;
  approver_id: string;
  approver_name: string;
  approver_email: string;
  action: 'approve' | 'reject' | 'request_info' | 'escalate';
  comments?: string;
  action_date: string;
  can_override?: boolean;
}

class ApprovalService {
  private readonly supabase = createClientComponentClient();

  // Approval Levels Management
  async getApprovalLevels(): Promise<ApprovalLevel[]> {
    try {
      const { data, error } = await this.supabase
        .from('approval_levels')
        .select('*')
        .eq('is_active', true)
        .order('level_order');

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching approval levels:', error);
      throw new Error('Falha ao carregar níveis de aprovação');
    }
  }

  async createApprovalLevel(
    levelData: Partial<ApprovalLevel>
  ): Promise<ApprovalLevel> {
    try {
      const { data, error } = await this.supabase
        .from('approval_levels')
        .insert([
          {
            ...levelData,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating approval level:', error);
      throw new Error('Falha ao criar nível de aprovação');
    }
  }

  async updateApprovalLevel(
    id: string,
    levelData: Partial<ApprovalLevel>
  ): Promise<ApprovalLevel> {
    try {
      const { data, error } = await this.supabase
        .from('approval_levels')
        .update({
          ...levelData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error updating approval level:', error);
      throw new Error('Falha ao atualizar nível de aprovação');
    }
  }

  async deleteApprovalLevel(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('approval_levels')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting approval level:', error);
      throw new Error('Falha ao excluir nível de aprovação');
    }
  }

  // Approval Users Management
  async getApprovalUsers(): Promise<ApprovalUser[]> {
    try {
      const { data, error } = await this.supabase
        .from('approval_users')
        .select(`
          *,
          approval_levels (
            id,
            level_name,
            level_order
          )
        `)
        .eq('is_active', true)
        .order('user_name');

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching approval users:', error);
      throw new Error('Falha ao carregar usuários aprovadores');
    }
  }

  async createApprovalUser(
    userData: Partial<ApprovalUser>
  ): Promise<ApprovalUser> {
    try {
      const { data, error } = await this.supabase
        .from('approval_users')
        .insert([
          {
            ...userData,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating approval user:', error);
      throw new Error('Falha ao criar usuário aprovador');
    }
  }

  async updateApprovalUser(
    id: string,
    userData: Partial<ApprovalUser>
  ): Promise<ApprovalUser> {
    try {
      const { data, error } = await this.supabase
        .from('approval_users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error updating approval user:', error);
      throw new Error('Falha ao atualizar usuário aprovador');
    }
  }

  async deleteApprovalUser(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('approval_users')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting approval user:', error);
      throw new Error('Falha ao excluir usuário aprovador');
    }
  }

  // Approval Requests Management
  async createApprovalRequest(requestData: {
    accounts_payable_id: string;
    amount: number;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    reason: string;
    justification?: string;
    due_date: string;
  }): Promise<ApprovalRequest> {
    try {
      // Get current user
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Determine approval levels based on amount
      const levels = await this.getApprovalLevels();
      const applicableLevels = levels.filter(
        (level) =>
          requestData.amount >= level.min_amount &&
          (level.max_amount === null || requestData.amount <= level.max_amount)
      );

      if (applicableLevels.length === 0) {
        throw new Error(
          'Nenhum nível de aprovação configurado para este valor'
        );
      }

      // Check for auto-approval
      const firstLevel = applicableLevels[0];
      const isAutoApproved =
        firstLevel.auto_approve_below !== null &&
        requestData.amount <= firstLevel.auto_approve_below;

      // Create approval request
      const { data: request, error: requestError } = await this.supabase
        .from('approval_requests')
        .insert([
          {
            accounts_payable_id: requestData.accounts_payable_id,
            requester_id: user.id,
            requester_name: user.email || 'Usuário',
            request_date: new Date().toISOString(),
            amount: requestData.amount,
            current_level: isAutoApproved ? applicableLevels.length + 1 : 1,
            status: isAutoApproved ? 'approved' : 'pending',
            priority: requestData.priority || 'normal',
            reason: requestData.reason,
            justification: requestData.justification,
            due_date: requestData.due_date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (requestError) {
        throw requestError;
      }

      // Create approval steps
      const steps = applicableLevels.map((level, index) => ({
        approval_request_id: request.id,
        level_order: level.level_order,
        level_name: level.level_name,
        required_approvers: level.required_approvers,
        approved_count:
          isAutoApproved && index === 0 ? level.required_approvers : 0,
        status: isAutoApproved && index === 0 ? 'approved' : 'pending',
        deadline: new Date(
          Date.now() + level.approval_timeout_hours * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date().toISOString(),
        completed_at:
          isAutoApproved && index === 0 ? new Date().toISOString() : undefined,
      }));

      const { error: stepsError } = await this.supabase
        .from('approval_steps')
        .insert(steps);

      if (stepsError) {
        throw stepsError;
      }

      return request;
    } catch (error) {
      console.error('Error creating approval request:', error);
      throw new Error('Falha ao criar solicitação de aprovação');
    }
  }

  async getApprovalRequest(id: string): Promise<
    ApprovalRequest & {
      approval_chain: (ApprovalStep & { approvers: ApprovalAction[] })[];
    }
  > {
    try {
      // Get request details
      const { data: request, error: requestError } = await this.supabase
        .from('approval_requests')
        .select(`
          *,
          accounts_payable (
            id,
            invoice_number,
            vendor_name,
            category
          )
        `)
        .eq('id', id)
        .single();

      if (requestError) {
        throw requestError;
      }

      // Get approval steps
      const { data: steps, error: stepsError } = await this.supabase
        .from('approval_steps')
        .select('*')
        .eq('approval_request_id', id)
        .order('level_order');

      if (stepsError) {
        throw stepsError;
      }

      // Get approval actions for each step
      const stepsWithActions = await Promise.all(
        (steps || []).map(async (step) => {
          const { data: actions, error: actionsError } = await this.supabase
            .from('approval_actions')
            .select('*')
            .eq('approval_step_id', step.id)
            .order('action_date');

          if (actionsError) {
            throw actionsError;
          }

          return {
            ...step,
            approvers: actions || [],
          };
        })
      );

      return {
        ...request,
        approval_chain: stepsWithActions,
      };
    } catch (error) {
      console.error('Error fetching approval request:', error);
      throw new Error('Falha ao carregar solicitação de aprovação');
    }
  }

  async getMyApprovalRequests(): Promise<ApprovalRequest[]> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await this.supabase
        .from('approval_requests')
        .select(`
          *,
          accounts_payable (
            invoice_number,
            vendor_name,
            category
          )
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching my approval requests:', error);
      throw new Error('Falha ao carregar minhas solicitações');
    }
  }

  async getPendingApprovals(): Promise<ApprovalRequest[]> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Get user's approval permissions
      const { data: userPermissions } = await this.supabase
        .from('approval_users')
        .select('approval_level_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (!userPermissions || userPermissions.length === 0) {
        return [];
      }

      const levelIds = userPermissions.map((p) => p.approval_level_id);

      // Find requests where user can approve
      const { data, error } = await this.supabase
        .from('approval_requests')
        .select(`
          *,
          accounts_payable (
            invoice_number,
            vendor_name,
            category
          ),
          approval_steps!inner (
            id,
            level_order,
            level_name,
            status,
            deadline
          )
        `)
        .eq('status', 'pending')
        .in('approval_steps.level_order', levelIds) // This would need proper join logic
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw new Error('Falha ao carregar aprovações pendentes');
    }
  }

  // Approval Actions
  async processApprovalAction(
    stepId: string,
    action: 'approve' | 'reject' | 'request_info' | 'escalate',
    comments?: string
  ): Promise<void> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Get step details
      const { data: step, error: stepError } = await this.supabase
        .from('approval_steps')
        .select(`
          *,
          approval_requests (*)
        `)
        .eq('id', stepId)
        .single();

      if (stepError) {
        throw stepError;
      }

      // Verify user can approve this step
      const { data: userPermission } = await this.supabase
        .from('approval_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!userPermission) {
        throw new Error('Usuário não tem permissão para aprovar');
      }

      // Record the action
      const { error: actionError } = await this.supabase
        .from('approval_actions')
        .insert([
          {
            approval_step_id: stepId,
            approver_id: user.id,
            approver_name: user.email || 'Usuário',
            approver_email: user.email || '',
            action,
            comments,
            action_date: new Date().toISOString(),
            can_override: userPermission.can_override,
          },
        ]);

      if (actionError) {
        throw actionError;
      }

      // Update step status
      const newApprovedCount =
        action === 'approve' ? step.approved_count + 1 : step.approved_count;

      const stepStatus =
        action === 'reject'
          ? 'rejected'
          : action === 'escalate'
            ? 'escalated'
            : newApprovedCount >= step.required_approvers
              ? 'approved'
              : 'pending';

      const { error: updateStepError } = await this.supabase
        .from('approval_steps')
        .update({
          approved_count: newApprovedCount,
          status: stepStatus,
          completed_at:
            stepStatus !== 'pending' ? new Date().toISOString() : undefined,
        })
        .eq('id', stepId);

      if (updateStepError) {
        throw updateStepError;
      }

      // Update request status if necessary
      if (stepStatus === 'approved' || stepStatus === 'rejected') {
        const { error: updateRequestError } = await this.supabase
          .from('approval_requests')
          .update({
            current_level:
              stepStatus === 'approved' &&
              step.approval_requests.current_level < 3
                ? step.approval_requests.current_level + 1
                : step.approval_requests.current_level,
            status:
              stepStatus === 'rejected'
                ? 'rejected'
                : stepStatus === 'approved' && step.level_order === 3
                  ? 'approved'
                  : 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('id', step.approval_request_id);

        if (updateRequestError) {
          throw updateRequestError;
        }
      }

      // Send notifications (would be implemented with notification service)
      await this.sendApprovalNotification(
        step.approval_request_id,
        action,
        userPermission.user_name
      );
    } catch (error) {
      console.error('Error processing approval action:', error);
      throw new Error('Falha ao processar ação de aprovação');
    }
  }

  async cancelApprovalRequest(requestId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verify user can cancel (must be requester or admin)
      const { data: request } = await this.supabase
        .from('approval_requests')
        .select('requester_id')
        .eq('id', requestId)
        .single();

      if (!request || request.requester_id !== user.id) {
        // Check if user is admin
        const { data: userPermission } = await this.supabase
          .from('approval_users')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (
          !(
            userPermission &&
            ['admin', 'super_admin'].includes(userPermission.role)
          )
        ) {
          throw new Error('Não autorizado a cancelar esta solicitação');
        }
      }

      const { error } = await this.supabase
        .from('approval_requests')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error cancelling approval request:', error);
      throw new Error('Falha ao cancelar solicitação de aprovação');
    }
  }

  // Notifications (placeholder - would integrate with notification service)
  private async sendApprovalNotification(
    requestId: string,
    action: string,
    approverName: string
  ): Promise<void> {
    try {
      // This would integrate with a notification service
      console.log(
        `Notification: Request ${requestId} was ${action} by ${approverName}`
      );

      // Could send email, push notification, etc.
      // await notificationService.send({
      //   type: 'approval_action',
      //   requestId,
      //   action,
      //   approverName
      // })
    } catch (error) {
      console.error('Error sending notification:', error);
      // Don't throw - notification failures shouldn't break approval flow
    }
  }

  // Utility Methods
  async getApprovalStats(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    escalated: number;
    overdue: number;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('get_approval_stats');

      if (error) {
        throw error;
      }

      return (
        data || {
          pending: 0,
          approved: 0,
          rejected: 0,
          escalated: 0,
          overdue: 0,
        }
      );
    } catch (error) {
      console.error('Error fetching approval stats:', error);
      return {
        pending: 0,
        approved: 0,
        rejected: 0,
        escalated: 0,
        overdue: 0,
      };
    }
  }

  async validateApprovalHierarchy(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    try {
      const levels = await this.getApprovalLevels();
      const users = await this.getApprovalUsers();

      const issues: string[] = [];

      // Check if levels have gaps in order
      const orders = levels.map((l) => l.level_order).sort((a, b) => a - b);
      for (let i = 1; i <= orders.length; i++) {
        if (!orders.includes(i)) {
          issues.push(`Nível ${i} não existe na hierarquia`);
        }
      }

      // Check if levels have sufficient approvers
      for (const level of levels) {
        const levelUsers = users.filter(
          (u) => u.approval_level_id === level.id
        );
        if (levelUsers.length < level.required_approvers) {
          issues.push(
            `Nível ${level.level_name} requer ${level.required_approvers} aprovadores mas só tem ${levelUsers.length}`
          );
        }
      }

      // Check for overlapping amount ranges
      for (let i = 0; i < levels.length; i++) {
        for (let j = i + 1; j < levels.length; j++) {
          const level1 = levels[i];
          const level2 = levels[j];

          const l1Min = level1.min_amount;
          const l1Max = level1.max_amount || Number.POSITIVE_INFINITY;
          const l2Min = level2.min_amount;
          const l2Max = level2.max_amount || Number.POSITIVE_INFINITY;

          if (l1Min <= l2Max && l1Max >= l2Min) {
            issues.push(
              `Níveis ${level1.level_name} e ${level2.level_name} têm faixas de valores sobrepostas`
            );
          }
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
      };
    } catch (error) {
      console.error('Error validating approval hierarchy:', error);
      return {
        isValid: false,
        issues: ['Erro ao validar hierarquia de aprovação'],
      };
    }
  }
}

export const approvalService = new ApprovalService();
export default approvalService;
