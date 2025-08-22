import type { Database } from "./supabase";

// Base types from Supabase
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type FinancialTransaction = Database["public"]["Tables"]["financial_transactions"]["Row"];
export type StaffMember = Database["public"]["Tables"]["staff_members"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];

// Enhanced types with relationships
export type AppointmentWithRelations = Appointment & {
	patients: { name: string; email: string } | null;
	staff_members: { name: string; specialty: string } | null;
	services: { name: string; duration: number } | null;
};

// Dashboard Metrics Interface
export type DashboardMetrics = {
	totalPatients: number;
	activePatients: number;
	monthlyRevenue: number;
	revenueGrowth: number;
	upcomingAppointments: number;
	appointmentsGrowth: number;
	activeStaffMembers: number;
	loading: boolean;
	error: Error | null;
};

// Financial Data Interfaces
export type DailyRevenue = {
	date: string;
	amount: number;
};

export type ServiceRevenue = {
	serviceName: string;
	totalRevenue: number;
	transactionCount: number;
};

export type FinancialSummary = {
	monthlyRevenue: number;
	dailyRevenue: DailyRevenue[];
	recentTransactions: FinancialTransaction[];
	revenueByService: ServiceRevenue[];
	totalIncome: number;
	totalExpenses: number;
	netProfit: number;
};

// Common Hook Interface
export type BaseHookReturn = {
	loading: boolean;
	error: Error | null;
};

// Patients Hook Interface
export interface PatientsHookReturn extends BaseHookReturn {
	patients: Patient[];
	recentPatients: Patient[];
	totalCount: number;
	searchPatients: (query: string) => void;
	getPatientById: (id: string) => Patient | null;
	refreshPatients: () => Promise<void>;
}

// Appointments Hook Interface
export interface AppointmentsHookReturn extends BaseHookReturn {
	appointments: AppointmentWithRelations[];
	upcomingAppointments: AppointmentWithRelations[];
	todaysAppointments: AppointmentWithRelations[];
	appointmentsByDate: (date: Date) => AppointmentWithRelations[];
	refreshAppointments: () => Promise<void>;
}

// Financial Hook Interface
export interface FinancialHookReturn extends BaseHookReturn, FinancialSummary {
	refreshFinancialData: () => Promise<void>;
}

// Staff Hook Interface
export interface StaffHookReturn extends BaseHookReturn {
	staffMembers: StaffMember[];
	activeStaff: StaffMember[];
	staffById: (id: string) => StaffMember | null;
	staffBySpecialty: Record<string, StaffMember[]>;
	totalStaff: number;
	activeStaffCount: number;
	refreshStaff: () => Promise<void>;
}

// Services Hook Interface
export interface ServicesHookReturn extends BaseHookReturn {
	services: Service[];
	activeServices: Service[];
	servicesByCategory: Record<string, Service[]>;
	serviceById: (id: string) => Service | null;
	popularServices: Service[];
	totalServices: number;
	activeServicesCount: number;
	refreshServices: () => Promise<void>;
}

// Search and Filter Types
export type SearchFilters = {
	query?: string;
	status?: string;
	dateFrom?: Date;
	dateTo?: Date;
	category?: string;
	specialty?: string;
};

// Sort Options
export type SortOptions = {
	field: string;
	direction: "asc" | "desc";
};

// Pagination Interface
export type PaginationOptions = {
	page: number;
	limit: number;
	total?: number;
};

export type PaginatedResult<T> = {
	data: T[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
};
