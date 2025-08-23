/**
 * Analytics Dashboard Component for NeonPro Healthcare System
 * Displays comprehensive analytics and metrics for healthcare operations
 */

type AnalyticsDashboardProps = {
	data?: {
		patients: number;
		appointments: number;
		revenue: number;
		growth: number;
	};
	loading?: boolean;
	error?: string;
};

export function AnalyticsDashboard({
	data = { patients: 0, appointments: 0, revenue: 0, growth: 0 },
	loading = false,
	error,
}: AnalyticsDashboardProps) {
	if (loading) {
		return (
			<div className="analytics-dashboard loading">
				<p>Loading analytics...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="analytics-dashboard error">
				<p>Error loading analytics: {error}</p>
			</div>
		);
	}

	return (
		<div className="analytics-dashboard">
			<h2>Healthcare Analytics Dashboard</h2>

			<div className="analytics-grid">
				<div className="metric-card">
					<h3>Total Patients</h3>
					<p className="metric-value">{data.patients}</p>
				</div>

				<div className="metric-card">
					<h3>Appointments</h3>
					<p className="metric-value">{data.appointments}</p>
				</div>

				<div className="metric-card">
					<h3>Revenue</h3>
					<p className="metric-value">R$ {data.revenue.toLocaleString()}</p>
				</div>

				<div className="metric-card">
					<h3>Growth</h3>
					<p className="metric-value">{data.growth}%</p>
				</div>
			</div>
		</div>
	);
}
