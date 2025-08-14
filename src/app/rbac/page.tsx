'use client'

import { useState } from 'react'
import { 
  Shield, 
  Users, 
  Key, 
  Lock, 
  Unlock,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Settings,
  AlertTriangle,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// RBAC Interfaces
interface Role {
  id: string
  name: string
  description: string
  level: 'admin' | 'manager' | 'operator' | 'viewer'
  permissions: string[]
  userCount: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  lastLogin: string
  avatar?: string
  permissions: string[]
  department: string
  createdAt: string
}

interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string
  category: 'patients' | 'procedures' | 'inventory' | 'finance' | 'admin'
  level: 'read' | 'write' | 'delete' | 'admin'
  isSystem: boolean
}

interface AccessLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  timestamp: string
  ip: string
  success: boolean
  details: string
}

// Permission Categories
const permissionCategories = [
  { id: 'patients', name: 'Pacientes', icon: Users, color: 'bg-blue-500' },
  { id: 'procedures', name: 'Procedimentos', icon: UserCheck, color: 'bg-green-500' },
  { id: 'inventory', name: 'Inventário', icon: Settings, color: 'bg-purple-500' },
  { id: 'finance', name: 'Financeiro', icon: Key, color: 'bg-yellow-500' },
  { id: 'admin', name: 'Administração', icon: Shield, color: 'bg-red-500' }
]

// Role Level Badge
const RoleLevelBadge = ({ level }: { level: string }) => {
  const levelConfig = {
    admin: { color: 'bg-red-100 text-red-800', label: 'Administrador' },
    manager: { color: 'bg-blue-100 text-blue-800', label: 'Gerente' },
    operator: { color: 'bg-green-100 text-green-800', label: 'Operador' },
    viewer: { color: 'bg-gray-100 text-gray-800', label: 'Visualizador' }
  }
  
  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.viewer
  
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  )
}

// User Status Badge
const UserStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Ativo', icon: UserCheck },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inativo', icon: UserX },
    suspended: { color: 'bg-red-100 text-red-800', label: 'Suspenso', icon: Lock },
    pending: { color: 'bg-amber-100 text-amber-800', label: 'Pendente', icon: AlertTriangle }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
  const Icon = config.icon
  
  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

