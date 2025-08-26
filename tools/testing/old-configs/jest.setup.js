const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            then: jest.fn().mockResolvedValue({ data: [], error: undefined }),
          }),
        }),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        then: jest.fn().mockResolvedValue({
          data: [{ id: '1', name: 'Test Form' }],
          error: undefined,
        }),
      }),
    }),
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          then: jest.fn().mockResolvedValue({
            data: [{ id: '1', status: 'revoked' }],
            error: undefined,
          }),
        }),
      }),
    }),
  }),
};

// Mock do cliente Supabase
jest.mock('@/app/utils/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock global para métodos Promise
global.mockSupabaseClient = mockSupabaseClient;
