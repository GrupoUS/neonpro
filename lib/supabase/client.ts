// Configuração para usar a conexão direta do Supabase via Augment
// Projeto GPUS: gfkskrkbnawkuppazkpt

export function createClient() {
  // Simulação de cliente Supabase para desenvolvimento
  // A conexão real será feita através do Augment
  return {
    auth: {
      getUser: async () => {
        // Simular usuário autenticado para desenvolvimento
        return {
          data: {
            user: {
              id: "demo-user-id",
              email: "demo@neonpro.com",
              user_metadata: {
                name: "Usuário Demo",
              },
            },
          },
          error: null,
        };
      },
      signInWithPassword: async (credentials: any) => {
        // Simular login bem-sucedido
        return {
          data: {
            user: {
              id: "demo-user-id",
              email: credentials.email,
              user_metadata: {
                name: "Usuário Demo",
              },
            },
            session: {
              access_token: "demo-token",
              refresh_token: "demo-refresh",
            },
          },
          error: null,
        };
      },
      signUp: async (credentials: any) => {
        // Simular registro bem-sucedido
        return {
          data: {
            user: {
              id: "demo-user-id",
              email: credentials.email,
              user_metadata: {
                name: credentials.name || "Novo Usuário",
              },
            },
          },
          error: null,
        };
      },
      signOut: async () => {
        return { error: null };
      },
      onAuthStateChange: (callback: any) => {
        // Simular mudança de estado de autenticação
        return {
          data: { subscription: null },
          unsubscribe: () => {},
        };
      },
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          limit: (count: number) => Promise.resolve({ data: [], error: null }),
        }),
        order: (column: string, options?: any) =>
          Promise.resolve({ data: [], error: null }),
        range: (from: number, to: number) =>
          Promise.resolve({ data: [], error: null }),
      }),
      insert: (data: any) => Promise.resolve({ data: null, error: null }),
      update: (data: any) => ({
        eq: (column: string, value: any) =>
          Promise.resolve({ data: null, error: null }),
      }),
      delete: () => ({
        eq: (column: string, value: any) =>
          Promise.resolve({ data: null, error: null }),
      }),
    }),
  };
}
