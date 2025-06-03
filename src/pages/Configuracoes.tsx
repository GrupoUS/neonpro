
import React from 'react';
import { Settings, User, Bell, Shield, Palette } from 'lucide-react';

const Configuracoes: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neon-brand">Configurações</h1>
        <p className="text-neon-subtitle mt-1">
          Gerencie as configurações da sua clínica
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-neon-interactive">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <User className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Perfil</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Gerencie informações do seu perfil e preferências pessoais.
          </p>
          <button className="btn-neon-primary">
            Editar Perfil
          </button>
        </div>

        <div className="card-neon-interactive">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Bell className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Notificações</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Configure como e quando você deseja receber notificações.
          </p>
          <button className="btn-neon-secondary">
            Configurar
          </button>
        </div>

        <div className="card-neon-interactive">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Segurança</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Gerencie senhas, autenticação e configurações de segurança.
          </p>
          <button className="btn-neon-outline">
            Gerenciar
          </button>
        </div>

        <div className="card-neon-interactive">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Palette className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Aparência</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Personalize a aparência e tema da aplicação.
          </p>
          <button className="btn-neon-gradient">
            Personalizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
