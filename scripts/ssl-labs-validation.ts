#!/usr/bin/env bun
/**
 * SSL Labs Validation Script
 * Automated SSL Labs API integration to validate A+ security rating
 */

import { writeFile } from 'fs/promises';

interface SSLLabsResult {
  host: string;
  port: number;
  protocol: string;
  isPublic: boolean;
  status: string;
  startTime: number;
  testTime: number;
  engineVersion: string;
  criteriaVersion: string;
  endpoints: SSLLabsEndpoint[];
}

interface SSLLabsEndpoint {
  ipAddress: string;
  serverName: string;
  statusMessage: string;
  grade: string;
  gradeTrustIgnored: string;
  hasWarnings: boolean;
  isExceptional: boolean;
  progress: number;
  duration: number;
  eta: number;
  delegation: number;
  details: SSLLabsDetails;
}

interface SSLLabsDetails {
  hostStartTime: number;
  certChains: any[];
  protocols: SSLLabsProtocol[];
  suites: SSLLabsSuite[];
  serverSignature: string;
  prefixDelegation: boolean;
  nonPrefixDelegation: boolean;
  vulnBeast: boolean;
  renegSupport: number;
  stsResponseHeader: string;
  stsMaxAge: number;
  stsSubdomains: boolean;
  pkpResponseHeader: string;
  sessionResumption: number;
  compressionMethods: number;
  supportsNpn: boolean;
  npnProtocols: string;
  supportsAlpn: boolean;
  alpnProtocols: string;
  sessionTickets: number;
  ocspStapling: boolean;
  staplingRevocationStatus: number;
  staplingRevocationErrorMessage: string;
  sniRequired: boolean;
  httpStatusCode: number;
  httpForwarding: string;
  supportsRc4: boolean;
  rc4WithModern: boolean;
  rc4Only: boolean;
  forwardSecrecy: number;
  protocolIntolerance: number;
  miscIntolerance: number;
  sims: SSLLabsSimulation[];
  heartbleed: boolean;
  heartbeat: boolean;
  openSslCcs: number;
  openSSLLuckyMinus20: number;
  poodle: boolean;
  poodleTls: number;
  fallbackScsv: boolean;
  freak: boolean;
  logjam: boolean;
  chaCha20Preference: boolean;
}

interface SSLLabsProtocol {
  id: number;
  name: string;
  version: string;
  v2SuitesDisabled: boolean;
  q: number;
}

interface SSLLabsSuite {
  id: number;
  name: string;
  cipherStrength: number;
  keyAlg: string;
  keySize: number;
  keyStrength: number;
  nameAlg: string;
  namedGroupBits: number;
  namedGroupId: number;
  namedGroupName: string;
  q: number;
}

interface SSLLabsSimulation {
  client: {
    id: number;
    name: string;
    platform: string;
    version: string;
    isReference: boolean;
  };
  errorCode: number;
  attempts: number;
  protocolId: number;
  suiteId: number;
  suiteName: string;
  kxInfo: string;
  serverSignature: string;
  alertType: number;
  alertCode: number;
  warnings: number;
}

class SSLLabsValidator {
  private readonly apiUrl = 'https://api.ssllabs.com/api/v3';
  private readonly maxRetries = 30;
  private readonly retryDelay = 30000; // 30 seconds

  async validateDomain(host: string, publish: boolean = false): Promise<SSLLabsResult> {
    console.log(`🔍 Starting SSL Labs analysis for ${host}...`);
    
    // Start the analysis
    const startResult = await this.startAnalysis(host, publish);
    console.log(`📊 Analysis started. Status: ${startResult.status}`);
    
    // Poll for results
    let result = startResult;
    let retries = 0;
    
    while (result.status !== 'READY' && retries < this.maxRetries) {
      console.log(`⏳ Waiting for analysis to complete... (${retries + 1}/${this.maxRetries})`);
      await this.sleep(this.retryDelay);
      
      result = await this.getAnalysisResult(host);
      retries++;
      
      if (result.status === 'ERROR') {
        throw new Error(`SSL Labs analysis failed for ${host}`);
      }
    }
    
    if (result.status !== 'READY') {
      throw new Error(`SSL Labs analysis timed out for ${host}`);
    }
    
    console.log(`✅ Analysis completed for ${host}`);
    return result;
  }

