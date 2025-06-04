import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { UserProfile, CreateUserProfileData, UpdateUserProfileData, UserRole, getRoleLabel } from '@/types/user';

interface UserFormProps {
  user?: UserProfile | null;
  onSubmit: (data: CreateUserProfileData | UpdateUserProfileData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
  isCurrentUserAdmin: boolean;
}

export const UserForm = ({ user, onSubmit, onCancel, loading = false, isCurrentUserAdmin }: UserFormProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    role: 'secretaria' as UserRole,
    especialidade: '',
    crm: '',
    senha: '',
    confirmarSenha: '',
    ativo: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!user;
  const isAdminRequired = formData.role === 'admin';
  const isMedicoRole = formData.role === 'medico';

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        role: user.role || 'secretaria',
        especialidade: user.especialidade || '',
        crm: user.crm || '',
        senha: '',
        confirmarSenha: '',
        ativo: user.ativo ?? true
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações básicas
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação de senha (apenas para criação)
    if (!isEditMode) {
      if (!formData.senha) {
        newErrors.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < 6) {
        newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = 'Senhas não coincidem';
      }
    }

    // Validações específicas para médicos
    if (isMedicoRole) {
      if (!formData.especialidade.trim()) {
        newErrors.especialidade = 'Especialidade é obrigatória para médicos';
      }
      if (!formData.crm.trim()) {
        newErrors.crm = 'CRM é obrigatório para médicos';
      }
    }

    // Validação de permissão para criar admin
    if (isAdminRequired && !isCurrentUserAdmin && !isEditMode) {
      newErrors.role = 'Apenas administradores podem criar outros administradores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let submitData: CreateUserProfileData | UpdateUserProfileData;

      if (isEditMode) {
        // Para edição, não incluir senha
        submitData = {
          nome: formData.nome,
          telefone: formData.telefone || undefined,
          especialidade: isMedicoRole ? formData.especialidade || undefined : undefined,
          crm: isMedicoRole ? formData.crm || undefined : undefined,
          ativo: formData.ativo,
          ...(isCurrentUserAdmin && { role: formData.role })
        };
      } else {
        // Para criação, incluir todos os campos
        submitData = {
          nome: formData.nome,
          email: formData.email,
          role: formData.role,
          telefone: formData.telefone || undefined,
          especialidade: isMedicoRole ? formData.especialidade || undefined : undefined,
          crm: isMedicoRole ? formData.crm || undefined : undefined,
          senha: formData.senha
        };
      }

      const success = await onSubmit(submitData);
      
      if (success) {
        // Reset form apenas se não estiver em modo de edição
        if (!isEditMode) {
          setFormData({
            nome: '',
            email: '',
            telefone: '',
            role: 'secretaria',
            especialidade: '',
            crm: '',
            senha: '',
            confirmarSenha: '',
            ativo: true
          });
        }
        onCancel(); // Fechar modal
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      // Limpar campos específicos de médico se não for médico
      ...(newRole !== 'medico' && {
        especialidade: '',
        crm: ''
      })
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
        </CardTitle>
        <CardDescription>
          {isEditMode 
            ? 'Atualize as informações do usuário'
            : 'Preencha os dados para criar um novo usuário'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome completo"
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && (
                <p className="text-sm text-red-500">{errors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@exemplo.com"
                className={errors.email ? 'border-red-500' : ''}
                disabled={isEditMode} // Email não pode ser alterado
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função *</Label>
              <Select 
                value={formData.role} 
                onValueChange={handleRoleChange}
                disabled={!isCurrentUserAdmin && isEditMode}
              >
                <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secretaria">{getRoleLabel('secretaria')}</SelectItem>
                  <SelectItem value="medico">{getRoleLabel('medico')}</SelectItem>
                  {isCurrentUserAdmin && (
                    <SelectItem value="admin">{getRoleLabel('admin')}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role}</p>
              )}
            </div>
          </div>

          {/* Campos específicos para médicos */}
          {isMedicoRole && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">
                  Informações Médicas
                </h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade *</Label>
                <Input
                  id="especialidade"
                  value={formData.especialidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, especialidade: e.target.value }))}
                  placeholder="Ex: Cardiologia"
                  className={errors.especialidade ? 'border-red-500' : ''}
                />
                {errors.especialidade && (
                  <p className="text-sm text-red-500">{errors.especialidade}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="crm">CRM *</Label>
                <Input
                  id="crm"
                  value={formData.crm}
                  onChange={(e) => setFormData(prev => ({ ...prev, crm: e.target.value }))}
                  placeholder="Ex: 123456"
                  className={errors.crm ? 'border-red-500' : ''}
                />
                {errors.crm && (
                  <p className="text-sm text-red-500">{errors.crm}</p>
                )}
              </div>
            </div>
          )}

          {/* Senha (apenas para criação) */}
          {!isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className={errors.senha ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.senha && (
                  <p className="text-sm text-red-500">{errors.senha}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                <Input
                  id="confirmarSenha"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmarSenha}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                  placeholder="Confirme a senha"
                  className={errors.confirmarSenha ? 'border-red-500' : ''}
                />
                {errors.confirmarSenha && (
                  <p className="text-sm text-red-500">{errors.confirmarSenha}</p>
                )}
              </div>
            </div>
          )}

          {/* Status do usuário (apenas para edição e apenas admins) */}
          {isEditMode && isCurrentUserAdmin && (
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
              />
              <Label htmlFor="ativo">Usuário ativo</Label>
            </div>
          )}

          {/* Alertas */}
          {isAdminRequired && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Administradores têm acesso total ao sistema, incluindo gerenciamento de usuários.
              </AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Criar Usuário')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
