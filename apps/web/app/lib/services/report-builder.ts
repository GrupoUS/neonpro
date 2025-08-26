// Reportbuilder Module
export interface ReportbuilderConfig {
  enabled: boolean;
  data?: unknown;
}

export const Reportbuilder_DEFAULT: ReportbuilderConfig = {
  enabled: true,
  data: undefined,
};

export function createReportbuilder() {
  return Reportbuilder_DEFAULT;
}

export default {
  config: Reportbuilder_DEFAULT,
  create: createReportbuilder,
};
