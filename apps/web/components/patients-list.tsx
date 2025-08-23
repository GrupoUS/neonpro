/**
 * 👥 Patients List - NeonPro Healthcare
 * ===================================
 *
 * Main patients list with search, filters,
 * and role-based actions.
 */

"use client";

import { Link, useSearch } from "@tanstack/react-router";
import { Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PatientsList() {
	const search = useSearch({ from: "/patients" });

	// Mock data - replace with actual data fetching
	const patients = [
		{
			id: "1",
			name: "Ana Silva",
			email: "ana.silva@email.com",
			phone: "(11) 99999-9999",
			status: "active",
			lastVisit: "2024-01-15",
			treatments: 3,
		},
		{
			id: "2",
			name: "Maria Santos",
			email: "maria.santos@email.com",
			phone: "(11) 88888-8888",
			status: "active",
			lastVisit: "2024-01-10",
			treatments: 1,
		},
		{
			id: "3",
			name: "João Oliveira",
			email: "joao.oliveira@email.com",
			phone: "(11) 77777-7777",
			status: "inactive",
			lastVisit: "2023-12-20",
			treatments: 5,
		},
	];

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
			case "inactive":
				return <Badge variant="secondary">Inativo</Badge>;
			case "pending":
				return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Pacientes</h1>
					<p className="text-muted-foreground">Gerencie seus pacientes e prontuários</p>
				</div>
				<Button asChild>
					<Link to="/patients/new">
						<Plus className="mr-2 h-4 w-4" />
						Novo Paciente
					</Link>
				</Button>
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
					<Input className="pl-10" defaultValue={search?.search || ""} placeholder="Buscar pacientes..." />
				</div>
				<Button variant="outline">
					<Filter className="mr-2 h-4 w-4" />
					Filtros
				</Button>
			</div>

			{/* Patients Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{patients.map((patient) => (
					<Card className="transition-shadow hover:shadow-lg" key={patient.id}>
						<CardContent className="p-6">
							<div className="mb-4 flex items-start justify-between">
								<div className="flex items-center space-x-3">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 font-semibold text-white">
										{patient.name.charAt(0)}
									</div>
									<div>
										<h3 className="font-semibold">{patient.name}</h3>
										<p className="text-muted-foreground text-sm">ID: {patient.id}</p>
									</div>
								</div>
								{getStatusBadge(patient.status)}
							</div>

							<div className="space-y-2 text-sm">
								<p className="flex justify-between">
									<span className="text-muted-foreground">Email:</span>
									<span className="ml-2 truncate">{patient.email}</span>
								</p>
								<p className="flex justify-between">
									<span className="text-muted-foreground">Telefone:</span>
									<span>{patient.phone}</span>
								</p>
								<p className="flex justify-between">
									<span className="text-muted-foreground">Última visita:</span>
									<span>{new Date(patient.lastVisit).toLocaleDateString("pt-BR")}</span>
								</p>
								<p className="flex justify-between">
									<span className="text-muted-foreground">Tratamentos:</span>
									<Badge variant="outline">{patient.treatments}</Badge>
								</p>
							</div>

							<div className="mt-6 flex items-center justify-between border-t pt-4">
								<Button asChild size="sm" variant="outline">
									<Link to={`/patients/${patient.id}`}>Ver Detalhes</Link>
								</Button>
								<Button size="icon" variant="ghost">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Pagination */}
			<div className="flex justify-center">
				<p className="text-muted-foreground text-sm">
					Mostrando {patients.length} de {patients.length} pacientes
				</p>
			</div>
		</div>
	);
}
