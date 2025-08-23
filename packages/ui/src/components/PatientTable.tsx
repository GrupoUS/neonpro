import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Grid,
	List,
	MoreHorizontal,
	RefreshCw,
	Users,
} from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { formatDate, formatPhone } from "../utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { PatientCard, type PatientData } from "./PatientCard";
import type { FilterOption } from "./SearchBox";

export type PaginationProps = {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	page: number;
	pageSize: number;
};

type PatientTableColumn = {
	key: keyof PatientData | "actions";
	label: string;
	sortable?: boolean;
	width?: string;
	render?: (patient: PatientData) => React.ReactNode;
};

type PatientTableViewMode = "table" | "cards";

type PatientTableSort = {
	column: string;
	direction: "asc" | "desc";
};

type PatientTablePagination = PaginationProps;

type PatientTableAction = {
	key: string;
	label: string;
	icon?: React.ReactNode;
	onClick: (patient: PatientData) => void;
};

type PatientTableProps = {
	patients: PatientData[];
	loading?: boolean;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	sortBy?: string;
	sortDirection?: "asc" | "desc";
	onSort?: (column: string, direction: "asc" | "desc") => void;
	selectedPatients?: string[];
	onSelectionChange?: (patientIds: string[]) => void;
	onPatientClick?: (patient: PatientData) => void;
	onPatientAction?: (action: string, patient: PatientData) => void;
	onRefresh?: () => void;
	pagination?: PaginationProps;
	filters?: FilterOption[];
	activeFilters?: string[];
	onFilterChange?: (filters: string[]) => void;
	columns?: PatientTableColumn[];
	viewMode?: PatientTableViewMode;
	onViewModeChange?: (mode: PatientTableViewMode) => void;
	className?: string;
};

// Helper function to get initials from name
const getInitials = (name: string): string => {
	return name
		.split(" ")
		.map((part) => part.charAt(0))
		.join("")
		.toUpperCase()
		.slice(0, 2);
};

// Helper function to format relative time
const formatRelativeTime = (dateString?: string): string => {
	if (!dateString) {
		return "-";
	}

	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return "Hoje";
	}
	if (diffDays === 1) {
		return "Ontem";
	}
	if (diffDays < 7) {
		return `${diffDays} dias atrás`;
	}
	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7);
		return `${weeks} semana${weeks > 1 ? "s" : ""} atrás`;
	}

	return formatDate(dateString);
};

const defaultColumns: PatientTableColumn[] = [
	{ key: "name", label: "Nome", sortable: true },
	{ key: "email", label: "Email", sortable: true },
	{ key: "phone", label: "Telefone", sortable: false },
	{ key: "lastVisit", label: "Última Visita", sortable: true },
	{ key: "status", label: "Status", sortable: true },
	{ key: "actions", label: "Ações", sortable: false, width: "120px" },
];

