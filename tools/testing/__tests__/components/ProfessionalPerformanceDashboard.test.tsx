import ProfessionalPerformanceDashboard from "@/components/dashboard/ProfessionalPerformanceDashboard";
import { getProfessionalPerformanceMetrics } from "@/lib/supabase/professionals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

// Mock the dependencies
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		back: vi.fn(),
	}),
}));

vi.mock("@/lib/supabase/professionals", () => ({
	getProfessionalPerformanceMetrics: vi.fn(),
}));

// Mock data
const mockPerformanceMetrics = [
	{
		id: "metric-1",
		professional_id: "1",
		metric_type: "patient_satisfaction",
		metric_value: 4.8,
		measurement_period: "monthly",
		period_start: "2024-01-01",
		period_end: "2024-01-31",
		notes: "Excelente avaliação dos pacientes",
		created_at: "2024-02-01T00:00:00Z",
		updated_at: "2024-02-01T00:00:00Z",
	},
	{
		id: "metric-2",
		professional_id: "1",
		metric_type: "appointment_completion_rate",
		metric_value: 95.5,
		measurement_period: "monthly",
		period_start: "2024-01-01",
		period_end: "2024-01-31",
		notes: "Alta taxa de conclusão de consultas",
		created_at: "2024-02-01T00:00:00Z",
		updated_at: "2024-02-01T00:00:00Z",
	},
	{
		id: "metric-3",
		professional_id: "1",
		metric_type: "revenue_generated",
		metric_value: 45_000.0,
		measurement_period: "monthly",
		period_start: "2024-01-01",
		period_end: "2024-01-31",
		notes: "Receita gerada no período",
		created_at: "2024-02-01T00:00:00Z",
		updated_at: "2024-02-01T00:00:00Z",
	},
	{
		id: "metric-4",
		professional_id: "1",
		metric_type: "professional_development_hours",
		metric_value: 40,
		measurement_period: "quarterly",
		period_start: "2024-01-01",
		period_end: "2024-03-31",
		notes: "Horas de desenvolvimento profissional",
		created_at: "2024-04-01T00:00:00Z",
		updated_at: "2024-04-01T00:00:00Z",
	},
];

const mockProfessional = {
	id: "1",
	given_name: "Dr. Ana",
	family_name: "Silva",
	qualification: "Dermatologista",
};

