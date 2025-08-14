// Executive Dashboard Engine - Core Business Logic

import {
  DashboardConfig,
  DashboardState,
  DashboardWidget,
  KPIMetric,
  Alert,
  PerformanceMetric,
  ExecutiveSummaryData,
  ChartDataPoint,
  DateRange,
  DashboardFilters,
  RealTimeUpdate,
  ApiResponse,
  DashboardError,
  GeneratedReport,
  ReportTemplate,
  TrendDirection,
  AlertSeverity
} from './types';

import {
  formatValue,
  calculateTrend,
  calculateKPIStatus,
  validateDateRange,
  SimpleCache,
  debounce,
  createErrorHandler,
  saveToLocalStorage,
  loadFromLocalStorage
} from './utils';

import {
  DASHBOARD_CONFIG,
  API_ENDPOINTS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  EVENTS
} from './constants';

/**
 * Executive Dashboard Engine
 * 
 * Core engine responsible for managing dashboard state, data fetching,
 * real-time updates, and business logic for the executive dashboard.
 */
export class ExecutiveDashboardEngine {
  private config: DashboardConfig;
  private state: DashboardState;
  private cache: SimpleCache;
  private eventListeners: Map<string, Function[]>;
  private realTimeConnection: WebSocket | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private errorHandler: (error: DashboardError) => void;

