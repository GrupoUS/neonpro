#!/usr/bin/env node

/**
 * 📊 Performance Dashboard Generator
 * Creates HTML performance reports from Core Web Vitals data
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class PerformanceDashboard {
  constructor(apiUrl) {
    this.apiUrl = apiUrl || process.env.DEPLOYMENT_URL || 'localhost:3000';
    this.reportPath = path.join(__dirname, '../reports');
  }

  async generateReport() {
    console.log('📊 Generating Performance Report...');
    
    try {
      // Fetch dashboard data from API
      const data = await this.fetchDashboardData();
      
      // Generate HTML report
      const htmlReport = this.generateHTMLReport(data);
      
      // Save report
      const reportFile = this.saveReport(htmlReport);
      
      console.log(`✅ Report generated: ${reportFile}`);
      
      return reportFile;
      
    } catch (error) {
      console.error('❌ Failed to generate report:', error.message);
      throw error;
    }
  }

  async fetchDashboardData() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.apiUrl,
        port: this.apiUrl.includes('localhost') ? 3000 : 443,
        path: '/api/analytics/web-vitals/dashboard',
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      const protocol = this.apiUrl.includes('localhost') ? require('http') : require('https');
      
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  generateHTMLReport(data) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeonPro - Performance Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1em; }
        .performance-score {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            text-align: center;
        }
        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
            font-weight: bold;
            color: white;
        }
        .score-a { background: #10b981; }
        .score-b { background: #f59e0b; }
        .score-c { background: #ef4444; }
        .score-d { background: #dc2626; }
        .score-f { background: #7f1d1d; }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .metric-title {
            font-size: 0.9em;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .metric-good { color: #10b981; }
        .metric-warning { color: #f59e0b; }
        .metric-poor { color: #ef4444; }
        .metric-subtitle {
            font-size: 0.85em;
            color: #6b7280;
        }
        .healthcare-section {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
        }
        .healthcare-section h3 {
            color: #92400e;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .summary-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-number {
            font-size: 1.5em;
            font-weight: bold;
            color: #4f46e5;
        }
        .footer {
            background: white;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 0.9em;
        }
        .alert {
            background: #fee2e2;
            border: 1px solid #fca5a5;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            color: #991b1b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 NeonPro Performance Dashboard</h1>
            <p>Gerado em: ${new Date(data.generatedAt).toLocaleString('pt-BR')}</p>
            <p>Período: ${data.timeRange || '24h'} • ${data.summary.totalSessions} sessões • ${data.summary.totalMetrics} métricas</p>
        </div>

        <div class="performance-score">
            <div class="score-circle score-${data.performanceGrade.grade.toLowerCase()}">
                ${data.performanceGrade.grade}
            </div>
            <h2>Performance Score: ${data.performanceGrade.score}/100</h2>
            <p>${data.performanceGrade.goodMetrics} de ${data.performanceGrade.totalMetrics} Core Web Vitals dentro do ideal</p>
        </div>

        ${data.healthcareMetrics && data.healthcareMetrics.count > 0 ? `
        <div class="healthcare-section">
            <h3>🏥 Métricas de Saúde - Conformidade LGPD</h3>
            <p><strong>Status:</strong> ${data.healthcareMetrics.complianceStatus === 'compliant' ? '✅ Conforme' : '⚠️ Requer Atenção'}</p>
            <p><strong>Tempo Médio de Resposta:</strong> ${data.healthcareMetrics.averageResponseTime}ms (limite: ${data.healthcareMetrics.complianceThreshold}ms)</p>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-number">${data.healthcareMetrics.patientViews}</div>
                    <div>Visualizações de Pacientes</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number">${data.healthcareMetrics.appointmentViews}</div>
                    <div>Visualizações de Consultas</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number">${data.healthcareMetrics.medicalRecordViews}</div>
                    <div>Visualizações de Prontuários</div>
                </div>
            </div>
        </div>
        ` : ''}

        <h2>📊 Core Web Vitals</h2>
        <div class="metrics-grid">
            ${this.generateMetricCards(data.coreWebVitals)}
        </div>

        <h2>📈 Resumo da Sessão</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-number">${data.summary.totalSessions}</div>
                <div>Sessões Únicas</div>
            </div>
            <div class="summary-item">
                <div class="summary-number">${data.summary.uniqueUsers || 0}</div>
                <div>Usuários Únicos</div>
            </div>
            <div class="summary-item">
                <div class="summary-number">${data.summary.totalMetrics}</div>
                <div>Total de Métricas</div>
            </div>
        </div>

        ${data.urlBreakdown && data.urlBreakdown.length > 0 ? `
        <h2>🔗 Performance por Página</h2>
        <div style="background: white; border-radius: 12px; padding: 20px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #e5e7eb;">
                        <th style="text-align: left; padding: 10px; color: #6b7280;">URL</th>
                        <th style="text-align: right; padding: 10px; color: #6b7280;">Métricas</th>
                        <th style="text-align: right; padding: 10px; color: #6b7280;">Sessões</th>
                        <th style="text-align: right; padding: 10px; color: #6b7280;">Perf. Média</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.urlBreakdown.slice(0, 10).map(url => `
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                        <td style="padding: 10px; font-family: monospace; font-size: 0.9em;">${url.url}</td>
                        <td style="padding: 10px; text-align: right;">${url.metrics}</td>
                        <td style="padding: 10px; text-align: right;">${url.sessions}</td>
                        <td style="padding: 10px; text-align: right;">${url.avgPerformance}ms</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="footer">
            <p>📊 Dashboard gerado automaticamente pelo sistema de monitoramento NeonPro</p>
            <p>Para relatórios em tempo real, acesse: ${this.apiUrl}/api/analytics/web-vitals/dashboard</p>
        </div>
    </div>
</body>
</html>`;
  }

  generateMetricCards(vitals) {
    const metrics = [
      { key: 'LCP', name: 'Largest Contentful Paint', unit: 'ms', good: 2500, poor: 4000 },
      { key: 'FID', name: 'First Input Delay', unit: 'ms', good: 100, poor: 300 },
      { key: 'CLS', name: 'Cumulative Layout Shift', unit: '', good: 0.1, poor: 0.25 },
      { key: 'FCP', name: 'First Contentful Paint', unit: 'ms', good: 1800, poor: 3000 },
      { key: 'TTFB', name: 'Time to First Byte', unit: 'ms', good: 800, poor: 1800 }
    ];

    return metrics.map(metric => {
      const data = vitals[metric.key];
      if (!data || data.count === 0) {
        return `
        <div class="metric-card">
            <div class="metric-title">${metric.name}</div>
            <div class="metric-value" style="color: #9ca3af;">N/A</div>
            <div class="metric-subtitle">Sem dados</div>
        </div>`;
      }

      let cssClass = 'metric-good';
      if (data.p75 > metric.poor) cssClass = 'metric-poor';
      else if (data.p75 > metric.good) cssClass = 'metric-warning';

      return `
        <div class="metric-card">
            <div class="metric-title">${metric.name} (${metric.key})</div>
            <div class="metric-value ${cssClass}">${data.p75}${metric.unit}</div>
            <div class="metric-subtitle">P75 • ${data.count} amostras</div>
        </div>`;
    }).join('');
  }

  saveReport(htmlContent) {
    if (!fs.existsSync(this.reportPath)) {
      fs.mkdirSync(this.reportPath, { recursive: true });
    }

    const filename = `performance-report-${new Date().toISOString().split('T')[0]}-${Date.now()}.html`;
    const filePath = path.join(this.reportPath, filename);
    
    fs.writeFileSync(filePath, htmlContent);
    
    return filePath;
  }
}

// CLI usage
if (require.main === module) {
  const apiUrl = process.argv[2] || process.env.DEPLOYMENT_URL;
  const dashboard = new PerformanceDashboard(apiUrl);
  
  dashboard.generateReport()
    .then(reportFile => {
      console.log(`🎉 Performance report ready: ${reportFile}`);
      console.log('Open the HTML file in your browser to view the report');
    })
    .catch(error => {
      console.error('Failed to generate report:', error);
      process.exit(1);
    });
}

module.exports = PerformanceDashboard;