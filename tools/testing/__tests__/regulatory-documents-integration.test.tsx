import "@testing-library/jest-dom";

import { vi } from "vitest";
import "@testing-library/jest-dom";
import { RegulatoryDocumentsList } from "@/components/regulatory-documents/regulatory-documents-list";
import { useRegulatoryDocuments } from "@/hooks/use-regulatory-documents";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";

// Mock the custom hook
vi.mock("@/hooks/use-regulatory-documents");
const mockUseRegulatoryDocuments = useRegulatoryDocuments as vi.MockedFunction<
	typeof useRegulatoryDocuments
>;

// Mock next/navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
}));

describe("RegulatoryDocumentsList Integration", () => {
	const mockDocuments = [
		{
			id: "1",
			title: "ANVISA Compliance Document",
			category: "ANVISA",
			type: "regulamento" as const,
			file_path: "/documents/anvisa-doc.pdf",
			expiration_date: "2025-12-31",
			created_at: "2025-01-22",
			updated_at: "2025-01-22",
		},
		{
			id: "2",
			title: "CFM Guidelines",
			category: "CFM",
			type: "diretriz" as const,
			file_path: "/documents/cfm-guidelines.pdf",
			expiration_date: "2025-06-30",
			created_at: "2025-01-22",
			updated_at: "2025-01-22",
		},
	];

	beforeEach(() => {
		cleanup(); // Ensure clean DOM before each test
		mockUseRegulatoryDocuments.mockReturnValue({
			documents: mockDocuments,
			loading: false,
			error: null,
			refetch: vi.fn(),
			createDocument: vi.fn(),
			updateDocument: vi.fn(),
			deleteDocument: vi.fn(),
		});
	});

	afterEach(() => {
		cleanup(); // Clean up DOM after each test
		vi.clearAllMocks();
	});

	it("renders documents list with proper data", () => {
		render(<RegulatoryDocumentsList />);

		expect(screen.getByText("ANVISA Compliance Document")).toBeInTheDocument();
		expect(screen.getByText("CFM Guidelines")).toBeInTheDocument();
		expect(screen.getByText("ANVISA")).toBeInTheDocument();
		expect(screen.getByText("CFM")).toBeInTheDocument();
	});

	it("shows loading state when fetching documents", () => {
		mockUseRegulatoryDocuments.mockReturnValue({
			documents: [],
			loading: true,
			error: null,
			refetch: vi.fn(),
			createDocument: vi.fn(),
			updateDocument: vi.fn(),
			deleteDocument: vi.fn(),
		});

		render(<RegulatoryDocumentsList />);

		expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
	});

	it("displays error message when fetch fails", () => {
		mockUseRegulatoryDocuments.mockReturnValue({
			documents: [],
			loading: false,
			error: "Failed to fetch documents",
			refetch: vi.fn(),
			createDocument: vi.fn(),
			updateDocument: vi.fn(),
			deleteDocument: vi.fn(),
		});

		render(<RegulatoryDocumentsList />);

		expect(screen.getByText("Error loading documents")).toBeInTheDocument();
		expect(screen.getByText("Failed to fetch documents")).toBeInTheDocument();
	});

	it("handles document deletion", async () => {
		const mockDeleteDocument = vi.fn().mockResolvedValue(undefined);
		mockUseRegulatoryDocuments.mockReturnValue({
			documents: mockDocuments,
			loading: false,
			error: null,
			refetch: vi.fn(),
			createDocument: vi.fn(),
			updateDocument: vi.fn(),
			deleteDocument: mockDeleteDocument,
		});

		render(<RegulatoryDocumentsList />);

		// Click delete button for first document (CFM Guidelines - ID '2' when sorted by expiration date)
		const deleteButtons = screen.getAllByTestId("delete-document-button");
		fireEvent.click(deleteButtons[0]);

		// Confirm deletion in modal
		const confirmButton = screen.getByTestId("confirm-delete-button");
		fireEvent.click(confirmButton);

		await waitFor(() => {
			expect(mockDeleteDocument).toHaveBeenCalledWith("2");
		});
	});

	it("filters documents by category", () => {
		render(<RegulatoryDocumentsList />);

		// Select ANVISA filter
		const categoryFilter = screen.getByTestId("category-filter");
		fireEvent.change(categoryFilter, { target: { value: "ANVISA" } });

		// Should show only ANVISA documents
		expect(screen.getByText("ANVISA Compliance Document")).toBeInTheDocument();
		expect(screen.queryByText("CFM Guidelines")).not.toBeInTheDocument();
	});

	it("sorts documents by expiration date", () => {
		render(<RegulatoryDocumentsList />);

		// Select expiration date sort
		const sortSelect = screen.getByTestId("sort-select");
		fireEvent.change(sortSelect, { target: { value: "expiration_date" } });

		// Verify documents are sorted properly
		const documentTitles = screen.getAllByTestId("document-title");
		expect(documentTitles[0]).toHaveTextContent("CFM Guidelines"); // Earlier expiration
		expect(documentTitles[1]).toHaveTextContent("ANVISA Compliance Document"); // Later expiration
	});
});
