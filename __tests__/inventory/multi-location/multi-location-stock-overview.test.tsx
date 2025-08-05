import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MultiLocationStockOverview } from "@/components/inventory/multi-location/multi-location-stock-overview";
import { multiLocationInventoryService } from "@/lib/services/multi-location-inventory-service";

// Mock the service
jest.mock("@/lib/services/multi-location-inventory-service");

const mockService = multiLocationInventoryService as jest.Mocked<
  typeof multiLocationInventoryService
>;

const mockStockData = [
  {
    item_id: "1",
    item_name: "Botox 100u",
    item_sku: "BTX100",
    clinic_id: "clinic-1",
    clinic_name: "Clínica Centro",
    room_id: "room-1",
    room_name: "Sala 1",
    current_quantity: 50,
    minimum_quantity: 10,
    expiry_date: "2025-06-01",
    batch_number: "BTX001",
    cost_per_unit: 250.0,
    total_value: 12500.0,
    last_updated: "2024-01-20T10:00:00Z",
  },
  {
    item_id: "2",
    item_name: "Preenchimento 1ml",
    item_sku: "FIL1ML",
    clinic_id: "clinic-2",
    clinic_name: "Clínica Norte",
    room_id: "room-2",
    room_name: "Sala 2",
    current_quantity: 5,
    minimum_quantity: 10,
    expiry_date: "2024-03-01",
    batch_number: "FIL001",
    cost_per_unit: 180.0,
    total_value: 900.0,
    last_updated: "2024-01-20T11:00:00Z",
  },
];

const mockLocationSummary = [
  {
    clinic_id: "clinic-1",
    clinic_name: "Clínica Centro",
    total_items: 25,
    total_value: 45000.0,
    low_stock_count: 2,
    expiring_count: 1,
  },
  {
    clinic_id: "clinic-2",
    clinic_name: "Clínica Norte",
    total_items: 18,
    total_value: 32000.0,
    low_stock_count: 3,
    expiring_count: 2,
  },
];

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("MultiLocationStockOverview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockService.getInventoryStock.mockResolvedValue(mockStockData);
    mockService.getLocationStockSummary.mockResolvedValue(mockLocationSummary);
    mockService.getLowStockAlerts.mockResolvedValue([mockStockData[1]]);
    mockService.getExpiringItems.mockResolvedValue([mockStockData[1]]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    render(
      <TestWrapper>
        <MultiLocationStockOverview />
      </TestWrapper>,
    );

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("renders stock overview with data", async () => {
    render(
      <TestWrapper>
        <MultiLocationStockOverview />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Visão Geral do Estoque")).toBeInTheDocument();
    });

    expect(screen.getByText("Botox 100u")).toBeInTheDocument();
    expect(screen.getByText("BTX100")).toBeInTheDocument();
    expect(screen.getByText("Clínica Centro")).toBeInTheDocument();
  });

  it("shows low stock and expiring alerts", async () => {
    render(
      <TestWrapper>
        <MultiLocationStockOverview />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Estoque Baixo")).toBeInTheDocument();
    });

    expect(screen.getByText("Vencendo")).toBeInTheDocument();
  });

  it("filters by search term", async () => {
    render(
      <TestWrapper>
        <MultiLocationStockOverview />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Botox 100u")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Buscar por nome, SKU ou localização...");
    fireEvent.change(searchInput, { target: { value: "Botox" } });

    await waitFor(() => {
      expect(mockService.getInventoryStock).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "Botox",
        }),
      );
    });
  });

  it("shows location filter when showLocationFilter is true", async () => {
    render(
      <TestWrapper>
        <MultiLocationStockOverview showLocationFilter={true} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Localização")).toBeInTheDocument();
    });

    expect(screen.getByText("Todas Localizações")).toBeInTheDocument();
  });

  it("does not show location filter when showLocationFilter is false", () => {
    render(
      <TestWrapper>
        <MultiLocationStockOverview showLocationFilter={false} />
      </TestWrapper>,
    );

    expect(screen.queryByText("Localização")).not.toBeInTheDocument();
  });

  it("handles category filter changes", async () => {
    render(
      <TestWrapper>
        <MultiLocationStockOverview />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Categoria")).toBeInTheDocument();
    });

    const categorySelect = screen.getByDisplayValue("Todas Categorias");
    fireEvent.click(categorySelect);

    const medicationOption = screen.getByText("Medicamentos");
    fireEvent.click(medicationOption);

    await waitFor(() => {
      expect(mockService.getInventoryStock).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "medication",
        }),
      );
    });
  });
});
