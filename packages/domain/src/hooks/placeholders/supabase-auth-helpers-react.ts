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
		signIn: () => Promise.resolve({ error: null }),
		signOut: () => Promise.resolve({ error: null }),
	},
	from: () => ({
		select: () => Promise.resolve({ data: [], error: null }),
		insert: () => Promise.resolve({ data: null, error: null }),
		update: () => Promise.resolve({ data: null, error: null }),
		delete: () => Promise.resolve({ data: null, error: null }),
	}),
});
