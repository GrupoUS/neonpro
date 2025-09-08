import { createClient } from "@/lib/supabase/client";

/**
 * NeonPro Healthcare Dashboard Service
 * Complete service for healthcare dashboard data and analytics
 */

// Core types for dashboard entities
export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  status: "online" | "offline" | "away";
  lastSeen: Date;
  permissions: string[];
  metadata: Record<string, unknown>;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;
  trend: "up" | "down" | "stable";
  format: "number" | "percentage" | "currency";
  category: string;
  description?: string;
  target?: number;
  unit?: string;
}

export interface DashboardProject {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "on-hold" | "completed" | "cancelled";
  progress: number;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  team: DashboardUser[];
  tags: string[];
  priority: "low" | "medium" | "high" | "urgent";
  health: "healthy" | "at-risk" | "critical";
}

export interface DashboardTask {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: DashboardUser;
  projectId?: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
}

export interface DashboardActivity {
  id: string;
  user: DashboardUser;
  action: string;
  target: string;
  targetType: "project" | "task" | "user" | "system";
  timestamp: Date;
  metadata: Record<string, unknown>;
  severity: "info" | "warning" | "error" | "success";
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  userId: string;
  action?: {
    label: string;
    url: string;
    method?: "GET" | "POST" | "PUT" | "DELETE";
  };
  priority: "low" | "medium" | "high";
  category: string;
}

export interface DashboardFilter {
  dateRange?: { start: Date; end: Date; };
  status?: string[];
  priority?: string[];
  department?: string[];
  userId?: string;
  projectId?: string;
  tags?: string[];
}

export interface DashboardAnalytics {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedTasks: number;
    pendingTasks: number;
    teamMembers: number;
    onlineUsers: number;
    totalBudget: number;
    spentBudget: number;
  };
  trends: {
    projectsGrowth: number;
    tasksCompletion: number;
    budgetUtilization: number;
    teamProductivity: number;
  };
  performance: {
    avgProjectDuration: number;
    avgTaskCompletionTime: number;
    onTimeDelivery: number;
    budgetAccuracy: number;
  };
  alerts: {
    overdueProjects: number;
    overbudgetProjects: number;
    blockedTasks: number;
    criticalIssues: number;
  };
}

export class NeonProDashboardService {
  private readonly supabase = createClient();

  /**
   * Get user's clinic/organization context
   */
  private async getUserContext(userId: string): Promise<{
    clinicId: string;
    organizationId: string;
    role: string;
    permissions: string[];
  }> {
    const { data, error } = await this.supabase
      .from("healthcare_professionals")
      .select(
        `
        clinic_id,
        user_id,
        role,
        permissions,
        clinics (
          id,
          organization_id,
          name
        )
      `,
      )
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      throw new Error("User context not found");
    }

