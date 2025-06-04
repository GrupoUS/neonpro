
import { UserProfile } from '../types/profile';

export const userHelpers = {
  // Filtros e estatísticas
  getActiveUsers: (users: UserProfile[]) => 
    users.filter(user => user.role !== 'inactive'),

  getUsersByRole: (users: UserProfile[], role: string) => 
    users.filter(user => user.role === role),

  getTotalUsersByRole: (users: UserProfile[]) => {
    const active = userHelpers.getActiveUsers(users);
    return {
      admin: active.filter(u => u.role === 'admin').length,
      user: active.filter(u => u.role === 'user').length,
      moderator: active.filter(u => u.role === 'moderator').length,
      total: active.length
    };
  },

  // Verificar se usuário atual é admin
  isCurrentUserAdmin: (currentUserProfile: UserProfile | null) => 
    currentUserProfile?.role === 'admin',

  // Verificar se usuário atual pode gerenciar outros usuários
  canManageUsers: (currentUserProfile: UserProfile | null) => 
    userHelpers.isCurrentUserAdmin(currentUserProfile)
};
