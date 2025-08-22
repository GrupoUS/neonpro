/**
 * 🚦 TanStack Router Provider - NeonPro Healthcare
 * ===============================================
 *
 * Router provider with authentication integration,
 * query client context, and healthcare-specific features.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { RouterProvider as TanStackRouterProvider } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { router } from "@/lib/router";

interface RouterProviderProps {
	children?: React.ReactNode;
}

export function RouterProvider({ children }: RouterProviderProps) {
	const queryClient = useQueryClient();
	const auth = useAuth();

	// Set router context with auth and query client
	React.useEffect(() => {
		router.update({
			context: {
				queryClient,
				auth: {
					user: auth.user,
					isAuthenticated: !!auth.user && !auth.loading,
					hasRole: (roles) => {
						if (!auth.user) return false;
						const roleArray = Array.isArray(roles) ? roles : [roles];
						return roleArray.includes(auth.user.role);
					},
				},
			},
		});
	}, [queryClient, auth.user, auth.loading]);

	return (
		<>
			<TanStackRouterProvider router={router} />
			{process.env.NODE_ENV === "development" && <TanStackRouterDevtools router={router} />}
		</>
	);
}

// Router navigation hooks for use throughout the app
export {
	useLocation,
	useNavigate,
	useParams,
	useSearch,
} from "@tanstack/react-router";

// Healthcare-specific navigation utilities
export function useHealthcareNavigation() {
	const navigate = useNavigate();
	const { user } = useAuth();

	return {
		// Navigate to dashboard appropriate for user role
		navigateToDashboard: () => {
			if (!user) {
				navigate({ to: "/login" });
				return;
			}

			switch (user.role) {
				case "admin":
					navigate({ to: "/admin/dashboard" });
					break;
				case "clinic_owner":
				case "clinic_manager":
					navigate({ to: "/dashboard" });
					break;
				case "professional":
					navigate({ to: "/professional/dashboard" });
					break;
				case "patient":
					navigate({ to: "/patient/dashboard" });
					break;
				default:
					navigate({ to: "/dashboard" });
			}
		},

		// Navigate to patients with optional filters
		navigateToPatients: (search?: { search?: string; status?: "active" | "inactive" | "pending"; page?: number }) => {
			navigate({
				to: "/patients",
				search: search || {},
			});
		},

		// Navigate to appointments with optional filters
		navigateToAppointments: (search?: {
			date?: string;
			status?: "scheduled" | "confirmed" | "completed" | "cancelled";
			professional?: string;
		}) => {
			navigate({
				to: "/appointments",
				search: search || {},
			});
		},

		// Navigate to patient details
		navigateToPatient: (patientId: string, tab?: "overview" | "appointments" | "medical-records") => {
			const to = tab ? `/patients/${patientId}/${tab}` : `/patients/${patientId}`;
			navigate({ to });
		},

		// Navigate to appointment details
		navigateToAppointment: (appointmentId: string) => {
			navigate({ to: `/appointments/${appointmentId}` });
		},

		// Emergency navigation - bypass all guards
		emergencyNavigate: (to: string) => {
			window.location.href = to;
		},

		// Navigate with breadcrumb preservation
		navigateWithBreadcrumb: (to: string, breadcrumb?: string) => {
			navigate({
				to,
				search: breadcrumb ? { breadcrumb } : {},
			});
		},
	};
}

// Route-based permission checker
export function useRoutePermissions() {
	const { user } = useAuth();

	return {
		canAccessPatients: () => {
			return user && ["clinic_owner", "clinic_manager", "professional"].includes(user.role);
		},

		canAccessProfessionals: () => {
			return user && ["clinic_owner", "clinic_manager"].includes(user.role);
		},

		canAccessCompliance: () => {
			return user && ["clinic_owner", "clinic_manager"].includes(user.role);
		},

		canAccessSettings: () => {
			return !!user;
		},

		canAccessClinicSettings: () => {
			return user && ["clinic_owner", "clinic_manager"].includes(user.role);
		},

		canCreatePatient: () => {
			return user && ["clinic_owner", "clinic_manager", "professional"].includes(user.role);
		},

		canEditPatient: (patientId?: string) => {
			if (!user) return false;

			// Clinic owners and managers can edit any patient
			if (["clinic_owner", "clinic_manager"].includes(user.role)) {
				return true;
			}

			// Professionals can edit their assigned patients
			if (user.role === "professional") {
				// TODO: Check if patient is assigned to this professional
				return true;
			}

			// Patients can only view their own profile (not edit through this route)
			return false;
		},

		canScheduleAppointment: () => {
			return user && ["clinic_owner", "clinic_manager", "professional"].includes(user.role);
		},
	};
}

// Breadcrumb utilities
export function useBreadcrumbs() {
	const location = useLocation();
	const params = useParams({ strict: false });

	const generateBreadcrumbs = () => {
		const pathSegments = location.pathname.split("/").filter(Boolean);
		const breadcrumbs = [{ label: "Início", href: "/" }];

		let currentPath = "";

		pathSegments.forEach((segment, index) => {
			currentPath += `/${segment}`;

			// Replace parameter values with actual data if available
			let label = segment;

			// Handle dynamic segments
			if (segment.startsWith("$")) {
				const paramKey = segment.substring(1);
				const paramValue = params[paramKey as keyof typeof params];
				label = paramValue ? String(paramValue) : segment;
			}

			// Translate common segments to Portuguese
			const translations: Record<string, string> = {
				dashboard: "Dashboard",
				patients: "Pacientes",
				appointments: "Consultas",
				professionals: "Profissionais",
				compliance: "Conformidade",
				settings: "Configurações",
				new: "Novo",
				edit: "Editar",
				profile: "Perfil",
				security: "Segurança",
			};

			label = translations[label] || label;

			breadcrumbs.push({
				label,
				href: currentPath,
				isActive: index === pathSegments.length - 1,
			});
		});

		return breadcrumbs;
	};

	return {
		breadcrumbs: generateBreadcrumbs(),
	};
}
