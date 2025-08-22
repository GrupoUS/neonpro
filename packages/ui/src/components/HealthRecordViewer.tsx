import { Clock, Download, Eye, EyeOff, FileText, Shield } from "lucide-react";
import * as React from "react";
import type { HealthRecordData, PractitionerData } from "../types";
import { cn } from "../utils/cn";
import { formatters } from "../utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

type HealthRecordViewerProps = {
	record: HealthRecordData;
	practitioner?: PractitionerData;
	canEdit?: boolean;
	canDownload?: boolean;
	showSensitiveData?: boolean;
	onEdit?: () => void;
	onDownload?: () => void;
	onToggleSensitive?: () => void;
	onViewDetails?: (section: string) => void;
	className?: string;
};

const HealthRecordViewer = React.forwardRef<HTMLDivElement, HealthRecordViewerProps>(
	(
		{
			record,
			practitioner,
			canEdit = false,
			canDownload = false,
			showSensitiveData = false,
			onEdit,
			onDownload,
			onToggleSensitive,
			onViewDetails,
			className,
			...props
		},
		ref
	) => {
		const [activeTab, setActiveTab] = React.useState("overview");

		const sensitiveFields = ["cpf", "rg", "medicalHistory", "medications", "allergies"];
		const renderSensitiveContent = (content: string, fieldName: string) => {
			if (sensitiveFields.includes(fieldName) && !showSensitiveData) {
				return (
					<div className="flex items-center gap-2 text-muted-foreground">
						<EyeOff className="h-4 w-4" />
						<span>Dados protegidos pela LGPD</span>
						{onToggleSensitive && (
							<Button className="h-auto p-0" onClick={onToggleSensitive} size="sm" variant="link">
								Mostrar
							</Button>
						)}
					</div>
				);
			}
			return content;
		};

		return (
			<div className={cn("space-y-6", className)} ref={ref} {...props}>
				{/* Header */}
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-3">
							<h2 className="font-semibold text-xl">Prontuário Médico</h2>
							<Badge variant="outline">
								<Shield className="mr-1 h-3 w-3" />
								LGPD Protegido
							</Badge>
						</div>

						<div className="flex items-center gap-4 text-muted-foreground text-sm">
							<div className="flex items-center gap-1">
								<Clock className="h-4 w-4" />
								Criado em {formatters.date(record.createdAt)}
							</div>

							{record.lastUpdated && (
								<div className="flex items-center gap-1">
									<Clock className="h-4 w-4" />
									Atualizado em {formatters.relativeTime(record.lastUpdated)}
								</div>
							)}
						</div>
					</div>{" "}
					<div className="flex items-center gap-2">
						{onToggleSensitive && (
							<Button onClick={onToggleSensitive} size="sm" variant="outline">
								{showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								{showSensitiveData ? "Ocultar" : "Mostrar"} Dados Sensíveis
							</Button>
						)}

						{canDownload && onDownload && (
							<Button onClick={onDownload} size="sm" variant="outline">
								<Download className="mr-2 h-4 w-4" />
								Baixar PDF
							</Button>
						)}

						{canEdit && onEdit && (
							<Button onClick={onEdit} size="sm" variant="medical">
								Editar Prontuário
							</Button>
						)}
					</div>
				</div>
				{/* Record Content */}
				<Tabs onValueChange={setActiveTab} value={activeTab}>
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="overview">Visão Geral</TabsTrigger>
						<TabsTrigger value="medical">Histórico Médico</TabsTrigger>
						<TabsTrigger value="procedures">Procedimentos</TabsTrigger>
						<TabsTrigger value="documents">Documentos</TabsTrigger>
					</TabsList>{" "}
					{/* Overview Tab */}
					<TabsContent className="space-y-6" value="overview">
						{/* Patient Basic Info */}
						<div className="rounded-lg border p-6">
							<h3 className="mb-4 font-semibold text-lg">Informações Básicas</h3>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<label className="font-medium text-muted-foreground text-sm">Nome Completo</label>
									<div className="mt-1">{record.patientName}</div>
								</div>

								<div>
									<label className="font-medium text-muted-foreground text-sm">Data de Nascimento</label>
									<div className="mt-1">
										{formatters.date(record.birthDate)} ({formatters.age(record.birthDate)} anos)
									</div>
								</div>

								<div>
									<label className="font-medium text-muted-foreground text-sm">CPF</label>
									<div className="mt-1">{renderSensitiveContent(record.cpf, "cpf")}</div>
								</div>

								<div>
									<label className="font-medium text-muted-foreground text-sm">RG</label>
									<div className="mt-1">{renderSensitiveContent(record.rg, "rg")}</div>
								</div>

								<div>
									<label className="font-medium text-muted-foreground text-sm">Telefone</label>
									<div className="mt-1">{formatters.phone(record.phone)}</div>
								</div>

								<div>
									<label className="font-medium text-muted-foreground text-sm">Email</label>
									<div className="mt-1">{record.email}</div>
								</div>
							</div>
						</div>{" "}
						{/* Emergency Contact */}
						{record.emergencyContact && (
							<div className="rounded-lg border p-6">
								<h3 className="mb-4 font-semibold text-lg">Contato de Emergência</h3>

								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div>
										<label className="font-medium text-muted-foreground text-sm">Nome</label>
										<div className="mt-1">{record.emergencyContact.name}</div>
									</div>

									<div>
										<label className="font-medium text-muted-foreground text-sm">Relação</label>
										<div className="mt-1">{record.emergencyContact.relationship}</div>
									</div>

									<div>
										<label className="font-medium text-muted-foreground text-sm">Telefone</label>
										<div className="mt-1">{formatters.phone(record.emergencyContact.phone)}</div>
									</div>
								</div>
							</div>
						)}
						{/* Responsible Practitioner */}
						{practitioner && (
							<div className="rounded-lg border p-6">
								<h3 className="mb-4 font-semibold text-lg">Profissional Responsável</h3>

								<div className="flex items-center gap-4">
									<Avatar>
										<AvatarImage alt={practitioner.name} src={practitioner.avatar} />
										<AvatarFallback>{formatters.initials(practitioner.name)}</AvatarFallback>
									</Avatar>

									<div>
										<div className="font-medium">{practitioner.name}</div>
										<div className="text-muted-foreground text-sm">{practitioner.specialization}</div>
										<div className="text-muted-foreground text-sm">CRM: {practitioner.crm}</div>
									</div>
								</div>
							</div>
						)}
					</TabsContent>{" "}
					{/* Medical History Tab */}
					<TabsContent className="space-y-6" value="medical">
						{/* Medical History */}
						<div className="rounded-lg border p-6">
							<h3 className="mb-4 font-semibold text-lg">Histórico Médico</h3>

							<div className="space-y-4">
								<div>
									<label className="font-medium text-muted-foreground text-sm">Condições Médicas</label>
									<div className="mt-2">
										{renderSensitiveContent(
											record.medicalHistory?.conditions?.join(", ") || "Nenhuma condição registrada",
											"medicalHistory"
										)}
									</div>
								</div>

								<div>
									<label className="font-medium text-muted-foreground text-sm">Medicamentos em Uso</label>
									<div className="mt-2">
										{renderSensitiveContent(
											record.medications?.join(", ") || "Nenhum medicamento registrado",
											"medications"
										)}
									</div>
								</div>

								<div>
									<label className="font-medium text-muted-foreground text-sm">Alergias</label>
									<div className="mt-2">
										{renderSensitiveContent(record.allergies?.join(", ") || "Nenhuma alergia registrada", "allergies")}
									</div>
								</div>
							</div>
						</div>{" "}
						{/* Previous Procedures */}
						{record.previousProcedures && record.previousProcedures.length > 0 && (
							<div className="rounded-lg border p-6">
								<h3 className="mb-4 font-semibold text-lg">Procedimentos Anteriores</h3>

								<div className="space-y-3">
									{record.previousProcedures.map((procedure, index) => (
										<div className="flex items-center justify-between rounded bg-muted/30 p-3" key={index}>
											<div>
												<div className="font-medium">{procedure.name}</div>
												<div className="text-muted-foreground text-sm">
													{formatters.date(procedure.date)} - {procedure.practitioner}
												</div>
											</div>

											{procedure.status && (
												<Badge variant={procedure.status === "completed" ? "confirmed" : "secondary"}>
													{procedure.status}
												</Badge>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</TabsContent>
					{/* Procedures Tab */}
					<TabsContent className="space-y-6" value="procedures">
						<div className="rounded-lg border p-6">
							<h3 className="mb-4 font-semibold text-lg">Procedimentos Realizados</h3>

							{record.procedures && record.procedures.length > 0 ? (
								<div className="space-y-4">
									{record.procedures.map((procedure, index) => (
										<div className="rounded-lg border p-4" key={index}>
											<div className="flex items-start justify-between">
												<div className="space-y-2">
													<div className="font-medium">{procedure.name}</div>
													<div className="text-muted-foreground text-sm">
														{formatters.date(procedure.date)} às {procedure.time}
													</div>
													{procedure.notes && <div className="text-sm">{procedure.notes}</div>}
												</div>{" "}
												<div className="flex items-center gap-2">
													<Badge variant={procedure.status === "completed" ? "confirmed" : "default"}>
														{procedure.status}
													</Badge>

													{onViewDetails && (
														<Button onClick={() => onViewDetails(`procedure-${index}`)} size="sm" variant="outline">
															Ver Detalhes
														</Button>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="py-8 text-center text-muted-foreground">Nenhum procedimento registrado</div>
							)}
						</div>
					</TabsContent>
					{/* Documents Tab */}
					<TabsContent className="space-y-6" value="documents">
						<div className="rounded-lg border p-6">
							<h3 className="mb-4 font-semibold text-lg">Documentos</h3>

							{record.documents && record.documents.length > 0 ? (
								<div className="space-y-3">
									{record.documents.map((document, index) => (
										<div className="flex items-center justify-between rounded border p-3" key={index}>
											<div className="flex items-center gap-3">
												<FileText className="h-5 w-5 text-muted-foreground" />
												<div>
													<div className="font-medium">{document.name}</div>
													<div className="text-muted-foreground text-sm">
														{document.type} - {formatters.date(document.uploadDate)}
													</div>
												</div>
											</div>

											<div className="flex items-center gap-2">
												<Badge variant="outline">{document.size}</Badge>
												<Button onClick={() => document.onDownload?.(document.id)} size="sm" variant="outline">
													<Download className="h-4 w-4" />
												</Button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="py-8 text-center text-muted-foreground">Nenhum documento anexado</div>
							)}
						</div>
					</TabsContent>
				</Tabs>{" "}
				{/* LGPD Compliance Notice */}
				<div className="rounded-lg border bg-muted/30 p-4">
					<div className="flex items-start gap-3">
						<Shield className="mt-0.5 h-5 w-5 text-blue-600" />
						<div className="space-y-1">
							<div className="font-medium">Proteção de Dados - LGPD</div>
							<div className="text-muted-foreground text-sm">
								Este prontuário contém dados pessoais sensíveis protegidos pela Lei Geral de Proteção de Dados (LGPD). O
								acesso e tratamento destes dados são registrados e auditados para garantir a segurança e privacidade do
								paciente.
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
);

HealthRecordViewer.displayName = "HealthRecordViewer";

export { HealthRecordViewer };
export type { HealthRecordViewerProps };
