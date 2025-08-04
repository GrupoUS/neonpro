// Temporary RBAC types for build compatibility
export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}