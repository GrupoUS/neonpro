// Placeholder for @supabase/auth-helpers-react
export const useUser = () => ({
  id: "mock-user-id",
  email: "mock@example.com",
});

export const useSession = () => ({
  user: {
    id: "mock-user-id",
    email: "mock@example.com",
  },
  access_token: "mock-token",
});

export const useSupabaseClient = () => ({
  auth: {
    signIn: () => Promise.resolve({ error: undefined }),
    signOut: () => Promise.resolve({ error: undefined }),
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: undefined }),
    insert: () => Promise.resolve({ data: undefined, error: undefined }),
    update: () => Promise.resolve({ data: undefined, error: undefined }),
    delete: () => Promise.resolve({ data: undefined, error: undefined }),
  }),
});