    return {
      clinicId: data.clinic_id,
      organizationId: (data.clinics as any)?.organization_id,
      role: data.role || "user",
      permissions: data.permissions || [],
    };
  }

  /**
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics(
    userId: string,
    filter?: DashboardFilter,
  ): Promise<DashboardAnalytics> {
    const context = await this.getUserContext(userId);

    // Get date range (default to last 30 days)
    const dateRange = filter?.dateRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    };

    // Run parallel queries for different analytics
    const [
      projectStats,
      taskStats,
      userStats,
      budgetStats,
      performanceMetrics,
    ] = await Promise.all([
      this.getProjectStatistics(context.clinicId, dateRange),
      this.getTaskStatistics(context.clinicId, dateRange),
      this.getUserStatistics(context.clinicId),
      this.getBudgetStatistics(context.clinicId, dateRange),
      this.getPerformanceMetrics(context.clinicId, dateRange),
    ]);

    return {
      overview: {
        totalProjects: projectStats.total,
        activeProjects: projectStats.active,
        completedTasks: taskStats.completed,
        pendingTasks: taskStats.pending,
        teamMembers: userStats.total,
        onlineUsers: userStats.online,
        totalBudget: budgetStats.total,
        spentBudget: budgetStats.spent,
      },
      trends: {
        projectsGrowth: projectStats.growth,
        tasksCompletion: taskStats.completionRate,
        budgetUtilization: budgetStats.utilizationRate,
        teamProductivity: performanceMetrics.productivity,
      },
      performance: performanceMetrics.performance,
      alerts: {
        overdueProjects: projectStats.overdue,
        overbudgetProjects: budgetStats.overbudget,
        blockedTasks: taskStats.blocked,
        criticalIssues: performanceMetrics.criticalIssues,
      },
    };
  }

  /**
   * Get dashboard metrics with comparison to previous period
   */
  async getDashboardMetrics(
    userId: string,
    category?: string,
  ): Promise<DashboardMetric[]> {
    const context = await this.getUserContext(userId);

    // Core business metrics for healthcare/clinic management
    const metricsQuery = this.supabase
      .from("dashboard_metrics")
      .select("*")
      .eq("clinic_id", context.clinicId)
      .order("display_order");

    if (category) {
      metricsQuery.eq("category", category);
    }

    const { data: metrics, error } = await metricsQuery;

    if (error) {
      throw new Error(`Failed to fetch metrics: ${error.message}`);
    }

    // Calculate trends and changes
    return await Promise.all(
      (metrics || []).map(async (metric) => {
        const previousValue = await this.getPreviousPeriodValue(
          metric.id,
          context.clinicId,
        );

        const change = previousValue > 0
          ? ((metric.current_value - previousValue) / previousValue) * 100
          : 0;

        return {
          id: metric.id,
          label: metric.label,
          value: metric.current_value,
          previousValue,
          change,
          trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
          format: metric.format,
          category: metric.category,
          description: metric.description,
          target: metric.target_value,
          unit: metric.unit,
        };
      }),
    );
  }

  /**
   * Get dashboard projects with team and progress
   */
  async getDashboardProjects(
    userId: string,
    filter?: DashboardFilter,
  ): Promise<DashboardProject[]> {
    const context = await this.getUserContext(userId);

    let query = this.supabase
      .from("dashboard_projects")
      .select(
        `
        *,
        project_members (
          user_id,
          role,
          healthcare_professionals (
            user_id,
            users (name, email, avatar_url),
            role,
            department
          )
        ),
        project_tasks (count)
      `,
      )
      .eq("clinic_id", context.clinicId);

    // Apply filters
    if (filter?.status?.length) {
      query = query.in("status", filter.status);
    }
    if (filter?.priority?.length) {
      query = query.in("priority", filter.priority);
    }
    if (filter?.tags?.length) {
      query = query.contains("tags", filter.tags);
    }

    const { data: projects, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return (projects || []).map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress || 0,
      startDate: new Date(project.start_date),
      endDate: new Date(project.end_date),
      budget: project.budget || 0,
      spent: project.spent || 0,
      team: (project.project_members || []).map((member: any) => ({
        id: member.user_id,
        name: member.healthcare_professionals?.users?.name,
        email: member.healthcare_professionals?.users?.email,
        avatar: member.healthcare_professionals?.users?.avatar_url,
        role: member.role,
        department: member.healthcare_professionals?.department,
        status: "offline", // Would need real-time data
        lastSeen: new Date(),
        permissions: [],
        metadata: {},
      })),
      tags: project.tags || [],
      priority: project.priority || "medium",
      health: this.calculateProjectHealth(project),
    }));
  }

  /**
   * Get dashboard tasks with assignees and progress
   */
  async getDashboardTasks(
    userId: string,
    filter?: DashboardFilter,
  ): Promise<DashboardTask[]> {
    const context = await this.getUserContext(userId);

    let query = this.supabase
      .from("dashboard_tasks")
      .select(
        `
        *,
        assignee:healthcare_professionals!assignee_id (
          user_id,
          users (name, email, avatar_url),
          role,
          department
        )
      `,
      )
      .eq("clinic_id", context.clinicId)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filter?.status?.length) {
      query = query.in("status", filter.status);
    }
    if (filter?.priority?.length) {
      query = query.in("priority", filter.priority);
    }
    if (filter?.userId) {
      query = query.eq("assignee_id", filter.userId);
    }
    if (filter?.projectId) {
      query = query.eq("project_id", filter.projectId);
    }

    const { data: tasks, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    return (tasks || []).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: {
        id: task.assignee.user_id,
        name: task.assignee.users.name,
        email: task.assignee.users.email,
        avatar: task.assignee.users.avatar_url,
        role: task.assignee.role,
        department: task.assignee.department,
        status: "offline",
        lastSeen: new Date(),
        permissions: [],
        metadata: {},
      },
      projectId: task.project_id,
      dueDate: new Date(task.due_date),
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      tags: task.tags || [],
      progress: task.progress || 0,
      estimatedHours: task.estimated_hours,
      actualHours: task.actual_hours,
    }));
  }

  /**
   * Get recent dashboard activities
   */
  async getDashboardActivities(
    userId: string,
    limit = 50,
  ): Promise<DashboardActivity[]> {
    const context = await this.getUserContext(userId);

    const { data: activities, error } = await this.supabase
      .from("dashboard_activities")
      .select(
        `
        *,
        user:healthcare_professionals (
          user_id,
          users (name, email, avatar_url),
          role,
          department
        )
      `,
      )
      .eq("clinic_id", context.clinicId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    return (activities || []).map((activity) => ({
      id: activity.id,
      user: {
        id: activity.user.user_id,
        name: activity.user.users.name,
        email: activity.user.users.email,
        avatar: activity.user.users.avatar_url,
        role: activity.user.role,
        department: activity.user.department,
        status: "offline",
        lastSeen: new Date(),
        permissions: [],
        metadata: {},
      },
      action: activity.action,
      target: activity.target,
      targetType: activity.target_type,
      timestamp: new Date(activity.timestamp),
      metadata: activity.metadata || {},
      severity: activity.severity || "info",
    }));
  }

  /**
   * Get user notifications
   */
  async getDashboardNotifications(
    userId: string,
    unreadOnly = false,
  ): Promise<DashboardNotification[]> {
    let query = this.supabase
      .from("dashboard_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return (notifications || []).map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      timestamp: new Date(notification.timestamp),
      read: notification.read,
      userId: notification.user_id,
      action: notification.action,
      priority: notification.priority || "medium",
      category: notification.category || "general",
    }));
  }

  /**
   * Create new project
   */
  async createProject(
    userId: string,
    project: Omit<DashboardProject, "id" | "team" | "health">,
  ): Promise<DashboardProject> {
    const context = await this.getUserContext(userId);

    const { data, error } = await this.supabase
      .from("dashboard_projects")
      .insert({
        clinic_id: context.clinicId,
        name: project.name,
        description: project.description,
        status: project.status,
        start_date: project.startDate.toISOString(),
        end_date: project.endDate.toISOString(),
        budget: project.budget,
        priority: project.priority,
        tags: project.tags,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return {
      ...project,
      id: data.id,
      team: [],
      health: "healthy",
    };
  }

  /**
   * Create new task
   */
  async createTask(
    userId: string,
    task: Omit<DashboardTask, "id" | "createdAt" | "updatedAt" | "assignee"> & {
      assigneeId: string;
    },
  ): Promise<DashboardTask> {
    const context = await this.getUserContext(userId);

    const { data, error } = await this.supabase
      .from("dashboard_tasks")
      .insert({
        clinic_id: context.clinicId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: task.assigneeId,
        project_id: task.projectId,
        due_date: task.dueDate.toISOString(),
        tags: task.tags,
        progress: task.progress,
        estimated_hours: task.estimatedHours,
        created_by: userId,
      })
      .select(
        `
        *,
        assignee:healthcare_professionals!assignee_id (
          user_id,
          users (name, email, avatar_url),
          role,
          department
        )
      `,
      )
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignee: {
        id: data.assignee.user_id,
        name: data.assignee.users.name,
        email: data.assignee.users.email,
        avatar: data.assignee.users.avatar_url,
        role: data.assignee.role,
        department: data.assignee.department,
        status: "offline",
        lastSeen: new Date(),
        permissions: [],
        metadata: {},
      },
      projectId: data.project_id,
      dueDate: new Date(data.due_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      tags: data.tags || [],
      progress: data.progress || 0,
      estimatedHours: data.estimated_hours,
      actualHours: data.actual_hours,
    };
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from("dashboard_notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  // Private helper methods

  private async getProjectStatistics(
    clinicId: string,
    dateRange: { start: Date; end: Date; },
  ) {
    const { data } = await this.supabase
      .from("dashboard_projects")
      .select("status, created_at")
      .eq("clinic_id", clinicId);

    const projects = data || [];
    const { length: total } = projects;
    const active = projects.filter((p) => p.status === "active").length;
    const newProjects = projects.filter(
      (p) => new Date(p.created_at) >= dateRange.start,
    ).length;

    return {
      total,
      active,
      growth: total > 0 ? (newProjects / total) * 100 : 0,
      overdue: 0, // Would need due date logic
    };
  }

  private async getTaskStatistics(
    clinicId: string,
    _dateRange: { start: Date; end: Date; },
  ) {
    const { data } = await this.supabase
      .from("dashboard_tasks")
      .select("status, created_at, updated_at")
      .eq("clinic_id", clinicId);

    const tasks = data || [];
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const { length: total } = tasks;

    return {
      completed,
      pending,
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      blocked: 0, // Would need blocked status
    };
  }

  private async getUserStatistics(clinicId: string) {
    const { data } = await this.supabase
      .from("healthcare_professionals")
      .select("user_id, last_seen")
      .eq("clinic_id", clinicId);

    const users = data || [];
    const { length: total } = users;
    const online = 0; // Would need real-time presence

    return { total, online };
  }

  private async getBudgetStatistics(
    clinicId: string,
    _dateRange: { start: Date; end: Date; },
  ) {
    const { data } = await this.supabase
      .from("dashboard_projects")
      .select("budget, spent")
      .eq("clinic_id", clinicId);

    const projects = data || [];
    const total = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const spent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const overbudget = projects.filter(
      (p) => (p.spent || 0) > (p.budget || 0),
    ).length;

    return {
      total,
      spent,
      utilizationRate: total > 0 ? (spent / total) * 100 : 0,
      overbudget,
    };
  }

  private async getPerformanceMetrics(
    _clinicId: string,
    _dateRange: { start: Date; end: Date; },
  ) {
    // Complex performance calculations would go here
    return {
      productivity: 85, // Placeholder
      performance: {
        avgProjectDuration: 45, // days
        avgTaskCompletionTime: 3.5, // days
        onTimeDelivery: 78, // percentage
        budgetAccuracy: 92, // percentage
      },
      criticalIssues: 2,
    };
  }

  private async getPreviousPeriodValue(
    metricId: string,
    clinicId: string,
  ): Promise<number> {
    const { data } = await this.supabase
      .from("dashboard_metrics_history")
      .select("value")
      .eq("metric_id", metricId)
      .eq("clinic_id", clinicId)
      .order("recorded_at", { ascending: false })
      .limit(1);

    return data?.[0]?.value || 0;
  }

  private calculateProjectHealth(
    project: any,
  ): "healthy" | "at-risk" | "critical" {
    const budgetHealth = (project.spent || 0) / (project.budget || 1);
    const timeHealth = (Date.now() - new Date(project.start_date).getTime())
      / (new Date(project.end_date).getTime()
        - new Date(project.start_date).getTime());

    if (budgetHealth > 1.2 || timeHealth > 1.2) {
      return "critical";
    }
    if (budgetHealth > 0.9 || timeHealth > 0.9) {
      return "at-risk";
    }
    return "healthy";
  }
}

// Export singleton instance
export const neonproDashboardService = new NeonProDashboardService();
export default neonproDashboardService;
