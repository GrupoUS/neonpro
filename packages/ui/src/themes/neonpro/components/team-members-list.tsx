/**
 * Team Members List Component
 * Based on TweakCN NEONPRO theme design (Sofia Davis (Owner), Jackson Lee (Developer), etc.)
 * Optimized for Brazilian healthcare team management
 */

import { cn } from "@neonpro/utils";
import {
  Calculator,
  Code,
  Crown,
  Edit,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Settings,
  Shield,
  Stethoscope,
  Trash2,
  User,
  UserCheck,
  UserPlus,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

// Brazilian healthcare team roles
export type TeamRole =
  | "owner" // Proprietário
  | "admin" // Administrador
  | "doctor" // Médico
  | "nurse" // Enfermeiro(a)
  | "receptionist" // Recepcionista
  | "developer" // Desenvolvedor
  | "billing" // Financeiro
  | "marketing" // Marketing
  | "manager" // Gerente
  | "support"; // Suporte

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatar?: string;
  phone?: string;
  department?: string;

  // Professional info (Brazilian healthcare)
  crmNumber?: string; // CRM for doctors
  corenNumber?: string; // COREN for nurses
  specialties?: string[]; // Medical specialties

  // Status & permissions
  status: "active" | "inactive" | "pending" | "suspended";
  permissions: string[];
  lastActive?: Date;
  joinedAt: Date;

  // Contact info
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface TeamMembersListProps {
  // Data
  members: TeamMember[];
  loading?: boolean;

  // Search & filter
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  roleFilter?: TeamRole | "all";
  onRoleFilterChange?: (role: TeamRole | "all") => void;
  statusFilter?: TeamMember["status"] | "all";
  onStatusFilterChange?: (status: TeamMember["status"] | "all") => void;

  // Actions
  onMemberClick?: (member: TeamMember) => void;
  onMemberEdit?: (member: TeamMember) => void;
  onMemberRemove?: (member: TeamMember) => void;
  onAddMember?: () => void;

  // Customization
  variant?: "default" | "card" | "compact" | "detailed";
  showActions?: boolean;
  showFilters?: boolean;
  className?: string;
}

// Role configuration (NEONPRO theme styling)
const ROLE_CONFIG = {
  owner: {
    label: "Proprietário",
    icon: Crown,
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    accent: "text-purple-600",
  },
  admin: {
    label: "Administrador",
    icon: Shield,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    accent: "text-blue-600",
  },
  doctor: {
    label: "Médico",
    icon: Stethoscope,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    accent: "text-green-600",
  },
  nurse: {
    label: "Enfermeiro(a)",
    icon: UserCheck,
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    accent: "text-teal-600",
  },
  receptionist: {
    label: "Recepcionista",
    icon: User,
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
    accent: "text-pink-600",
  },
  developer: {
    label: "Desenvolvedor",
    icon: Code,
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    accent: "text-indigo-600",
  },
  billing: {
    label: "Financeiro",
    icon: Calculator,
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    accent: "text-orange-600",
  },
  marketing: {
    label: "Marketing",
    icon: Settings,
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    accent: "text-cyan-600",
  },
  manager: {
    label: "Gerente",
    icon: Settings,
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    accent: "text-gray-600",
  },
  support: {
    label: "Suporte",
    icon: Settings,
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    accent: "text-yellow-600",
  },
} as const;

// Status configuration
const STATUS_CONFIG = {
  active: {
    label: "Ativo",
    dot: "bg-green-500",
    text: "text-green-700",
  },
  inactive: {
    label: "Inativo",
    dot: "bg-gray-400",
    text: "text-gray-600",
  },
  pending: {
    label: "Pendente",
    dot: "bg-yellow-500",
    text: "text-yellow-700",
  },
  suspended: {
    label: "Suspenso",
    dot: "bg-red-500",
    text: "text-red-700",
  },
} as const;

// Role badge component
const RoleBadge: React.FC<{ role: TeamRole; }> = ({ role }) => {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border",
        config.bg,
        config.text,
        config.border,
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  );
};

// Status indicator component
const StatusIndicator: React.FC<{ status: TeamMember["status"]; }> = ({
  status,
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-2 h-2 rounded-full", config.dot)} />
      <span className={cn("text-sm", config.text)}>{config.label}</span>
    </div>
  );
};