// Permission Matrix Component
const PermissionMatrix = ({ roles, permissions }: { roles: Role[], permissions: Permission[] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const filteredPermissions = selectedCategory === 'all' 
    ? permissions 
    : permissions.filter(p => p.category === selectedCategory)
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Matrix de Permissões
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Permissão
            </Button>
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            Todas
          </Button>
          {permissionCategories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permissão</TableHead>
                {roles.map(role => (
                  <TableHead key={role.id} className="text-center">
                    {role.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.map(permission => {
                const category = permissionCategories.find(c => c.id === permission.category)
                const Icon = category?.icon || Shield
                
                return (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`${category?.color || 'bg-gray-500'} p-1 rounded`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-sm text-gray-500">{permission.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    {roles.map(role => (
                      <TableCell key={role.id} className="text-center">
                        <Switch
                          checked={role.permissions.includes(permission.id)}
                          onCheckedChange={() => {
                            // Handle permission toggle
                            console.log(`Toggle ${permission.id} for ${role.id}`)
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Access Logs Component
const AccessLogsCard = ({ logs }: { logs: AccessLog[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Eye className="w-5 h-5" />
        Log de Acesso (Últimas 24h)
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {logs.slice(0, 10).map(log => (
          <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="font-medium text-sm">{log.userName}</p>
                <p className="text-xs text-gray-500">{log.action} • {log.resource}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
              <p className="text-xs text-gray-400">{log.ip}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// RBAC Statistics Card
const RBACStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "bg-blue-600" 
}: {
  title: string
  value: string | number
  icon: any
  trend?: string
  color?: string
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Mock RBAC Data
const mockRoles: Role[] = [
  {
    id: 'role-001',
    name: 'Administrador',
    description: 'Acesso completo ao sistema',
    level: 'admin',
    permissions: ['perm-001', 'perm-002', 'perm-003', 'perm-004', 'perm-005', 'perm-006'],
    userCount: 2,
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2025-01-10'
  },
  {
    id: 'role-002',
    name: 'Médico',
    description: 'Acesso a pacientes e procedimentos médicos',
    level: 'manager',
    permissions: ['perm-001', 'perm-002', 'perm-003'],
    userCount: 5,
    isSystem: false,
    createdAt: '2024-01-15',
    updatedAt: '2025-01-08'
  },
  {
    id: 'role-003',
    name: 'Enfermeiro',
    description: 'Acesso a procedimentos e inventário',
    level: 'operator',
    permissions: ['perm-001', 'perm-003', 'perm-004'],
    userCount: 3,
    isSystem: false,
    createdAt: '2024-02-01',
    updatedAt: '2024-12-20'
  },
  {
    id: 'role-004',
    name: 'Recepcionista',
    description: 'Acesso a agendamentos e informações básicas',
    level: 'viewer',
    permissions: ['perm-001', 'perm-006'],
    userCount: 4,
    isSystem: false,
    createdAt: '2024-03-01',
    updatedAt: '2024-11-15'
  }
]

const mockUsers: User[] = [
  {
    id: 'user-001',
    name: 'Dra. Maria Santos',
    email: 'maria.santos@neonpro.com',
    role: 'Médico',
    status: 'active',
    lastLogin: '2025-01-14T09:30:00',
    permissions: ['perm-001', 'perm-002', 'perm-003'],
    department: 'Dermatologia',
    createdAt: '2024-01-15'
  },
  {
    id: 'user-002',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@neonpro.com',
    role: 'Enfermeiro',
    status: 'active',
    lastLogin: '2025-01-14T08:45:00',
    permissions: ['perm-001', 'perm-003', 'perm-004'],
    department: 'Procedimentos',
    createdAt: '2024-02-01'
  },
  {
    id: 'user-003',
    name: 'Ana Ferreira',
    email: 'ana.ferreira@neonpro.com',
    role: 'Esteticista',
    status: 'active',
    lastLogin: '2025-01-13T16:20:00',
    permissions: ['perm-001', 'perm-003'],
    department: 'Estética',
    createdAt: '2024-03-15'
  },
  {
    id: 'user-004',
    name: 'Juliana Lima',
    email: 'juliana.lima@neonpro.com',
    role: 'Recepcionista',
    status: 'active',
    lastLogin: '2025-01-14T07:30:00',
    permissions: ['perm-001', 'perm-006'],
    department: 'Atendimento',
    createdAt: '2024-05-15'
  }
]

const mockPermissions: Permission[] = [
  {
    id: 'perm-001',
    name: 'Visualizar Pacientes',
    resource: 'patients',
    action: 'read',
    description: 'Visualizar informações básicas dos pacientes',
    category: 'patients',
    level: 'read',
    isSystem: true
  },
  {
    id: 'perm-002',
    name: 'Editar Prontuários',
    resource: 'medical_records',
    action: 'write',
    description: 'Criar e editar prontuários médicos',
    category: 'patients',
    level: 'write',
    isSystem: true
  },
  {
    id: 'perm-003',
    name: 'Executar Procedimentos',
    resource: 'procedures',
    action: 'execute',
    description: 'Registrar e executar procedimentos',
    category: 'procedures',
    level: 'write',
    isSystem: true
  },
  {
    id: 'perm-004',
    name: 'Gerenciar Inventário',
    resource: 'inventory',
    action: 'manage',
    description: 'Controlar estoque e inventário',
    category: 'inventory',
    level: 'write',
    isSystem: true
  },
  {
    id: 'perm-005',
    name: 'Visualizar Relatórios Financeiros',
    resource: 'financial_reports',
    action: 'read',
    description: 'Acessar relatórios financeiros',
    category: 'finance',
    level: 'read',
    isSystem: true
  },
  {
    id: 'perm-006',
    name: 'Gerenciar Agendamentos',
    resource: 'schedules',
    action: 'manage',
    description: 'Criar e gerenciar agendamentos',
    category: 'patients',
    level: 'write',
    isSystem: true
  }
]

const mockAccessLogs: AccessLog[] = [
  {
    id: 'log-001',
    userId: 'user-001',
    userName: 'Dra. Maria Santos',
    action: 'LOGIN',
    resource: 'system',
    timestamp: '2025-01-14T09:30:00',
    ip: '192.168.1.100',
    success: true,
    details: 'Login successful'
  },
  {
    id: 'log-002',
    userId: 'user-002',
    userName: 'Carlos Oliveira',
    action: 'VIEW',
    resource: 'patient_records',
    timestamp: '2025-01-14T09:15:00',
    ip: '192.168.1.101',
    success: true,
    details: 'Viewed patient ID: 12345'
  },
  {
    id: 'log-003',
    userId: 'user-001',
    userName: 'Dra. Maria Santos',
    action: 'EDIT',
    resource: 'medical_record',
    timestamp: '2025-01-14T09:25:00',
    ip: '192.168.1.100',
    success: true,
    details: 'Updated medical record ID: 67890'
  }
]

export default function RBACPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('users')

  // Calculate statistics
  const totalUsers = mockUsers.length
  const activeUsers = mockUsers.filter(u => u.status === 'active').length
  const totalRoles = mockRoles.length
  const totalPermissions = mockPermissions.length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* RBAC Header */}
      <header className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8" />
                RBAC - Controle de Acesso
              </h1>
              <p className="text-red-100 mt-1">
                Role-Based Access Control • LGPD Compliant • Auditoria Completa
              </p>
            </div>
            <Button variant="secondary" className="bg-white text-red-600 hover:bg-red-50">
              <Plus className="w-4 h-4 mr-2" />
              Nova Função
            </Button>
          </div>
        </div>
      </header>

      {/* RBAC Statistics */}
      <div className="max-w-7xl mx-auto p-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <RBACStatCard
            title="Total de Usuários"
            value={totalUsers}
            icon={Users}
            trend="+2 este mês"
            color="bg-blue-600"
          />
          <RBACStatCard
            title="Usuários Ativos"
            value={activeUsers}
            icon={UserCheck}
            color="bg-green-600"
          />
          <RBACStatCard
            title="Funções Ativas"
            value={totalRoles}
            icon={Key}
            color="bg-purple-600"
          />
          <RBACStatCard
            title="Permissões"
            value={totalPermissions}
            icon={Lock}
            color="bg-amber-600"
          />
        </div>

        {/* RBAC Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="roles">Funções</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
            <TabsTrigger value="logs">Logs de Acesso</TabsTrigger>
          </TabsList>
          
          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              {/* Search and Controls */}
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Usuário
                </Button>
              </div>
              
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Último Login</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>
                                  {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <RoleLevelBadge level={user.role.toLowerCase()} />
                          </TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>
                            <UserStatusBadge status={user.status} />
                          </TableCell>
                          <TableCell>
                            {new Date(user.lastLogin).toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Roles Tab */}
          <TabsContent value="roles" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockRoles.map(role => (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <RoleLevelBadge level={role.level} />
                    </div>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Usuários:</span>
                        <span className="font-medium">{role.userCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Permissões:</span>
                        <span className="font-medium">{role.permissions.length}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Permissions Tab */}
          <TabsContent value="permissions" className="mt-6">
            <PermissionMatrix roles={mockRoles} permissions={mockPermissions} />
          </TabsContent>
          
          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <AccessLogsCard logs={mockAccessLogs} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Security Footer */}
      <footer className="bg-white border-t p-6 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-red-600 border-red-600">
              LGPD Compliant
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              ISO 27001
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Auditoria Ativa
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Sistema de controle de acesso com auditoria completa
          </p>
        </div>
      </footer>
    </div>
  )
}