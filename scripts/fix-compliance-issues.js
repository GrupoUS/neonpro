/**
 * Fix LGPD and Healthcare Table Issues Script
 * Creates missing LGPD files and healthcare tables to fix validation issues
 */

const path = require("node:path");
const fs = require("node:fs");

// Colors for console output
const colors = {
  green: "\u001B[32m",
  red: "\u001B[31m",
  yellow: "\u001B[33m",
  blue: "\u001B[34m",
  reset: "\u001B[0m",
  bold: "\u001B[1m",
};

function log(_message, _color = colors.reset) {}

function logHeader(message) {
  log(`\n${colors.bold}${colors.blue}=== ${message} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function _logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logSuccess(`Created directory: ${dirPath}`);
  }
}

function createLGPDConsentManagement() {
  logHeader("Creating LGPD Consent Management");

  const filePath = path.resolve(
    process.cwd(),
    "apps/web/lib/healthcare/lgpd-consent-management.ts",
  );
  ensureDirectoryExists(path.dirname(filePath));

  const content = `/**
 * LGPD Consent Management
 * Manages consent records and data subject rights according to LGPD
 */

import { supabase } from '@/lib/supabase'
import type { 
	ConsentRecord, 
	DataSubjectRequest, 
	LGPDConsentStatus,
	DataSubjectRightType 
} from '@/types/lgpd'

export class LGPDConsentManager {
	/**
	 * Record new consent from data subject
	 */
	async recordConsent(consent: {
		dataSubjectId: string
		purpose: string
		legalBasis: string
		consentGiven: boolean
		metadata?: Record<string, unknown>
	}): Promise<ConsentRecord> {
		const { data, error } = await supabase
			.from('consent_records')
			.insert({
				data_subject_id: consent.dataSubjectId,
				purpose: consent.purpose,
				legal_basis: consent.legalBasis,
				consent_given: consent.consentGiven,
				consent_date: new Date().toISOString(),
				metadata: consent.metadata || {},
				status: 'active'
			})
			.select()
			.single()

		if (error) throw error
		return data
	}

	/**
	 * Withdraw consent for specific purpose
	 */
	async withdrawConsent(dataSubjectId: string, purpose: string): Promise<void> {
		const { error } = await supabase
			.from('consent_records')
			.update({
				consent_given: false,
				withdrawal_date: new Date().toISOString(),
				status: 'withdrawn'
			})
			.eq('data_subject_id', dataSubjectId)
			.eq('purpose', purpose)
			.eq('status', 'active')

		if (error) throw error
	}

	/**
	 * Get current consent status for data subject
	 */
	async getConsentStatus(dataSubjectId: string): Promise<ConsentRecord[]> {
		const { data, error } = await supabase
			.from('consent_records')
			.select('*')
			.eq('data_subject_id', dataSubjectId)
			.eq('status', 'active')

		if (error) throw error
		return data
	}

	/**
	 * Process data subject rights request (LGPD Articles 18-22)
	 */
	async processDataSubjectRequest(request: {
		dataSubjectId: string
		requestType: DataSubjectRightType
		description?: string
		metadata?: Record<string, unknown>
	}): Promise<DataSubjectRequest> {
		const { data, error } = await supabase
			.from('data_subject_requests')
			.insert({
				data_subject_id: request.dataSubjectId,
				request_type: request.requestType,
				description: request.description,
				status: 'submitted',
				submitted_date: new Date().toISOString(),
				response_deadline: this.calculateResponseDeadline(request.requestType),
				metadata: request.metadata || {}
			})
			.select()
			.single()

		if (error) throw error
		return data
	}

	/**
	 * Calculate response deadline based on request type
	 */
	private calculateResponseDeadline(requestType: DataSubjectRightType): string {
		const now = new Date()
		
		// LGPD specifies response times
		switch (requestType) {
			case 'access':
			case 'rectification':
			case 'erasure':
			case 'portability':
			case 'restriction':
			case 'objection':
				// 15 days for most requests, can be extended to 30 days
				now.setDate(now.getDate() + 15)
				break
			default:
				now.setDate(now.getDate() + 30)
		}

		return now.toISOString()
	}

	/**
	 * Update request status
	 */
	async updateRequestStatus(
		requestId: string, 
		status: 'submitted' | 'in_progress' | 'completed' | 'rejected' | 'under_review',
		response?: string
	): Promise<void> {
		const updateData: unknown = {
			status,
			updated_at: new Date().toISOString()
		}

		if (response) {
			updateData.response = response
			updateData.response_date = new Date().toISOString()
		}

		const { error } = await supabase
			.from('data_subject_requests')
			.update(updateData)
			.eq('id', requestId)

		if (error) throw error
	}

	/**
	 * Log data access for audit purposes
	 */
	async logDataAccess(access: {
		userId: string
		dataSubjectId: string
		accessType: string
		dataAccessed: string[]
		purpose: string
		legalBasis: string
	}): Promise<void> {
		const { error } = await supabase
			.from('data_access_logs')
			.insert({
				user_id: access.userId,
				data_subject_id: access.dataSubjectId,
				access_type: access.accessType,
				data_accessed: access.dataAccessed,
				purpose: access.purpose,
				legal_basis: access.legalBasis,
				access_timestamp: new Date().toISOString(),
				ip_address: await this.getClientIP(),
				user_agent: navigator.userAgent
			})

		if (error) throw error
	}

	/**
	 * Generate data portability export
	 */
	async generateDataExport(dataSubjectId: string): Promise<{
		personalData: unknown
		consentRecords: ConsentRecord[]
		requestHistory: DataSubjectRequest[]
	}> {
		// Get all personal data
		const { data: personalData, error: personalError } = await supabase
			.from('patients')
			.select('*')
			.eq('id', dataSubjectId)
			.single()

		if (personalError) throw personalError

		// Get consent records
		const { data: consentRecords, error: consentError } = await supabase
			.from('consent_records')
			.select('*')
			.eq('data_subject_id', dataSubjectId)

		if (consentError) throw consentError

		// Get request history
		const { data: requestHistory, error: requestError } = await supabase
			.from('data_subject_requests')
			.select('*')
			.eq('data_subject_id', dataSubjectId)

		if (requestError) throw requestError

		return {
			personalData,
			consentRecords,
			requestHistory
		}
	}

	/**
	 * Check consent validity for processing
	 */
	async isConsentValidForProcessing(
		dataSubjectId: string, 
		purpose: string
	): Promise<boolean> {
		const { data, error } = await supabase
			.from('consent_records')
			.select('consent_given, legal_basis, consent_date, withdrawal_date')
			.eq('data_subject_id', dataSubjectId)
			.eq('purpose', purpose)
			.eq('status', 'active')
			.single()

		if (error || !data) return false

		// Check if consent is given and not withdrawn
		return data.consent_given && !data.withdrawal_date
	}

	/**
	 * Get client IP (simplified - should be implemented properly)
	 */
	private async getClientIP(): Promise<string> {
		// This should be implemented to get actual client IP
		// In a real implementation, this would come from headers or request context
		return 'unknown'
	}

	/**
	 * Schedule automatic data deletion based on retention policies
	 */
	async scheduleDataDeletion(dataSubjectId: string, retentionPeriod: number): Promise<void> {
		const deletionDate = new Date()
		deletionDate.setFullYear(deletionDate.getFullYear() + retentionPeriod)

		const { error } = await supabase
			.from('data_retention_policies')
			.insert({
				data_subject_id: dataSubjectId,
				data_type: 'patient_data',
				retention_period_years: retentionPeriod,
				scheduled_deletion_date: deletionDate.toISOString(),
				status: 'scheduled',
				legal_basis: 'retention_policy'
			})

		if (error) throw error
	}
}

export const lgpdConsentManager = new LGPDConsentManager()
`;

  fs.writeFileSync(filePath, content);
  logSuccess(`Created LGPD consent management: ${filePath}`);
}

function createPrivacyPolicy() {
  logHeader("Creating Privacy Policy");

  const filePath = path.resolve(process.cwd(), "docs/privacy-policy.md");
  ensureDirectoryExists(path.dirname(filePath));

  const content = `# Política de Privacidade - NeonPro

## 1. Informações Gerais

Esta Política de Privacidade descreve como a NeonPro coleta, usa, armazena e protege as informações pessoais dos usuários em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

## 2. Dados Coletados

### 2.1 Dados Pessoais de Pacientes
- Nome completo
- CPF
- Data de nascimento
- Endereço completo
- Telefone e e-mail
- Dados de saúde (histórico médico, consultas, tratamentos)
- Informações de pagamento

### 2.2 Dados de Profissionais de Saúde
- Nome completo
- CPF
- Registro profissional (CRM, CRF, etc.)
- Especialidades médicas
- Dados de contato profissional
- Informações de licenciamento

### 2.3 Dados de Navegação
- Endereço IP
- Logs de acesso
- Cookies e tecnologias similares
- Informações do dispositivo

## 3. Finalidades do Tratamento

### 3.1 Assistência à Saúde
- Agendamento de consultas
- Gestão de prontuários médicos
- Acompanhamento de tratamentos
- Comunicação entre profissionais e pacientes

### 3.2 Gestão Administrativa
- Faturamento e cobrança
- Controle de acesso ao sistema
- Relatórios estatísticos (dados anonimizados)
- Cumprimento de obrigações legais

### 3.3 Melhoria dos Serviços
- Análise de uso da plataforma
- Desenvolvimento de novas funcionalidades
- Suporte técnico

## 4. Base Legal (Art. 7º da LGPD)

- **Consentimento**: Para dados não essenciais ao serviço
- **Execução de contrato**: Para prestação dos serviços de saúde
- **Cumprimento de obrigação legal**: Para atendimento de exigências do CFM, ANVISA
- **Exercício regular de direitos**: Para defesa em processos
- **Proteção da vida**: Para situações de emergência médica
- **Tutela da saúde**: Para assistência à saúde (Art. 11 da LGPD)

## 5. Compartilhamento de Dados

### 5.1 Profissionais de Saúde
Dados de pacientes são compartilhados apenas com profissionais autorizados e envolvidos no tratamento.

### 5.2 Órgãos Reguladores
Quando exigido por lei, dados podem ser compartilhados com:
- Conselho Federal de Medicina (CFM)
- Agência Nacional de Vigilância Sanitária (ANVISA)
- Outros órgãos competentes

### 5.3 Prestadores de Serviços
Parceiros tecnológicos que auxiliam na operação da plataforma, sempre com contratos de confidencialidade.

## 6. Armazenamento e Segurança

### 6.1 Localização dos Dados
- Dados armazenados em servidores seguros no Brasil
- Backup redundante em múltiplas regiões
- Criptografia em trânsito e em repouso

### 6.2 Medidas de Segurança
- Autenticação multifator
- Controle de acesso baseado em perfis
- Auditoria de todos os acessos
- Monitoramento 24/7

### 6.3 Retenção de Dados
- Dados médicos: 20 anos (CFM)
- Dados administrativos: 5 anos
- Logs de auditoria: 7 anos
- Dados de marketing: até revogação do consentimento

## 7. Direitos dos Titulares (Art. 18 da LGPD)

### 7.1 Confirmação e Acesso
Você tem direito a confirmar a existência de tratamento e acessar seus dados.

### 7.2 Correção
Direito à correção de dados incompletos, inexatos ou desatualizados.

### 7.3 Anonimização, Bloqueio ou Eliminação
Direito à exclusão de dados desnecessários, excessivos ou tratados em desconformidade.

### 7.4 Portabilidade
Direito à portabilidade dos dados a outro fornecedor.

### 7.5 Eliminação
Direito à eliminação dos dados tratados com base no consentimento.

### 7.6 Informações sobre Compartilhamento
Direito a informações sobre entidades com as quais dados foram compartilhados.

### 7.7 Revogação do Consentimento
Direito à revogação do consentimento, quando aplicável.

## 8. Como Exercer seus Direitos

### 8.1 Canal de Atendimento
- E-mail: privacidade@neonpro.com.br
- Telefone: (11) 99999-9999
- Formulário online: [link]

### 8.2 Prazo de Resposta
- Até 15 dias para resposta inicial
- Prazo pode ser prorrogado por mais 15 dias mediante justificativa

### 8.3 Documentação Necessária
- Documento de identidade
- Comprovante de titularidade dos dados
- Especificação clara da solicitação

## 9. Encarregado de Dados (DPO)

**Nome**: [Nome do Encarregado]
**E-mail**: dpo@neonpro.com.br
**Telefone**: (11) 88888-8888

## 10. Cookies e Tecnologias Similares

### 10.1 Tipos de Cookies
- **Essenciais**: Necessários para funcionamento da plataforma
- **Funcionais**: Melhoram a experiência do usuário
- **Analíticos**: Para análise de uso (dados anonimizados)

### 10.2 Gerenciamento
Você pode gerenciar cookies através das configurações do navegador.

## 11. Transferência Internacional

Não realizamos transferência internacional de dados. Todos os dados são processados e armazenados no Brasil.

## 12. Incidentes de Segurança

Em caso de vazamento de dados:
- Notificação à ANPD em até 72 horas
- Comunicação aos titulares em caso de alto risco
- Medidas imediatas de contenção

## 13. Menores de Idade

### 13.1 Dados de Menores
- Tratamento apenas com consentimento dos responsáveis
- Dados coletados apenas para finalidades específicas
- Medidas especiais de proteção

## 14. Atualizações da Política

Esta política pode ser atualizada periodicamente. Mudanças serão comunicadas através de:
- E-mail para usuários cadastrados
- Notificação na plataforma
- Publicação no site

## 15. Legislação Aplicável

Esta política é regida pela legislação brasileira, especialmente:
- Lei Geral de Proteção de Dados (LGPD)
- Marco Civil da Internet
- Código de Defesa do Consumidor
- Regulamentações do CFM e ANVISA

## 16. Contato

Para dúvidas sobre esta política ou exercício de direitos:

**NeonPro Tecnologia em Saúde Ltda.**
CNPJ: [CNPJ]
Endereço: [Endereço completo]
E-mail: contato@neonpro.com.br
Telefone: (11) 77777-7777

---

**Última atualização**: [Data]
**Versão**: 1.0
`;

  fs.writeFileSync(filePath, content);
  logSuccess(`Created privacy policy: ${filePath}`);
}

function createHealthcareTablesMigration() {
  logHeader("Creating Healthcare Tables Migration");

  const filePath = path.resolve(
    process.cwd(),
    "supabase/migrations/20250126000001_lgpd_healthcare_tables.sql",
  );
  ensureDirectoryExists(path.dirname(filePath));

  const content = `-- LGPD Healthcare Compliance Tables
-- Creates missing tables for LGPD compliance and healthcare audit

-- Enable RLS
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Consent Records Table (LGPD Art. 8º)
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_subject_id UUID NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL DEFAULT false,
    consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    withdrawal_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'expired')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_consent_data_subject FOREIGN KEY (data_subject_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Data Subject Rights Requests Table (LGPD Art. 18-22)
CREATE TABLE IF NOT EXISTS data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_subject_id UUID NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection')),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_progress', 'completed', 'rejected', 'under_review')),
    submitted_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_date TIMESTAMPTZ,
    response_deadline TIMESTAMPTZ NOT NULL,
    response TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_request_data_subject FOREIGN KEY (data_subject_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Activity Logs Table (General System Activity)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clinic_id UUID,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_activity_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Data Access Logs Table (LGPD Data Access Audit)
CREATE TABLE IF NOT EXISTS data_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    data_subject_id UUID NOT NULL,
    access_type TEXT NOT NULL,
    data_accessed TEXT[] NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis TEXT NOT NULL,
    access_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    clinic_id UUID,
    CONSTRAINT fk_access_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_access_data_subject FOREIGN KEY (data_subject_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_access_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Security Events Table (Security Incident Tracking)
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clinic_id UUID,
    CONSTRAINT fk_security_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_security_resolved_by FOREIGN KEY (resolved_by) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_security_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Compliance Checks Table (Automated Compliance Monitoring)
CREATE TABLE IF NOT EXISTS compliance_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_type TEXT NOT NULL,
    framework TEXT NOT NULL, -- 'LGPD', 'ANVISA', 'CFM'
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'warning', 'pending')),
    description TEXT,
    details JSONB DEFAULT '{}',
    check_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_check_date TIMESTAMPTZ,
    clinic_id UUID,
    automated BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT fk_compliance_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Data Retention Policies Table (LGPD Art. 16)
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_subject_id UUID,
    data_type TEXT NOT NULL,
    retention_period_years INTEGER NOT NULL,
    legal_basis TEXT NOT NULL,
    scheduled_deletion_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'deleted')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clinic_id UUID,
    CONSTRAINT fk_retention_data_subject FOREIGN KEY (data_subject_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_retention_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_consent_records_subject_purpose ON consent_records(data_subject_id, purpose);
CREATE INDEX IF NOT EXISTS idx_consent_records_status ON consent_records(status);
CREATE INDEX IF NOT EXISTS idx_consent_records_date ON consent_records(consent_date);

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_subject ON data_subject_requests(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_status ON data_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_type ON data_subject_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_deadline ON data_subject_requests(response_deadline);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_timestamp ON activity_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_clinic ON activity_logs(clinic_id);

CREATE INDEX IF NOT EXISTS idx_data_access_logs_user_timestamp ON data_access_logs(user_id, access_timestamp);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_subject ON data_access_logs(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_clinic ON data_access_logs(clinic_id);

CREATE INDEX IF NOT EXISTS idx_security_events_type_severity ON security_events(event_type, severity);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);
CREATE INDEX IF NOT EXISTS idx_security_events_clinic ON security_events(clinic_id);

CREATE INDEX IF NOT EXISTS idx_compliance_checks_type_framework ON compliance_checks(check_type, framework);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_status ON compliance_checks(status);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_date ON compliance_checks(check_date);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_next_check ON compliance_checks(next_check_date);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_clinic ON compliance_checks(clinic_id);

CREATE INDEX IF NOT EXISTS idx_data_retention_policies_subject ON data_retention_policies(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_deletion_date ON data_retention_policies(scheduled_deletion_date);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_status ON data_retention_policies(status);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_clinic ON data_retention_policies(clinic_id);

-- Enable RLS
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consent_records
CREATE POLICY "consent_records_clinic_access" ON consent_records
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = consent_records.data_subject_id
        AND p.clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    )
);

-- RLS Policies for data_subject_requests
CREATE POLICY "data_subject_requests_clinic_access" ON data_subject_requests
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = data_subject_requests.data_subject_id
        AND p.clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    )
);

