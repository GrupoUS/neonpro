"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Clock,
  Crown,
  Edit,
  Loader2,
  Plus,
  Settings,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  role: "approver" | "admin" | "super_admin";
  department?: string;
  created_at: string;
}

export interface ApprovalHierarchyConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const defaultLevels: Partial<ApprovalLevel>[] = [
  {
    level_order: 1,
    level_name: "Supervisor Direto",
    min_amount: 0,
    max_amount: 1000,
    required_approvers: 1,
    approval_timeout_hours: 24,
    can_be_skipped: false,
    auto_approve_below: 100,
    description: "Aprovação para despesas até R$ 1.000",
  },
  {
    level_order: 2,
    level_name: "Gerente Departamental",
    min_amount: 1000.01,
    max_amount: 5000,
    required_approvers: 1,
    approval_timeout_hours: 48,
    can_be_skipped: false,
    description: "Aprovação para despesas de R$ 1.000,01 até R$ 5.000",
  },
  {
    level_order: 3,
    level_name: "Diretor Financeiro",
    min_amount: 5000.01,
    max_amount: null,
    required_approvers: 2,
    approval_timeout_hours: 72,
    can_be_skipped: false,
    description: "Aprovação para despesas acima de R$ 5.000",
  },
];

const userRoles = [
  { value: "approver", label: "Aprovador", icon: UserCheck },
  { value: "admin", label: "Administrador", icon: Shield },
  { value: "super_admin", label: "Super Admin", icon: Crown },
];

