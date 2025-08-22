import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, ChevronUp, Download, Edit, Eye, Filter, MoreHorizontal, Search } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

const tableVariants = cva("w-full border-collapse", {
	variants: {
		variant: {
			default: "overflow-hidden rounded-lg border border-border bg-gradient-card shadow-healthcare-sm backdrop-blur-sm",
			medical:
				"overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent shadow-healthcare-md backdrop-blur-sm",
			patient:
				"overflow-hidden rounded-lg border border-secondary/30 bg-gradient-to-br from-secondary/5 via-secondary/3 to-transparent shadow-healthcare-md backdrop-blur-sm",
			simple: "border-0 bg-transparent",
		},
		size: {
			default: "",
			sm: "text-sm",
			lg: "text-base",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

const Table = React.forwardRef<
	HTMLTableElement,
	React.HTMLAttributes<HTMLTableElement> & VariantProps<typeof tableVariants>
>(({ className, variant, size, ...props }, ref) => (
	<div className="relative w-full overflow-auto">
		<table className={cn(tableVariants({ variant, size }), className)} ref={ref} {...props} />
	</div>
));
Table.displayName = "Table";
const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => (
		<thead
			className={cn(
				"border-border bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40 backdrop-blur-sm [&_tr]:border-border/60 [&_tr]:border-b",
				className
			)}
			ref={ref}
			{...props}
		/>
	)
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => (
		<tbody className={cn("[&_tr:last-child]:border-0", className)} ref={ref} {...props} />
	)
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => (
		<tfoot className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} ref={ref} {...props} />
	)
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
	HTMLTableRowElement,
	React.HTMLAttributes<HTMLTableRowElement> & {
		priority?: "low" | "normal" | "high" | "critical";
		interactive?: boolean;
		selected?: boolean;
	}
>(({ className, priority = "normal", interactive, selected, ...props }, ref) => (
	<tr
		className={cn(
			"border-border/60 border-b backdrop-blur-sm transition-all duration-300 data-[state=selected]:bg-muted/80",
			priority === "critical" &&
				"animate-pulse-healthcare border-destructive/30 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent shadow-healthcare-sm",
			priority === "high" && "bg-gradient-to-br from-warning/8 via-warning/4 to-transparent",
			priority === "low" && "opacity-75",
			interactive &&
				"cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:bg-gradient-to-br hover:from-muted/60 hover:via-muted/40 hover:to-transparent hover:shadow-healthcare-sm",
			selected &&
				"border-primary/30 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 shadow-healthcare-sm",
			className
		)}
		data-priority={priority}
		data-state={selected ? "selected" : undefined}
		ref={ref}
		{...props}
	/>
));
TableRow.displayName = "TableRow";
const TableHead = React.forwardRef<
	HTMLTableCellElement,
	React.ThHTMLAttributes<HTMLTableCellElement> & {
		sortable?: boolean;
		sortDirection?: "asc" | "desc" | null;
		onSort?: () => void;
	}
>(({ className, sortable, sortDirection, onSort, children, ...props }, ref) => (
	<th
		className={cn(
			"h-12 px-4 text-left align-middle font-semibold text-foreground [&:has([role=checkbox])]:pr-0",
			sortable &&
				"cursor-pointer select-none rounded-md transition-all duration-200 hover:bg-gradient-to-br hover:from-muted/40 hover:via-muted/30 hover:to-transparent hover:text-primary",
			className
		)}
		onClick={sortable ? onSort : undefined}
		ref={ref}
		{...props}
	>
		<div className="flex items-center gap-2">
			{children}
			{sortable && (
				<div className="flex flex-col transition-all duration-200">
					{sortDirection === "asc" ? (
						<ChevronUp className="h-4 w-4 text-primary" />
					) : sortDirection === "desc" ? (
						<ChevronDown className="h-4 w-4 text-primary" />
					) : (
						<div className="h-4 w-4 opacity-50 transition-opacity hover:opacity-100">
							<ChevronUp className="h-2 w-2" />
							<ChevronDown className="h-2 w-2" />
						</div>
					)}
				</div>
			)}
		</div>
	</th>
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement> & {
		sensitive?: boolean;
		lgpdProtected?: boolean;
	}
>(({ className, sensitive, lgpdProtected, children, ...props }, ref) => (
	<td
		className={cn(
			"p-4 align-middle [&:has([role=checkbox])]:pr-0",
			sensitive && "bg-gradient-to-br from-warning/10 via-warning/5 to-transparent backdrop-blur-sm",
			lgpdProtected && "bg-gradient-to-br from-success/8 via-success/4 to-transparent backdrop-blur-sm",
			className
		)}
		data-lgpd-protected={lgpdProtected}
		data-sensitive={sensitive}
		ref={ref}
		{...props}
	>
		{sensitive && (
			<div className="mb-1 flex items-center gap-1 text-warning text-xs">
				<div className="h-2 w-2 animate-pulse rounded-full bg-warning" />
				<span className="font-medium">Dados Sensíveis</span>
			</div>
		)}
		{children}
		{lgpdProtected && (
			<div className="mt-1 flex items-center gap-1 text-success text-xs">
				<div className="h-2 w-2 rounded-full bg-success" />
				<span className="font-medium opacity-75">Protegido pela LGPD</span>
			</div>
		)}
	</td>
));
TableCell.displayName = "TableCell";
const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
	({ className, ...props }, ref) => (
		<caption className={cn("mt-4 text-muted-foreground text-sm", className)} ref={ref} {...props} />
	)
);
TableCaption.displayName = "TableCaption";

// Healthcare-specific table components

interface Patient {
	id: string;
	name: string;
	cpf: string;
	birthDate: Date;
	phone: string;
	email: string;
	lastVisit?: Date;
	nextAppointment?: Date;
	priority: "low" | "normal" | "high" | "critical";
	status: "active" | "inactive" | "pending";
}

interface PatientTableProps {
	patients: Patient[];
	onPatientSelect?: (patient: Patient) => void;
	onPatientEdit?: (patient: Patient) => void;
	showSensitiveData?: boolean;
	lgpdCompliant?: boolean;
	searchTerm?: string;
	sortBy?: keyof Patient;
	sortDirection?: "asc" | "desc";
	onSort?: (field: keyof Patient) => void;
}

const PatientTable = React.forwardRef<HTMLTableElement, PatientTableProps>(
	(
		{
			patients,
			onPatientSelect,
			onPatientEdit,
			showSensitiveData = false,
			lgpdCompliant = true,
			searchTerm,
			sortBy,
			sortDirection,
			onSort,
		},
		ref
	) => {
		const filteredPatients = React.useMemo(() => {
			if (!searchTerm) return patients;

			return patients.filter(
				(patient) =>
					patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					patient.cpf.includes(searchTerm) ||
					patient.email.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}, [patients, searchTerm]);

		const maskCPF = (cpf: string) => {
			if (!showSensitiveData) {
				return `***.***.***-${cpf.slice(-2)}`;
			}
			return cpf;
		};

		const maskEmail = (email: string) => {
			if (!showSensitiveData) {
				const [user, domain] = email.split("@");
				return `${user.slice(0, 2)}***@${domain}`;
			}
			return email;
		};

		return (
			<div className="space-y-4">
				{lgpdCompliant && (
					<div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/10 p-3">
						<div className="flex items-center gap-2 text-sm text-success">
							<div className="h-2 w-2 rounded-full bg-success" />
							<span>Dados protegidos pela LGPD</span>
						</div>
						{!showSensitiveData && <div className="text-muted-foreground text-xs">Dados sensíveis mascarados</div>}
					</div>
				)}

				<Table ref={ref} variant="patient">
					<TableHeader>
						<TableRow>
							<TableHead
								onSort={() => onSort?.("name")}
								sortable
								sortDirection={sortBy === "name" ? sortDirection : null}
							>
								Nome
							</TableHead>
							<TableHead
								onSort={() => onSort?.("cpf")}
								sortable
								sortDirection={sortBy === "cpf" ? sortDirection : null}
							>
								CPF
							</TableHead>
							<TableHead>Data Nasc.</TableHead>
							<TableHead>Contato</TableHead>
							<TableHead
								onSort={() => onSort?.("lastVisit")}
								sortable
								sortDirection={sortBy === "lastVisit" ? sortDirection : null}
							>
								Última Visita
							</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="w-[100px]">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredPatients.map((patient) => (
							<TableRow
								interactive
								key={patient.id}
								onClick={() => onPatientSelect?.(patient)}
								priority={patient.priority}
							>
								<TableCell className="font-medium">{patient.name}</TableCell>
								<TableCell lgpdProtected={lgpdCompliant} sensitive={showSensitiveData}>
									{maskCPF(patient.cpf)}
								</TableCell>
								<TableCell>{patient.birthDate.toLocaleDateString("pt-BR")}</TableCell>
								<TableCell lgpdProtected={lgpdCompliant} sensitive={showSensitiveData}>
									<div className="space-y-1">
										<div>{patient.phone}</div>
										<div className="text-muted-foreground text-xs">{maskEmail(patient.email)}</div>
									</div>
								</TableCell>
								<TableCell>{patient.lastVisit?.toLocaleDateString("pt-BR") || "Nunca"}</TableCell>
								<TableCell>
									<span
										className={cn(
											"inline-flex items-center rounded-full px-2 py-1 font-medium text-xs",
											patient.status === "active" && "border border-success/20 bg-success/10 text-success",
											patient.status === "inactive" && "border border-muted bg-muted/50 text-muted-foreground",
											patient.status === "pending" && "border border-warning/20 bg-warning/10 text-warning"
										)}
									>
										{patient.status === "active" && "Ativo"}
										{patient.status === "inactive" && "Inativo"}
										{patient.status === "pending" && "Pendente"}
									</span>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<button
											className="rounded-md p-2 transition-colors hover:bg-muted"
											onClick={(e) => {
												e.stopPropagation();
												onPatientSelect?.(patient);
											}}
											title="Visualizar"
										>
											<Eye className="h-4 w-4" />
										</button>
										<button
											className="rounded-md p-2 transition-colors hover:bg-muted"
											onClick={(e) => {
												e.stopPropagation();
												onPatientEdit?.(patient);
											}}
											title="Editar"
										>
											<Edit className="h-4 w-4" />
										</button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				{filteredPatients.length === 0 && (
					<div className="py-8 text-center text-muted-foreground">
						{searchTerm ? "Nenhum paciente encontrado para a busca." : "Nenhum paciente cadastrado."}
					</div>
				)}
			</div>
		);
	}
);
PatientTable.displayName = "PatientTable";
interface Appointment {
	id: string;
	patientName: string;
	professionalName: string;
	datetime: Date;
	duration: number;
	status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
	priority: "low" | "normal" | "high" | "critical";
	type: string;
	notes?: string;
}

interface AppointmentTableProps {
	appointments: Appointment[];
	onAppointmentSelect?: (appointment: Appointment) => void;
	onAppointmentEdit?: (appointment: Appointment) => void;
	onStatusChange?: (appointment: Appointment, newStatus: Appointment["status"]) => void;
	dateFilter?: Date;
	statusFilter?: Appointment["status"];
	sortBy?: keyof Appointment;
	sortDirection?: "asc" | "desc";
	onSort?: (field: keyof Appointment) => void;
}

const AppointmentTable = React.forwardRef<HTMLTableElement, AppointmentTableProps>(
	(
		{
			appointments,
			onAppointmentSelect,
			onAppointmentEdit,
			onStatusChange,
			dateFilter,
			statusFilter,
			sortBy,
			sortDirection,
			onSort,
		},
		ref
	) => {
		const filteredAppointments = React.useMemo(() => {
			return appointments.filter((appointment) => {
				if (dateFilter && appointment.datetime.toDateString() !== dateFilter.toDateString()) {
					return false;
				}
				if (statusFilter && appointment.status !== statusFilter) {
					return false;
				}
				return true;
			});
		}, [appointments, dateFilter, statusFilter]);

		const getStatusColor = (status: Appointment["status"]) => {
			switch (status) {
				case "scheduled":
					return "bg-primary/10 text-primary border border-primary/20";
				case "confirmed":
					return "bg-success/10 text-success border border-success/20";
				case "in-progress":
					return "bg-warning/10 text-warning border border-warning/20";
				case "completed":
					return "bg-success/15 text-success border border-success/30";
				case "cancelled":
					return "bg-destructive/10 text-destructive border border-destructive/20";
				case "no-show":
					return "bg-muted/50 text-muted-foreground border border-muted";
				default:
					return "bg-muted/50 text-muted-foreground border border-muted";
			}
		};

		const getStatusLabel = (status: Appointment["status"]) => {
			switch (status) {
				case "scheduled":
					return "Agendado";
				case "confirmed":
					return "Confirmado";
				case "in-progress":
					return "Em Andamento";
				case "completed":
					return "Concluído";
				case "cancelled":
					return "Cancelado";
				case "no-show":
					return "Faltou";
				default:
					return "Desconhecido";
			}
		};

		return (
			<Table ref={ref} variant="medical">
				<TableHeader>
					<TableRow>
						<TableHead
							onSort={() => onSort?.("datetime")}
							sortable
							sortDirection={sortBy === "datetime" ? sortDirection : null}
						>
							Data/Hora
						</TableHead>
						<TableHead
							onSort={() => onSort?.("patientName")}
							sortable
							sortDirection={sortBy === "patientName" ? sortDirection : null}
						>
							Paciente
						</TableHead>
						<TableHead
							onSort={() => onSort?.("professionalName")}
							sortable
							sortDirection={sortBy === "professionalName" ? sortDirection : null}
						>
							Profissional
						</TableHead>
						<TableHead>Tipo</TableHead>
						<TableHead>Duração</TableHead>
						<TableHead
							onSort={() => onSort?.("status")}
							sortable
							sortDirection={sortBy === "status" ? sortDirection : null}
						>
							Status
						</TableHead>
						<TableHead className="w-[100px]">Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredAppointments.map((appointment) => (
						<TableRow
							interactive
							key={appointment.id}
							onClick={() => onAppointmentSelect?.(appointment)}
							priority={appointment.priority}
						>
							<TableCell className="font-medium">
								<div className="space-y-1">
									<div>{appointment.datetime.toLocaleDateString("pt-BR")}</div>
									<div className="text-muted-foreground text-sm">
										{appointment.datetime.toLocaleTimeString("pt-BR", {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</div>
								</div>
							</TableCell>
							<TableCell>{appointment.patientName}</TableCell>
							<TableCell>{appointment.professionalName}</TableCell>
							<TableCell>
								<span className="inline-flex items-center rounded-md border border-accent/20 bg-accent/10 px-2 py-1 font-medium text-accent text-xs">
									{appointment.type}
								</span>
							</TableCell>
							<TableCell>{appointment.duration} min</TableCell>
							<TableCell>
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2 py-1 font-medium text-xs",
										getStatusColor(appointment.status)
									)}
								>
									{getStatusLabel(appointment.status)}
								</span>
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<button
										className="rounded-md p-2 transition-colors hover:bg-muted"
										onClick={(e) => {
											e.stopPropagation();
											onAppointmentSelect?.(appointment);
										}}
										title="Visualizar"
									>
										<Eye className="h-4 w-4" />
									</button>
									<button
										className="rounded-md p-2 transition-colors hover:bg-muted"
										onClick={(e) => {
											e.stopPropagation();
											onAppointmentEdit?.(appointment);
										}}
										title="Editar"
									>
										<Edit className="h-4 w-4" />
									</button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	}
);
AppointmentTable.displayName = "AppointmentTable";
export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
	// Healthcare-specific exports
	PatientTable,
	AppointmentTable,
	tableVariants,
	type Patient,
	type PatientTableProps,
	type Appointment,
	type AppointmentTableProps,
};
