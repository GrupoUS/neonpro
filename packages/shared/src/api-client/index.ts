// Minimal API client stub to satisfy tests; wire real client later
export const apiClient = {
  api: {
    v1: {
      patients: {
        $get: async (_opts: any) => ({ json: async () => ({ success: true, data: [] }) }),
        ':id': {
          $get: async (_opts: any) => ({ json: async () => ({ success: true, data: {} }) }),
          appointments: {
            $get: async (_opts: any) => ({ json: async () => ({ success: true, data: [] }) }),
          },
          'medical-records': {
            $get: async (_opts: any) => ({ json: async () => ({ success: true, data: [] }) }),
          },
        },
      },
      appointments: {
        $get: async (_opts: any) => ({ json: async () => ({ success: true, data: [] }) }),
        ':id': {
          $get: async (_opts: any) => ({ json: async () => ({ success: true, data: {} }) }),
        },
      },
    },
  },
};
