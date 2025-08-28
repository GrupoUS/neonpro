import { toast } from "@/components/ui/use-toast";

// Toast helper functions for consistent messaging
export const toastHelpers = {
  // Success messages
  success: {
    login: () =>
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao NeonPro!",
      }),
    logout: () =>
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      }),
    saved: (item?: string) =>
      toast({
        title: "Salvo com sucesso",
        description: item
          ? `${item} foi salvo com sucesso.`
          : "As alterações foram salvas.",
      }),
    deleted: (item?: string) =>
      toast({
        title: "Excluído com sucesso",
        description: item
          ? `${item} foi excluído com sucesso.`
          : "Item excluído com sucesso.",
      }),
    created: (item?: string) =>
      toast({
        title: "Criado com sucesso",
        description: item
          ? `${item} foi criado com sucesso.`
          : "Item criado com sucesso.",
      }),
    signup: () =>
      toast({
        title: "Conta criada com sucesso!",
        description:
          "Verifique seu email para confirmar sua conta e começar a usar o NeonPro Healthcare.",
      }),
  },

  // Error messages
  error: {
    generic: () =>
      toast({
        title: "Erro inesperado",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive",
      }),
    network: () =>
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão com a internet e tente novamente.",
        variant: "destructive",
      }),
    unauthorized: () =>
      toast({
        title: "Não autorizado",
        description: "Você não tem permissão para realizar esta ação.",
        variant: "destructive",
      }),
    validation: (message?: string) =>
      toast({
        title: "Dados inválidos",
        description: message || "Verifique os dados informados e tente novamente.",
        variant: "destructive",
      }),
    notFound: (item?: string) =>
      toast({
        title: "Não encontrado",
        description: item
          ? `${item} não foi encontrado.`
          : "Item não encontrado.",
        variant: "destructive",
      }),
  },

  // Loading messages
  loading: {
    save: () =>
      toast({
        title: "Salvando...",
        description: "Aguarde enquanto salvamos as alterações.",
      }),
    delete: () =>
      toast({
        title: "Excluindo...",
        description: "Aguarde enquanto excluímos o item.",
      }),
    create: () =>
      toast({
        title: "Criando...",
        description: "Aguarde enquanto criamos o item.",
      }),
    fetch: () =>
      toast({
        title: "Carregando...",
        description: "Buscando dados mais recentes.",
      }),
  },

  // Warning messages
  warning: {
    unsavedChanges: () =>
      toast({
        title: "Alterações não salvas",
        description: "Você tem alterações não salvas. Deseja continuar?",
        variant: "destructive",
      }),
    offline: () =>
      toast({
        title: "Modo offline",
        description: "Você está offline. Algumas funcionalidades podem não funcionar.",
        variant: "destructive",
      }),
  },
};