  constructor(config: DashboardConfig) {
    this.config = config;
    this.cache = new SimpleCache(DASHBOARD_CONFIG.CACHE.DEFAULT_TTL);
    this.eventListeners = new Map();
    this.errorHandler = createErrorHandler();
    
    this.state = {
      config,
      data: null,
      widgets: [],
      kpis: [],
      alerts: [],
      layout: {
        id: 'default',
        name: 'Layout Padrão',
        widgets: [],
        breakpoints: {
          lg: [],
          md: [],
          sm: [],
          xs: [],
          xxs: []
        },
        isDefault: true,
        isShared: false,
        createdBy: config.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      isLoading: false,
      error: null,
      lastUpdated: null,
      realTimeEnabled: config.realTimeEnabled || false,
      autoRefresh: false
    };

    this.initializeEngine();
  }

  /**
   * Initialize the dashboard engine
   */
  private async initializeEngine(): Promise<void> {
    try {
      // Load saved state from localStorage
      await this.loadSavedState();
      
      // Initialize real-time connection if enabled
      if (this.config.realTimeEnabled) {
        await this.initializeRealTime();
      }
      
      // Start auto-refresh if configured
      if (this.config.refreshInterval) {
        this.startAutoRefresh();
      }
      
      this.emit(EVENTS.ENGINE_INITIALIZED, { engine: this });
    } catch (error) {
      this.handleError(error as Error, 'Falha ao inicializar o engine do dashboard');
    }
  }

  /**
   * Load dashboard data
   */
  public async loadDashboardData(): Promise<void> {
    this.setState({ isLoading: true, error: null });
    
    try {
      const cacheKey = this.generateCacheKey('dashboard-data');
      let data = this.cache.get(cacheKey);
      
      if (!data) {
        // Simulate API call - replace with actual API integration
        data = await this.fetchDashboardData();
        this.cache.set(cacheKey, data);
      }
      
      this.setState({
        data,
        lastUpdated: new Date(),
        isLoading: false
      });
      
      this.emit(EVENTS.DATA_LOADED, { data });
    } catch (error) {
      this.handleError(error as Error, 'Falha ao carregar dados do dashboard');
    }
  }

  /**
   * Load KPI metrics
   */
  public async loadKPIMetrics(): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey('kpi-metrics');
      let kpis = this.cache.get(cacheKey);
      
      if (!kpis) {
        kpis = await this.fetchKPIMetrics();
        this.cache.set(cacheKey, kpis);
      }
      
      this.setState({ kpis });
      this.emit(EVENTS.KPIS_UPDATED, { kpis });
    } catch (error) {
      this.handleError(error as Error, 'Falha ao carregar métricas KPI');
    }
  }

  /**
   * Load alerts
   */
  public async loadAlerts(): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey('alerts');
      let alerts = this.cache.get(cacheKey);
      
      if (!alerts) {
        alerts = await this.fetchAlerts();
        this.cache.set(cacheKey, alerts);
      }
      
      this.setState({ alerts });
      this.emit(EVENTS.ALERTS_UPDATED, { alerts });
    } catch (error) {
      this.handleError(error as Error, 'Falha ao carregar alertas');
    }
  }

  /**
   * Load widgets
   */
  public async loadWidgets(): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey('widgets');
      let widgets = this.cache.get(cacheKey);
      
      if (!widgets) {
        widgets = await this.fetchWidgets();
        this.cache.set(cacheKey, widgets);
      }
      
      this.setState({ widgets });
      this.emit(EVENTS.WIDGETS_UPDATED, { widgets });
    } catch (error) {
      this.handleError(error as Error, 'Falha ao carregar widgets');
    }
  }

  /**
   * Update dashboard filters
   */
  public async updateFilters(filters: Partial<DashboardFilters>): Promise<void> {
    const newConfig = {
      ...this.config,
      filters: {
        ...this.config.filters,
        ...filters
      }
    };
    
    this.config = newConfig;
    this.setState({ config: newConfig });
    
    // Clear cache and reload data with new filters
    this.cache.clear();
    await this.loadDashboardData();
    
    this.emit(EVENTS.FILTERS_UPDATED, { filters: newConfig.filters });
  }

  /**
   * Update date range
   */
  public async updateDateRange(dateRange: DateRange): Promise<void> {
    if (!validateDateRange(dateRange)) {
      throw new Error('Intervalo de datas inválido');
    }
    
    const newConfig = {
      ...this.config,
      dateRange
    };
    
    this.config = newConfig;
    this.setState({ config: newConfig });
    
    // Clear cache and reload data with new date range
    this.cache.clear();
    await this.loadDashboardData();
    
    this.emit(EVENTS.DATE_RANGE_UPDATED, { dateRange });
  }

  /**
   * Add or update widget
   */
  public async updateWidget(widget: DashboardWidget): Promise<void> {
    const widgets = [...this.state.widgets];
    const existingIndex = widgets.findIndex(w => w.id === widget.id);
    
    if (existingIndex >= 0) {
      widgets[existingIndex] = widget;
    } else {
      widgets.push(widget);
    }
    
    this.setState({ widgets });
    await this.saveWidgets(widgets);
    
    this.emit(EVENTS.WIDGET_UPDATED, { widget });
  }

  /**
   * Remove widget
   */
  public async removeWidget(widgetId: string): Promise<void> {
    const widgets = this.state.widgets.filter(w => w.id !== widgetId);
    
    this.setState({ widgets });
    await this.saveWidgets(widgets);
    
    this.emit(EVENTS.WIDGET_REMOVED, { widgetId });
  }

  /**
   * Acknowledge alert
   */
  public async acknowledgeAlert(alertId: string): Promise<void> {
    const alerts = this.state.alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true, acknowledgedAt: new Date() }
        : alert
    );
    
    this.setState({ alerts });
    await this.saveAlerts(alerts);
    
    this.emit(EVENTS.ALERT_ACKNOWLEDGED, { alertId });
  }

  /**
   * Resolve alert
   */
  public async resolveAlert(alertId: string): Promise<void> {
    const alerts = this.state.alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, resolved: true, resolvedAt: new Date() }
        : alert
    );
    
    this.setState({ alerts });
    await this.saveAlerts(alerts);
    
    this.emit(EVENTS.ALERT_RESOLVED, { alertId });
  }

  /**
   * Generate report
   */
  public async generateReport(template: ReportTemplate): Promise<GeneratedReport> {
    try {
      this.emit(EVENTS.REPORT_GENERATION_STARTED, { template });
      
      // Simulate report generation - replace with actual implementation
      const report = await this.createReport(template);
      
      this.emit(EVENTS.REPORT_GENERATED, { report });
      return report;
    } catch (error) {
      this.handleError(error as Error, 'Falha ao gerar relatório');
      throw error;
    }
  }

  /**
   * Export dashboard data
   */
  public async exportData(format: 'csv' | 'json' | 'pdf'): Promise<Blob> {
    try {
      const data = {
        config: this.config,
        state: this.state,
        exportedAt: new Date().toISOString()
      };
      
      switch (format) {
        case 'json':
          return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        case 'csv':
          return await this.exportToCSV(data);
        case 'pdf':
          return await this.exportToPDF(data);
        default:
          throw new Error(`Formato de exportação não suportado: ${format}`);
      }
    } catch (error) {
      this.handleError(error as Error, 'Falha ao exportar dados');
      throw error;
    }
  }

  /**
   * Refresh all data
   */
  public async refreshAll(): Promise<void> {
    this.cache.clear();
    
    await Promise.all([
      this.loadDashboardData(),
      this.loadKPIMetrics(),
      this.loadAlerts(),
      this.loadWidgets()
    ]);
    
    this.emit(EVENTS.DATA_REFRESHED, { timestamp: new Date() });
  }

  /**
   * Start auto-refresh
   */
  public startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    const interval = this.config.refreshInterval || DASHBOARD_CONFIG.REFRESH_INTERVALS.NORMAL;
    
    this.refreshTimer = setInterval(() => {
      this.refreshAll().catch(error => {
        this.handleError(error, 'Falha na atualização automática');
      });
    }, interval);
    
    this.setState({ autoRefresh: true });
    this.emit(EVENTS.AUTO_REFRESH_STARTED, { interval });
  }

  /**
   * Stop auto-refresh
   */
  public stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    this.setState({ autoRefresh: false });
    this.emit(EVENTS.AUTO_REFRESH_STOPPED);
  }

  /**
   * Initialize real-time connection
   */
  private async initializeRealTime(): Promise<void> {
    try {
      const wsUrl = `${API_ENDPOINTS.WEBSOCKET}?clinicId=${this.config.clinicId}&userId=${this.config.userId}`;
      
      this.realTimeConnection = new WebSocket(wsUrl);
      
      this.realTimeConnection.onopen = () => {
        this.setState({ realTimeEnabled: true });
        this.emit(EVENTS.REAL_TIME_CONNECTED);
      };
      
      this.realTimeConnection.onmessage = (event) => {
        try {
          const update: RealTimeUpdate = JSON.parse(event.data);
          this.handleRealTimeUpdate(update);
        } catch (error) {
          console.error('Erro ao processar atualização em tempo real:', error);
        }
      };
      
      this.realTimeConnection.onclose = () => {
        this.setState({ realTimeEnabled: false });
        this.emit(EVENTS.REAL_TIME_DISCONNECTED);
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (this.config.realTimeEnabled) {
            this.initializeRealTime();
          }
        }, 5000);
      };
      
      this.realTimeConnection.onerror = (error) => {
        this.handleError(error as any, 'Erro na conexão em tempo real');
      };
    } catch (error) {
      this.handleError(error as Error, 'Falha ao inicializar conexão em tempo real');
    }
  }

  /**
   * Handle real-time updates
   */
  private handleRealTimeUpdate(update: RealTimeUpdate): void {
    switch (update.type) {
      case 'kpi_update':
        this.updateKPIFromRealTime(update.data);
        break;
      case 'alert_new':
        this.addAlertFromRealTime(update.data);
        break;
      case 'alert_resolved':
        this.resolveAlertFromRealTime(update.data.alertId);
        break;
      case 'data_update':
        this.updateDataFromRealTime(update.data);
        break;
      default:
        console.warn('Tipo de atualização em tempo real desconhecido:', update.type);
    }
  }

  /**
   * Update KPI from real-time data
   */
  private updateKPIFromRealTime(kpiData: any): void {
    const kpis = this.state.kpis.map(kpi => 
      kpi.id === kpiData.id ? { ...kpi, ...kpiData, lastUpdated: new Date() } : kpi
    );
    
    this.setState({ kpis });
    this.emit(EVENTS.KPI_REAL_TIME_UPDATE, { kpi: kpiData });
  }

  /**
   * Add alert from real-time data
   */
  private addAlertFromRealTime(alertData: any): void {
    const alerts = [alertData, ...this.state.alerts];
    
    this.setState({ alerts });
    this.emit(EVENTS.ALERT_REAL_TIME_NEW, { alert: alertData });
  }

  /**
   * Resolve alert from real-time data
   */
  private resolveAlertFromRealTime(alertId: string): void {
    const alerts = this.state.alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, resolved: true, resolvedAt: new Date() }
        : alert
    );
    
    this.setState({ alerts });
    this.emit(EVENTS.ALERT_REAL_TIME_RESOLVED, { alertId });
  }

  /**
   * Update data from real-time
   */
  private updateDataFromRealTime(data: any): void {
    this.setState({ 
      data: { ...this.state.data, ...data },
      lastUpdated: new Date()
    });
    
    this.emit(EVENTS.DATA_REAL_TIME_UPDATE, { data });
  }

  // Mock data generation methods (replace with actual API calls)
  private async fetchDashboardData(): Promise<ExecutiveSummaryData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      keyMetrics: [
        {
          id: 'revenue',
          name: 'Receita Total',
          value: 125000,
          unit: 'R$',
          format: 'currency',
          trend: 'up',
          change: 12.5,
          target: 120000,
          category: 'financial'
        },
        {
          id: 'patients',
          name: 'Pacientes Atendidos',
          value: 450,
          unit: '',
          format: 'number',
          trend: 'up',
          change: 8.2,
          target: 400,
          category: 'operational'
        }
      ],
      insights: [
        {
          id: 'insight-1',
          title: 'Crescimento na Receita',
          description: 'A receita aumentou 12.5% em relação ao mês anterior',
          type: 'positive',
          priority: 'high',
          category: 'financial',
          impact: 'high',
          confidence: 0.95
        }
      ],
      recommendations: [
        {
          id: 'rec-1',
          title: 'Otimizar Agendamentos',
          description: 'Implementar sistema de agendamento inteligente',
          priority: 'high',
          category: 'operational',
          impact: 'medium',
          effort: 'low',
          timeline: '2-4 semanas',
          actions: [
            {
              id: 'action-1',
              title: 'Configurar sistema',
              description: 'Configurar parâmetros do sistema de agendamento',
              assignee: 'TI',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              status: 'pending'
            }
          ]
        }
      ],
      alerts: [],
      achievements: [
        {
          id: 'ach-1',
          title: 'Meta de Receita Atingida',
          description: 'Superamos a meta mensal de receita em 4.2%',
          type: 'milestone',
          date: new Date(),
          category: 'financial',
          impact: 'high'
        }
      ],
      trends: {
        revenue: {
          direction: 'up',
          percentage: 12.5,
          period: 'month',
          forecast: {
            nextPeriod: 135000,
            confidence: 0.85,
            factors: ['Sazonalidade', 'Novos serviços']
          }
        }
      },
      financialSummary: {
        totalRevenue: 125000,
        totalExpenses: 85000,
        netProfit: 40000,
        profitMargin: 32,
        serviceRevenue: [
          {
            serviceId: 'consultation',
            serviceName: 'Consultas',
            revenue: 75000,
            percentage: 60
          }
        ],
        providerRevenue: [
          {
            providerId: 'dr-silva',
            providerName: 'Dr. Silva',
            revenue: 45000,
            percentage: 36
          }
        ]
      },
      operationalSummary: {
        totalAppointments: 450,
        completedAppointments: 425,
        cancelledAppointments: 25,
        noShowRate: 5.6,
        averageWaitTime: 15,
        patientSatisfaction: 4.7,
        utilizationRate: 85
      },
      clinicalSummary: {
        totalPatients: 320,
        newPatients: 45,
        returningPatients: 275,
        averageAge: 42,
        patientDemographics: {
          ageGroups: [
            { range: '0-18', count: 45, percentage: 14 },
            { range: '19-35', count: 95, percentage: 30 },
            { range: '36-50', count: 110, percentage: 34 },
            { range: '51-65', count: 55, percentage: 17 },
            { range: '65+', count: 15, percentage: 5 }
          ],
          genderDistribution: [
            { gender: 'Feminino', count: 185, percentage: 58 },
            { gender: 'Masculino', count: 135, percentage: 42 }
          ]
        },
        topDiagnoses: [
          {
            code: 'Z00.0',
            description: 'Exame médico geral',
            count: 85,
            percentage: 20
          }
        ],
        topProcedures: [
          {
            code: '99213',
            description: 'Consulta de acompanhamento',
            count: 120,
            percentage: 28
          }
        ]
      }
    };
  }

  private async fetchKPIMetrics(): Promise<KPIMetric[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 'revenue-kpi',
        name: 'Receita Mensal',
        value: 125000,
        unit: 'R$',
        format: 'currency',
        category: 'financial',
        trend: 'up',
        status: 'good',
        target: 120000,
        previousValue: 111111,
        lastUpdated: new Date(),
        description: 'Receita total do mês atual'
      },
      {
        id: 'patients-kpi',
        name: 'Pacientes Atendidos',
        value: 450,
        unit: '',
        format: 'number',
        category: 'operational',
        trend: 'up',
        status: 'good',
        target: 400,
        previousValue: 416,
        lastUpdated: new Date(),
        description: 'Total de pacientes atendidos no mês'
      }
    ];
  }

  private async fetchAlerts(): Promise<Alert[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: 'alert-1',
        title: 'Sistema de Backup',
        message: 'Backup automático falhou na última execução',
        severity: 'warning',
        category: 'system',
        source: 'backup-service',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: false,
        resolved: false
      }
    ];
  }

  private async fetchWidgets(): Promise<DashboardWidget[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      {
        id: 'revenue-chart',
        type: 'chart',
        title: 'Receita por Mês',
        position: { x: 0, y: 0, w: 6, h: 4 },
        config: {
          chartType: 'line',
          dataSource: 'revenue-monthly'
        },
        visible: true,
        locked: false,
        resizable: true,
        draggable: true
      }
    ];
  }

  private async saveWidgets(widgets: DashboardWidget[]): Promise<void> {
    saveToLocalStorage(STORAGE_KEYS.WIDGETS, widgets);
  }

  private async saveAlerts(alerts: Alert[]): Promise<void> {
    saveToLocalStorage(STORAGE_KEYS.ALERTS, alerts);
  }

  private async loadSavedState(): Promise<void> {
    const savedWidgets = loadFromLocalStorage(STORAGE_KEYS.WIDGETS);
    const savedAlerts = loadFromLocalStorage(STORAGE_KEYS.ALERTS);
    
    if (savedWidgets) {
      this.setState({ widgets: savedWidgets });
    }
    
    if (savedAlerts) {
      this.setState({ alerts: savedAlerts });
    }
  }

  private async createReport(template: ReportTemplate): Promise<GeneratedReport> {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      id: `report-${Date.now()}`,
      templateId: template.id,
      title: template.name,
      format: template.format,
      data: this.state.data,
      generatedAt: new Date(),
      generatedBy: this.config.userId,
      size: 1024 * 1024, // 1MB
      url: '/api/reports/download/report-123.pdf'
    };
  }

  private async exportToCSV(data: any): Promise<Blob> {
    // Simplified CSV export
    const csv = 'data,value\n' + JSON.stringify(data).replace(/,/g, ';');
    return new Blob([csv], { type: 'text/csv' });
  }

  private async exportToPDF(data: any): Promise<Blob> {
    // Simplified PDF export (would use a PDF library in real implementation)
    const content = JSON.stringify(data, null, 2);
    return new Blob([content], { type: 'application/pdf' });
  }

  private generateCacheKey(prefix: string): string {
    const { clinicId, dateRange, filters } = this.config;
    const filterKey = JSON.stringify(filters);
    const dateKey = `${dateRange.from.getTime()}-${dateRange.to.getTime()}`;
    return `${prefix}-${clinicId}-${dateKey}-${btoa(filterKey)}`;
  }

  private setState(updates: Partial<DashboardState>): void {
    this.state = { ...this.state, ...updates };
    this.emit(EVENTS.STATE_UPDATED, { state: this.state, updates });
  }

  private handleError(error: Error, context: string): void {
    const dashboardError: DashboardError = {
      code: 'DASHBOARD_ERROR',
      message: error.message,
      context,
      timestamp: new Date(),
      stack: error.stack
    };
    
    this.setState({ 
      error: dashboardError,
      isLoading: false
    });
    
    this.errorHandler(dashboardError);
    this.emit(EVENTS.ERROR_OCCURRED, { error: dashboardError });
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Erro no listener do evento ${event}:`, error);
      }
    });
  }

  // Public API methods
  public getState(): DashboardState {
    return { ...this.state };
  }

  public getConfig(): DashboardConfig {
    return { ...this.config };
  }

  public addEventListener(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  public removeEventListener(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  public destroy(): void {
    // Clean up resources
    this.stopAutoRefresh();
    
    if (this.realTimeConnection) {
      this.realTimeConnection.close();
    }
    
    this.eventListeners.clear();
    this.cache.clear();
    
    this.emit(EVENTS.ENGINE_DESTROYED);
  }
}