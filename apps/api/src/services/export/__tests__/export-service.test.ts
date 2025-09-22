import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExportService } from '../export-service';
import { ExportLGPDCompliance } from '../lgpd-compliance';
import { ExportFilter, ExportPagination, LGPDComplianceOptions } from '../types';

describe('ExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks(
    vi.useFakeTimers(

  afterEach(() => {
    vi.useRealTimers(

  describe('createExportJob', () => {
    it('should create an export job with pending status',async () => {
      const userId = 'user123';
      const format = 'csv';
      const filters: ExportFilter = { search: 'test' };
      const pagination: ExportPagination = { page: 1, limit: 100, offset: 0 };
      const lgpdOptions: LGPDComplianceOptions = {
        anonymizeSensitiveFields: true,
        excludeRestrictedFields: false,
        purpose: 'DATA_EXPORT',
        retentionDays: 30,
        consentRequired: true,
      };

      const job = await ExportService.createExportJob(
        userId,
        format,
        filters,
        pagination,
        lgpdOptions,
      

      expect(job).toMatchObject({
        userId,
        format,
        filters,
        pagination,
        status: 'pending',
        progress: {
          processed: 0,
          total: 0,
          percentage: 0,
        },

      expect(job.id).toBeDefined(
      expect(job.createdAt).toBeInstanceOf(Date
      expect(job.updatedAt).toBeInstanceOf(Date

    it('should process export job asynchronously',async () => {
      const userId = 'user123';
      const format = 'csv';
      const filters: ExportFilter = {};
      const pagination: ExportPagination = { page: 1, limit: 10, offset: 0 };
      const lgpdOptions: LGPDComplianceOptions = {
        anonymizeSensitiveFields: true,
        excludeRestrictedFields: false,
        purpose: 'DATA_EXPORT',
        retentionDays: 30,
        consentRequired: false,
      };

      const validateSpy = vi.spyOn(
        ExportLGPDCompliance,
        'validateExportRequest',
      
      validateSpy.mockResolvedValue({ valid: true   }

      const job = await ExportService.createExportJob(
        userId,
        format,
        filters,
        pagination,
        lgpdOptions,
      

      await vi.advanceTimersByTimeAsync(100

      const updatedJob = await ExportService.getExportJob(job.id
      expect(updatedJob?.status).toBe('processing')

  describe('getExportJob', () => {
    it('should return existing job',async () => {
      const userId = 'user123';
      const format = 'csv';
      const filters: ExportFilter = {};
      const pagination: ExportPagination = { page: 1, limit: 10, offset: 0 };
      const lgpdOptions: LGPDComplianceOptions = {
        anonymizeSensitiveFields: true,
        excludeRestrictedFields: false,
        purpose: 'DATA_EXPORT',
        retentionDays: 30,
        consentRequired: false,
      };

      const job = await ExportService.createExportJob(
        userId,
        format,
        filters,
        pagination,
        lgpdOptions,
      
      const retrievedJob = await ExportService.getExportJob(job.id

      expect(retrievedJob).toEqual(job

    it('should return null for non-existent job',async () => {
      const job = await ExportService.getExportJob('non-existent-id')
      expect(job).toBeNull(

  describe('cancelExportJob', () => {
    it('should cancel processing job',async () => {
      const userId = 'user123';
      const format = 'csv';
      const filters: ExportFilter = {};
      const pagination: ExportPagination = { page: 1, limit: 10, offset: 0 };
      const lgpdOptions: LGPDComplianceOptions = {
        anonymizeSensitiveFields: true,
        excludeRestrictedFields: false,
        purpose: 'DATA_EXPORT',
        retentionDays: 30,
        consentRequired: false,
      };

      const job = await ExportService.createExportJob(
        userId,
        format,
        filters,
        pagination,
        lgpdOptions,
      

      const success = await ExportService.cancelExportJob(job.id, _userId
      expect(success).toBe(true);

      const cancelledJob = await ExportService.getExportJob(job.id
      expect(cancelledJob?.status).toBe('cancelled')

    it('should not cancel job from different user',async () => {
      const userId = 'user123';
      const format = 'csv';
      const filters: ExportFilter = {};
      const pagination: ExportPagination = { page: 1, limit: 10, offset: 0 };
      const lgpdOptions: LGPDComplianceOptions = {
        anonymizeSensitiveFields: true,
        excludeRestrictedFields: false,
        purpose: 'DATA_EXPORT',
        retentionDays: 30,
        consentRequired: false,
      };

      const job = await ExportService.createExportJob(
        userId,
        format,
        filters,
        pagination,
        lgpdOptions,
      

      const success = await ExportService.cancelExportJob(
        job.id,
        'different-user',
      
      expect(success).toBe(false);

  describe('getExportFormats', () => {
    it('should return available export formats',async () => {
      const formats = await ExportService.getExportFormats(

      expect(formats).toEqual([
        {
          format: 'csv',
          description: 'Valores separados por vírgula, compatível com Excel',
        },
        {
          format: 'xlsx',
          description: 'Formato Excel nativo com múltiplas planilhas',
        },
      ]

  describe('getExportFields', () => {
    it('should return available export fields',async () => {
      const fields = await ExportService.getExportFields(

      expect(fields).toHaveLength(15
      expect(fields[0]).toMatchObject({
        field: 'id',
        label: 'ID',
        type: 'string',
        sensitive: false,
        required: true,

  describe('getExportHistory', () => {
    it('should return user export history',async () => {
      const userId = 'user123';

      await ExportService.createExportJob(
        userId,
        'csv',
        {},
        { page: 1, limit: 10, offset: 0 },
        {
          anonymizeSensitiveFields: true,
          excludeRestrictedFields: false,
          purpose: 'DATA_EXPORT',
          retentionDays: 30,
          consentRequired: false,
        },
      

      await ExportService.createExportJob(
        userId,
        'xlsx',
        {},
        { page: 1, limit: 10, offset: 0 },
        {
          anonymizeSensitiveFields: true,
          excludeRestrictedFields: false,
          purpose: 'DATA_EXPORT',
          retentionDays: 30,
          consentRequired: false,
        },
      

      const history = await ExportService.getExportHistory(userId, 10

      expect(history).toHaveLength(2
      expect(history[0]._userId).toBe(userId
      expect(history[0].format).toBe('xlsx')
      expect(history[1].format).toBe('csv')

    it('should respect limit parameter',async () => {
      const userId = 'user123';

      for (let i = 0; i < 5; i++) {
        await ExportService.createExportJob(
          userId,
          'csv',
          {},
          { page: 1, limit: 10, offset: 0 },
          {
            anonymizeSensitiveFields: true,
            excludeRestrictedFields: false,
            purpose: 'DATA_EXPORT',
            retentionDays: 30,
            consentRequired: false,
          },
        
      }

      const history = await ExportService.getExportHistory(userId, 3
      expect(history).toHaveLength(3

  describe('getExportMetrics', () => {
    it('should return metrics for completed job',async () => {
      const userId = 'user123';
      const format = 'csv';
      const filters: ExportFilter = {};
      const pagination: ExportPagination = { page: 1, limit: 10, offset: 0 };
      const lgpdOptions: LGPDComplianceOptions = {
        anonymizeSensitiveFields: true,
        excludeRestrictedFields: false,
        purpose: 'DATA_EXPORT',
        retentionDays: 30,
        consentRequired: false,
      };

      const validateSpy = vi.spyOn(
        ExportLGPDCompliance,
        'validateExportRequest',
      
      validateSpy.mockResolvedValue({ valid: true   }

      const job = await ExportService.createExportJob(
        userId,
        format,
        filters,
        pagination,
        lgpdOptions,
      

      await vi.advanceTimersByTimeAsync(2000

      const metrics = await ExportService.getExportMetrics(job.id

      expect(metrics).toBeDefined(
      expect(metrics?.totalRecords).toBeGreaterThan(0
      expect(metrics?.exportedRecords).toBeGreaterThan(0
      expect(metrics?.processingTime).toBeGreaterThanOrEqual(0

    it('should return null for non-existent job',async () => {
      const metrics = await ExportService.getExportMetrics('non-existent-id')
      expect(metrics).toBeNull(

  describe('cleanupExpiredJobs', () => {
    it('should remove expired jobs',async () => {
      const userId = 'user123';
      const format = 'csv';
      const filters: ExportFilter = {};
      const pagination: ExportPagination = { page: 1, limit: 10, offset: 0 };
      const lgpdOptions: LGPDComplianceOptions = {
        anonymizeSensitiveFields: true,
        excludeRestrictedFields: false,
        purpose: 'DATA_EXPORT',
        retentionDays: 30,
        consentRequired: false,
      };

      const validateSpy = vi.spyOn(
        ExportLGPDCompliance,
        'validateExportRequest',
      
      validateSpy.mockResolvedValue({ valid: true   }

      const job = await ExportService.createExportJob(
        userId,
        format,
        filters,
        pagination,
        lgpdOptions,
      

      await vi.advanceTimersByTimeAsync(2000

      vi.setSystemTime(new Date(Date.now() + 25 * 60 * 60 * 1000)

      await ExportService.cleanupExpiredJobs(

      const cleanedJob = await ExportService.getExportJob(job.id
      expect(cleanedJob).toBeNull(
