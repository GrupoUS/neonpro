"use client";

import {
	AlertCircle,
	Download,
	Edit,
	FileText,
	Settings,
	Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../Alert";
import { Button } from "../Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../Card";
import { Input } from "../Input";
import { Label } from "../Label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../Select";
import { Textarea } from "../Textarea";

// ============================================================================
// TYPES
// ============================================================================

type RequestType =
	| "access"
	| "rectification"
	| "erasure"
	| "restriction"
	| "portability"
	| "objection";

type DataSubjectRequest = {
	id: string;
	requestType: RequestType;
	status: "pending" | "processing" | "completed" | "denied";
	requestedAt: string;
	completedAt?: string;
	details?: any;
};

// ============================================================================
// DATA SUBJECT RIGHTS COMPONENT
// ============================================================================

export function DataSubjectRights() {
	const [selectedRequestType, setSelectedRequestType] = useState<
		RequestType | ""
	>("");
	const [requestDetails, setRequestDetails] = useState("");
	const [rectificationField, setRectificationField] = useState("");
	const [rectificationOldValue, setRectificationOldValue] = useState("");
	const [rectificationNewValue, setRectificationNewValue] = useState("");
	const [rectificationReason, setRectificationReason] = useState("");
	const [loading, setLoading] = useState(false);
	const [requests, _setRequests] = useState<DataSubjectRequest[]>([]);

	const requestTypes = [
		{
			value: "access",
			label: "Acesso aos Dados",
			description: "Solicitar acesso a todos os seus dados pessoais",
			icon: <FileText className="h-4 w-4" />,
		},
		{
			value: "rectification",
			label: "Retificação de Dados",
			description: "Solicitar correção de dados incorretos ou incompletos",
			icon: <Edit className="h-4 w-4" />,
		},
		{
			value: "erasure",
			label: "Eliminação de Dados",
			description: "Solicitar a eliminação dos seus dados pessoais",
			icon: <Trash2 className="h-4 w-4" />,
		},
		{
			value: "restriction",
			label: "Limitação do Tratamento",
			description: "Solicitar limitação do processamento dos seus dados",
			icon: <Settings className="h-4 w-4" />,
		},
		{
			value: "portability",
			label: "Portabilidade de Dados",
			description:
				"Solicitar seus dados em formato estruturado e interoperável",
			icon: <Download className="h-4 w-4" />,
		},
		{
			value: "objection",
			label: "Oposição ao Tratamento",
			description: "Opor-se ao tratamento dos seus dados pessoais",
			icon: <AlertCircle className="h-4 w-4" />,
		},
	];

	const submitRequest = async () => {
		if (!selectedRequestType) {
			toast.error("Selecione o tipo de solicitação");
			return;
		}

		setLoading(true);

		try {
			const requestData: any = {
				requestType: selectedRequestType,
				reason: requestDetails,
			};

			// Special handling for rectification requests
			if (selectedRequestType === "rectification") {
				if (
					!(rectificationField && rectificationNewValue && rectificationReason)
				) {
					toast.error("Preencha todos os campos obrigatórios para retificação");
					setLoading(false);
					return;
				}

				requestData.details = {
					field: rectificationField,
					oldValue: rectificationOldValue,
					newValue: rectificationNewValue,
					reason: rectificationReason,
				};
			}

			const response = await fetch("/api/lgpd/data-rights/request", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Falha ao criar solicitação");
			}

			const result = await response.json();

			toast.success(result.message || "Solicitação criada com sucesso");

			// Reset form
			setSelectedRequestType("");
			setRequestDetails("");
			setRectificationField("");
			setRectificationOldValue("");
			setRectificationNewValue("");
			setRectificationReason("");

			// Refresh requests list (would need to implement this)
			// loadUserRequests();
		} catch (_error) {
			toast.error("Erro ao criar solicitação");
		} finally {
			setLoading(false);
		}
	};

	const selectedRequest = requestTypes.find(
		(rt) => rt.value === selectedRequestType,
	);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Direitos do Titular dos Dados - LGPD
					</CardTitle>
					<CardDescription>
						Exerça seus direitos previstos na Lei Geral de Proteção de Dados
						(LGPD)
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Request Type Selection */}
					<div>
						<Label htmlFor="request-type">Tipo de Solicitação</Label>
						<Select
							onValueChange={(value: RequestType) =>
								setSelectedRequestType(value)
							}
							value={selectedRequestType}
						>
							<SelectTrigger>
								<SelectValue placeholder="Selecione o tipo de solicitação" />
							</SelectTrigger>
							<SelectContent>
								{requestTypes.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										<div className="flex items-center gap-2">
											{type.icon}
											<div>
												<div className="font-medium">{type.label}</div>
												<div className="text-gray-500 text-xs">
													{type.description}
												</div>
											</div>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Selected Request Info */}
					{selectedRequest && (
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								<strong>{selectedRequest.label}:</strong>{" "}
								{selectedRequest.description}
							</AlertDescription>
						</Alert>
					)}

					{/* Rectification Specific Fields */}
					{selectedRequestType === "rectification" && (
						<div className="space-y-4 rounded-lg bg-blue-50 p-4">
							<h4 className="font-medium text-blue-900">
								Detalhes da Retificação
							</h4>

							<div>
								<Label htmlFor="rectification-field">
									Campo a ser Corrigido *
								</Label>
								<Input
									id="rectification-field"
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setRectificationField(e.target.value)
									}
									placeholder="Ex: Nome, Email, Telefone..."
									value={rectificationField}
								/>
							</div>

							<div>
								<Label htmlFor="rectification-old-value">Valor Atual</Label>
								<Input
									id="rectification-old-value"
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setRectificationOldValue(e.target.value)
									}
									placeholder="Valor atualmente registrado (opcional)"
									value={rectificationOldValue}
								/>
							</div>

							<div>
								<Label htmlFor="rectification-new-value">Valor Correto *</Label>
								<Input
									id="rectification-new-value"
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setRectificationNewValue(e.target.value)
									}
									placeholder="Valor correto que deve ser registrado"
									value={rectificationNewValue}
								/>
							</div>

							<div>
								<Label htmlFor="rectification-reason">
									Motivo da Correção *
								</Label>
								<Textarea
									id="rectification-reason"
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setRectificationReason(e.target.value)
									}
									placeholder="Explique por que esta correção é necessária..."
									rows={3}
									value={rectificationReason}
								/>
							</div>
						</div>
					)}

					{/* General Request Details */}
					{selectedRequestType && selectedRequestType !== "rectification" && (
						<div>
							<Label htmlFor="request-details">
								Detalhes Adicionais (Opcional)
							</Label>
							<Textarea
								id="request-details"
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setRequestDetails(e.target.value)
								}
								placeholder="Forneça detalhes adicionais sobre sua solicitação..."
								rows={4}
								value={requestDetails}
							/>
						</div>
					)}

					{/* Submit Button */}
					<Button
						className="w-full"
						disabled={loading || !selectedRequestType}
						onClick={submitRequest}
					>
						{loading ? "Enviando..." : "Enviar Solicitação"}
					</Button>

					{/* Important Notes */}
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							<strong>Importante:</strong> Suas solicitações serão processadas
							em até 15 dias úteis, conforme previsto na LGPD. Você receberá
							atualizações sobre o status por email.
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>

			{/* Request History Card (placeholder) */}
			<Card>
				<CardHeader>
					<CardTitle>Histórico de Solicitações</CardTitle>
					<CardDescription>
						Acompanhe o status das suas solicitações anteriores
					</CardDescription>
				</CardHeader>
				<CardContent>
					{requests.length === 0 ? (
						<div className="py-8 text-center text-gray-500">
							<FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
							<p>Nenhuma solicitação encontrada</p>
							<p className="text-sm">
								Suas solicitações aparecerão aqui após serem criadas
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{requests.map((request) => (
								<RequestHistoryCard key={request.id} request={request} />
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// ============================================================================
// REQUEST HISTORY CARD COMPONENT
// ============================================================================

type RequestHistoryCardProps = {
	request: DataSubjectRequest;
};

function RequestHistoryCard({ request }: RequestHistoryCardProps) {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "bg-green-100 text-green-800";
			case "processing":
				return "bg-blue-100 text-blue-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "denied":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "completed":
				return "Concluída";
			case "processing":
				return "Em Processamento";
			case "pending":
				return "Pendente";
			case "denied":
				return "Negada";
			default:
				return status;
		}
	};

	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div>
						<h4 className="font-medium">{request.requestType}</h4>
						<p className="text-gray-600 text-sm">
							Solicitado em:{" "}
							{new Date(request.requestedAt).toLocaleString("pt-BR")}
						</p>
						{request.completedAt && (
							<p className="text-gray-600 text-sm">
								Concluído em:{" "}
								{new Date(request.completedAt).toLocaleString("pt-BR")}
							</p>
						)}
					</div>
					<div
						className={`rounded-full px-2 py-1 font-medium text-xs ${getStatusColor(
							request.status,
						)}`}
					>
						{getStatusLabel(request.status)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