// Avatar component with fallback
const MemberAvatar: React.FC<{
  member: TeamMember;
  size?: "sm" | "md" | "lg";
}> = ({ member, size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const initials = member.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-blue-400 to-purple-500",
        "flex items-center justify-center text-white font-medium",
        sizeClasses[size],
      )}
    >
      {member.avatar
        ? (
          <img
            src={member.avatar}
            alt={member.name}
            className="w-full h-full rounded-full object-cover"
          />
        )
        : <span>{initials}</span>}
    </div>
  );
};

// Member card component (for card variant)
const MemberCard: React.FC<{
  member: TeamMember;
  showActions: boolean;
  onEdit?: (member: TeamMember) => void;
  onRemove?: (member: TeamMember) => void;
  onClick?: (member: TeamMember) => void;
}> = ({ member, showActions, onEdit, onRemove, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(member)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <MemberAvatar member={member} size="lg" />
          <div>
            <h4 className="font-semibold text-gray-900">{member.name}</h4>
            <p className="text-sm text-gray-600">{member.email}</p>
          </div>
        </div>

        {showActions && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(member);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.(member);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <Trash2 className="w-4 h-4" />
                  Remover
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Role & Status */}
      <div className="flex items-center justify-between mb-4">
        <RoleBadge role={member.role} />
        <StatusIndicator status={member.status} />
      </div>

      {/* Professional info */}
      {(member.crmNumber || member.corenNumber) && (
        <div className="text-sm text-gray-600 mb-4">
          {member.crmNumber && <div>CRM: {member.crmNumber}</div>}
          {member.corenNumber && <div>COREN: {member.corenNumber}</div>}
        </div>
      )}

      {/* Contact info */}
      <div className="space-y-2">
        {member.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{member.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>{member.email}</span>
        </div>
      </div>
    </div>
  );
};

// List item component (for default variant)
const MemberListItem: React.FC<{
  member: TeamMember;
  showActions: boolean;
  onEdit?: (member: TeamMember) => void;
  onRemove?: (member: TeamMember) => void;
  onClick?: (member: TeamMember) => void;
}> = ({ member, showActions, onEdit, onRemove, onClick }) => {
  return (
    <div
      className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onClick?.(member)}
    >
      {/* Member info */}
      <div className="flex items-center gap-4">
        <MemberAvatar member={member} />

        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h4 className="font-medium text-gray-900">{member.name}</h4>
            <RoleBadge role={member.role} />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{member.email}</span>
            {member.phone && <span>{member.phone}</span>}
            <StatusIndicator status={member.status} />
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(member);
            }}
            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
            title="Editar membro"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(member);
            }}
            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
            title="Remover membro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export const TeamMembersList: React.FC<TeamMembersListProps> = ({
  members,
  loading = false,
  searchQuery = "",
  onSearchChange,
  roleFilter = "all",
  onRoleFilterChange,
  statusFilter = "all",
  onStatusFilterChange,
  onMemberClick,
  onMemberEdit,
  onMemberRemove,
  onAddMember,
  variant = "default",
  showActions = true,
  showFilters = true,
  className,
}) => {
  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch = !searchQuery
      || member.name.toLowerCase().includes(searchQuery.toLowerCase())
      || member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div
      className={cn("bg-white rounded-xl border border-gray-200", className)}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Equipe ({filteredMembers.length})
          </h3>

          {onAddMember && (
            <button
              onClick={onAddMember}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Adicionar
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange?.(e.target.value as unknown as typeof roleFilter)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Cargos</option>
              {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                <option key={role} value={role}>
                  {config.label}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange?.(e.target.value as unknown as typeof statusFilter)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          variant === "card" ? "grid gap-6 p-6" : "",
          variant === "card"
            ? "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "",
        )}
      >
        {loading
          ? (
            <div className="p-8 text-center text-gray-500">
              Carregando membros da equipe...
            </div>
          )
          : filteredMembers.length === 0
          ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum membro encontrado
            </div>
          )
          : variant === "card"
          ? (
            filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                showActions={showActions}
                onEdit={onMemberEdit}
                onRemove={onMemberRemove}
                onClick={onMemberClick}
              />
            ))
          )
          : (
            filteredMembers.map((member) => (
              <MemberListItem
                key={member.id}
                member={member}
                showActions={showActions}
                onEdit={onMemberEdit}
                onRemove={onMemberRemove}
                onClick={onMemberClick}
              />
            ))
          )}
      </div>
    </div>
  );
};

export default TeamMembersList;
