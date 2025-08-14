import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MedicalRecordsManager } from '../medical-records';
import type { 
  MedicalRecord, 
  MedicalHistory, 
  MedicalAttachment,
  CreateMedicalRecordData,
  UpdateMedicalRecordData,
  CreateMedicalHistoryData,
  UpdateMedicalHistoryData
} from '../medical-records';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null
        }))
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null
      }))
    }))
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => ({
        data: { path: 'test-path' },
        error: null
      })),
      download: vi.fn(() => ({
        data: new Blob(['test']),
        error: null
      })),
      remove: vi.fn(() => ({
        data: null,
        error: null
      }))
    }))
  }
};

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

vi.mock('@/lib/audit/audit-logger', () => ({
  AuditLogger: {
    log: vi.fn()
  }
}));

vi.mock('@/lib/lgpd/lgpd-manager', () => ({
  LGPDManager: {
    logDataProcessing: vi.fn(),
    checkDataRetention: vi.fn()
  }
}));

describe('MedicalRecordsManager', () => {
  let manager: MedicalRecordsManager;
  const mockPatientId = 'patient-123';
  const mockClinicId = 'clinic-456';
  const mockUserId = 'user-789';

  beforeEach(() => {
    manager = new MedicalRecordsManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Medical Records', () => {
    const mockMedicalRecord: MedicalRecord = {
      id: 'record-1',
      patientId: mockPatientId,
      clinicId: mockClinicId,
      type: 'consultation',
      title: 'Consulta de Rotina',
      content: 'Paciente apresenta bom estado geral',
      status: 'active',
      priority: 'normal',
      tags: ['rotina', 'checkup'],
      attachments: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: mockUserId,
      version: 1,
      isDeleted: false
    };

    describe('createMedicalRecord', () => {
      it('should create a medical record successfully', async () => {
        const createData: CreateMedicalRecordData = {
          patientId: mockPatientId,
          clinicId: mockClinicId,
          type: 'consultation',
          title: 'Nova Consulta',
          content: 'Conteúdo da consulta',
          priority: 'normal',
          tags: ['consulta'],
          metadata: {}
        };

        mockSupabase.from().insert().select().single.mockResolvedValueOnce({
          data: mockMedicalRecord,
          error: null
        });

        const result = await manager.createMedicalRecord(createData, mockUserId);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockMedicalRecord);
        expect(mockSupabase.from).toHaveBeenCalledWith('medical_records');
      });

      it('should handle creation errors', async () => {
        const createData: CreateMedicalRecordData = {
          patientId: mockPatientId,
          clinicId: mockClinicId,
          type: 'consultation',
          title: 'Nova Consulta',
          content: 'Conteúdo da consulta',
          priority: 'normal',
          tags: [],
          metadata: {}
        };

        mockSupabase.from().insert().select().single.mockResolvedValueOnce({
          data: null,
          error: { message: 'Database error' }
        });

        const result = await manager.createMedicalRecord(createData, mockUserId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Database error');
      });

      it('should validate required fields', async () => {
        const invalidData = {
          patientId: '',
          clinicId: mockClinicId,
          type: 'consultation',
          title: '',
          content: 'Conteúdo',
          priority: 'normal',
          tags: [],
          metadata: {}
        } as CreateMedicalRecordData;

        const result = await manager.createMedicalRecord(invalidData, mockUserId);

        expect(result.success).toBe(false);
        expect(result.error).toContain('obrigatório');
      });
    });

    describe('getMedicalRecord', () => {
      it('should retrieve a medical record by id', async () => {
        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: [mockMedicalRecord],
          error: null
        });

        const result = await manager.getMedicalRecord('record-1');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockMedicalRecord);
      });

      it('should handle record not found', async () => {
        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: [],
          error: null
        });

        const result = await manager.getMedicalRecord('nonexistent');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Registro médico não encontrado');
      });
    });

    describe('updateMedicalRecord', () => {
      it('should update a medical record successfully', async () => {
        const updateData: UpdateMedicalRecordData = {
          title: 'Título Atualizado',
          content: 'Conteúdo atualizado',
          tags: ['atualizado']
        };

        const updatedRecord = { ...mockMedicalRecord, ...updateData, version: 2 };

        mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
          data: updatedRecord,
          error: null
        });

        const result = await manager.updateMedicalRecord('record-1', updateData, mockUserId);

        expect(result.success).toBe(true);
        expect(result.data?.title).toBe('Título Atualizado');
        expect(result.data?.version).toBe(2);
      });

      it('should handle update errors', async () => {
        const updateData: UpdateMedicalRecordData = {
          title: 'Título Atualizado'
        };

        mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
          data: null,
          error: { message: 'Update failed' }
        });

        const result = await manager.updateMedicalRecord('record-1', updateData, mockUserId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Update failed');
      });
    });

    describe('deleteMedicalRecord', () => {
      it('should soft delete a medical record', async () => {
        mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
          data: { ...mockMedicalRecord, isDeleted: true },
          error: null
        });

        const result = await manager.deleteMedicalRecord('record-1', mockUserId);

        expect(result.success).toBe(true);
        expect(mockSupabase.from().update).toHaveBeenCalledWith(
          expect.objectContaining({ isDeleted: true })
        );
      });
    });

    describe('getPatientMedicalRecords', () => {
      it('should retrieve all medical records for a patient', async () => {
        const mockRecords = [mockMedicalRecord];

        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: mockRecords,
          error: null
        });

        const result = await manager.getPatientMedicalRecords(mockPatientId);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockRecords);
        expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('patient_id', mockPatientId);
      });

      it('should filter by type when specified', async () => {
        const mockRecords = [mockMedicalRecord];

        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: mockRecords,
          error: null
        });

        const result = await manager.getPatientMedicalRecords(mockPatientId, {
          type: 'consultation'
        });

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockRecords);
      });
    });
  });

  describe('Medical History', () => {
    const mockMedicalHistory: MedicalHistory = {
      id: 'history-1',
      patientId: mockPatientId,
      clinicId: mockClinicId,
      category: 'allergy',
      subcategory: 'medication',
      title: 'Alergia a Penicilina',
      description: 'Paciente apresenta alergia severa à penicilina',
      severity: 'high',
      status: 'active',
      startDate: new Date('2020-01-01'),
      endDate: null,
      tags: ['alergia', 'medicamento'],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: mockUserId,
      isDeleted: false
    };

    describe('createMedicalHistory', () => {
      it('should create medical history successfully', async () => {
        const createData: CreateMedicalHistoryData = {
          patientId: mockPatientId,
          clinicId: mockClinicId,
          category: 'allergy',
          subcategory: 'medication',
          title: 'Nova Alergia',
          description: 'Descrição da alergia',
          severity: 'medium',
          status: 'active',
          startDate: new Date(),
          tags: ['alergia'],
          metadata: {}
        };

        mockSupabase.from().insert().select().single.mockResolvedValueOnce({
          data: mockMedicalHistory,
          error: null
        });

        const result = await manager.createMedicalHistory(createData, mockUserId);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockMedicalHistory);
        expect(mockSupabase.from).toHaveBeenCalledWith('medical_history');
      });

      it('should validate required fields for medical history', async () => {
        const invalidData = {
          patientId: '',
          clinicId: mockClinicId,
          category: 'allergy',
          title: '',
          description: 'Descrição',
          severity: 'medium',
          status: 'active',
          startDate: new Date(),
          tags: [],
          metadata: {}
        } as CreateMedicalHistoryData;

        const result = await manager.createMedicalHistory(invalidData, mockUserId);

        expect(result.success).toBe(false);
        expect(result.error).toContain('obrigatório');
      });
    });

    describe('getMedicalHistory', () => {
      it('should retrieve medical history by id', async () => {
        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: [mockMedicalHistory],
          error: null
        });

        const result = await manager.getMedicalHistory('history-1');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockMedicalHistory);
      });
    });

    describe('getPatientMedicalHistory', () => {
      it('should retrieve all medical history for a patient', async () => {
        const mockHistories = [mockMedicalHistory];

        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: mockHistories,
          error: null
        });

        const result = await manager.getPatientMedicalHistory(mockPatientId);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockHistories);
      });

      it('should filter by category when specified', async () => {
        const mockHistories = [mockMedicalHistory];

        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: mockHistories,
          error: null
        });

        const result = await manager.getPatientMedicalHistory(mockPatientId, {
          category: 'allergy'
        });

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockHistories);
      });
    });
  });

  describe('Attachments', () => {
    const mockAttachment: MedicalAttachment = {
      id: 'attachment-1',
      recordId: 'record-1',
      fileName: 'test-file.pdf',
      originalName: 'Test File.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
      filePath: 'medical/attachments/test-file.pdf',
      category: 'document',
      subcategory: 'report',
      description: 'Test document',
      tags: ['test'],
      metadata: {},
      uploadedAt: new Date(),
      uploadedBy: mockUserId,
      isDeleted: false
    };

    describe('uploadAttachment', () => {
      it('should upload attachment successfully', async () => {
        const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
        
        mockSupabase.storage.from().upload.mockResolvedValueOnce({
          data: { path: 'medical/attachments/test.pdf' },
          error: null
        });

        mockSupabase.from().insert().select().single.mockResolvedValueOnce({
          data: mockAttachment,
          error: null
        });

        const result = await manager.uploadAttachment(
          'record-1',
          mockFile,
          {
            category: 'document',
            subcategory: 'report',
            description: 'Test document',
            tags: ['test']
          },
          mockUserId
        );

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockAttachment);
        expect(mockSupabase.storage.from).toHaveBeenCalledWith('medical-attachments');
      });

      it('should handle upload errors', async () => {
        const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
        
        mockSupabase.storage.from().upload.mockResolvedValueOnce({
          data: null,
          error: { message: 'Upload failed' }
        });

        const result = await manager.uploadAttachment(
          'record-1',
          mockFile,
          {
            category: 'document',
            description: 'Test document'
          },
          mockUserId
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe('Upload failed');
      });

      it('should validate file size', async () => {
        const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
        
        const result = await manager.uploadAttachment(
          'record-1',
          largeFile,
          {
            category: 'document',
            description: 'Large document'
          },
          mockUserId
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('muito grande');
      });

      it('should validate file type', async () => {
        const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-executable' });
        
        const result = await manager.uploadAttachment(
          'record-1',
          invalidFile,
          {
            category: 'document',
            description: 'Invalid file'
          },
          mockUserId
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('não permitido');
      });
    });

    describe('getAttachment', () => {
      it('should retrieve attachment by id', async () => {
        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: [mockAttachment],
          error: null
        });

        const result = await manager.getAttachment('attachment-1');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockAttachment);
      });
    });

    describe('downloadAttachment', () => {
      it('should download attachment successfully', async () => {
        const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
        
        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: [mockAttachment],
          error: null
        });

        mockSupabase.storage.from().download.mockResolvedValueOnce({
          data: mockBlob,
          error: null
        });

        const result = await manager.downloadAttachment('attachment-1');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockBlob);
      });

      it('should handle download errors', async () => {
        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: [mockAttachment],
          error: null
        });

        mockSupabase.storage.from().download.mockResolvedValueOnce({
          data: null,
          error: { message: 'Download failed' }
        });

        const result = await manager.downloadAttachment('attachment-1');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Download failed');
      });
    });

    describe('deleteAttachment', () => {
      it('should delete attachment successfully', async () => {
        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: [mockAttachment],
          error: null
        });

        mockSupabase.storage.from().remove.mockResolvedValueOnce({
          data: null,
          error: null
        });

        mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
          data: { ...mockAttachment, isDeleted: true },
          error: null
        });

        const result = await manager.deleteAttachment('attachment-1', mockUserId);

        expect(result.success).toBe(true);
        expect(mockSupabase.storage.from().remove).toHaveBeenCalled();
      });
    });
  });

  describe('Search and Analytics', () => {
    describe('searchMedicalRecords', () => {
      it('should search medical records by query', async () => {
        const mockRecords = [{
          id: 'record-1',
          patientId: mockPatientId,
          title: 'Consulta de Rotina',
          content: 'Paciente apresenta bom estado geral',
          type: 'consultation',
          status: 'active',
          createdAt: new Date(),
          rank: 0.5
        }];

        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: mockRecords,
          error: null
        });

        const result = await manager.searchMedicalRecords({
          query: 'consulta',
          patientId: mockPatientId
        });

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockRecords);
      });

      it('should handle search with filters', async () => {
        const mockRecords = [];

        mockSupabase.from().select().eq().order.mockResolvedValueOnce({
          data: mockRecords,
          error: null
        });

        const result = await manager.searchMedicalRecords({
          query: 'test',
          patientId: mockPatientId,
          type: 'consultation',
          status: 'active',
          dateFrom: new Date('2024-01-01'),
          dateTo: new Date('2024-12-31'),
          limit: 10
        });

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockRecords);
      });
    });

    describe('getPatientSummary', () => {
      it('should generate patient summary', async () => {
        const mockSummary = {
          totalRecords: 5,
          totalHistory: 3,
          totalAttachments: 2,
          recentRecords: [],
          activeConditions: [],
          allergies: [],
          medications: [],
          lastUpdated: new Date()
        };

        // Mock multiple database calls
        mockSupabase.from().select().eq().order
          .mockResolvedValueOnce({ data: [], error: null }) // records
          .mockResolvedValueOnce({ data: [], error: null }) // history
          .mockResolvedValueOnce({ data: [], error: null }) // attachments
          .mockResolvedValueOnce({ data: [], error: null }) // recent records
          .mockResolvedValueOnce({ data: [], error: null }) // active conditions
          .mockResolvedValueOnce({ data: [], error: null }) // allergies
          .mockResolvedValueOnce({ data: [], error: null }); // medications

        const result = await manager.getPatientSummary(mockPatientId);

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('totalRecords');
        expect(result.data).toHaveProperty('totalHistory');
        expect(result.data).toHaveProperty('totalAttachments');
      });
    });
  });

  describe('Utility Methods', () => {
    describe('generateThumbnail', () => {
      it('should generate thumbnail for image files', async () => {
        const mockImageFile = new File(['fake image data'], 'test.jpg', { type: 'image/jpeg' });
        
        // Mock canvas and context
        const mockCanvas = {
          getContext: vi.fn(() => ({
            drawImage: vi.fn(),
            canvas: {
              toBlob: vi.fn((callback) => callback(new Blob(['thumbnail'], { type: 'image/jpeg' })))
            }
          })),
          width: 0,
          height: 0
        };
        
        global.HTMLCanvasElement = vi.fn(() => mockCanvas) as any;
        global.Image = vi.fn(() => ({
          onload: null,
          onerror: null,
          src: ''
        })) as any;

        const result = await manager.generateThumbnail(mockImageFile);

        expect(result).toBeInstanceOf(Blob);
      });

      it('should return null for non-image files', async () => {
        const mockPdfFile = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
        
        const result = await manager.generateThumbnail(mockPdfFile);

        expect(result).toBeNull();
      });
    });

    describe('validateFileType', () => {
      it('should validate allowed file types', () => {
        expect(manager.validateFileType('image/jpeg')).toBe(true);
        expect(manager.validateFileType('application/pdf')).toBe(true);
        expect(manager.validateFileType('text/plain')).toBe(true);
        expect(manager.validateFileType('application/x-executable')).toBe(false);
        expect(manager.validateFileType('application/javascript')).toBe(false);
      });
    });

    describe('formatFileSize', () => {
      it('should format file sizes correctly', () => {
        expect(manager.formatFileSize(1024)).toBe('1.0 KB');
        expect(manager.formatFileSize(1048576)).toBe('1.0 MB');
        expect(manager.formatFileSize(1073741824)).toBe('1.0 GB');
        expect(manager.formatFileSize(500)).toBe('500 B');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabase.from().select().eq().order.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await manager.getMedicalRecord('record-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection failed');
    });

    it('should handle invalid input data', async () => {
      const invalidData = null as any;

      const result = await manager.createMedicalRecord(invalidData, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Dados inválidos');
    });

    it('should handle missing user ID', async () => {
      const createData: CreateMedicalRecordData = {
        patientId: mockPatientId,
        clinicId: mockClinicId,
        type: 'consultation',
        title: 'Test',
        content: 'Content',
        priority: 'normal',
        tags: [],
        metadata: {}
      };

      const result = await manager.createMedicalRecord(createData, '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('obrigatório');
    });
  });

  describe('Integration Tests', () => {
    it('should create record with attachment workflow', async () => {
      // Create record
      const createData: CreateMedicalRecordData = {
        patientId: mockPatientId,
        clinicId: mockClinicId,
        type: 'consultation',
        title: 'Consulta com Anexo',
        content: 'Consulta que terá anexo',
        priority: 'normal',
        tags: [],
        metadata: {}
      };

      const mockRecord = {
        id: 'record-1',
        ...createData,
        status: 'active',
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUserId,
        version: 1,
        isDeleted: false
      };

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockRecord,
        error: null
      });

      const recordResult = await manager.createMedicalRecord(createData, mockUserId);
      expect(recordResult.success).toBe(true);

      // Upload attachment
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      mockSupabase.storage.from().upload.mockResolvedValueOnce({
        data: { path: 'medical/attachments/test.pdf' },
        error: null
      });

      const mockAttachment = {
        id: 'attachment-1',
        recordId: 'record-1',
        fileName: 'test.pdf',
        originalName: 'test.pdf',
        mimeType: 'application/pdf',
        fileSize: 4,
        filePath: 'medical/attachments/test.pdf',
        category: 'document',
        uploadedAt: new Date(),
        uploadedBy: mockUserId,
        isDeleted: false
      };

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockAttachment,
        error: null
      });

      const attachmentResult = await manager.uploadAttachment(
        'record-1',
        mockFile,
        { category: 'document' },
        mockUserId
      );

      expect(attachmentResult.success).toBe(true);
      expect(attachmentResult.data?.recordId).toBe('record-1');
    });

    it('should handle complete patient data retrieval', async () => {
      // Mock all patient data
      mockSupabase.from().select().eq().order
        .mockResolvedValueOnce({ data: [mockMedicalRecord], error: null }) // records
        .mockResolvedValueOnce({ data: [], error: null }); // history

      const recordsResult = await manager.getPatientMedicalRecords(mockPatientId);
      const historyResult = await manager.getPatientMedicalHistory(mockPatientId);

      expect(recordsResult.success).toBe(true);
      expect(historyResult.success).toBe(true);
      expect(recordsResult.data).toHaveLength(1);
      expect(historyResult.data).toHaveLength(0);
    });
  });
});