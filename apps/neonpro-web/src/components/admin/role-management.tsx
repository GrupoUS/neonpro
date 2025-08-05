// Role Management Interface Component
// Story 1.2: Role-Based Permissions Enhancement

"use client";

import React, { useState, useEffect, useCallback } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Badge } from "@/components/ui/badge";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Checkbox } from "@/components/ui/checkbox";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Separator } from "@/components/ui/separator";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { useToast } from "@/components/ui/use-toast";
import type { useRBAC } from "@/hooks/use-rbac";
import type { createClient } from "@/lib/supabase/client";
import type { rbacManager } from "@/lib/auth/rbac/permissions";
import type {
  UserRole,
  Permission,
  RoleDefinition,
  UserRoleAssignment,
  DEFAULT_ROLES,
  PERMISSION_GROUPS,
} from "@/types/rbac";
import type {
  Users,
  Shield,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Search,
  Filter,
} from "lucide-react";

interface RoleManagementProps {
  clinicId: string;
}

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  role_id: string;
  assigned_at: string;
  assigned_by: string;
  is_active: boolean;
  expires_at?: string;
}

interface RoleAssignmentForm {
  userId: string;
  roleId: string;
  expiresAt?: string;
  notes?: string;
}

export function RoleManagement({ clinicId }: RoleManagementProps) {
  const { toast } = useToast();
  const { hasPermission, userRole, isLoading: rbacLoading } = useRBAC({ clinicId });
  const supabase = createClient();

  // State
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [assignmentForm, setAssignmentForm] = useState<RoleAssignmentForm>({
    userId: "",
    roleId: "",
  });

  // Check permissions
  const [canManageRoles, setCanManageRoles] = useState(false);
  const [canAssignRoles, setCanAssignRoles] = useState(false);
  const [canViewUsers, setCanViewUsers] = useState(false);

  useEffect(() => {
    async function checkPermissions() {
      const [manage, assign, view] = await Promise.all([
        hasPermission("manage_roles"),
        hasPermission("assign_roles"),
        hasPermission("view_users"),
      ]);

      setCanManageRoles(manage);
      setCanAssignRoles(assign);
      setCanViewUsers(view);
    }

    if (!rbacLoading) {
      checkPermissions();
    }
  }, [hasPermission, rbacLoading]);

  // Load data
  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("user_role_assignments")
        .select(`
          *,
          user:users(id, email, full_name),
          role:role_definitions(name, display_name)
        `)
        .eq("clinic_id", clinicId)
        .order("assigned_at", { ascending: false });

      if (error) throw error;

      const usersWithRoles: UserWithRole[] = data.map((assignment) => ({
        id: assignment.user.id,
        email: assignment.user.email,
        full_name: assignment.user.full_name,
        role: assignment.role.name as UserRole,
        role_id: assignment.role_id,
        assigned_at: assignment.assigned_at,
        assigned_by: assignment.assigned_by,
        is_active: assignment.is_active,
        expires_at: assignment.expires_at,
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários",
        variant: "destructive",
      });
    }
  }, [clinicId, supabase, toast]);

  const loadRoles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("role_definitions")
        .select("*")
        .order("hierarchy");

      if (error) throw error;

      setRoles(data);
    } catch (error) {
      console.error("Error loading roles:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar funções",
        variant: "destructive",
      });
    }
  }, [supabase, toast]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await Promise.all([loadUsers(), loadRoles()]);
      setIsLoading(false);
    }

    if (canViewUsers) {
      loadData();
    }
  }, [canViewUsers, loadUsers, loadRoles]);

  // Handle role assignment
  const handleAssignRole = async () => {
    if (!assignmentForm.userId || !assignmentForm.roleId) {
      toast({
        title: "Erro",
        description: "Selecione um usuário e uma função",
        variant: "destructive",
      });
      return;
    }

    try {
      await rbacManager.assignRole(assignmentForm.userId, assignmentForm.roleId, clinicId, {
        expiresAt: assignmentForm.expiresAt ? new Date(assignmentForm.expiresAt) : undefined,
        notes: assignmentForm.notes,
      });

      toast({
        title: "Sucesso",
        description: "Função atribuída com sucesso",
      });

      setShowAssignDialog(false);
      setAssignmentForm({ userId: "", roleId: "" });
      await loadUsers();
    } catch (error) {
      console.error("Error assigning role:", error);
      toast({
        title: "Erro",
        description: "Falha ao atribuir função",
        variant: "destructive",
      });
    }
  };

  // Handle role removal
  const handleRemoveRole = async (userId: string) => {
    try {
      await rbacManager.removeRole(userId, clinicId);

      toast({
        title: "Sucesso",
        description: "Função removida com sucesso",
      });

      await loadUsers();
    } catch (error) {
      console.error("Error removing role:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover função",
        variant: "destructive",
      });
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Get role badge variant
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "owner":
        return "destructive";
      case "manager":
        return "default";
      case "staff":
        return "secondary";
      case "patient":
        return "outline";
      default:
        return "outline";
    }
  };

  if (rbacLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!canViewUsers) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Você não tem permissão para visualizar usuários.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciamento de Funções</h2>
          <p className="text-muted-foreground">
            Gerencie funções e permissões dos usuários da clínica
          </p>
        </div>

        {canAssignRoles && (
          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Atribuir Função
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atribuir Função</DialogTitle>
                <DialogDescription>
                  Selecione um usuário e uma função para atribuir
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-select">Usuário</Label>
                  <Select
                    value={assignmentForm.userId}
                    onValueChange={(value) =>
                      setAssignmentForm((prev) => ({ ...prev, userId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="role-select">Função</Label>
                  <Select
                    value={assignmentForm.roleId}
                    onValueChange={(value) =>
                      setAssignmentForm((prev) => ({ ...prev, roleId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expires-at">Data de Expiração (Opcional)</Label>
                  <Input
                    id="expires-at"
                    type="datetime-local"
                    value={assignmentForm.expiresAt || ""}
                    onChange={(e) =>
                      setAssignmentForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas (Opcional)</Label>
                  <Input
                    id="notes"
                    placeholder="Notas sobre a atribuição"
                    value={assignmentForm.notes || ""}
                    onChange={(e) =>
                      setAssignmentForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAssignRole}>Atribuir</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="roles">Funções</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as funções</SelectItem>
                <SelectItem value="owner">Proprietário</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="staff">Funcionário</SelectItem>
                <SelectItem value="patient">Paciente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Atribuído em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(user.assigned_at).toLocaleDateString("pt-BR")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {user.is_active ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm">{user.is_active ? "Ativo" : "Inativo"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canAssignRoles && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setAssignmentForm({ userId: user.id, roleId: user.role_id });
                                  setShowAssignDialog(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Função
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleRemoveRole(user.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remover Função
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <RoleDefinitionsTab
            roles={roles}
            canManageRoles={canManageRoles}
            onRolesChange={loadRoles}
            clinicId={clinicId}
          />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsTab roles={roles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Role Definitions Tab Component
interface RoleDefinitionsTabProps {
  roles: RoleDefinition[];
  canManageRoles: boolean;
  onRolesChange: () => void;
  clinicId: string;
}

function RoleDefinitionsTab({
  roles,
  canManageRoles,
  onRolesChange,
  clinicId,
}: RoleDefinitionsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {role.display_name}
                <Badge variant="outline">Nível {role.hierarchy}</Badge>
              </CardTitle>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Permissões:</strong> {role.permissions.length}
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{role.permissions.length - 3} mais
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Permissions Tab Component
interface PermissionsTabProps {
  roles: RoleDefinition[];
}

function PermissionsTab({ roles }: PermissionsTabProps) {
  return (
    <div className="space-y-6">
      {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
        <Card key={groupName}>
          <CardHeader>
            <CardTitle className="capitalize">{groupName.replace("_", " ")}</CardTitle>
            <CardDescription>
              Permissões relacionadas a {groupName.replace("_", " ").toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {permissions.map((permission) => (
                <div
                  key={permission}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{permission}</div>
                    <div className="text-sm text-muted-foreground">
                      Permite {permission.replace("_", " ").toLowerCase()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {roles.map((role) => (
                      <Badge
                        key={role.id}
                        variant={
                          role.permissions.includes(permission as Permission)
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
