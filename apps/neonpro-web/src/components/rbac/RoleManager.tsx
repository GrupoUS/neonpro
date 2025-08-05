/**
 * Role Manager Component for RBAC Administration
 * Story 1.2: Role-Based Access Control Implementation
 *
 * This component provides role and permission management interface for administrators
 */

import type {
  AlertTriangle,
  Edit,
  Plus,
  Save,
  Settings,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Checkbox } from "@/components/ui/checkbox";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { usePermissions } from "@/hooks/usePermissions";
import type { DEFAULT_ROLES, Permission, UserRole } from "@/types/rbac";
import type { PermissionGuard } from "./PermissionGuard";

/**
 * User with role assignment
 */
interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId: string;
  createdAt: string;
  lastLogin?: string;
}

/**
 * Role assignment form data
 */
interface RoleAssignmentForm {
  userId: string;
  newRole: UserRole;
  reason: string;
}

/**
 * Role Manager Component
 */
export const RoleManager: React.FC = () => {
  const { hasPermission, role: currentUserRole } = usePermissions();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [roleForm, setRoleForm] = useState<RoleAssignmentForm>({
    userId: "",
    newRole: "staff",
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  /**
   * Load users from the system
   */
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would fetch from API
      // For now, we'll simulate with mock data
      const mockUsers: UserWithRole[] = [
        {
          id: "1",
          email: "admin@clinic.com",
          name: "Admin User",
          role: "owner",
          clinicId: "clinic-1",
          createdAt: "2024-01-01T00:00:00Z",
          lastLogin: "2024-01-27T10:00:00Z",
        },
        {
          id: "2",
          email: "manager@clinic.com",
          name: "Manager User",
          role: "manager",
          clinicId: "clinic-1",
          createdAt: "2024-01-02T00:00:00Z",
          lastLogin: "2024-01-27T09:30:00Z",
        },
        {
          id: "3",
          email: "staff@clinic.com",
          name: "Staff User",
          role: "staff",
          clinicId: "clinic-1",
          createdAt: "2024-01-03T00:00:00Z",
          lastLogin: "2024-01-27T08:00:00Z",
        },
      ];

      setUsers(mockUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle role assignment
   */
  const handleRoleAssignment = async () => {
    if (!selectedUser || !roleForm.newRole || !roleForm.reason.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call the API
      console.log("Assigning role:", {
        userId: selectedUser.id,
        oldRole: selectedUser.role,
        newRole: roleForm.newRole,
        reason: roleForm.reason,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id ? { ...user, role: roleForm.newRole } : user,
        ),
      );

      setSuccess(`Role updated successfully for ${selectedUser.name}`);
      setShowRoleDialog(false);
      setSelectedUser(null);
      setRoleForm({ userId: "", newRole: "staff", reason: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign role");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Open role assignment dialog
   */
  const openRoleDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setRoleForm({
      userId: user.id,
      newRole: user.role,
      reason: "",
    });
    setShowRoleDialog(true);
  };

  /**
   * Get role badge variant
   */
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "owner":
        return "default";
      case "manager":
        return "secondary";
      case "staff":
        return "outline";
      case "patient":
        return "destructive";
      default:
        return "outline";
    }
  };

  /**
   * Check if current user can modify target user's role
   */
  const canModifyRole = (targetUser: UserWithRole): boolean => {
    if (currentUserRole === "owner") return true;
    if (currentUserRole === "manager" && targetUser.role !== "owner") return true;
    return false;
  };

  /**
   * Load users on component mount
   */
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Clear messages after delay
   */
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <PermissionGuard requiredPermissions={["users.manage"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
            <p className="text-muted-foreground">
              Manage user roles and permissions for your clinic
            </p>
          </div>
          <Button onClick={loadUsers} disabled={isLoading}>
            <Users className="mr-2 h-4 w-4" />
            Refresh Users
          </Button>
        </div>

        {/* Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Roles</TabsTrigger>
            <TabsTrigger value="permissions">Role Permissions</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Role Assignments</CardTitle>
                <CardDescription>View and modify user roles within your clinic</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell>
                          {canModifyRole(user) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRoleDialog(user)}
                            >
                              <Edit className="mr-2 h-3 w-3" />
                              Edit Role
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(DEFAULT_ROLES).map(([roleName, roleData]) => (
                <Card key={roleName}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(roleName as UserRole)}>
                        {roleName.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-normal text-muted-foreground">
                        Level {roleData.hierarchy}
                      </span>
                    </CardTitle>
                    <CardDescription>{roleData.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Permissions:</Label>
                      <div className="grid gap-1">
                        {roleData.permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox checked disabled />
                            <span className="text-sm">{permission}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Role Assignment Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Modify the role for {selectedUser?.name} ({selectedUser?.email})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-role">Current Role</Label>
                <Input id="current-role" value={selectedUser?.role.toUpperCase() || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-role">New Role</Label>
                <Select
                  value={roleForm.newRole}
                  onValueChange={(value) =>
                    setRoleForm((prev) => ({ ...prev, newRole: value as UserRole }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(DEFAULT_ROLES)
                      .filter((role) => {
                        // Filter roles based on current user's permissions
                        if (currentUserRole === "owner") return true;
                        if (currentUserRole === "manager") return role !== "owner";
                        return false;
                      })
                      .map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.toUpperCase()}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Change *</Label>
                <Input
                  id="reason"
                  placeholder="Enter reason for role change..."
                  value={roleForm.reason}
                  onChange={(e) => setRoleForm((prev) => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleRoleAssignment}
                disabled={isLoading || !roleForm.reason.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
};

export default RoleManager;
