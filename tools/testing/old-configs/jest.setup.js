const mockSupabaseClient = {
	from: jest.fn().mockReturnValue({
		select: jest.fn().mockReturnValue({
			eq: jest.fn().mockReturnValue({
				eq: jest.fn().mockReturnValue({
					order: jest.fn().mockReturnValue({
						then: jest.fn().mockResolvedValue({ data: [], error: null }),
					}),
				}),
			}),
		}),
		insert: jest.fn().mockReturnValue({
			select: jest.fn().mockReturnValue({
				then: jest.fn().mockResolvedValue({
					data: [{ id: "1", name: "Test Form" }],
					error: null,
				}),
			}),
		}),
		update: jest.fn().mockReturnValue({
			eq: jest.fn().mockReturnValue({
				select: jest.fn().mockReturnValue({
					then: jest.fn().mockResolvedValue({
						data: [{ id: "1", status: "revoked" }],
						error: null,
					}),
				}),
			}),
		}),
	}),
};

// Mock do cliente Supabase
jest.mock("@/app/utils/supabase/client", () => ({
	createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock global para métodos Promise
global.mockSupabaseClient = mockSupabaseClient;