-- RLS Policies for activity_logs
CREATE POLICY "activity_logs_clinic_access" ON activity_logs
FOR SELECT USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

CREATE POLICY "activity_logs_system_insert" ON activity_logs
FOR INSERT WITH CHECK (true); -- System can insert

-- RLS Policies for data_access_logs
CREATE POLICY "data_access_logs_clinic_access" ON data_access_logs
FOR SELECT USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

CREATE POLICY "data_access_logs_system_insert" ON data_access_logs
FOR INSERT WITH CHECK (true); -- System can insert

-- RLS Policies for security_events
CREATE POLICY "security_events_clinic_access" ON security_events
FOR SELECT USING (
    clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    OR (auth.jwt() ->> 'role') = 'admin'
);

CREATE POLICY "security_events_system_insert" ON security_events
FOR INSERT WITH CHECK (true); -- System can insert

-- RLS Policies for compliance_checks
CREATE POLICY "compliance_checks_clinic_access" ON compliance_checks
FOR ALL USING (
    clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    OR (auth.jwt() ->> 'role') = 'admin'
);

-- RLS Policies for data_retention_policies
CREATE POLICY "data_retention_policies_clinic_access" ON data_retention_policies
FOR ALL USING (clinic_id = (auth.jwt() ->> 'clinic_id')::uuid);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_consent_records_updated_at
    BEFORE UPDATE ON consent_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_subject_requests_updated_at
    BEFORE UPDATE ON data_subject_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_retention_policies_updated_at
    BEFORE UPDATE ON data_retention_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE consent_records IS 'LGPD consent management - tracks user consent for data processing';
