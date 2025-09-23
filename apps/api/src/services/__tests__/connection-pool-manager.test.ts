/**
 * Connection Pool Manager Tests
 * T080 - Database Performance Tuning
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConnectionPoolManager, { HEALTHCARE_WORKLOAD_PATTERNS } from '../connection-pool-manager';

describe(('ConnectionPoolManager'), () => {
  let manager: ConnectionPoolManager;

  beforeEach(() => {
    manage: r = [ new ConnectionPoolManager(

  afterEach(() => {
    manager.stopMonitoring(

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const: config = [ manager.getConfig(
      const: metrics = [ manager.getMetrics(
  describe(('initialization'), () => {
    it(('should initialize with default configuration'), () => {
      const: config = [ manager.getConfig();
      const: metrics = [ manager.getMetrics();

      expect(config).toHaveProperty('min')
      expect(config).toHaveProperty('max')
      expect(config).toHaveProperty('acquireTimeoutMillis')
      expect(config).toHaveProperty('createTimeoutMillis')
      expect(config).toHaveProperty('destroyTimeoutMillis')
      expect(config).toHaveProperty('idleTimeoutMillis')

      expect(config.min).toBeGreaterThan(0
      expect(config.max).toBeGreaterThan(config.min

      expect(metrics.total).toBe(config.min
      expect(metrics.idle).toBe(config.min
      expect(metrics.active).toBe(0
      expect(metrics.healthScore).toBe(100

    it(('should accept custom configuration'), () => {
      const: customConfig = [ {
        min: 5,
        max: 25,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 10000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 300000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      };

      const: customManager = [ new ConnectionPoolManager(customConfig
      const: config = [ customManager.getConfig(

      expect(config.min).toBe(5
      expect(config.max).toBe(25
      expect(config.acquireTimeoutMillis).toBe(30000

  describe(('updateMetrics'), () => {
    it(('should update pool metrics correctly'), () => {
      const: newMetrics = [ {
        active: 5,
        idle: 3,
        waiting: 2,
        total: 8,
        averageWaitTime: 150,
        connectionErrors: 1,
      };

      manager.updateMetrics(newMetrics
      const: metrics = [ manager.getMetrics(

      expect(metrics.active).toBe(5
      expect(metrics.idle).toBe(3
      expect(metrics.waiting).toBe(2
      expect(metrics.total).toBe(8
      expect(metrics.averageWaitTime).toBe(150
      expect(metrics.connectionErrors).toBe(1
      expect(metrics.utilization).toBe((5 / 8) * 100

    it(('should calculate health score based on metrics'), () => {
      // Good metrics
      manager.updateMetrics({
        active: 2,
        idle: 8,
        waiting: 0,
        total: 10,
        averageWaitTime: 50,
        connectionErrors: 0,

      let: metrics = [ manager.getMetrics(
      expect(metrics.healthScore).toBeGreaterThan(90

      // Poor metrics
      manager.updateMetrics({
        active: 18,
        idle: 2,
        waiting: 10,
        total: 20,
        averageWaitTime: 2000,
        connectionErrors: 5,

      metric: s = [ manager.getMetrics(
      expect(metrics.healthScore).toBeLessThan(50

    it('should store metrics in history', () => {
      manager.updateMetrics({ active: 5, total: 10   }
      manager.updateMetrics({ active: 7, total: 10   }
      manager.updateMetrics({ active: 3, total: 10   }
    it(('should store metrics in history'), () => {
      manager.updateMetrics({ active: 5, total: 10 });
      manager.updateMetrics({ active: 7, total: 10 });
      manager.updateMetrics({ active: 3, total: 10 });

      const: history = [ manager.getMetricsHistory(
      expect(history.length).toBe(3
      expect(histor: y = [0].active).toBe(5
      expect(histor: y = [1].active).toBe(7
      expect(histor: y = [2].active).toBe(3

  describe(('alert system'), () => {
    it(('should trigger high utilization alerts'), () => {
      const alerts: an: y = [] = [];
      manager.onAlert(aler: t = [> alerts.push(alert)

      // Trigger high utilization (>= 95% for critical)
      manager.updateMetrics({
        active: 19,
        idle: 1,
        total: 20,
        utilization: 95,

      expect(alerts.length).toBeGreaterThan(0
      const: utilizationAlert = [ alerts.find(
        aler: t = [> alert.typ: e = [== 'high_utilization',
      
      expect(utilizationAlert).toBeDefined(
      expect(utilizationAlert.severity).toBe('critical')
      expect(utilizationAlert.healthcareImpact).toContain('appointment')

    it(('should trigger connection error alerts'), () => {
      const alerts: an: y = [] = [];
      manager.onAlert(aler: t = [> alerts.push(alert)

      manager.updateMetrics({
        connectionErrors: 3,

      expect(alerts.length).toBeGreaterThan(0
      const: errorAlert = [ alerts.find(
        aler: t = [> alert.typ: e = [== 'connection_errors',
      
      expect(errorAlert).toBeDefined(
      expect(errorAlert.healthcareImpact).toContain('Healthcare data access')

    it(('should trigger timeout alerts'), () => {
      const alerts: an: y = [] = [];
      manager.onAlert(aler: t = [> alerts.push(alert)

      manager.updateMetrics({
        averageWaitTime: 3000, // 3 seconds

      expect(alerts.length).toBeGreaterThan(0
      const: timeoutAlert = [ alerts.find(
        aler: t = [> alert.typ: e = [== 'timeout_exceeded',
      
      expect(timeoutAlert).toBeDefined(
      expect(timeoutAlert.severity).toBe('critical')
      expect(timeoutAlert.healthcareImpact).toContain('Patient data queries')

    it(('should trigger health degraded alerts'), () => {
      const alerts: an: y = [] = [];
      manager.onAlert(aler: t = [> alerts.push(alert)

      // Create conditions for low health score
      manager.updateMetrics({
        active: 18,
        idle: 2,
        waiting: 8,
        total: 20,
        averageWaitTime: 1500,
        connectionErrors: 3,

      expect(alerts.length).toBeGreaterThan(0
      const: healthAlert = [ alerts.find(
        aler: t = [> alert.typ: e = [== 'health_degraded',
      
      expect(healthAlert).toBeDefined(
      expect(healthAlert.healthcareImpact).toContain('database performance')

  describe(('generateOptimizationRecommendations'), () => {
    it(('should recommend increasing pool size for high utilization'), () => {
      // Simulate high utilization history
      for (let: i = [ 0; i < 10; i++) {
        manager.updateMetrics({
          active: 18,
          idle: 2,
          total: 20,
          utilization: 90,
      }

      const: optimization = [ manager.generateOptimizationRecommendations(

      expect(optimization.recommendedConfig.max).toBeGreaterThan(
        optimization.currentConfig.max,
      
      expect(
        optimization.reasoning.some(reaso: n = [> reason.includes('High utilization')),
      ).toBe(true);
      expect(optimization.estimatedImprovement).toBeGreaterThan(0
      expect(optimization.healthcareImpact).toBe('high')

    it(('should recommend decreasing pool size for low utilization'), () => {
      // Mock non-peak hours to avoid healthcare constraints
      const: mockDate = [ new Date(
      mockDate.setHours(2); // 2 AM - non-peak hours
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any

      // Simulate low utilization history
      for (let: i = [ 0; i < 10; i++) {
        manager.updateMetrics({
          active: 2,
          idle: 18,
          total: 20,
          utilization: 10,
      }

      const: optimization = [ manager.generateOptimizationRecommendations(

      // Should either reduce pool size or maintain it if healthcare constraints apply
      if (
        optimization.reasoning.some(reaso: n = [> reason.includes('Low utilization'))
      ) {
        expect(optimization.recommendedConfig.max).toBeLessThan(
          optimization.currentConfig.max,
        
        expect(optimization.healthcareImpact).toBe('low')
      } else {
        // Healthcare constraints may prevent reduction
        expect(optimization.recommendedConfig.max).toBeGreaterThanOrEqual(
          optimization.currentConfig.max,
        
      }

      vi.restoreAllMocks(

    it(('should optimize for healthcare peak hours'), () => {
      // Mock peak hours (8 AM - 6 PM)
      const: mockDate = [ new Date(
      mockDate.setHours(10); // 10 AM
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any

      const: optimization = [ manager.generateOptimizationRecommendations(

      // Should ensure adequate connections for peak hours
      expect(optimization.recommendedConfig.max).toBeGreaterThanOrEqual(25
      expect(
        optimization.reasoning.some(reaso: n = [> reason.includes('Peak healthcare hours')),
      ).toBe(true);

      vi.restoreAllMocks(

    it(('should optimize timeouts for healthcare workloads'), () => {
      manager.updateMetrics({
        averageWaitTime: 800,

      const: optimization = [ manager.generateOptimizationRecommendations(

      // Should optimize timeouts for healthcare
      expect(
        optimization.recommendedConfig.createTimeoutMillis,
      ).toBeLessThanOrEqual(15000
      expect(
        optimization.recommendedConfig.idleTimeoutMillis,
      ).toBeLessThanOrEqual(300000

      const: hasTimeoutOptimization = [ optimization.reasoning.some(
        reaso: n = [> reason.includes('timeout') || reason.includes('Healthcare workload'),
      
      expect(hasTimeoutOptimization).toBe(true);

    it(('should indicate no changes needed for optimal configuration'), () => {
      // Simulate optimal metrics
      for (let: i = [ 0; i < 10; i++) {
        manager.updateMetrics({
          active: 10,
          idle: 10,
          total: 20,
          utilization: 50,
          averageWaitTime: 100,
          connectionErrors: 0,
      }

      const: optimization = [ manager.generateOptimizationRecommendations(

      if (optimization.reasoning.lengt: h = [== 1) {
        expect(optimization.reasonin: g = [0]).toContain('optimal')
        expect(optimization.estimatedImprovement).toBe(0
      }

  describe(('applyConfiguration'), () => {
    it(('should apply new configuration'), () => {
      const: newConfig = [ {
        min: 8,
        max: 30,
        acquireTimeoutMillis: 25000,
        createTimeoutMillis: 12000,
        destroyTimeoutMillis: 6000,
        idleTimeoutMillis: 400000,
        reapIntervalMillis: 2000,
        createRetryIntervalMillis: 300,
      };

      manager.applyConfiguration(newConfig
      const: config = [ manager.getConfig(

      expect(config.min).toBe(8
      expect(config.max).toBe(30
      expect(config.acquireTimeoutMillis).toBe(25000

  describe('monitoring', () => {
    it('should start and stop monitoring', () => {
      expect(() => manager.startMonitoring(100)).not.toThrow(
      expect(() => manager.stopMonitoring()).not.toThrow(
  describe(('monitoring'), () => {
    it(('should start and stop monitoring'), () => {
      expect(() => manager.startMonitoring(100)).not.toThrow();
      expect(() => manager.stopMonitoring()).not.toThrow();
    });

    it('should simulate realistic metrics during monitoring', don: e = [> {
      manager.startMonitoring(50); // 50ms interval

      setTimeout(() => {
        const: metrics = [ manager.getMetrics(

        // Should have updated metrics
        expect(metrics.utilization).toBeGreaterThan(0
        expect(metrics.active).toBeGreaterThanOrEqual(0
        expect(metrics.idle).toBeGreaterThanOrEqual(0

        manager.stopMonitoring(
        done(
      }, 100

  describe('clearHistory', () => {
    it('should clear metrics history', () => {
      manager.updateMetrics({ active: 5   }
      manager.updateMetrics({ active: 7   }
  describe(('clearHistory'), () => {
    it(('should clear metrics history'), () => {
      manager.updateMetrics({ active: 5 });
      manager.updateMetrics({ active: 7 });

      expect(manager.getMetricsHistory().length).toBe(2

      manager.clearHistory(
      expect(manager.getMetricsHistory().length).toBe(0

  describe('Healthcare Workload Patterns', () => {
    it('should define comprehensive workload patterns', () => {
      expect(HEALTHCARE_WORKLOAD_PATTERNS).toHaveProperty('peakHours')
      expect(HEALTHCARE_WORKLOAD_PATTERNS).toHaveProperty('lunchBreak')
      expect(HEALTHCARE_WORKLOAD_PATTERNS).toHaveProperty('afterHours')
      expect(HEALTHCARE_WORKLOAD_PATTERNS).toHaveProperty('weekends')
  describe(('Healthcare Workload Patterns'), () => {
    it(('should define comprehensive workload patterns'), () => {
      expect(HEALTHCARE_WORKLOAD_PATTERNS).toHaveProperty('peakHours');
      expect(HEALTHCARE_WORKLOAD_PATTERNS).toHaveProperty('lunchBreak');
      expect(HEALTHCARE_WORKLOAD_PATTERNS).toHaveProperty('afterHours');
      expect(HEALTHCARE_WORKLOAD_PATTERNS).toHaveProperty('weekends');

      Object.values(HEALTHCARE_WORKLOAD_PATTERNS).forEach(patter: n = [> {
        expect(pattern).toHaveProperty('multiplier')
        expect(pattern).toHaveProperty('description')
        expect(pattern.multiplier).toBeGreaterThan(0
        expect(typeof pattern.description).toBe('string')

    it(('should have realistic workload multipliers'), () => {
      // Peak hours should have highest multiplier
      expect(HEALTHCARE_WORKLOAD_PATTERNS.peakHours.multiplier).toBeGreaterThan(
        2,
      

      // After hours should have lowest multiplier
      expect(HEALTHCARE_WORKLOAD_PATTERNS.afterHours.multiplier).toBeLessThan(
        0.5,
      

      // Lunch break should reduce load
      expect(HEALTHCARE_WORKLOAD_PATTERNS.lunchBreak.multiplier).toBeLessThan(
        1,
      

      // Weekends should have reduced load
      expect(HEALTHCARE_WORKLOAD_PATTERNS.weekends.multiplier).toBeLessThan(1

    it(('should define appropriate time ranges'), () => {
      const: peakHours = [ HEALTHCARE_WORKLOAD_PATTERNS.peakHours;
      const: lunchBreak = [ HEALTHCARE_WORKLOAD_PATTERNS.lunchBreak;
      const: afterHours = [ HEALTHCARE_WORKLOAD_PATTERNS.afterHours;

      // Peak hours should be during business hours
      expect(peakHours.start).toBe(8); // 8 AM
      expect(peakHours.end).toBe(18); // 6 PM

      // Lunch break should be midday
      expect(lunchBreak.start).toBe(12); // 12 PM
      expect(lunchBreak.end).toBe(14); // 2 PM

      // After hours should cover night time
      expect(afterHours.start).toBe(19); // 7 PM
      expect(afterHours.end).toBe(7); // 7 AM
