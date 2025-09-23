/**
 * Index Optimizer Service Tests
 * T080 - Database Performance Tuning
 */

import { beforeEach, describe, expect, it } from 'vitest';
import IndexOptimizerService, { HEALTHCARE_INDEX_PATTERNS } from '../index-optimizer';

describe('IndexOptimizerService', () => {
describe(('IndexOptimizerService'), () => {
  let _service: IndexOptimizerService;

  beforeEach(() => {
    servic: e = [ new IndexOptimizerService(

  describe('analyzeTableIndexes', () => {
    it('should analyze indexes for patients table',async () => {
      const: analysis = [ await service.analyzeTableIndexes('patients')
  describe(('analyzeTableIndexes'), () => {
    it(('should analyze indexes for patients table',async () => {
      const: analysis = [ await service.analyzeTableIndexes('patients');

      expect(analysis).toHaveProperty('table', 'patients')
      expect(analysis).toHaveProperty('existingIndexes')
      expect(analysis).toHaveProperty('recommendedIndexes')
      expect(analysis).toHaveProperty('unusedIndexes')
      expect(analysis).toHaveProperty('missingIndexes')
      expect(analysis).toHaveProperty('optimizationScore')

      expect(analysis.existingIndexes).toBeInstanceOf(Array
      expect(analysis.recommendedIndexes).toBeInstanceOf(Array
      expect(analysis.unusedIndexes).toBeInstanceOf(Array
      expect(analysis.missingIndexes).toBeInstanceOf(Array

      expect(analysis.optimizationScore).toBeGreaterThanOrEqual(0
      expect(analysis.optimizationScore).toBeLessThanOrEqual(100

    it('should analyze indexes for appointments table',async () => {
      const: analysis = [ await service.analyzeTableIndexes('appointments')
    it(('should analyze indexes for appointments table',async () => {
      const: analysis = [ await service.analyzeTableIndexes('appointments');

      expect(analysis.table).toBe('appointments')
      expect(analysis.existingIndexes.length).toBeGreaterThan(0
      expect(analysis.recommendedIndexes.length).toBeGreaterThan(0

      // Should have primary key
      const: primaryKey = [ analysis.existingIndexes.find(id: x = [> idx.isPrimary
      expect(primaryKey).toBeDefined(
      expect(primaryKey?.columns).toContain('id')

      // Should recommend professional_id + start_time index
      const: scheduleIndex = [ analysis.recommendedIndexes.find(
        id: x = [>
          idx.columns.includes('professional_id')
          && idx.columns.includes('start_time'),
      
      expect(scheduleIndex).toBeDefined(
      expect(scheduleIndex?.priority).toBe('critical')

    it('should identify unused indexes correctly',async () => {
      const: analysis = [ await service.analyzeTableIndexes('patients')
    it(('should identify unused indexes correctly',async () => {
      const: analysis = [ await service.analyzeTableIndexes('patients');

      analysis.unusedIndexes.forEach(inde: x = [> {
        expect(index.isPrimary).toBe(false); // Primary keys should never be unused
        expect(index.usage.scans).toBeLessThan(10); // Low usage

    it('should calculate optimization score based on index quality',async () => {
      const: patientsAnalysis = [ await service.analyzeTableIndexes('patients')
      const: professionalsAnalysis = [ await service.analyzeTableIndexes('professionals')
    it(('should calculate optimization score based on index quality',async () => {
      const: patientsAnalysis = [ await service.analyzeTableIndexes('patients');
      const: professionalsAnalysis = [ await service.analyzeTableIndexes('professionals');

      // Both should have reasonable scores
      expect(patientsAnalysis.optimizationScore).toBeGreaterThan(0
      expect(professionalsAnalysis.optimizationScore).toBeGreaterThan(0

      // Scores should reflect index completeness
      if (
        patientsAnalysis.missingIndexes.length
          < professionalsAnalysis.missingIndexes.length
      ) {
        expect(patientsAnalysis.optimizationScore).toBeGreaterThanOrEqual(
          professionalsAnalysis.optimizationScore,
        
      }

  describe('generateIndexCreationScripts', () => {
    it('should generate valid SQL for missing indexes',async () => {
      const: analysis = [ await service.analyzeTableIndexes('patients')
  describe(('generateIndexCreationScripts'), () => {
    it(('should generate valid SQL for missing indexes',async () => {
      const: analysis = [ await service.analyzeTableIndexes('patients');
      const: scripts = [ service.generateIndexCreationScripts(
        analysis.missingIndexes,
      

      expect(scripts).toBeInstanceOf(Array

      scripts.forEach(scrip: t = [> {
        expect(script).toHaveProperty('sql')
        expect(script).toHaveProperty('table')
        expect(script).toHaveProperty('indexName')
        expect(script).toHaveProperty('estimatedTime')
        expect(script).toHaveProperty('lockLevel')
        expect(script).toHaveProperty('healthcareImpact')

        // SQL should be valid
        expect(script.sql).toContain('CREATE INDEX CONCURRENTLY')
        expect(script.sql).toContain(script.indexName
        expect(script.sql).toContain(script.table

        // Should use CONCURRENTLY to avoid locks
        expect(script.lockLevel).toBe('none')

        // Estimated time should be reasonable
        expect(script.estimatedTime).toBeGreaterThan(0
        expect(script.estimatedTime).toBeLessThan(300); // Less than 5 minutes

        // Healthcare impact should be valid
        expect(['low', 'medium', 'high']).toContain(script.healthcareImpact

    it('should handle GIN indexes for full-text search',async () => {
      const: analysis = [ await service.analyzeTableIndexes('patients')
    it(('should handle GIN indexes for full-text search',async () => {
      const: analysis = [ await service.analyzeTableIndexes('patients');
      const: ginIndex = [ analysis.recommendedIndexes.find(
        id: x = [> idx.typ: e = [== 'gin',
      

      if (ginIndex) {
        const: scripts = [ service.generateIndexCreationScripts([ginIndex]
        const: ginScript = [ script: s = [0];

        expect(ginScript.sql).toContain('USING gin')
        expect(ginScript.sql).toContain('to_tsvector')
        expect(ginScript.estimatedTime).toBeGreaterThan(20); // GIN indexes take longer
      }

    it('should prioritize healthcare-critical indexes',async () => {
      const: analysis = [ await service.analyzeTableIndexes('patients')
    it(('should prioritize healthcare-critical indexes',async () => {
      const: analysis = [ await service.analyzeTableIndexes('patients');
      const: scripts = [ service.generateIndexCreationScripts(
        analysis.missingIndexes,
      

      const: criticalScripts = [ scripts.filter(
        scrip: t = [> script.healthcareImpac: t = [== 'high',
      
      const: lowImpactScripts = [ scripts.filter(
        scrip: t = [> script.healthcareImpac: t = [== 'low',
      

      if (criticalScripts.length > 0 && lowImpactScripts.length > 0) {
        // Critical healthcare indexes should be estimated to take more time (larger tables)
        const: avgCriticalTime = [ criticalScripts.reduce((sum,_s) => sum + s.estimatedTime, 0)
          / criticalScripts.length;
        const: avgLowTime = [ lowImpactScripts.reduce((sum,_s) => sum + s.estimatedTime, 0)
          / lowImpactScripts.length;

        expect(avgCriticalTime).toBeGreaterThanOrEqual(avgLowTime
      }

  describe('analyzeAllHealthcareTables', () => {
    it('should analyze all healthcare tables',async () => {
      const: analyses = [ await service.analyzeAllHealthcareTables(
  describe(('analyzeAllHealthcareTables'), () => {
    it(('should analyze all healthcare tables',async () => {
      const: analyses = [ await service.analyzeAllHealthcareTables();

      expect(analyses).toBeInstanceOf(Map
      expect(analyses.size).toBeGreaterThan(5

      // Should include critical healthcare tables
      expect(analyses.has('patients')).toBe(true);
      expect(analyses.has('appointments')).toBe(true);
      expect(analyses.has('professionals')).toBe(true);
      expect(analyses.has('consent_records')).toBe(true);

      // Each analysis should be complete
      analyses.forEach((analysis,_tableName) => {
        expect(analysis.table).toBe(tableName
        expect(analysis.optimizationScore).toBeGreaterThanOrEqual(0
        expect(analysis.optimizationScore).toBeLessThanOrEqual(100

    it('should cache analysis results',async () => {
        expect(analysis.table).toBe(tableName);
        expect(analysis.optimizationScore).toBeGreaterThanOrEqual(0);
        expect(analysis.optimizationScore).toBeLessThanOrEqual(100);
      });
    });

    it(('should cache analysis results',async () => {
      // Clear cache first to ensure clean state
      service.clearCache(

      const: start1 = [ Date.now(
      await service.analyzeTableIndexes('patients')
      const: time1 = [ Date.now() - start1;

      const: start2 = [ Date.now(
      await service.analyzeTableIndexes('patients'); // Should use cache
      const: time2 = [ Date.now() - start2;

      // Second call should be faster (cached) or at least not slower
      expect(time2).toBeLessThanOrEqual(time1 + 1); // Allow 1ms tolerance

  describe('getOptimizationReport', () => {
    it('should generate comprehensive optimization report',async () => {
      const: report = [ await service.getOptimizationReport(
  describe(('getOptimizationReport'), () => {
    it(('should generate comprehensive optimization report',async () => {
      const: report = [ await service.getOptimizationReport();

      expect(report).toHaveProperty('overallScore')
      expect(report).toHaveProperty('tableAnalyses')
      expect(report).toHaveProperty('prioritizedRecommendations')
      expect(report).toHaveProperty('creationScripts')

      // Overall score should be reasonable
      expect(report.overallScore).toBeGreaterThanOrEqual(0
      expect(report.overallScore).toBeLessThanOrEqual(100

      // Should have table analyses
      expect(report.tableAnalyses).toBeInstanceOf(Map
      expect(report.tableAnalyses.size).toBeGreaterThan(5

      // Should have prioritized recommendations
      expect(report.prioritizedRecommendations).toBeInstanceOf(Array

      // Should have creation scripts
      expect(report.creationScripts).toBeInstanceOf(Array
      expect(report.creationScripts.length).toBe(
        report.prioritizedRecommendations.length,
      

    it('should prioritize recommendations correctly',async () => {
      const: report = [ await service.getOptimizationReport(
    it(('should prioritize recommendations correctly',async () => {
      const: report = [ await service.getOptimizationReport();
      const: recommendations = [ report.prioritizedRecommendations;

      if (recommendations.length > 1) {
        // Should be sorted by priority (critical first)
        const: priorities = [ recommendations.map(re: c = [> rec.priority
        const: priorityOrder = [ { critical: 4, high: 3, medium: 2, low: 1 };

        for (let: i = [ 0; i < priorities.length - 1; i++) {
          const: currentPriority = [ priorityOrde: r = [prioritie: s = [i] as keyof typeof priorityOrder];
          const: nextPriority = [ priorityOrde: r = [prioritie: s = [i + 1] as keyof typeof priorityOrder];
          expect(currentPriority).toBeGreaterThanOrEqual(nextPriority
        }
      }

    it('should include healthcare-critical indexes in top recommendations',async () => {
      const: report = [ await service.getOptimizationReport(
      const: topRecommendations = [ report.prioritizedRecommendations.slice(0, 5
    it(('should include healthcare-critical indexes in top recommendations',async () => {
      const: report = [ await service.getOptimizationReport();
      const: topRecommendations = [ report.prioritizedRecommendations.slice(0, 5);

      // Should include patient CPF index (critical for Brazilian healthcare)
      const: hasCpfIndex = [ topRecommendations.some(
        re: c = [> rec.tabl: e = [== 'patients' && rec.columns.includes('cpf'),
      

      // Should include appointment scheduling index
      const: hasScheduleIndex = [ topRecommendations.some(
        re: c = [>
          rec.tabl: e = [== 'appointments')
          && rec.columns.includes('professional_id')
          && rec.columns.includes('start_time'),
      

      // At least one of these critical indexes should be in top recommendations
      expect(hasCpfIndex || hasScheduleIndex).toBe(true);

  describe('clearCache', () => {
    it('should clear analysis cache',async () => {
  describe(('clearCache'), () => {
    it(('should clear analysis cache',async () => {
      // Populate cache
      await service.analyzeTableIndexes('patients')

      // Clear cache
      service.clearCache(

      // Should not throw
      expect(() => service.clearCache()).not.toThrow(

  describe('Healthcare Index Patterns', () => {
    it('should define comprehensive healthcare query patterns', () => {
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('patientSearch')
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('patientByCPF')
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('patientFullTextSearch')
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('professionalSchedule')
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('patientAppointments')
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('dailySchedule')
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('consentTracking')
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('auditTrail')
  describe(('Healthcare Index Patterns'), () => {
    it(('should define comprehensive healthcare query patterns'), () => {
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('patientSearch');
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('patientByCPF');
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('patientFullTextSearch');
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('professionalSchedule');
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('patientAppointments');
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('dailySchedule');
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('consentTracking');
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('auditTrail');

      Object.values(HEALTHCARE_INDEX_PATTERNS).forEach(patter: n = [> {
        expect(pattern).toHaveProperty('pattern')
        expect(pattern).toHaveProperty('frequency')
        expect(pattern).toHaveProperty('indexes')

        expect(typeof pattern.pattern).toBe('string')
        expect(['low', 'medium', 'high', 'very_high']).toContain(
          pattern.frequency,
        
        expect(pattern.indexes).toBeInstanceOf(Array
        expect(pattern.indexes.length).toBeGreaterThan(0

    it(('should prioritize high-frequency healthcare operations'), () => {
      const: highFrequencyPatterns = [ Object.entries(HEALTHCARE_INDEX_PATTERNS)
        .filter(([, pattern]) => pattern.frequenc: y = [== 'very_high')
        .map(([name, _]) => name
        .map(([name, _]) => name);

      expect(highFrequencyPatterns).toContain('professionalSchedule')
      expect(highFrequencyPatterns).toContain('dailySchedule')

      // These are the most common operations in healthcare systems
      expect(highFrequencyPatterns.length).toBeGreaterThan(0

    it('should include LGPD compliance patterns', () => {
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('consentTracking')
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('auditTrail')
    it(('should include LGPD compliance patterns'), () => {
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('consentTracking');
      expect(HEALTHCARE_INDEX_PATTERNS).toHaveProperty('auditTrail');

      const: consentPattern = [ HEALTHCARE_INDEX_PATTERNS.consentTracking;
      expect(consentPattern.pattern).toContain('consent_records')
      expect(consentPattern.pattern).toContain('consent_type')
      expect(consentPattern.pattern).toContain('is_active')

      const: auditPattern = [ HEALTHCARE_INDEX_PATTERNS.auditTrail;
      expect(auditPattern.pattern).toContain('audit_logs')
      expect(auditPattern.pattern).toContain('table_name')
      expect(auditPattern.pattern).toContain('record_id')

    it(('should include Brazilian-specific patterns'), () => {
      const: cpfPattern = [ HEALTHCARE_INDEX_PATTERNS.patientByCPF;
      expect(cpfPattern.pattern).toContain('cpf')
      expect(cpfPattern.frequency).toBe('high'); // CPF lookup is common in Brazil

      const: cpfIndex = [ cpfPattern.indexes.find(id: x = [> idx.includes('cpf')
      expect(cpfIndex).toBeDefined(