export default function ApprovalHierarchyConfig({
  open,
  onOpenChange,
  onSave,
}: ApprovalHierarchyConfigProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"levels" | "users">("levels");
  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>([]);
  const [approvalUsers, setApprovalUsers] = useState<ApprovalUser[]>([]);

  // Form states
  const [editingLevel, setEditingLevel] = useState<ApprovalLevel | null>(null);
  const [editingUser, setEditingUser] = useState<ApprovalUser | null>(null);
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);

  useEffect(() => {
    if (open) {
      loadApprovalHierarchy();
    }
  }, [open]);

  const loadApprovalHierarchy = async () => {
    try {
      // Mock data - In real implementation, this would come from API
      const mockLevels: ApprovalLevel[] = defaultLevels.map(
        (level, index) =>
          ({
            id: `level_${index + 1}`,
            ...level,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as ApprovalLevel)
      );

      const mockUsers: ApprovalUser[] = [
        {
          id: "user_1",
          user_id: "u1",
          user_name: "João Silva",
          user_email: "joao@neonpro.com",
          approval_level_id: "level_1",
          spending_limit: 1000,
          can_override: false,
          is_active: true,
          role: "approver",
          department: "Operações",
          created_at: new Date().toISOString(),
        },
        {
          id: "user_2",
          user_id: "u2",
          user_name: "Maria Santos",
          user_email: "maria@neonpro.com",
          approval_level_id: "level_2",
          spending_limit: 5000,
          can_override: false,
          is_active: true,
          role: "approver",
          department: "Financeiro",
          created_at: new Date().toISOString(),
        },
        {
          id: "user_3",
          user_id: "u3",
          user_name: "Carlos Oliveira",
          user_email: "carlos@neonpro.com",
          approval_level_id: "level_3",
          spending_limit: null,
          can_override: true,
          is_active: true,
          role: "admin",
          department: "Direção",
          created_at: new Date().toISOString(),
        },
      ];

      setApprovalLevels(mockLevels);
      setApprovalUsers(mockUsers);
    } catch (error) {
      console.error("Error loading approval hierarchy:", error);
      toast.error("Erro ao carregar hierarquia de aprovação");
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Sem limite";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const handleSaveLevel = async (levelData: Partial<ApprovalLevel>) => {
    setLoading(true);
    try {
      if (editingLevel) {
        // Update existing level
        setApprovalLevels((levels) =>
          levels.map((level) =>
            level.id === editingLevel.id
              ? { ...level, ...levelData, updated_at: new Date().toISOString() }
              : level
          )
        );
        toast.success("Nível de aprovação atualizado");
      } else {
        // Create new level
        const newLevel: ApprovalLevel = {
          id: `level_${Date.now()}`,
          ...levelData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as ApprovalLevel;

        setApprovalLevels((levels) => [...levels, newLevel]);
        toast.success("Nível de aprovação criado");
      }

      setShowLevelForm(false);
      setEditingLevel(null);
    } catch (error) {
      console.error("Error saving level:", error);
      toast.error("Erro ao salvar nível de aprovação");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (userData: Partial<ApprovalUser>) => {
    setLoading(true);
    try {
      if (editingUser) {
        // Update existing user
        setApprovalUsers((users) =>
          users.map((user) =>
            user.id === editingUser.id ? { ...user, ...userData } : user
          )
        );
        toast.success("Usuário aprovador atualizado");
      } else {
        // Create new user
        const newUser: ApprovalUser = {
          id: `user_${Date.now()}`,
          ...userData,
          is_active: true,
          created_at: new Date().toISOString(),
        } as ApprovalUser;

        setApprovalUsers((users) => [...users, newUser]);
        toast.success("Usuário aprovador adicionado");
      }

      setShowUserForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Erro ao salvar usuário aprovador");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (!confirm("Tem certeza que deseja excluir este nível de aprovação?"))
      return;

    try {
      setApprovalLevels((levels) =>
        levels.filter((level) => level.id !== levelId)
      );
      toast.success("Nível de aprovação excluído");
    } catch (error) {
      console.error("Error deleting level:", error);
      toast.error("Erro ao excluir nível de aprovação");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário aprovador?"))
      return;

    try {
      setApprovalUsers((users) => users.filter((user) => user.id !== userId));
      toast.success("Usuário aprovador removido");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erro ao remover usuário aprovador");
    }
  };

  const handleSaveHierarchy = async () => {
    setLoading(true);
    try {
      // In real implementation, this would save to API
      console.log("Saving hierarchy:", { approvalLevels, approvalUsers });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Hierarquia de aprovação salva com sucesso");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving hierarchy:", error);
      toast.error("Erro ao salvar hierarquia de aprovação");
    } finally {
      setLoading(false);
    }
  };

  const getUsersForLevel = (levelId: string) => {
    return approvalUsers.filter((user) => user.approval_level_id === levelId);
  };

  const getRoleIcon = (role: string) => {
    const roleConfig = userRoles.find((r) => r.value === role);
    return roleConfig?.icon || UserCheck;
  };

  const getLevelStatus = (level: ApprovalLevel) => {
    const users = getUsersForLevel(level.id);
    if (users.length === 0) {
      return {
        status: "warning",
        label: "Sem aprovadores",
        color: "bg-yellow-100 text-yellow-800",
      };
    }
    if (users.length < level.required_approvers) {
      return {
        status: "error",
        label: "Aprovadores insuficientes",
        color: "bg-red-100 text-red-800",
      };
    }
    return {
      status: "success",
      label: "Configurado",
      color: "bg-green-100 text-green-800",
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração da Hierarquia de Aprovação
          </DialogTitle>
          <DialogDescription>
            Configure níveis de aprovação e usuários responsáveis pela aprovação
            de contas a pagar
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b">
          <button
            onClick={() => setActiveTab("levels")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
              activeTab === "levels"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Níveis de Aprovação
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
              activeTab === "users"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Usuários Aprovadores
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === "levels" && (
            <div className="space-y-4">
              {/* Levels Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Níveis de Aprovação</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure os diferentes níveis de aprovação baseados em
                    valores
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEditingLevel(null);
                    setShowLevelForm(true);
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Nível
                </Button>
              </div>

              {/* Levels Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ordem</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Faixa de Valores</TableHead>
                        <TableHead>Aprovadores</TableHead>
                        <TableHead>Timeout</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvalLevels
                        .sort((a, b) => a.level_order - b.level_order)
                        .map((level) => {
                          const statusInfo = getLevelStatus(level);
                          const users = getUsersForLevel(level.id);

                          return (
                            <TableRow key={level.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                    {level.level_order}
                                  </div>
                                  {!level.is_active && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Inativo
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {level.level_name}
                                  </p>
                                  {level.description && (
                                    <p className="text-xs text-muted-foreground">
                                      {level.description}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>
                                    {formatCurrency(level.min_amount)} +
                                  </div>
                                  {level.max_amount && (
                                    <div className="text-muted-foreground">
                                      até {formatCurrency(level.max_amount)}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Users className="h-3 w-3" />
                                  {users.length}/{level.required_approvers}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="h-3 w-3" />
                                  {level.approval_timeout_hours}h
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn("text-xs", statusInfo.color)}
                                >
                                  {statusInfo.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingLevel(level);
                                      setShowLevelForm(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteLevel(level.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      {approvalLevels.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Nenhum nível de aprovação configurado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              {/* Users Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Usuários Aprovadores
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Gerencie usuários que podem aprovar contas a pagar
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEditingUser(null);
                    setShowUserForm(true);
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </div>

              {/* Users Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Nível</TableHead>
                        <TableHead>Limite</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvalUsers.map((user) => {
                        const level = approvalLevels.find(
                          (l) => l.id === user.approval_level_id
                        );
                        const RoleIcon = getRoleIcon(user.role);

                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{user.user_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {user.user_email}
                                </p>
                                {user.department && (
                                  <p className="text-xs text-blue-600">
                                    {user.department}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                  {level?.level_order || "?"}
                                </div>
                                <span className="text-sm">
                                  {level?.level_name || "Nível não encontrado"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {formatCurrency(user.spending_limit)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <RoleIcon className="h-3 w-3" />
                                <span className="text-sm capitalize">
                                  {
                                    userRoles.find((r) => r.value === user.role)
                                      ?.label
                                  }
                                </span>
                                {user.can_override && (
                                  <Badge variant="outline" className="text-xs">
                                    Override
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  "text-xs",
                                  user.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                )}
                              >
                                {user.is_active ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingUser(user);
                                    setShowUserForm(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {approvalUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Nenhum usuário aprovador configurado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button onClick={handleSaveHierarchy} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Salvando..." : "Salvar Hierarquia"}
          </Button>
        </DialogFooter>

        {/* Level Form Modal */}
        <LevelFormModal
          open={showLevelForm}
          onOpenChange={setShowLevelForm}
          level={editingLevel}
          onSave={handleSaveLevel}
          loading={loading}
        />

        {/* User Form Modal */}
        <UserFormModal
          open={showUserForm}
          onOpenChange={setShowUserForm}
          user={editingUser}
          approvalLevels={approvalLevels}
          onSave={handleSaveUser}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}

// Level Form Modal Component
interface LevelFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: ApprovalLevel | null;
  onSave: (data: Partial<ApprovalLevel>) => void;
  loading: boolean;
}

function LevelFormModal({
  open,
  onOpenChange,
  level,
  onSave,
  loading,
}: LevelFormModalProps) {
  const [formData, setFormData] = useState<Partial<ApprovalLevel>>({
    level_order: 1,
    level_name: "",
    min_amount: 0,
    max_amount: null,
    required_approvers: 1,
    approval_timeout_hours: 24,
    can_be_skipped: false,
    auto_approve_below: null,
    description: "",
  });

  useEffect(() => {
    if (level) {
      setFormData(level);
    } else {
      setFormData({
        level_order: 1,
        level_name: "",
        min_amount: 0,
        max_amount: null,
        required_approvers: 1,
        approval_timeout_hours: 24,
        can_be_skipped: false,
        auto_approve_below: null,
        description: "",
      });
    }
  }, [level, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: keyof ApprovalLevel, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {level ? "Editar Nível de Aprovação" : "Novo Nível de Aprovação"}
          </DialogTitle>
          <DialogDescription>
            Configure os parâmetros deste nível de aprovação
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level_order">Ordem do Nível *</Label>
              <Input
                id="level_order"
                type="number"
                min="1"
                value={formData.level_order || ""}
                onChange={(e) =>
                  updateField("level_order", parseInt(e.target.value) || 1)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level_name">Nome do Nível *</Label>
              <Input
                id="level_name"
                value={formData.level_name || ""}
                onChange={(e) => updateField("level_name", e.target.value)}
                placeholder="Ex: Supervisor Direto"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_amount">Valor Mínimo (R$) *</Label>
              <Input
                id="min_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_amount || ""}
                onChange={(e) =>
                  updateField("min_amount", parseFloat(e.target.value) || 0)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_amount">Valor Máximo (R$)</Label>
              <Input
                id="max_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.max_amount || ""}
                onChange={(e) =>
                  updateField(
                    "max_amount",
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                placeholder="Deixe vazio para sem limite"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="required_approvers">
                Aprovadores Necessários *
              </Label>
              <Input
                id="required_approvers"
                type="number"
                min="1"
                value={formData.required_approvers || ""}
                onChange={(e) =>
                  updateField(
                    "required_approvers",
                    parseInt(e.target.value) || 1
                  )
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approval_timeout_hours">Timeout (horas) *</Label>
              <Input
                id="approval_timeout_hours"
                type="number"
                min="1"
                value={formData.approval_timeout_hours || ""}
                onChange={(e) =>
                  updateField(
                    "approval_timeout_hours",
                    parseInt(e.target.value) || 24
                  )
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auto_approve_below">
              Auto-aprovar abaixo de (R$)
            </Label>
            <Input
              id="auto_approve_below"
              type="number"
              step="0.01"
              min="0"
              value={formData.auto_approve_below || ""}
              onChange={(e) =>
                updateField(
                  "auto_approve_below",
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
              placeholder="Deixe vazio para desabilitar"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Descrição opcional do nível"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="can_be_skipped"
              checked={formData.can_be_skipped || false}
              onCheckedChange={(checked) =>
                updateField("can_be_skipped", checked)
              }
            />
            <Label htmlFor="can_be_skipped">
              Este nível pode ser pulado em situações especiais
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// User Form Modal Component
interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ApprovalUser | null;
  approvalLevels: ApprovalLevel[];
  onSave: (data: Partial<ApprovalUser>) => void;
  loading: boolean;
}

function UserFormModal({
  open,
  onOpenChange,
  user,
  approvalLevels,
  onSave,
  loading,
}: UserFormModalProps) {
  const [formData, setFormData] = useState<Partial<ApprovalUser>>({
    user_name: "",
    user_email: "",
    approval_level_id: "",
    spending_limit: null,
    can_override: false,
    role: "approver",
    department: "",
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        user_name: "",
        user_email: "",
        approval_level_id: "",
        spending_limit: null,
        can_override: false,
        role: "approver",
        department: "",
      });
    }
  }, [user, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      user_id: formData.user_id || `user_${Date.now()}`,
    });
  };

  const updateField = (field: keyof ApprovalUser, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Usuário Aprovador" : "Novo Usuário Aprovador"}
          </DialogTitle>
          <DialogDescription>
            Configure os dados e permissões deste usuário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_name">Nome Completo *</Label>
              <Input
                id="user_name"
                value={formData.user_name || ""}
                onChange={(e) => updateField("user_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_email">E-mail *</Label>
              <Input
                id="user_email"
                type="email"
                value={formData.user_email || ""}
                onChange={(e) => updateField("user_email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="approval_level_id">Nível de Aprovação *</Label>
              <Select
                value={formData.approval_level_id || ""}
                onValueChange={(value) =>
                  updateField("approval_level_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um nível" />
                </SelectTrigger>
                <SelectContent>
                  {approvalLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      Nível {level.level_order} - {level.level_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função *</Label>
              <Select
                value={formData.role || ""}
                onValueChange={(value) => updateField("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="h-4 w-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spending_limit">Limite de Gastos (R$)</Label>
              <Input
                id="spending_limit"
                type="number"
                step="0.01"
                min="0"
                value={formData.spending_limit || ""}
                onChange={(e) =>
                  updateField(
                    "spending_limit",
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                placeholder="Deixe vazio para sem limite"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={formData.department || ""}
                onChange={(e) => updateField("department", e.target.value)}
                placeholder="Ex: Financeiro, Operações"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="can_override"
              checked={formData.can_override || false}
              onCheckedChange={(checked) =>
                updateField("can_override", checked)
              }
            />
            <Label htmlFor="can_override">
              Pode substituir/anular aprovações de outros usuários
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
