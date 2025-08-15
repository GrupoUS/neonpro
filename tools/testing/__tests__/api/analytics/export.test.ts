import { createMocks } from 'node-mocks-http';
import { mockExportData, mockSession } from '@/../../__tests__/utils/mockData';
import handler from '@/app/api/analytics/export/route';

// Mock Supabase auth
jest.mock('@/utils/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      }),
    },
  }),
}));

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    save: jest.fn(),
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    addImage: jest.fn(),
    output: jest.fn().mockReturnValue('mock-pdf-content'),
  }));
});

// Mock ExcelJS
jest.mock('exceljs', () => ({
  Workbook: jest.fn().mockImplementation(() => ({
    addWorksheet: jest.fn().mockReturnValue({
      addRow: jest.fn(),
      getColumn: jest.fn().mockReturnValue({
        width: 0,
      }),
      mergeCells: jest.fn(),
      getCell: jest.fn().mockReturnValue({
        font: {},
        alignment: {},
        fill: {},
      }),
    }),
    xlsx: {
      writeBuffer: jest
        .fn()
        .mockResolvedValue(Buffer.from('mock-excel-content')),
    },
  })),
}));

describe('/api/analytics/export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export data to PDF format', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        format: 'pdf',
        data: mockExportData,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()['content-type']).toBe('application/pdf');
    expect(res._getHeaders()['content-disposition']).toContain('attachment');
    expect(res._getData()).toBeTruthy();
  });

  it('should export data to Excel format', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        format: 'excel',
        data: mockExportData,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()['content-type']).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(res._getHeaders()['content-disposition']).toContain('attachment');
  });

  it('should export data to CSV format', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        format: 'csv',
        data: mockExportData,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()['content-type']).toBe('text/csv');
    expect(res._getHeaders()['content-disposition']).toContain('attachment');
    expect(res._getData()).toContain('Total Patients,Total Revenue');
  });

  it('should return 400 for invalid format', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        format: 'invalid',
        data: mockExportData,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain('Invalid export format');
  });

  it('should return 401 for unauthenticated requests', async () => {
    // Mock unauthenticated session
    const mockSupabase = require('@/utils/supabase/server').createClient();
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        format: 'pdf',
        data: mockExportData,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 405 for non-POST methods', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });

  it('should handle missing data gracefully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        format: 'pdf',
        // Missing data
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain('Missing required data');
  });

  it('should handle rate limiting', async () => {
    // Make multiple rapid requests
    const requests = Array.from({ length: 10 }, () =>
      createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.1',
        },
        body: {
          format: 'pdf',
          data: mockExportData,
        },
      })
    );

    const responses = await Promise.all(
      requests.map(({ req, res }) => handler(req, res))
    );

    // Should have some rate limited responses
    const rateLimitedResponses = responses.filter(
      (_, index) => requests[index].res._getStatusCode() === 429
    );

    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
