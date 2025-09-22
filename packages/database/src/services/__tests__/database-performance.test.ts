/**
 * Test suite for DatabasePerformanceService
 * Tests query optimization, caching, and performance monitoring functionality
 */

import { DatabasePerformanceService } from '../database-performance.service.js';
import { createSupabaseClient } from '../../client.js';

// Mock Supabase client for testing
const createMockSupabaseClient = () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  onConflict: jest.fn().mockReturnThis(),

describe('DatabasePerformanceService_, () => {
  let performanceService: DatabasePerformanceService;
  let mockSupabase: any;

  beforeEach(() => {
    performanceService = new DatabasePerformanceService(mockSupabase, {
      enableQueryCaching: true,
      cacheTTL: 60000, // 1 minute for tests
      slowQueryThreshold: 100,
      enablePerformanceLogging: true,
      maxCacheSize: 100,

  describe('optimizedQuery_, () => {
    it('should execute query and cache results for SELECT operations_,_async () => {
      const mockData = { id: '1', name: 'Test' };
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),

    it('should use cached results for subsequent calls_,_async () => {
      const mockData = { id: '1', name: 'Test' };
      
      // Populate cache directly

      const querySpy = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,

      const result = await performanceService.optimizedQuery(
        'test_table_,
        'select',
        querySpy,
        { cacheKey: 'test-query' }

    it('should not cache INSERT operations_,_async () => {
      const mockData = { id: '1' };
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),

    it('should log performance metrics_,_async () => {
      const mockData = { id: '1', name: 'Test' };
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      expect(metrics[0]).toMatchObject({
        table: 'test_table_,
        operation: 'select',
        success: true,

    it('should handle errors gracefully_,_async () => {
      const mockError = { message: 'Database error' };
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),

    it('should handle batch errors gracefully_,_async () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];

      mockSupabase.from.mockReturnValue({
        insert: jest.fn()
          .mockResolvedValueOnce({ error: null }) // First batch succeeds
          .mockResolvedValueOnce({ error: { message: 'Constraint violation' } }), // Second batch fails

  describe('optimizeExpirationCheck_, () => {
    it('should perform single-operation expiration check_,_async () => {
      const mockExpiredData = [
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ];

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: mockExpiredData,
          error: null,
        }),

      const result = await performanceService.optimizeExpirationCheck(
        'test_table_,
        'expires_at_,
        'status',
        'ACTIVE',

  describe('getPerformanceStats_, () => {
    it('should calculate performance statistics correctly_,_async () => {
      // Add some test metrics
      performanceService['metrics'] = [
        { _query: 'test1', duration: 50, timestamp: new Date().toISOString(), success: true, table: 'test', operation: 'select_ },
        { _query: 'test2', duration: 150, timestamp: new Date().toISOString(), success: true, table: 'test', operation: 'select_ },
        { _query: 'test3', duration: 200, timestamp: new Date().toISOString(), success: false, table: 'test', operation: 'select_ },
      ];


  describe('cache management_, () => {
    it('should clear cache entries_, () => {
      // Populate cache

    it('should clean up expired entries_, () => {
      // Add expired entry
      const expiredTimestamp = new Date(Date.now() - 120000).toISOString(); // 2 minutes ago
      performanceService['cache'].set('expired', {
        data: 'expired_value_,
        timestamp: expiredTimestamp,
        ttl: 60000,
        key: 'expired',

  describe('cache size management_, () => {
    it('should respect max cache size_, () => {
      const service = new DatabasePerformanceService(mockSupabase, {
        enableQueryCaching: true,
        cacheTTL: 60000,
        slowQueryThreshold: 100,
        enablePerformanceLogging: true,
        maxCacheSize: 2, // Very small cache for testing
