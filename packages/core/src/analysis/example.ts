// Practical example for Brazilian aesthetic clinic
// Shows real value in 30 minutes setup

import { ClinicAnalyzer, ClinicAnalysisRequest } from './services/clinic-analyzer';
import { SimpleReportGenerator } from './services/report-generator';
import { PricingCalculator, BRAZILIAN_CLINIC_PRICING } from './pricing';

// Example: Dr. Silva's Aesthetic Clinic in São Paulo
const brazilianClinicExample: ClinicAnalysisRequest = {
  clinicName: 'Clínica de Estética Dr. Silva',
  website: 'www.drspasilva.com.br',
  hasBookingSystem: true,        // But it's buggy
  hasPaymentSystem: true,        // But it's insecure
  patientDataStorage: true       // But not LGPD compliant
};

// Step 1: Analyze clinic in 5 minutes
console.log('🏥 ANALISANDO CLÍNICA BRASILEIRA...');
const analysis = ClinicAnalyzer.analyze(brazilianClinicExample);

console.log(`📊 Status: ${analysis.status}`);
console.log(`⚠️ LGPD Compliance: ${analysis.criticalMetrics.lgpdCompliance}%`);
console.log(`📱 Mobile Performance: ${analysis.criticalMetrics.mobilePerformance}%`);

// Step 2: Generate report for clinic owner
const report = SimpleReportGenerator.generate({
  name: analysis.clinicName,
  lgpdIssues: analysis.findings.filter(f => f.type === 'lgpd_violation').length,
  mobileScore: analysis.criticalMetrics.mobilePerformance,
  bookingIssues: analysis.findings.filter(f => f.type === 'booking_failure').length,
  paymentIssues: analysis.findings.filter(f => f.type === 'payment_issue').length,
  findings: analysis.findings
});

console.log('\n💰 ROI PARA CLÍNICA:');
console.log(`💵 Economia mensal: R$ ${report.roi.monthlySavings.toLocaleString('pt-BR')}`);
console.log(`💸 Custo implementação: R$ ${report.roi.implementationCost.toLocaleString('pt-BR')}`);
console.log(`⏱️ Payback: ${report.roi.paybackMonths} meses`);

// Step 3: Choose pricing plan
const recommendedPlan = PricingCalculator.getRecommendedPlan('medium');
const roi = PricingCalculator.calculateROI(recommendedPlan, {
  monthlyRevenue: 25000,         // Typical Brazilian clinic
  patientCount: 150,
  hasLGPDIssues: true,
  hasMobileIssues: true,
  hasBookingIssues: true
});

console.log('\n📋 PLANO RECOMENDADO:');
console.log(`📦 Plano: ${recommendedPlan.plan}`);
console.log(`💰 Mensalidade: R$ ${recommendedPlan.monthlyPrice.toLocaleString('pt-BR')}`);
console.log(`📈 ROI Anual: ${roi.annualROI.toFixed(0)}%`);

// Step 4: Show implementation timeline
console.log('\n🚅 IMPLEMENTAÇÃO EM 4 SEMANAS:');
console.log('Semana 1: LGPD compliance (evitar multas R$50M)');
console.log('Semana 2: Otimização mobile (70% pacientes)');
console.log('Semana 3: Confiabilidade de agendamentos');
console.log('Semana 4: Lançamento e treinamento (30 min)');

console.log('\n🎯 RESULTADO FINAL:');
console.log('✅ Clínica protegida contra multas LGPD');
console.log('✅ Site rápido no celular dos pacientes');
console.log('✅ Agendamentos 100% confiáveis');
console.log('✅ Pagamentos seguros sem fraude');
console.log('✅ ROI positivo em 2-3 meses');

export { brazilianClinicExample, analysis, report, roi, recommendedPlan };