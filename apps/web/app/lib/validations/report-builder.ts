// Reportbuilder Module
export type ReportbuilderConfig = {
	enabled: boolean;
	data?: unknown;
};

export const Reportbuilder_DEFAULT: ReportbuilderConfig = {
	enabled: true,
	data: null,
};

export function createReportbuilder() {
	return Reportbuilder_DEFAULT;
}

export default {
	config: Reportbuilder_DEFAULT,
	create: createReportbuilder,
};
