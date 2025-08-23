export type AppEnv = {
	Variables: {
		dbClient: string;
	};
	Bindings: {
		DATABASE_URL?: string;
		SUPABASE_URL?: string;
		SUPABASE_ANON_KEY?: string;
		SUPABASE_SERVICE_ROLE_KEY?: string;
	};
};
