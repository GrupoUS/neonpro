"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, FileText, Info, Lock, Shield, Signature, X } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { PatientConsent, TreatmentPlan } from "@/types/treatments";

// Visual components maintaining NeonPro design
type NeonGradientCardProps = {
	children: React.ReactNode;
	className?: string;
};

const NeonGradientCard = ({ children, className = "" }: NeonGradientCardProps) => (
	<motion.div
		animate={{ opacity: 1, y: 0 }}
		className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-sm ${className}`}
		initial={{ opacity: 0, y: 20 }}
	>
		<div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
		<div className="relative z-10">{children}</div>
	</motion.div>
);

// Props interface
type CosmeticConsentBrazilianProps = {
	treatmentPlan: TreatmentPlan;
	existingConsent?: PatientConsent;
	onConsentGranted?: (consent: Omit<PatientConsent, "id" | "created_at" | "updated_at">) => void;
	onConsentWithdrawn?: (consentId: string, reason: string) => void;
	onConsentUpdated?: (consentId: string, updates: Partial<PatientConsent>) => void;
	mode?: "new" | "view" | "edit";
	showProgress?: boolean;
	className?: string;
};

// Consent form data structure
type ConsentFormData = {
	// Treatment consent
	treatmentConsentGranted: boolean;
	risksUnderstood: boolean;
	alternativesDiscussed: boolean;
	expectationsSet: boolean;

	// LGPD data processing consent
	dataProcessingConsent: boolean;
	photoDocumentationConsent: boolean;
	marketingConsent: boolean;
	researchConsent: boolean;

	// Data retention preferences
	customRetentionPeriod: number;
	crossBorderTransferConsent: boolean;

	// Guardian consent (for minors)
	isMinor: boolean;
	guardianName: string;
	guardianRelationship: string;
	guardianConsent: boolean;

	// Witness information
	witnessRequired: boolean;
	witnessName: string;

	// Digital signature
	patientSignature: string;

	// Additional notes
	additionalNotes: string;
};

export function CosmeticConsentBrazilian({
	treatmentPlan,
	existingConsent,
	onConsentGranted,
	onConsentWithdrawn,
	onConsentUpdated,
	mode = "new",
	showProgress = true,
	className = "",
}: CosmeticConsentBrazilianProps) {
	// State management
	const [activeTab, setActiveTab] = useState("treatment");
	const [formData, setFormData] = useState<ConsentFormData>({
		treatmentConsentGranted: existingConsent?.consent_granted,
		risksUnderstood: existingConsent?.risks_explained,
		alternativesDiscussed: existingConsent?.alternatives_discussed,
		expectationsSet: existingConsent?.realistic_expectations_set,
		dataProcessingConsent: false,
		photoDocumentationConsent: false,
		marketingConsent: false,
		researchConsent: false,
		customRetentionPeriod: existingConsent?.retention_period_days || 2555, // 7 years default
		crossBorderTransferConsent: existingConsent?.cross_border_transfer,
		isMinor: existingConsent?.requires_guardian_consent,
		guardianName: existingConsent?.guardian_name || "",
		guardianRelationship: existingConsent?.guardian_relationship || "",
		guardianConsent: false,
		witnessRequired: existingConsent?.witness_present,
		witnessName: existingConsent?.witness_name || "",
		patientSignature: "",
		additionalNotes: "",
	});

	const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
	const [withdrawalReason, setWithdrawalReason] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Calculate consent completion progress
	const calculateProgress = (): number => {
		const requiredFields = [
			formData.treatmentConsentGranted,
			formData.risksUnderstood,
			formData.alternativesDiscussed,
			formData.expectationsSet,
			formData.dataProcessingConsent,
		];

		const optionalFields = [
			formData.photoDocumentationConsent,
			formData.isMinor ? formData.guardianConsent : true,
			formData.witnessRequired ? formData.witnessName !== "" : true,
			formData.patientSignature !== "",
		];

		const completed = [...requiredFields, ...optionalFields].filter(Boolean).length;
		const total = requiredFields.length + optionalFields.length;

		return (completed / total) * 100;
	};

	// Form handlers
	const updateFormData = (updates: Partial<ConsentFormData>) => {
		setFormData((prev) => ({ ...prev, ...updates }));
	};

	const handleSubmitConsent = async () => {
		if (!onConsentGranted) {
			return;
		}

		setIsSubmitting(true);

		try {
			const consentData: Omit<PatientConsent, "id" | "created_at" | "updated_at"> = {
				patient_id: treatmentPlan.patient_id,
				treatment_plan_id: treatmentPlan.id,
				consent_type: "treatment",
				purpose_description: `Consentimento para ${treatmentPlan.treatment_name} - ${treatmentPlan.description}`,
				data_categories: [
					"dados_pessoais",
					"historico_medico",
					...(formData.photoDocumentationConsent ? ["fotografias_clinicas"] : []),
					...(formData.marketingConsent ? ["dados_marketing"] : []),
				],
				retention_period_days: formData.customRetentionPeriod,
				sharing_with_third_parties: formData.marketingConsent,
				cross_border_transfer: formData.crossBorderTransferConsent,
				informed_consent_provided: formData.treatmentConsentGranted,
				risks_explained: formData.risksUnderstood,
				alternatives_discussed: formData.alternativesDiscussed,
				realistic_expectations_set: formData.expectationsSet,
				consent_granted: formData.treatmentConsentGranted && formData.dataProcessingConsent,
				consent_date: new Date().toISOString(),
				consent_method: "digital",
				witness_present: formData.witnessRequired,
				witness_name: formData.witnessName || null,
				requires_guardian_consent: formData.isMinor,
				guardian_name: formData.guardianName || null,
				guardian_relationship: formData.guardianRelationship || null,
				guardian_consent_date: formData.isMinor && formData.guardianConsent ? new Date().toISOString() : null,
				withdrawal_allowed: true,
				withdrawal_date: null,
				withdrawal_reason: null,
				withdrawal_method: null,
				patient_signature: formData.patientSignature || null,
				professional_signature: null, // To be filled by professional
				electronic_signature_method: "digital_signature",
				ip_address: null, // Would be captured in real implementation
				device_information: null, // Would be captured in real implementation
				created_by: "patient_portal", // Or professional interface
				verified_by: null,
				verification_date: null,
			};

			await onConsentGranted(consentData);
		} catch (_error) {
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleWithdrawConsent = async () => {
		if (!(existingConsent && onConsentWithdrawn && withdrawalReason.trim())) {
			return;
		}

		await onConsentWithdrawn(existingConsent.id, withdrawalReason);
		setShowWithdrawDialog(false);
		setWithdrawalReason("");
	};

	// Render existing consent view
	if (mode === "view" && existingConsent) {
		return (
			<div className={`space-y-6 ${className}`}>
				<NeonGradientCard>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-white">
							<Shield className="h-5 w-5" />
							Consentimento LGPD e CFM - Visualização
						</CardTitle>
						<CardDescription className="text-slate-300">
							Consentimento para {treatmentPlan.treatment_name}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="text-slate-300">Status do Consentimento</Label>
								<div className="flex items-center gap-2">
									{existingConsent.consent_granted ? (
										<CheckCircle className="h-4 w-4 text-green-500" />
									) : (
										<X className="h-4 w-4 text-red-500" />
									)}
									<span className="text-white">{existingConsent.consent_granted ? "Concedido" : "Negado"}</span>
								</div>
							</div>

							<div className="space-y-2">
								<Label className="text-slate-300">Data do Consentimento</Label>
								<p className="text-white">
									{new Date(existingConsent.consent_date).toLocaleDateString("pt-BR", {
										year: "numeric",
										month: "long",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
							</div>
						</div>

						<Separator className="border-slate-600" />

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label className="mb-2 block text-slate-300">Consentimentos Específicos</Label>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										{existingConsent.informed_consent_provided ? (
											<CheckCircle className="h-4 w-4 text-green-500" />
										) : (
											<X className="h-4 w-4 text-red-500" />
										)}
										<span className="text-sm text-white">Consentimento Informado</span>
									</div>
									<div className="flex items-center gap-2">
										{existingConsent.risks_explained ? (
											<CheckCircle className="h-4 w-4 text-green-500" />
										) : (
											<X className="h-4 w-4 text-red-500" />
										)}
										<span className="text-sm text-white">Riscos Explicados</span>
									</div>
									<div className="flex items-center gap-2">
										{existingConsent.alternatives_discussed ? (
											<CheckCircle className="h-4 w-4 text-green-500" />
										) : (
											<X className="h-4 w-4 text-red-500" />
										)}
										<span className="text-sm text-white">Alternativas Discutidas</span>
									</div>
								</div>
							</div>

							<div>
								<Label className="mb-2 block text-slate-300">Dados LGPD</Label>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm text-white">Retenção de Dados</span>
										<span className="text-slate-300 text-sm">{existingConsent.retention_period_days} dias</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-white">Transferência Internacional</span>
										<span className="text-slate-300 text-sm">
											{existingConsent.cross_border_transfer ? "Autorizada" : "Não autorizada"}
										</span>
									</div>
								</div>
							</div>
						</div>

						{existingConsent.withdrawal_allowed && !existingConsent.withdrawal_date && (
							<div className="pt-4">
								<Button className="w-full" onClick={() => setShowWithdrawDialog(true)} variant="outline">
									<X className="mr-2 h-4 w-4" />
									Retirar Consentimento
								</Button>
							</div>
						)}

						{existingConsent.withdrawal_date && (
							<Alert className="border-red-500/50 bg-red-500/10">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription className="text-red-100">
									Consentimento retirado em {new Date(existingConsent.withdrawal_date).toLocaleDateString("pt-BR")}
									{existingConsent.withdrawal_reason && (
										<>
											<br />
											Motivo: {existingConsent.withdrawal_reason}
										</>
									)}
								</AlertDescription>
							</Alert>
						)}
					</CardContent>
				</NeonGradientCard>

				{/* Withdrawal Dialog */}
				<Dialog onOpenChange={setShowWithdrawDialog} open={showWithdrawDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Retirar Consentimento</DialogTitle>
							<DialogDescription>
								Ao retirar o consentimento, o tratamento será interrompido e seus dados serão processados conforme a
								política de retenção LGPD.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="withdrawal-reason">Motivo da Retirada (opcional)</Label>
								<Textarea
									id="withdrawal-reason"
									onChange={(e) => setWithdrawalReason(e.target.value)}
									placeholder="Descreva o motivo para a retirada do consentimento..."
									value={withdrawalReason}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button onClick={() => setShowWithdrawDialog(false)} variant="outline">
								Cancelar
							</Button>
							<Button onClick={handleWithdrawConsent} variant="destructive">
								Confirmar Retirada
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		);
	} // New consent form
	return (
		<div className={`space-y-6 ${className}`}>
			{/* Progress Header */}
			{showProgress && (
				<NeonGradientCard>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-white">
							<Shield className="h-5 w-5" />
							Consentimento LGPD e CFM
						</CardTitle>
						<CardDescription className="text-slate-300">
							Consentimento para {treatmentPlan.treatment_name}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-slate-300 text-sm">Progresso do Consentimento</span>
								<span className="font-medium text-sm text-white">{Math.round(calculateProgress())}% concluído</span>
							</div>
							<Progress className="h-2" value={calculateProgress()} />
						</div>
					</CardContent>
				</NeonGradientCard>
			)}

			{/* Main Consent Form */}
			<Card>
				<CardHeader>
					<CardTitle>Formulário de Consentimento</CardTitle>
					<CardDescription>
						Por favor, leia atentamente e forneça seu consentimento para cada item abaixo.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="treatment">Tratamento</TabsTrigger>
							<TabsTrigger value="lgpd">LGPD</TabsTrigger>
							<TabsTrigger value="guardian">Responsável</TabsTrigger>
							<TabsTrigger value="signature">Assinatura</TabsTrigger>
						</TabsList>

						{/* Treatment Consent Tab */}
						<TabsContent className="space-y-4" value="treatment">
							<Alert>
								<Info className="h-4 w-4" />
								<AlertDescription>
									<strong>Informações sobre o Tratamento:</strong> {treatmentPlan.treatment_name}
									<br />
									<strong>Descrição:</strong> {treatmentPlan.description}
									<br />
									<strong>Sessões Previstas:</strong> {treatmentPlan.expected_sessions}
								</AlertDescription>
							</Alert>

							<div className="space-y-4">
								<div className="flex items-start space-x-2">
									<Checkbox
										aria-describedby="treatment-consent-description"
										checked={formData.treatmentConsentGranted}
										id="treatment-consent"
										onCheckedChange={(checked) =>
											updateFormData({
												treatmentConsentGranted: checked as boolean,
											})
										}
									/>
									<div className="grid gap-1.5 leading-none">
										<Label
											className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="treatment-consent"
										>
											Autorizo a realização do tratamento estético proposto
										</Label>
										<p className="text-muted-foreground text-xs" id="treatment-consent-description">
											Declaro que compreendi a natureza do tratamento e autorizo sua realização.
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-2">
									<Checkbox
										aria-describedby="risks-description"
										checked={formData.risksUnderstood}
										id="risks-understood"
										onCheckedChange={(checked) => updateFormData({ risksUnderstood: checked as boolean })}
									/>
									<div className="grid gap-1.5 leading-none">
										<Label
											className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="risks-understood"
										>
											Compreendi os riscos e possíveis complicações
										</Label>
										<p className="text-muted-foreground text-xs" id="risks-description">
											Todos os riscos, benefícios e possíveis complicações foram explicados e compreendidos.
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-2">
									<Checkbox
										aria-describedby="alternatives-description"
										checked={formData.alternativesDiscussed}
										id="alternatives-discussed"
										onCheckedChange={(checked) =>
											updateFormData({
												alternativesDiscussed: checked as boolean,
											})
										}
									/>
									<div className="grid gap-1.5 leading-none">
										<Label
											className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="alternatives-discussed"
										>
											Alternativas de tratamento foram discutidas
										</Label>
										<p className="text-muted-foreground text-xs" id="alternatives-description">
											Outras opções de tratamento foram apresentadas e suas vantagens/desvantagens explicadas.
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-2">
									<Checkbox
										aria-describedby="expectations-description"
										checked={formData.expectationsSet}
										id="expectations-set"
										onCheckedChange={(checked) => updateFormData({ expectationsSet: checked as boolean })}
									/>
									<div className="grid gap-1.5 leading-none">
										<Label
											className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="expectations-set"
										>
											Expectativas realistas foram estabelecidas
										</Label>
										<p className="text-muted-foreground text-xs" id="expectations-description">
											Compreendo que os resultados podem variar e não há garantia de resultado específico.
										</p>
									</div>
								</div>
							</div>

							<Alert className="border-yellow-500/50 bg-yellow-500/10">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									<strong>Importante:</strong> Este consentimento está em conformidade com as diretrizes do Conselho
									Federal de Medicina (CFM) para procedimentos estéticos.
								</AlertDescription>
							</Alert>
						</TabsContent>

						{/* LGPD Consent Tab */}
						<TabsContent className="space-y-4" value="lgpd">
							<Alert>
								<Lock className="h-4 w-4" />
								<AlertDescription>
									<strong>Lei Geral de Proteção de Dados (LGPD)</strong>
									<br />
									Conforme a Lei nº 13.709/2018, você tem direitos sobre seus dados pessoais.
								</AlertDescription>
							</Alert>

							<div className="space-y-4">
								<div className="flex items-start space-x-2">
									<Checkbox
										aria-describedby="data-processing-description"
										checked={formData.dataProcessingConsent}
										id="data-processing"
										onCheckedChange={(checked) =>
											updateFormData({
												dataProcessingConsent: checked as boolean,
											})
										}
									/>
									<div className="grid gap-1.5 leading-none">
										<Label
											className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="data-processing"
										>
											Autorizo o processamento dos meus dados pessoais *
										</Label>
										<p className="text-muted-foreground text-xs" id="data-processing-description">
											Necessário para realização do tratamento, prontuário médico e acompanhamento clínico.
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-2">
									<Checkbox
										aria-describedby="photo-description"
										checked={formData.photoDocumentationConsent}
										id="photo-documentation"
										onCheckedChange={(checked) =>
											updateFormData({
												photoDocumentationConsent: checked as boolean,
											})
										}
									/>
									<div className="grid gap-1.5 leading-none">
										<Label
											className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="photo-documentation"
										>
											Autorizo documentação fotográfica
										</Label>
										<p className="text-muted-foreground text-xs" id="photo-description">
											Para acompanhamento clínico, com proteção biométrica e anonimização automática.
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-2">
									<Checkbox
										aria-describedby="marketing-description"
										checked={formData.marketingConsent}
										id="marketing-consent"
										onCheckedChange={(checked) => updateFormData({ marketingConsent: checked as boolean })}
									/>
									<div className="grid gap-1.5 leading-none">
										<Label
											className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="marketing-consent"
										>
											Autorizo uso para marketing (opcional)
										</Label>
										<p className="text-muted-foreground text-xs" id="marketing-description">
											Fotos anonimizadas podem ser usadas em materiais educativos e promocionais.
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-2">
									<Checkbox
										aria-describedby="research-description"
										checked={formData.researchConsent}
										id="research-consent"
										onCheckedChange={(checked) => updateFormData({ researchConsent: checked as boolean })}
									/>
									<div className="grid gap-1.5 leading-none">
										<Label
											className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="research-consent"
										>
											Autorizo uso para pesquisa científica (opcional)
										</Label>
										<p className="text-muted-foreground text-xs" id="research-description">
											Dados anonimizados podem contribuir para estudos científicos na área.
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-2">
									<Checkbox
										aria-describedby="cross-border-description"
										checked={formData.crossBorderTransferConsent}
										id="cross-border"
										onCheckedChange={(checked) =>
											updateFormData({
												crossBorderTransferConsent: checked as boolean,
											})
										}
									/>
									<div className="grid gap-1.5 leading-none">
										<Label
											className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="cross-border"
										>
											Autorizo transferência internacional de dados (opcional)
										</Label>
										<p className="text-muted-foreground text-xs" id="cross-border-description">
											Apenas para serviços de nuvem com proteção adequada e certificações de segurança.
										</p>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="retention-period">Período de Retenção de Dados</Label>
								<div className="flex items-center space-x-2">
									<Input
										className="w-32"
										id="retention-period"
										max="3650"
										min="365"
										onChange={(e) =>
											updateFormData({
												customRetentionPeriod: Number.parseInt(e.target.value, 10) || 2555,
											})
										}
										type="number"
										value={formData.customRetentionPeriod}
									/>
									<span className="text-muted-foreground text-sm">dias (padrão: 7 anos)</span>
								</div>
								<p className="text-muted-foreground text-xs">
									Seus dados serão mantidos pelo período especificado, conforme legislação médica brasileira.
								</p>
							</div>

							<Alert className="border-blue-500/50 bg-blue-500/10">
								<Shield className="h-4 w-4" />
								<AlertDescription>
									<strong>Seus Direitos LGPD:</strong> Você pode a qualquer momento acessar, corrigir, excluir ou portar
									seus dados, bem como retirar este consentimento através do nosso portal ou solicitação direta.
								</AlertDescription>
							</Alert>
						</TabsContent>

						{/* Guardian Consent Tab */}
						<TabsContent className="space-y-4" value="guardian">
							<div className="flex items-start space-x-2">
								<Checkbox
									checked={formData.isMinor}
									id="is-minor"
									onCheckedChange={(checked) => updateFormData({ isMinor: checked as boolean })}
								/>
								<div className="grid gap-1.5 leading-none">
									<Label
										className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										htmlFor="is-minor"
									>
										Paciente menor de idade (requer consentimento do responsável)
									</Label>
								</div>
							</div>

							{formData.isMinor && (
								<div className="space-y-4 border-blue-500 border-l-2 pl-6">
									<div className="space-y-2">
										<Label htmlFor="guardian-name">Nome do Responsável Legal *</Label>
										<Input
											id="guardian-name"
											onChange={(e) => updateFormData({ guardianName: e.target.value })}
											placeholder="Nome completo do responsável"
											required
											value={formData.guardianName}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="guardian-relationship">Grau de Parentesco *</Label>
										<Input
											id="guardian-relationship"
											onChange={(e) => updateFormData({ guardianRelationship: e.target.value })}
											placeholder="Ex: Pai, Mãe, Tutor legal"
											required
											value={formData.guardianRelationship}
										/>
									</div>

									<div className="flex items-start space-x-2">
										<Checkbox
											checked={formData.guardianConsent}
											id="guardian-consent"
											onCheckedChange={(checked) => updateFormData({ guardianConsent: checked as boolean })}
										/>
										<div className="grid gap-1.5 leading-none">
											<Label
												className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
												htmlFor="guardian-consent"
											>
												Como responsável legal, autorizo o tratamento proposto *
											</Label>
											<p className="text-muted-foreground text-xs">
												O responsável declara ter compreendido todos os termos e autoriza o tratamento.
											</p>
										</div>
									</div>
								</div>
							)}

							<Separator />

							<div className="flex items-start space-x-2">
								<Checkbox
									checked={formData.witnessRequired}
									id="witness-required"
									onCheckedChange={(checked) => updateFormData({ witnessRequired: checked as boolean })}
								/>
								<div className="grid gap-1.5 leading-none">
									<Label
										className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										htmlFor="witness-required"
									>
										Presença de testemunha (opcional, mas recomendado para procedimentos de alto risco)
									</Label>
								</div>
							</div>

							{formData.witnessRequired && (
								<div className="space-y-2 border-green-500 border-l-2 pl-6">
									<Label htmlFor="witness-name">Nome da Testemunha</Label>
									<Input
										id="witness-name"
										onChange={(e) => updateFormData({ witnessName: e.target.value })}
										placeholder="Nome completo da testemunha"
										value={formData.witnessName}
									/>
									<p className="text-muted-foreground text-xs">
										A testemunha deve estar presente durante a assinatura do consentimento.
									</p>
								</div>
							)}
						</TabsContent>

						{/* Signature Tab */}
						<TabsContent className="space-y-4" value="signature">
							<Alert>
								<Signature className="h-4 w-4" />
								<AlertDescription>
									<strong>Assinatura Digital:</strong> Sua assinatura confirma que leu, compreendeu e concorda com todos
									os termos do consentimento.
								</AlertDescription>
							</Alert>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="additional-notes">Observações Adicionais (opcional)</Label>
									<Textarea
										id="additional-notes"
										onChange={(e) => updateFormData({ additionalNotes: e.target.value })}
										placeholder="Inclua qualquer observação ou solicitação especial..."
										rows={3}
										value={formData.additionalNotes}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="patient-signature">Assinatura Digital do Paciente *</Label>
									<Input
										id="patient-signature"
										onChange={(e) => updateFormData({ patientSignature: e.target.value })}
										placeholder="Digite seu nome completo como assinatura"
										required
										value={formData.patientSignature}
									/>
									<p className="text-muted-foreground text-xs">
										Digite seu nome completo. Esta assinatura digital tem validade legal conforme a legislação
										brasileira.
									</p>
								</div>

								<Alert className="border-green-500/50 bg-green-500/10">
									<CheckCircle className="h-4 w-4" />
									<AlertDescription>
										Ao assinar digitalmente, você confirma que:
										<ul className="mt-2 list-inside list-disc space-y-1">
											<li>Leu e compreendeu todos os termos do consentimento</li>
											<li>Teve oportunidade de fazer perguntas</li>
											<li>Recebeu cópia deste documento</li>
											<li>Concorda voluntariamente com o tratamento</li>
										</ul>
									</AlertDescription>
								</Alert>
							</div>

							{/* Summary and Submit */}
							<div className="space-y-4 border-t pt-4">
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<p className="font-medium">Status dos Consentimentos Obrigatórios:</p>
										<ul className="mt-2 space-y-1">
											<li className="flex items-center gap-2">
												{formData.treatmentConsentGranted ? (
													<CheckCircle className="h-4 w-4 text-green-500" />
												) : (
													<X className="h-4 w-4 text-red-500" />
												)}
												Consentimento para Tratamento
											</li>
											<li className="flex items-center gap-2">
												{formData.dataProcessingConsent ? (
													<CheckCircle className="h-4 w-4 text-green-500" />
												) : (
													<X className="h-4 w-4 text-red-500" />
												)}
												Processamento de Dados LGPD
											</li>
											<li className="flex items-center gap-2">
												{formData.patientSignature.trim() ? (
													<CheckCircle className="h-4 w-4 text-green-500" />
												) : (
													<X className="h-4 w-4 text-red-500" />
												)}
												Assinatura Digital
											</li>
										</ul>
									</div>

									<div>
										<p className="font-medium">Consentimentos Opcionais:</p>
										<ul className="mt-2 space-y-1">
											<li className="flex items-center gap-2">
												{formData.photoDocumentationConsent ? (
													<CheckCircle className="h-4 w-4 text-green-500" />
												) : (
													<X className="h-4 w-4 text-gray-400" />
												)}
												Documentação Fotográfica
											</li>
											<li className="flex items-center gap-2">
												{formData.marketingConsent ? (
													<CheckCircle className="h-4 w-4 text-green-500" />
												) : (
													<X className="h-4 w-4 text-gray-400" />
												)}
												Uso para Marketing
											</li>
											<li className="flex items-center gap-2">
												{formData.researchConsent ? (
													<CheckCircle className="h-4 w-4 text-green-500" />
												) : (
													<X className="h-4 w-4 text-gray-400" />
												)}
												Pesquisa Científica
											</li>
										</ul>
									</div>
								</div>

								<Button
									className="w-full"
									disabled={
										!(
											formData.treatmentConsentGranted &&
											formData.dataProcessingConsent &&
											formData.patientSignature.trim()
										) ||
										isSubmitting ||
										(formData.isMinor && !(formData.guardianConsent && formData.guardianName.trim()))
									}
									onClick={handleSubmitConsent}
									size="lg"
								>
									{isSubmitting ? (
										<>
											<div className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2" />
											Processando Consentimento...
										</>
									) : (
										<>
											<FileText className="mr-2 h-4 w-4" />
											Confirmar Consentimento
										</>
									)}
								</Button>

								<p className="text-center text-muted-foreground text-xs">
									Este documento será arquivado digitalmente com timestamp e assinatura eletrônica conforme as normas
									brasileiras de validade jurídica.
								</p>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}

export default CosmeticConsentBrazilian;
