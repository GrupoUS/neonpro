import { ResolutionEngine } from '../resolution-engine';
import { 
  ConflictType, 
  ConflictSeverity, 
  ResolutionStrategy, 
  ResolutionOption,
  ResolutionEngineConfig,
  Conflict
} from '../types';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js');
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            neq: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null }))
  })),
  rpc: jest.fn(() => Promise.resolve({ data: null, error: null }))
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

describe('ResolutionEngine', () => {
  let engine: ResolutionEngine;
  let mockConfig: ResolutionEngineConfig;
  let mockConflict: Conflict;

  beforeEach(() => {
    mockConfig = {
      enabledStrategies: [
        ResolutionStrategy.RESCHEDULE_LATER,
        ResolutionStrategy.RESCHEDULE_EARLIER,
        ResolutionStrategy.CHANGE_STAFF,
        ResolutionStrategy.CHANGE_ROOM
      ],
      maxResolutionOptions: 5,
      autoApplyThreshold: 0.9,
      requireApproval: true,
      notificationEnabled: true,
      rollbackEnabled: true,
      maxRollbackDays: 7
    };

    mockConflict = {
      id: 'conflict-1',
      type: ConflictType.TIME_OVERLAP,
      severity: ConflictSeverity.HIGH,
      appointmentId: 'appointment-1',
      conflictingAppointmentId: 'appointment-2',
      description: 'Time overlap conflict',
      detectedAt: new Date(),
      metadata: {
        overlapDuration: 30,
        overlapPercentage: 0.5
      }
    };

    engine = new ResolutionEngine(mockConfig);
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const defaultEngine = new ResolutionEngine();
      expect(defaultEngine).toBeInstanceOf(ResolutionEngine);
    });

    it('should initialize with custom config', () => {
      expect(engine).toBeInstanceOf(ResolutionEngine);
    });

    it('should validate config on initialization', () => {
      const invalidConfig = {
        ...mockConfig,
        maxResolutionOptions: -1
      };

      expect(() => new ResolutionEngine(invalidConfig)).toThrow();
    });
  });

  describe('generateResolutions', () => {
    it('should generate resolution options for time overlap conflict', async () => {
      const mockAppointment = {
        id: 'appointment-1',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        staff_id: 'staff-1',
        room_id: 'room-1',
        client_id: 'client-1',
        service_id: 'service-1',
        status: 'scheduled'
      };

      // Mock available slots
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                neq: jest.fn(() => Promise.resolve({ 
                  data: [], 
                  error: null 
                }))
              }))
            }))
          }))
        }))
      });

      const resolutions = await engine.generateResolutions(mockConflict, mockAppointment);
      
      expect(resolutions).toBeDefined();
      expect(Array.isArray(resolutions)).toBe(true);
      expect(resolutions.length).toBeGreaterThan(0);
      expect(resolutions.length).toBeLessThanOrEqual(mockConfig.maxResolutionOptions);
    });

    it('should generate different strategies for different conflict types', async () => {
      const staffConflict = {
        ...mockConflict,
        type: ConflictType.STAFF_CONFLICT
      };

      const roomConflict = {
        ...mockConflict,
        type: ConflictType.ROOM_CONFLICT
      };

      const mockAppointment = {
        id: 'appointment-1',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        staff_id: 'staff-1',
        room_id: 'room-1',
        client_id: 'client-1',
        service_id: 'service-1',
        status: 'scheduled'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                neq: jest.fn(() => Promise.resolve({ 
                  data: [], 
                  error: null 
                }))
              }))
            }))
          }))
        }))
      });

      const staffResolutions = await engine.generateResolutions(staffConflict, mockAppointment);
      const roomResolutions = await engine.generateResolutions(roomConflict, mockAppointment);
      
      expect(staffResolutions).toBeDefined();
      expect(roomResolutions).toBeDefined();
      
      // Should have different strategies
      const staffStrategies = staffResolutions.map(r => r.strategy);
      const roomStrategies = roomResolutions.map(r => r.strategy);
      
      expect(staffStrategies).toContain(ResolutionStrategy.CHANGE_STAFF);
      expect(roomStrategies).toContain(ResolutionStrategy.CHANGE_ROOM);
    });

    it('should rank resolutions by score', async () => {
      const mockAppointment = {
        id: 'appointment-1',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        staff_id: 'staff-1',
        room_id: 'room-1',
        client_id: 'client-1',
        service_id: 'service-1',
        status: 'scheduled'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                neq: jest.fn(() => Promise.resolve({ 
                  data: [], 
                  error: null 
                }))
              }))
            }))
          }))
        }))
      });

      const resolutions = await engine.generateResolutions(mockConflict, mockAppointment);
      
      // Check if resolutions are sorted by score (descending)
      for (let i = 0; i < resolutions.length - 1; i++) {
        expect(resolutions[i].score).toBeGreaterThanOrEqual(resolutions[i + 1].score);
      }
    });

    it('should handle equipment conflicts', async () => {
      const equipmentConflict = {
        ...mockConflict,
        type: ConflictType.EQUIPMENT_CONFLICT
      };

      const mockAppointment = {
        id: 'appointment-1',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        staff_id: 'staff-1',
        room_id: 'room-1',
        client_id: 'client-1',
        service_id: 'service-1',
        status: 'scheduled'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                neq: jest.fn(() => Promise.resolve({ 
                  data: [], 
                  error: null 
                }))
              }))
            }))
          }))
        }))
      });

      const resolutions = await engine.generateResolutions(equipmentConflict, mockAppointment);
      
      expect(resolutions).toBeDefined();
      expect(resolutions.length).toBeGreaterThan(0);
    });
  });

  describe('applyResolution', () => {
    let mockResolution: ResolutionOption;

    beforeEach(() => {
      mockResolution = {
        id: 'resolution-1',
        strategy: ResolutionStrategy.RESCHEDULE_LATER,
        description: 'Reschedule appointment to later time',
        score: 0.85,
        confidence: 0.9,
        estimatedCost: 10,
        feasibility: 0.95,
        changes: {
          appointmentId: 'appointment-1',
          newStartTime: '2024-01-15T14:00:00Z',
          newEndTime: '2024-01-15T15:00:00Z'
        },
        pros: ['Minimal disruption', 'Same day'],
        cons: ['Later in day'],
        affectedAppointments: ['appointment-1'],
        requiredApprovals: ['client-1'],
        estimatedDuration: 5
      };
    });

    it('should apply resolution successfully', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ 
            data: [{ id: 'appointment-1' }], 
            error: null 
          }))
        }))
      });

      const result = await engine.applyResolution(mockResolution);
      
      expect(result.success).toBe(true);
      expect(result.appliedChanges).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
    });

    it('should handle validation errors', async () => {
      const invalidResolution = {
        ...mockResolution,
        changes: {
          appointmentId: 'appointment-1',
          newStartTime: 'invalid-date',
          newEndTime: '2024-01-15T15:00:00Z'
        }
      };

      const result = await engine.applyResolution(invalidResolution);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ 
            data: null, 
            error: { message: 'Database error' } 
          }))
        }))
      });

      const result = await engine.applyResolution(mockResolution);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });

    it('should create rollback point when enabled', async () => {
      const configWithRollback = {
        ...mockConfig,
        rollbackEnabled: true
      };
      
      const engineWithRollback = new ResolutionEngine(configWithRollback);
      
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ 
            data: [{ id: 'appointment-1' }], 
            error: null 
          }))
        })),
        insert: jest.fn(() => Promise.resolve({ 
          data: [{ id: 'rollback-1' }], 
          error: null 
        }))
      });

      const result = await engineWithRollback.applyResolution(mockResolution);
      
      expect(result.success).toBe(true);
      expect(result.rollbackId).toBeDefined();
    });

    it('should handle staff changes', async () => {
      const staffChangeResolution = {
        ...mockResolution,
        strategy: ResolutionStrategy.CHANGE_STAFF,
        changes: {
          appointmentId: 'appointment-1',
          newStaffId: 'staff-2'
        }
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ 
            data: [{ id: 'appointment-1' }], 
            error: null 
          }))
        }))
      });

      const result = await engine.applyResolution(staffChangeResolution);
      
      expect(result.success).toBe(true);
    });

    it('should handle room changes', async () => {
      const roomChangeResolution = {
        ...mockResolution,
        strategy: ResolutionStrategy.CHANGE_ROOM,
        changes: {
          appointmentId: 'appointment-1',
          newRoomId: 'room-2'
        }
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ 
            data: [{ id: 'appointment-1' }], 
            error: null 
          }))
        }))
      });

      const result = await engine.applyResolution(roomChangeResolution);
      
      expect(result.success).toBe(true);
    });
  });

  describe('rollbackResolution', () => {
    it('should rollback resolution successfully', async () => {
      const rollbackId = 'rollback-1';
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ 
            data: [{
              id: rollbackId,
              original_data: {
                appointment_id: 'appointment-1',
                start_time: '2024-01-15T10:00:00Z',
                end_time: '2024-01-15T11:00:00Z'
              }
            }], 
            error: null 
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ 
            data: [{ id: 'appointment-1' }], 
            error: null 
          }))
        }))
      });

      const result = await engine.rollbackResolution(rollbackId);
      
      expect(result.success).toBe(true);
    });

    it('should handle rollback not found', async () => {
      const rollbackId = 'nonexistent-rollback';
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ 
            data: [], 
            error: null 
          }))
        }))
      });

      const result = await engine.rollbackResolution(rollbackId);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle expired rollback', async () => {
      const rollbackId = 'expired-rollback';
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 10); // 10 days ago
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ 
            data: [{
              id: rollbackId,
              created_at: expiredDate.toISOString(),
              original_data: {}
            }], 
            error: null 
          }))
        }))
      });

      const result = await engine.rollbackResolution(rollbackId);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('expired');
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      const newConfig = {
        ...mockConfig,
        autoApplyThreshold: 0.95
      };

      engine.updateConfig(newConfig);
      // Configuration should be updated (no direct way to test, but method should not throw)
    });

    it('should validate new configuration', () => {
      const invalidConfig = {
        ...mockConfig,
        maxResolutionOptions: -5
      };

      expect(() => engine.updateConfig(invalidConfig)).toThrow();
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle multiple resolutions efficiently', async () => {
      const conflicts = Array.from({ length: 10 }, (_, i) => ({
        ...mockConflict,
        id: `conflict-${i}`,
        appointmentId: `appointment-${i}`
      }));

      const mockAppointment = {
        id: 'appointment-1',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        staff_id: 'staff-1',
        room_id: 'room-1',
        client_id: 'client-1',
        service_id: 'service-1',
        status: 'scheduled'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                neq: jest.fn(() => Promise.resolve({ 
                  data: [], 
                  error: null 
                }))
              }))
            }))
          }))
        }))
      });

      const startTime = Date.now();
      
      const resolutionPromises = conflicts.map(conflict => 
        engine.generateResolutions(conflict, mockAppointment)
      );
      
      const results = await Promise.all(resolutionPromises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(results).toHaveLength(10);
      results.forEach(resolutions => {
        expect(Array.isArray(resolutions)).toBe(true);
      });
    });

    it('should cache resolution strategies', async () => {
      const mockAppointment = {
        id: 'appointment-1',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        staff_id: 'staff-1',
        room_id: 'room-1',
        client_id: 'client-1',
        service_id: 'service-1',
        status: 'scheduled'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                neq: jest.fn(() => Promise.resolve({ 
                  data: [], 
                  error: null 
                }))
              }))
            }))
          }))
        }))
      });

      // First call
      await engine.generateResolutions(mockConflict, mockAppointment);
      
      // Second call with same parameters should be faster (cached)
      const startTime = Date.now();
      await engine.generateResolutions(mockConflict, mockAppointment);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast due to caching
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid conflict data', async () => {
      const invalidConflict = {
        ...mockConflict,
        type: 'INVALID_TYPE' as ConflictType
      };

      const mockAppointment = {
        id: 'appointment-1',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        staff_id: 'staff-1',
        room_id: 'room-1',
        client_id: 'client-1',
        service_id: 'service-1',
        status: 'scheduled'
      };

      await expect(engine.generateResolutions(invalidConflict, mockAppointment))
        .rejects.toThrow();
    });

    it('should handle network failures gracefully', async () => {
      const mockAppointment = {
        id: 'appointment-1',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        staff_id: 'staff-1',
        room_id: 'room-1',
        client_id: 'client-1',
        service_id: 'service-1',
        status: 'scheduled'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                neq: jest.fn(() => Promise.reject(new Error('Network error')))
              }))
            }))
          }))
        }))
      });

      await expect(engine.generateResolutions(mockConflict, mockAppointment))
        .rejects.toThrow('Network error');
    });
  });
});
