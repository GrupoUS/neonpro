// Dashboardbuilder Module
export type DashboardbuilderConfig = {
	enabled: boolean;
	data?: unknown;
};

export const Dashboardbuilder_DEFAULT: DashboardbuilderConfig = {
	enabled: true,
	data: null,
};

export function createDashboardbuilder() {
	return Dashboardbuilder_DEFAULT;
}

export default {
	config: Dashboardbuilder_DEFAULT,
	create: createDashboardbuilder,
};
