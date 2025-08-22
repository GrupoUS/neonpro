/**
 * ANVISA Product Registration Component
 * Component for registering and managing ANVISA-compliant products
 */

"use client";

import { AlertTriangle, CheckCircle, Clock, Edit, Package, Plus, Save, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { Alert, AlertDescription } from "../Alert";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card";
import { Input } from "../Input";
import { Label } from "../Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Select";
import { Textarea } from "../Textarea";

type Product = {
	id: string;
	name: string;
	registration_number: string;
	manufacturer: string;
	category: string;
	status: "active" | "pending" | "expired" | "suspended";
	expiry_date: string;
	compliance_score: number;
	created_at: string;
};

type ProductFormData = {
	name: string;
	registration_number: string;
	manufacturer: string;
	category: string;
	description: string;
	expiry_date: string;
	batch_number: string;
	lot_size: number;
};

type ANVISAProductRegistrationProps = {
	clinicId: string;
};

export function ANVISAProductRegistration({ clinicId }: ANVISAProductRegistrationProps) {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [_editingProduct, _setEditingProduct] = useState<string | null>(null);
	const [formData, setFormData] = useState<ProductFormData>({
		name: "",
		registration_number: "",
		manufacturer: "",
		category: "",
		description: "",
		expiry_date: "",
		batch_number: "",
		lot_size: 0,
	});
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/anvisa/products?clinic_id=${clinicId}`);
			if (response.ok) {
				const data = await response.json();
				setProducts(data.data);
			}
		} catch (_error) {
			setError("Erro ao carregar produtos");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		try {
			const payload = {
				...formData,
				clinic_id: clinicId,
				lot_size: Number(formData.lot_size),
			};

			const response = await fetch("/api/anvisa/products", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				setSuccess("Produto registrado com sucesso!");
				setFormData({
					name: "",
					registration_number: "",
					manufacturer: "",
					category: "",
					description: "",
					expiry_date: "",
					batch_number: "",
					lot_size: 0,
				});
				setShowForm(false);
				fetchProducts();
			} else {
				const errorData = await response.json();
				setError(errorData.error || "Erro ao registrar produto");
			}
		} catch (_error) {
			setError("Erro ao registrar produto");
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-500 text-white">Ativo</Badge>;
			case "pending":
				return <Badge variant="outline">Pendente</Badge>;
			case "expired":
				return <Badge variant="destructive">Expirado</Badge>;
			case "suspended":
				return <Badge variant="secondary">Suspenso</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getComplianceColor = (score: number) => {
		if (score >= 90) {
			return "text-green-600";
		}
		if (score >= 75) {
			return "text-blue-600";
		}
		if (score >= 60) {
			return "text-yellow-600";
		}
		return "text-red-600";
	};

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
					<div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[...new Array(6)].map((_, i) => (
						<Card className="animate-pulse" key={i}>
							<CardHeader>
								<div className="h-4 w-32 rounded bg-gray-200" />
								<div className="h-3 w-24 rounded bg-gray-200" />
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="h-3 w-full rounded bg-gray-200" />
								<div className="h-3 w-3/4 rounded bg-gray-200" />
								<div className="h-6 w-16 rounded bg-gray-200" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-bold text-2xl tracking-tight">Registro de Produtos ANVISA</h3>
					<p className="text-muted-foreground">Gerencie produtos estéticos e sua conformidade regulatória</p>
				</div>
				<Button onClick={() => setShowForm(!showForm)}>
					<Plus className="mr-2 h-4 w-4" />
					Registrar Produto
				</Button>
			</div>

			{/* Alerts */}
			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert className="border-green-200 bg-green-50">
					<CheckCircle className="h-4 w-4 text-green-600" />
					<AlertDescription className="text-green-800">{success}</AlertDescription>
				</Alert>
			)}

			{/* Registration Form */}
			{showForm && (
				<Card>
					<CardHeader>
						<CardTitle>Novo Produto</CardTitle>
						<CardDescription>Registre um novo produto estético com conformidade ANVISA</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="name">Nome do Produto</Label>
									<Input
										id="name"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder="Ex: Ácido Hialurônico Restylane"
										required
										value={formData.name}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="registration_number">Número de Registro ANVISA</Label>
									<Input
										id="registration_number"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setFormData({
												...formData,
												registration_number: e.target.value,
											})
										}
										placeholder="Ex: 12345.678.901-2"
										required
										value={formData.registration_number}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="manufacturer">Fabricante</Label>
									<Input
										id="manufacturer"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setFormData({ ...formData, manufacturer: e.target.value })
										}
										placeholder="Ex: Galderma"
										required
										value={formData.manufacturer}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="category">Categoria</Label>
									<Select
										onValueChange={(value: string) => setFormData({ ...formData, category: value })}
										value={formData.category}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione a categoria" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="dermal_filler">Preenchedor Dérmico</SelectItem>
											<SelectItem value="botulinum_toxin">Toxina Botulínica</SelectItem>
											<SelectItem value="laser_equipment">Equipamento a Laser</SelectItem>
											<SelectItem value="topical_treatment">Tratamento Tópico</SelectItem>
											<SelectItem value="medical_device">Dispositivo Médico</SelectItem>
											<SelectItem value="other">Outros</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="batch_number">Número do Lote</Label>
									<Input
										id="batch_number"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setFormData({ ...formData, batch_number: e.target.value })
										}
										placeholder="Ex: LOT123456"
										value={formData.batch_number}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="expiry_date">Data de Validade</Label>
									<Input
										id="expiry_date"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setFormData({ ...formData, expiry_date: e.target.value })
										}
										required
										type="date"
										value={formData.expiry_date}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="lot_size">Quantidade no Lote</Label>
									<Input
										id="lot_size"
										min="1"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setFormData({
												...formData,
												lot_size: Number(e.target.value),
											})
										}
										placeholder="Ex: 50"
										type="number"
										value={formData.lot_size}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Descrição</Label>
								<Textarea
									id="description"
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setFormData({ ...formData, description: e.target.value })
									}
									placeholder="Descrição detalhada do produto, indicações e especificações"
									rows={3}
									value={formData.description}
								/>
							</div>

							<div className="flex justify-end space-x-2">
								<Button onClick={() => setShowForm(false)} type="button" variant="outline">
									<X className="mr-2 h-4 w-4" />
									Cancelar
								</Button>
								<Button type="submit">
									<Save className="mr-2 h-4 w-4" />
									Registrar Produto
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			{/* Products Grid */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{products.map((product) => (
					<Card className="transition-shadow hover:shadow-md" key={product.id}>
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<CardTitle className="text-lg">{product.name}</CardTitle>
									<CardDescription className="text-sm">{product.manufacturer}</CardDescription>
								</div>
								<Button size="sm" variant="ghost">
									<Edit className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">Status:</span>
								{getStatusBadge(product.status)}
							</div>

							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">Registro:</span>
								<span className="font-mono text-sm">{product.registration_number}</span>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">Conformidade:</span>
								<span className={cn("font-semibold text-sm", getComplianceColor(product.compliance_score))}>
									{product.compliance_score}%
								</span>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-sm">Validade:</span>
								<span className="text-sm">{new Date(product.expiry_date).toLocaleDateString("pt-BR")}</span>
							</div>

							<div className="border-t pt-2">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-xs">Categoria: {product.category}</span>
									<div className="flex space-x-1">
										{product.status === "active" && <CheckCircle className="h-4 w-4 text-green-500" />}
										{product.status === "pending" && <Clock className="h-4 w-4 text-yellow-500" />}
										{(product.status === "expired" || product.status === "suspended") && (
											<XCircle className="h-4 w-4 text-red-500" />
										)}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{products.length === 0 && !loading && (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Package className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">Nenhum produto registrado</h3>
						<p className="mb-4 text-center text-muted-foreground">
							Comece registrando seus produtos estéticos para garantir conformidade com a ANVISA
						</p>
						<Button onClick={() => setShowForm(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Registrar Primeiro Produto
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
