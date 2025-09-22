import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { AIDataService } from '../../apps/api/src/services/ai-data-service';
import { PermissionContext, QueryIntent, QueryParameters } from '@neonpro/types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getOttomatorBridge } from '../../apps/api/src/services/ottomator-agent-bridge';

// Mock dependencies
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

vi.mock('../../../apps/api/src/services/ottomator-agent-bridge', () => ({
  getOttomatorBridge: vi.fn(),
}));

describe('AIDataService', () => {
  let aiDataService: AIDataService;
  let mockSupabase: SupabaseClient;
  let mockPermissionContext: PermissionContext;
  let mockGetOttomatorBridge: Mock;

  beforeEach(() => {
    // Reset all mocks

    // Create mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn(),
    } as any;


    // Mock Ottomator bridge
    mockGetOttomatorBridge = getOttomatorBridge as Mock;
    mockGetOttomatorBridge.mockReturnValue({
      processQuery: vi.fn(),
      isHealthy: vi.fn().mockReturnValue(true),

    // Create test permission context
    mockPermissionContext = {
      userId: 'test-user-id',
      role: 'healthcare_professional',
      permissions: ['read_clients', 'read_appointments', 'read_financial'],
      domain: 'test-clinic',
    };


  describe('Constructor', () => {
    it('should initialize Supabase client with correct configuration', () => {
      expect(createClient).toHaveBeenCalledWith(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            persistSession: false,
          },
        }

  describe('Permission Validation', () => {
    it('should allow access to client data with proper permissions', () => {
      const context = { ...mockPermissionContext, permissions: ['read_clients'] };

  describe('Audit Logging', () => {
    it('should log successful data access', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        action: 'ai_agent_client_data',
        entity_type: 'client_data',
        parameters: { clientNames: ['test'] },
        record_count: 5,
        success: true,
        domain: 'test-clinic',
        timestamp: expect.any(String),

  describe('Domain Filtering', () => {
    it('should apply domain filter to queries', () => {
      const mockQuery = { eq: vi.fn().mockReturnThis() };

  describe('getClientsByName', () => {
    const mockParameters: QueryParameters = {
      clientNames: ['John Doe', 'Jane Smith'],
    };

    it('should retrieve clients with domain filtering', async () => {
      const mockData = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      expect(mockSupabase.select).toHaveBeenCalledWith(`
        id,
        name,
        email,
        phone,
        address,
        birth_date,
        created_at,
        updated_at

    it('should handle case-insensitive name search', async () => {
      const mockData = [{ id: 1, name: 'john doe', email: 'john@example.com' }];
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),

    it('should return empty array when no data found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),

  describe('Performance Tests', () => {
    it('should handle large result sets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Client ${i + 1}`,
        email: `client${i + 1}@example.com`,

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),

    it('should handle concurrent requests', async () => {
      const mockData = [{ id: 1, name: 'Test Client', email: 'test@example.com' }];
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),

      // Run multiple requests concurrently
      const promises = Array.from({ length: 10 }, () => 
        aiDataService.getClientsByName({ clientNames: ['Test'] })

  describe('Edge Cases', () => {
    it('should handle empty client names parameter', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),

    it('should handle special characters in client names', async () => {
      const mockData = [{ id: 1, name: "O'Connor", email: 'oconnor@example.com' }];
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