const PatientTable = React.forwardRef<HTMLDivElement, PatientTableProps>(
	(
		{
			patients,
			loading = false,
			searchValue = "",
			onSearchChange,
			sortBy,
			sortDirection = "asc",
			onSort,
			selectedPatients = [],
			onSelectionChange,
			onPatientClick,
			onPatientAction,
			onRefresh,
			pagination,
			filters = [],
			activeFilters = [],
			onFilterChange,
			columns = defaultColumns,
			viewMode = "table",
			onViewModeChange,
			className,
			...props
		},
		ref,
	) => {
		// Internal state management
		const [sort, setSort] = React.useState<{
			column: string;
			direction: "asc" | "desc";
		} | null>(null);
		const [searchTerm, setSearchTerm] = React.useState(searchValue);
		const [internalSelectedPatients, setSelectedPatients] =
			React.useState<string[]>(selectedPatients);
		const [internalPagination, setPagination] = React.useState(pagination);
		const [internalViewMode, setViewMode] = React.useState(viewMode);

		// Computed values
		const enableSelection = Boolean(onSelectionChange);

		// Filter and sort data
		const filteredData = React.useMemo(() => {
			let result = [...patients];

			// Apply search filter
			if (searchTerm) {
				result = result.filter(
					(patient) =>
						patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
						patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
						patient.phone?.includes(searchTerm),
				);
			}

			return result;
		}, [patients, searchTerm]);

		// Paginated data
		const paginatedData = React.useMemo(() => {
			if (!internalPagination?.pageSize) {
				return filteredData;
			}

			const startIndex =
				((internalPagination.page || 1) - 1) * internalPagination.pageSize;
			const endIndex = startIndex + internalPagination.pageSize;
			return filteredData.slice(startIndex, endIndex);
		}, [filteredData, internalPagination]);

		// Update internal state when props change
		React.useEffect(() => {
			setSearchTerm(searchValue);
		}, [searchValue]);

		React.useEffect(() => {
			setSelectedPatients(selectedPatients);
		}, [selectedPatients]);

		React.useEffect(() => {
			setPagination(pagination);
		}, [pagination]);

		React.useEffect(() => {
			setViewMode(viewMode);
		}, [viewMode]);

		// Handler functions
		const handleSort = (column: string) => {
			setSort((prev) => {
				if (prev?.column === column) {
					return {
						column,
						direction: prev.direction === "asc" ? "desc" : "asc",
					};
				}
				return { column, direction: "asc" };
			});

			if (onSort) {
				const newDirection =
					sort?.column === column && sort?.direction === "asc" ? "desc" : "asc";
				onSort(column, newDirection);
			}
		};

		const handleSelectAll = () => {
			const newSelected =
				internalSelectedPatients.length === patients.length
					? []
					: patients.map((p) => p.id);
			setSelectedPatients(newSelected);

			if (onSelectionChange) {
				onSelectionChange(newSelected);
			}
		};

		const handleSelectPatient = (patientId: string) => {
			setSelectedPatients((prev) => {
				const newSelected = prev.includes(patientId)
					? prev.filter((id) => id !== patientId)
					: [...prev, patientId];

				if (onSelectionChange) {
					onSelectionChange(newSelected);
				}
				return newSelected;
			});
		};

		const handlePatientSelect = (patient: PatientData) => {
			if (onPatientClick) {
				onPatientClick(patient);
			}
		};

		const handlePaginationChange = (page: number) => {
			setPagination((prev) => (prev ? { ...prev, page } : undefined));
		};

		const handleViewModeChange = (mode: PatientTableViewMode) => {
			setViewMode(mode);
			if (onViewModeChange) {
				onViewModeChange(mode);
			}
		};

		// Render cell content
		const renderCellContent = (
			patient: PatientData,
			column: PatientTableColumn,
		) => {
			if (column.render) {
				return column.render(patient);
			}

			switch (column.key) {
				case "name":
					return (
						<div className="flex items-center gap-3">
							<Avatar size="sm">
								<AvatarImage alt={patient.name} src={patient.avatar} />
								<AvatarFallback>
									{getInitials(patient.name || "Unknown")}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="font-medium">{patient.name}</div>
								<div className="text-muted-foreground text-sm">
									{patient.email}
								</div>
							</div>
						</div>
					);

				case "phone":
					return formatPhone(patient.phone || "");

				case "lastVisit":
					return formatRelativeTime(patient.lastVisit);

				case "status":
					return (
						<Badge variant={getStatusVariant(patient.status)}>
							{getStatusLabel(patient.status)}
						</Badge>
					);

				case "actions":
					return (
						<div className="flex items-center gap-1">
							<Button
								onClick={(e) => {
									e.stopPropagation();
									onPatientAction?.("view", patient);
								}}
								size="sm"
								variant="ghost"
							>
								Ver
							</Button>
							<Button
								onClick={(e) => {
									e.stopPropagation();
									onPatientAction?.("menu", patient);
								}}
								size="sm"
								variant="ghost"
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</div>
					);

				default:
					return (patient as any)[column.key] || "-";
			}
		};

		const getStatusVariant = (status: string) => {
			switch (status) {
				case "active":
					return "confirmed";
				case "inactive":
					return "secondary";
				case "pending":
					return "pending";
				default:
					return "default";
			}
		};

		const getStatusLabel = (status: string) => {
			switch (status) {
				case "active":
					return "Ativo";
				case "inactive":
					return "Inativo";
				case "pending":
					return "Pendente";
				default:
					return status;
			}
		};

		return (
			<div {...props} className={cn("space-y-4", className)} ref={ref}>
				{/* Header with actions */}
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<h3 className="font-semibold text-lg">Pacientes</h3>
						{internalSelectedPatients.length > 0 && (
							<span className="text-muted-foreground text-sm">
								{internalSelectedPatients.length} selecionado
								{internalSelectedPatients.length > 1 ? "s" : ""}
							</span>
						)}
					</div>

					<div className="flex items-center gap-2">
						{onRefresh && (
							<Button
								disabled={loading}
								onClick={onRefresh}
								size="sm"
								variant="outline"
							>
								<RefreshCw
									className={cn("h-4 w-4", loading && "animate-spin")}
								/>
							</Button>
						)}

						<div className="flex items-center rounded-md border">
							<Button
								onClick={() => handleViewModeChange("table")}
								size="sm"
								variant={internalViewMode === "table" ? "default" : "ghost"}
							>
								<List className="h-4 w-4" />
							</Button>
							<Button
								onClick={() => handleViewModeChange("cards")}
								size="sm"
								variant={internalViewMode === "cards" ? "default" : "ghost"}
							>
								<Grid className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>

				{/* Table View */}
				{internalViewMode === "table" && (
					<div className="overflow-hidden rounded-lg border">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="border-b bg-muted/50">
									<tr>
										{enableSelection && (
											<th className="w-12 px-4 py-3 text-left">
												<Checkbox
													checked={
														internalSelectedPatients.length ===
															patients.length && patients.length > 0
													}
													onCheckedChange={handleSelectAll}
												/>
											</th>
										)}
										{columns.map((column) => (
											<th
												className={cn(
													"px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider",
													column.sortable &&
														"cursor-pointer hover:text-foreground",
													column.width && `w-[${column.width}]`,
												)}
												key={column.key}
												onClick={() =>
													column.sortable && handleSort(column.key as string)
												}
											>
												<div className="flex items-center gap-2">
													{column.label}
													{column.sortable && sort?.column === column.key && (
														<div className="text-foreground">
															{sort.direction === "asc" ? (
																<ChevronUp className="h-4 w-4" />
															) : (
																<ChevronDown className="h-4 w-4" />
															)}
														</div>
													)}
												</div>
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y">
									{paginatedData.map((patient) => (
										<tr
											className="cursor-pointer hover:bg-muted/50"
											key={patient.id}
											onClick={() => handlePatientSelect(patient)}
										>
											{enableSelection && (
												<td className="w-12 px-4 py-3">
													<Checkbox
														checked={internalSelectedPatients.includes(
															patient.id,
														)}
														onCheckedChange={() =>
															handleSelectPatient(patient.id)
														}
														onClick={(e) => e.stopPropagation()}
													/>
												</td>
											)}
											{columns.map((column) => (
												<td className="px-4 py-3" key={column.key}>
													{renderCellContent(patient, column)}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Cards View */}
				{internalViewMode === "cards" && (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{paginatedData.map((patient) => (
							<PatientCard
								className="cursor-pointer"
								key={patient.id}
								onClick={() => handlePatientSelect(patient)}
								patient={patient}
							/>
						))}
					</div>
				)}

				{/* Pagination */}
				{internalPagination && internalPagination.totalPages > 1 && (
					<div className="flex items-center justify-between">
						<div className="text-muted-foreground text-sm">
							Mostrando{" "}
							{((internalPagination.page || 1) - 1) *
								internalPagination.pageSize +
								1}{" "}
							a{" "}
							{Math.min(
								(internalPagination.page || 1) * internalPagination.pageSize,
								internalPagination.totalItems,
							)}{" "}
							de {internalPagination.totalItems} pacientes
						</div>

						<div className="flex items-center gap-2">
							<Button
								disabled={(internalPagination.page || 1) <= 1}
								onClick={() =>
									handlePaginationChange((internalPagination.page || 1) - 1)
								}
								size="sm"
								variant="outline"
							>
								<ChevronLeft className="h-4 w-4" />
								Anterior
							</Button>

							<span className="text-sm">
								Página {internalPagination.page || 1} de{" "}
								{internalPagination.totalPages}
							</span>

							<Button
								disabled={
									(internalPagination.page || 1) >=
									internalPagination.totalPages
								}
								onClick={() =>
									handlePaginationChange((internalPagination.page || 1) + 1)
								}
								size="sm"
								variant="outline"
							>
								Próxima
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}

				{/* Empty State */}
				{filteredData.length === 0 && !loading && (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<Users className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							Nenhum paciente encontrado
						</h3>
						<p className="text-muted-foreground text-sm">
							{searchTerm
								? "Tente ajustar os filtros de busca."
								: "Comece adicionando seu primeiro paciente."}
						</p>
					</div>
				)}
			</div>
		);
	},
);

PatientTable.displayName = "PatientTable";

export { PatientTable };
export type {
	PatientTableProps,
	PatientTableColumn,
	PatientTableViewMode,
	PatientTableSort,
	PatientTableAction,
};