  private async startAnalysis(host: string, publish: boolean): Promise<SSLLabsResult> {
    const url = `${this.apiUrl}/analyze?host=${encodeURIComponent(host)}&publish=${publish ? 'on' : 'off'}&startNew=on&all=done`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SSL Labs API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async getAnalysisResult(host: string): Promise<SSLLabsResult> {
    const url = `${this.apiUrl}/analyze?host=${encodeURIComponent(host)}&all=done`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SSL Labs API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport(result: SSLLabsResult): string {
    const report = [];
    report.push(`# SSL Labs Security Report for ${result.host}`);
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push('');
    
    report.push('## Overall Results');
    report.push(`- Host: ${result.host}:${result.port}`);
    report.push(`- Status: ${result.status}`);
    report.push(`- Test Duration: ${Math.round(result.testTime / 1000)}s`);
    report.push('');
    
    result.endpoints.forEach((endpoint, index) => {
      report.push(`## Endpoint ${index + 1}: ${endpoint.ipAddress}`);
      report.push(`- **Grade: ${endpoint.grade}**`);
      report.push(`- Grade (Trust Ignored): ${endpoint.gradeTrustIgnored}`);
      report.push(`- Has Warnings: ${endpoint.hasWarnings ? '⚠️ Yes' : '✅ No'}`);
      report.push(`- Is Exceptional: ${endpoint.isExceptional ? '🌟 Yes' : 'No'}`);
      report.push('');
      
      if (endpoint.details) {
        const details = endpoint.details;
        
        report.push('### Security Features');
        report.push(`- HSTS: ${details.stsResponseHeader ? '✅ Enabled' : '❌ Disabled'}`);
        if (details.stsMaxAge) {
          report.push(`  - Max Age: ${details.stsMaxAge} seconds`);
          report.push(`  - Include Subdomains: ${details.stsSubdomains ? '✅ Yes' : '❌ No'}`);
        }
        report.push(`- OCSP Stapling: ${details.ocspStapling ? '✅ Enabled' : '❌ Disabled'}`);
        report.push(`- Forward Secrecy: ${this.getForwardSecrecyStatus(details.forwardSecrecy)}`);
        report.push(`- Session Resumption: ${this.getSessionResumptionStatus(details.sessionResumption)}`);
        report.push('');
        
        report.push('### Vulnerabilities');
        report.push(`- Heartbleed: ${details.heartbleed ? '❌ Vulnerable' : '✅ Not Vulnerable'}`);
        report.push(`- POODLE (SSL): ${details.poodle ? '❌ Vulnerable' : '✅ Not Vulnerable'}`);
        report.push(`- FREAK: ${details.freak ? '❌ Vulnerable' : '✅ Not Vulnerable'}`);
        report.push(`- Logjam: ${details.logjam ? '❌ Vulnerable' : '✅ Not Vulnerable'}`);
        report.push(`- RC4 Support: ${details.supportsRc4 ? '❌ Supported' : '✅ Not Supported'}`);
        report.push('');
        
        if (details.protocols && details.protocols.length > 0) {
          report.push('### Supported Protocols');
          details.protocols.forEach(protocol => {
            report.push(`- ${protocol.name} ${protocol.version}`);
          });
          report.push('');
        }
        
        if (details.suites && details.suites.length > 0) {
          report.push('### Cipher Suites (Top 10)');
          details.suites.slice(0, 10).forEach(suite => {
            report.push(`- ${suite.name} (${suite.cipherStrength}-bit)`);
          });
          report.push('');
        }
      }
    });
    
    return report.join('\n');
  }

  private getForwardSecrecyStatus(fs: number): string {
    switch (fs) {
      case 0: return '❌ Not Supported';
      case 1: return '⚠️ With Some Browsers';
      case 2: return '⚠️ With Modern Browsers';
      case 4: return '✅ Yes (All)';
      default: return `Unknown (${fs})`;
    }
  }

  private getSessionResumptionStatus(sr: number): string {
    switch (sr) {
      case 0: return '❌ Not Supported';
      case 1: return '✅ Session IDs';
      case 2: return '✅ Session Tickets';
      case 3: return '✅ Both Session IDs and Tickets';
      default: return `Unknown (${sr})`;
    }
  }

  validateGrade(result: SSLLabsResult, requiredGrade: string = 'A+'): boolean {
    const gradeOrder = ['F', 'T', 'E', 'D', 'C', 'B', 'A-', 'A', 'A+'];
    const requiredIndex = gradeOrder.indexOf(requiredGrade);
    
    if (requiredIndex === -1) {
      throw new Error(`Invalid required grade: ${requiredGrade}`);
    }
    
    return result.endpoints.every(endpoint => {
      const gradeIndex = gradeOrder.indexOf(endpoint.grade);
      return gradeIndex >= requiredIndex;
    });
  }
}

async function main() {
  const domains = [
    'neonpro.com',
    'api.neonpro.com',
    'staging.neonpro.com'
  ];
  
  const validator = new SSLLabsValidator();
  const results: { [key: string]: SSLLabsResult } = {};
  const reports: { [key: string]: string } = {};
  
  console.log('🚀 Starting SSL Labs validation for NeonPro domains...\n');
  
  for (const domain of domains) {
    try {
      console.log(`\n📋 Validating ${domain}...`);
      const result = await validator.validateDomain(domain, false);
      results[domain] = result;
      
      const report = validator.generateReport(result);
      reports[domain] = report;
      
      const isAPlus = validator.validateGrade(result, 'A+');
      console.log(`${domain}: ${isAPlus ? '✅ A+ Grade Achieved' : '❌ A+ Grade Not Achieved'}`);
      
      // Save individual report
      await writeFile(`ssl-labs-report-${domain.replace(/\./g, '-')}.md`, report);
      
    } catch (error) {
      console.error(`❌ Error validating ${domain}:`, error);
      results[domain] = null as any;
    }
  }
  
  // Generate summary report
  const summaryReport = [];
  summaryReport.push('# SSL Labs Validation Summary');
  summaryReport.push(`Generated: ${new Date().toISOString()}`);
  summaryReport.push('');
  
  summaryReport.push('## Results Overview');
  for (const domain of domains) {
    const result = results[domain];
    if (result) {
      const grades = result.endpoints.map(e => e.grade).join(', ');
      const isAPlus = validator.validateGrade(result, 'A+');
      summaryReport.push(`- **${domain}**: ${grades} ${isAPlus ? '✅' : '❌'}`);
    } else {
      summaryReport.push(`- **${domain}**: ❌ Analysis Failed`);
    }
  }
  summaryReport.push('');
  
  summaryReport.push('## Healthcare Compliance Status');
  for (const domain of domains) {
    const result = results[domain];
    if (result && result.endpoints.length > 0) {
      const endpoint = result.endpoints[0];
      const isCompliant = endpoint.grade === 'A+' && !endpoint.hasWarnings;
      summaryReport.push(`- **${domain}**: ${isCompliant ? '✅ Healthcare Ready' : '⚠️ Needs Attention'}`);
    }
  }
  summaryReport.push('');
  
  summaryReport.push('## Recommendations');
  summaryReport.push('- Ensure all domains achieve A+ rating');
  summaryReport.push('- Enable HSTS with includeSubDomains and preload');
  summaryReport.push('- Implement OCSP stapling for all certificates');
  summaryReport.push('- Disable support for weak cipher suites');
  summaryReport.push('- Regular monitoring and certificate renewal');
  
  await writeFile('ssl-labs-summary.md', summaryReport.join('\n'));
  
  console.log('\n📊 SSL Labs validation completed!');
  console.log('📄 Reports saved:');
  console.log('  - ssl-labs-summary.md');
  for (const domain of domains) {
    if (results[domain]) {
      console.log(`  - ssl-labs-report-${domain.replace(/\./g, '-')}.md`);
    }
  }
}

// Run the validation if this script is executed directly
if (import.meta.main) {
  main().catch(console.error);
}

export { SSLLabsValidator };
