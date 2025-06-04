// Types para sistema de usuários e perfis
export type UserRole = 'admin' | 'medico' | 'secretaria';

export interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  role: UserRole;
  telefone?: string;
  especialidade?: string; // Para médicos
  crm?: string; // Para médicos
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileData {
  nome: string;
  email: string;
  role: UserRole;
  telefone?: string;
  especialidade?: string;
  crm?: string;
  senha: string; // Para criar novo usuário
}

export interface UpdateUserProfileData {
  nome?: string;
  telefone?: string;
  especialidade?: string;
  crm?: string;
  ativo?: boolean;
  role?: UserRole; // Apenas admins podem alterar
}

export interface UserPermissions {
  canViewPatients: boolean;
  canEditPatients: boolean;
  canDeletePatients: boolean;
  canViewAppointments: boolean;
  canEditAppointments: boolean;
  canDeleteAppointments: boolean;
  canViewFinancial: boolean;
  canEditFinancial: boolean;
  canDeleteFinancial: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
}

// Helper para obter permissões baseadas no role
export const getRolePermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'admin':
      return {
        canViewPatients: true,
        canEditPatients: true,
        canDeletePatients: true,
        canViewAppointments: true,
        canEditAppointments: true,
        canDeleteAppointments: true,
        canViewFinancial: true,
        canEditFinancial: true,
        canDeleteFinancial: true,
        canViewReports: true,
        canManageUsers: true,
      };
    
    case 'medico':
      return {
        canViewPatients: true,
        canEditPatients: true,
        canDeletePatients: false,
        canViewAppointments: true,
        canEditAppointments: true,
        canDeleteAppointments: false,
        canViewFinancial: true,
        canEditFinancial: false,
        canDeleteFinancial: false,
        canViewReports: true,
        canManageUsers: false,
      };
    
    case 'secretaria':
      return {
        canViewPatients: true,
        canEditPatients: true,
        canDeletePatients: false,
        canViewAppointments: true,
        canEditAppointments: true,
        canDeleteAppointments: false,
        canViewFinancial: true,
        canEditFinancial: true,
        canDeleteFinancial: false,
        canViewReports: false,
        canManageUsers: false,
      };
    
    default:
      return {
        canViewPatients: false,
        canEditPatients: false,
        canDeletePatients: false,
        canViewAppointments: false,
        canEditAppointments: false,
        canDeleteAppointments: false,
        canViewFinancial: false,
        canEditFinancial: false,
        canDeleteFinancial: false,
        canViewReports: false,
        canManageUsers: false,
      };
  }
};

// Helper para obter label do role
export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'medico':
      return 'Médico';
    case 'secretaria':
      return 'Secretária';
    default:
      return 'Desconhecido';
  }
};

// Helper para obter cor do badge do role
export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'medico':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'secretaria':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};