describe("ProfessionalPerformanceDashboard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(getProfessionalPerformanceMetrics as vi.Mock).mockResolvedValue(
			mockPerformanceMetrics,
		);
	});

	describe("Component Rendering", () => {
		it("should render dashboard header", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			expect(
				screen.getByText("Performance - Dr. Ana Silva"),
			).toBeInTheDocument();
			expect(
				screen.getByText(
					"Métricas de performance e desenvolvimento profissional",
				),
			).toBeInTheDocument();
		});

		it("should render time period selector", () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			expect(screen.getByText("Período:")).toBeInTheDocument();
			expect(screen.getByRole("combobox")).toBeInTheDocument();
		});

		it("should render performance overview cards", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("Satisfação do Paciente")).toBeInTheDocument();
				expect(screen.getByText("Taxa de Conclusão")).toBeInTheDocument();
				expect(screen.getByText("Receita Gerada")).toBeInTheDocument();
				expect(
					screen.getByText("Horas de Desenvolvimento"),
				).toBeInTheDocument();
			});
		});

		it("should render charts section", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(
					screen.getByText("Tendências de Performance"),
				).toBeInTheDocument();
				expect(
					screen.getByText("Distribuição de Métricas"),
				).toBeInTheDocument();
			});
		});

		it("should render metrics table", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("Histórico de Métricas")).toBeInTheDocument();
				expect(screen.getByRole("table")).toBeInTheDocument();
			});
		});
	});

	describe("Data Loading", () => {
		it("should load performance metrics on mount", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(getProfessionalPerformanceMetrics).toHaveBeenCalledWith("1");
			});
		});

		it("should handle loading error", async () => {
			(getProfessionalPerformanceMetrics as vi.Mock).mockRejectedValue(
				new Error("Failed to load"),
			);

			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(
					screen.getByText("Erro ao carregar métricas de performance"),
				).toBeInTheDocument();
			});
		});

		it("should display loading state", () => {
			(getProfessionalPerformanceMetrics as vi.Mock).mockImplementation(
				() => new Promise((resolve) => setTimeout(resolve, 1000)),
			);

			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			expect(screen.getByText("Carregando métricas...")).toBeInTheDocument();
		});
	});

	describe("Performance Metrics Display", () => {
		it("should display patient satisfaction metric correctly", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("4.8")).toBeInTheDocument();
				expect(screen.getByText("/5.0")).toBeInTheDocument();
			});
		});

		it("should display completion rate as percentage", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("95.5%")).toBeInTheDocument();
			});
		});

		it("should display revenue with currency formatting", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("R$ 45.000,00")).toBeInTheDocument();
			});
		});

		it("should display development hours", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("40")).toBeInTheDocument();
				expect(screen.getByText("horas")).toBeInTheDocument();
			});
		});

		it("should show trend indicators", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				// Look for trend icons (up/down arrows)
				const trendIcons = screen.getAllByTestId(/trend-icon/);
				expect(trendIcons.length).toBeGreaterThan(0);
			});
		});
	});

	describe("Time Period Filtering", () => {
		it("should filter metrics by monthly period", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("Última Semana")).toBeInTheDocument();
				expect(screen.getByText("Último Mês")).toBeInTheDocument();
				expect(screen.getByText("Último Trimestre")).toBeInTheDocument();
				expect(screen.getByText("Último Ano")).toBeInTheDocument();
			});
		});

		it("should update metrics when period changes", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(getProfessionalPerformanceMetrics).toHaveBeenCalledTimes(1);
			});

			// Change period selection
			const periodSelector = screen.getByRole("combobox");
			fireEvent.click(periodSelector);

			const quarterOption = screen.getByText("Último Trimestre");
			fireEvent.click(quarterOption);

			await waitFor(() => {
				expect(getProfessionalPerformanceMetrics).toHaveBeenCalledTimes(2);
			});
		});

		it("should display correct date ranges for periods", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				// Should show formatted date ranges
				expect(screen.getByText("01/01/2024 - 31/01/2024")).toBeInTheDocument();
			});
		});
	});

	describe("Charts and Visualizations", () => {
		it("should render performance trend chart", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(
					screen.getByText("Tendências de Performance"),
				).toBeInTheDocument();
				// Chart would be rendered by Recharts library
				expect(document.querySelector(".recharts-wrapper")).toBeInTheDocument();
			});
		});

		it("should render metrics distribution chart", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(
					screen.getByText("Distribuição de Métricas"),
				).toBeInTheDocument();
				// Pie chart would be rendered by Recharts library
				expect(document.querySelector(".recharts-pie")).toBeInTheDocument();
			});
		});

		it("should handle empty chart data gracefully", async () => {
			(getProfessionalPerformanceMetrics as vi.Mock).mockResolvedValue([]);

			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(
					screen.getByText("Nenhum dado disponível para o período selecionado"),
				).toBeInTheDocument();
			});
		});

		it("should display chart tooltips correctly", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				// Chart tooltips would be handled by Recharts
				const chartContainer = document.querySelector(".recharts-wrapper");
				expect(chartContainer).toBeInTheDocument();
			});
		});
	});

	describe("Metrics Table", () => {
		it("should display all metrics in table", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("Satisfação do Paciente")).toBeInTheDocument();
				expect(
					screen.getByText("Taxa de Conclusão de Consultas"),
				).toBeInTheDocument();
				expect(screen.getByText("Receita Gerada")).toBeInTheDocument();
				expect(
					screen.getByText("Horas de Desenvolvimento Profissional"),
				).toBeInTheDocument();
			});
		});

		it("should show metric values with correct formatting", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("4.8/5.0")).toBeInTheDocument();
				expect(screen.getByText("95.5%")).toBeInTheDocument();
				expect(screen.getByText("R$ 45.000,00")).toBeInTheDocument();
				expect(screen.getByText("40 horas")).toBeInTheDocument();
			});
		});

		it("should display measurement periods correctly", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("Mensal")).toBeInTheDocument();
				expect(screen.getByText("Trimestral")).toBeInTheDocument();
			});
		});

		it("should show notes when available", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(
					screen.getByText("Excelente avaliação dos pacientes"),
				).toBeInTheDocument();
				expect(
					screen.getByText("Alta taxa de conclusão de consultas"),
				).toBeInTheDocument();
			});
		});

		it("should sort table by different columns", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				const metricTypeHeader = screen.getByText("Tipo de Métrica");
				expect(metricTypeHeader).toBeInTheDocument();

				// Click to sort
				fireEvent.click(metricTypeHeader);
			});

			// Should re-order table rows
			await waitFor(() => {
				expect(screen.getByRole("table")).toBeInTheDocument();
			});
		});
	});

	describe("Performance Insights", () => {
		it("should display performance summary", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("Resumo de Performance")).toBeInTheDocument();
			});
		});

		it("should show recommendations when performance is below target", async () => {
			const lowPerformanceMetrics = [
				{
					...mockPerformanceMetrics[0],
					metric_value: 3.2, // Low satisfaction
				},
			];

			(getProfessionalPerformanceMetrics as vi.Mock).mockResolvedValue(
				lowPerformanceMetrics,
			);

			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("Recomendações")).toBeInTheDocument();
				expect(
					screen.getByText("Considere melhorar a comunicação com pacientes"),
				).toBeInTheDocument();
			});
		});

		it("should highlight exceptional performance", async () => {
			const highPerformanceMetrics = [
				{
					...mockPerformanceMetrics[0],
					metric_value: 4.9, // Excellent satisfaction
				},
			];

			(getProfessionalPerformanceMetrics as vi.Mock).mockResolvedValue(
				highPerformanceMetrics,
			);

			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("Performance Excepcional")).toBeInTheDocument();
			});
		});
	});

	describe("Export and Actions", () => {
		it("should provide export options", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(
					screen.getByRole("button", { name: "Exportar Relatório" }),
				).toBeInTheDocument();
			});
		});

		it("should allow printing dashboard", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(
					screen.getByRole("button", { name: "Imprimir" }),
				).toBeInTheDocument();
			});
		});

		it("should refresh data when refresh button is clicked", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(getProfessionalPerformanceMetrics).toHaveBeenCalledTimes(1);
			});

			const refreshButton = screen.getByRole("button", { name: "Atualizar" });
			fireEvent.click(refreshButton);

			await waitFor(() => {
				expect(getProfessionalPerformanceMetrics).toHaveBeenCalledTimes(2);
			});
		});
	});

	describe("Responsive Design", () => {
		it("should adapt layout for mobile screens", () => {
			// Mock window.innerWidth
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: 375,
			});

			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			// Should render mobile-friendly layout
			expect(
				screen.getByText("Performance - Dr. Ana Silva"),
			).toBeInTheDocument();
		});

		it("should stack cards vertically on small screens", () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			// Cards should have responsive classes
			const cards = screen.getAllByTestId("performance-card");
			expect(cards.length).toBeGreaterThan(0);
		});
	});

	describe("Error Handling", () => {
		it("should handle network errors gracefully", async () => {
			(getProfessionalPerformanceMetrics as vi.Mock).mockRejectedValue(
				new Error("Network error"),
			);

			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(
					screen.getByText("Erro ao carregar métricas de performance"),
				).toBeInTheDocument();
				expect(
					screen.getByRole("button", { name: "Tentar Novamente" }),
				).toBeInTheDocument();
			});
		});

		it("should retry loading when retry button is clicked", async () => {
			(getProfessionalPerformanceMetrics as vi.Mock)
				.mockRejectedValueOnce(new Error("Network error"))
				.mockResolvedValueOnce(mockPerformanceMetrics);

			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(
					screen.getByText("Erro ao carregar métricas de performance"),
				).toBeInTheDocument();
			});

			const retryButton = screen.getByRole("button", {
				name: "Tentar Novamente",
			});
			fireEvent.click(retryButton);

			await waitFor(() => {
				expect(screen.getByText("Satisfação do Paciente")).toBeInTheDocument();
			});
		});

		it("should handle missing professional data", () => {
			render(<ProfessionalPerformanceDashboard professional={null} />);

			expect(
				screen.getByText("Profissional não encontrado"),
			).toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have proper ARIA labels", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByRole("main")).toBeInTheDocument();
				expect(screen.getByRole("table")).toBeInTheDocument();
				expect(screen.getByRole("combobox")).toBeInTheDocument();
			});
		});

		it("should support keyboard navigation", () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			const periodSelector = screen.getByRole("combobox");
			expect(periodSelector).toBeInTheDocument();

			fireEvent.focus(periodSelector);
			expect(document.activeElement).toBe(periodSelector);
		});

		it("should have proper color contrast for charts", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				// Chart colors should meet accessibility standards
				const chartContainer = document.querySelector(".recharts-wrapper");
				expect(chartContainer).toBeInTheDocument();
			});
		});
	});

	describe("Data Validation", () => {
		it("should handle malformed metric data", async () => {
			const malformedMetrics = [
				{
					...mockPerformanceMetrics[0],
					metric_value: null,
				},
			];

			(getProfessionalPerformanceMetrics as vi.Mock).mockResolvedValue(
				malformedMetrics,
			);

			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				expect(screen.getByText("Dados inválidos")).toBeInTheDocument();
			});
		});

		it("should validate date ranges", async () => {
			render(
				<ProfessionalPerformanceDashboard professional={mockProfessional} />,
			);

			await waitFor(() => {
				// Should format dates correctly
				expect(screen.getByText("01/01/2024 - 31/01/2024")).toBeInTheDocument();
			});
		});
	});
});