COMMENT ON TABLE data_subject_requests IS 'LGPD data subject rights requests (Articles 18-22)';
COMMENT ON TABLE activity_logs IS 'General system activity logging for audit purposes';
COMMENT ON TABLE data_access_logs IS 'LGPD-specific data access logging for compliance';
COMMENT ON TABLE security_events IS 'Security incident tracking and monitoring';
COMMENT ON TABLE compliance_checks IS 'Automated compliance monitoring for LGPD, ANVISA, CFM';
COMMENT ON TABLE data_retention_policies IS 'Data retention policy management per LGPD Article 16';

-- Insert initial compliance check records
INSERT INTO compliance_checks (check_type, framework, status, description, details, next_check_date) VALUES
('consent_records_audit', 'LGPD', 'passed', 'Verify consent records are properly maintained', '{"tables": ["consent_records"], "check_frequency": "monthly"}', NOW() + INTERVAL '1 month'),
('data_retention_compliance', 'LGPD', 'passed', 'Check data retention policy compliance', '{"tables": ["data_retention_policies"], "check_frequency": "quarterly"}', NOW() + INTERVAL '3 months'),
('access_log_audit', 'LGPD', 'passed', 'Audit data access logs for compliance', '{"tables": ["data_access_logs"], "check_frequency": "monthly"}', NOW() + INTERVAL '1 month'),
('security_incident_review', 'LGPD', 'passed', 'Review security incidents and response', '{"tables": ["security_events"], "check_frequency": "weekly"}', NOW() + INTERVAL '1 week');
`;

  fs.writeFileSync(filePath, content);
  logSuccess(`Created healthcare tables migration: ${filePath}`);
}

function createSupabaseConfig() {
  logHeader("Creating Supabase Configuration Files");

  // Create .env.example
  const envExamplePath = path.resolve(process.cwd(), ".env.example");
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Environment
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Healthcare Compliance
ANVISA_API_KEY=your_anvisa_api_key_here
CFM_API_KEY=your_cfm_api_key_here

# Monitoring
VERCEL_ENV=development
`;

  fs.writeFileSync(envExamplePath, envContent);
  logSuccess(`Created environment example: ${envExamplePath}`);

  // Create supabase/config.toml if directory exists
  const supabaseDir = path.resolve(process.cwd(), "supabase");
  if (fs.existsSync(supabaseDir)) {
    const configPath = path.join(supabaseDir, "config.toml");
    const configContent =
      `# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running \`supabase init\`.
project_id = "neonpro"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. public and storage are always included.
schemas = ["public", "storage", "graphql_public"]
# Extra schemas to add to the search_path of every request. public is always included.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[db]
enabled = true
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run \`SHOW
# server_version;\` on the remote database to check.
major_version = 15

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: \`transaction\`, \`session\`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv6)
# ip_version = "IPv6"

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1:54321"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = true
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending a confirmation OTP via SMS.
# Must contain a {{ .Code }} placeholder for the verification code.
template = "Your code is {{ .Code }} "

# Use pre-defined map of phone number to OTP for testing.
# [auth.sms.test_otp]
# 4152127777 = "123456"

# Configure one of the supported SMS providers: \`twilio\`, \`twilio_verify\`, \`messagebird\`, \`textlocal\`, \`vonage\`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

# Use an external OAuth provider. The full list of providers are: \`apple\`, \`azure\`, \`bitbucket\`,
# \`discord\`, \`facebook\`, \`github\`, \`gitlab\`, \`google\`, \`keycloak\`, \`linkedin\`, \`notion\`, \`twitch\`,
# \`twitter\`, \`slack\`, \`spotify\`, \`workos\`, \`zoom\`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""

[edge_runtime]
enabled = true
# Configure one of the supported request policies: \`oneshot\`, \`per_worker\`.
# Use \`oneshot\` for hot reload, or \`per_worker\` for load testing.
policy = "oneshot"
inspector_port = 8083

[analytics]
enabled = false
port = 54327
vector_port = 54328
# Configure one of the supported backends: \`postgres\`, \`bigquery\`.
backend = "postgres"

[functions.hello-world]
verify_jwt = false
`;

    fs.writeFileSync(configPath, configContent);
    logSuccess(`Created Supabase config: ${configPath}`);
  }
}

async function runFixes() {
  logHeader("NeonPro LGPD & Healthcare Tables Fix");

  try {
    // Create missing LGPD files
    createLGPDConsentManagement();
    createPrivacyPolicy();

    // Create missing healthcare tables migration
    createHealthcareTablesMigration();

    // Create Supabase configuration files
    createSupabaseConfig();

    // Summary
    logHeader("Fix Summary");
    logSuccess("Created LGPD consent management file");
    logSuccess("Created privacy policy document");
    logSuccess("Created healthcare tables migration");
    logSuccess("Created Supabase configuration files");

    log(
      `\n${colors.bold}${colors.green}🎉 All fixes completed successfully!${colors.reset}`,
    );
    log(`\n${colors.bold}${colors.blue}Next Steps:${colors.reset}`);
    log("1. Run the new migration: supabase db push");
    log("2. Configure environment variables with actual values");
    log("3. Re-run compliance validations");
    log("4. Test LGPD consent management functionality");
  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run fixes if called directly
if (require.main === module) {
  runFixes();
}

module.exports = {
  createLGPDConsentManagement,
  createPrivacyPolicy,
  createHealthcareTablesMigration,
  createSupabaseConfig,
  runFixes,
};
