/**
 * ActiveSessionsTable Component Tests
 * Following TDD methodology for security vulnerability remediation
 * Healthcare compliance: LGPD, ANVISA, CFM standards
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActiveSessionsTable } from "./ActiveSessionsTable";

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock data for testing
const mockSessions = [
  {
    id: "session-1",
    userId: "user-123",
    userEmail: "medico@hospital.com",
    deviceInfo: "Chrome 120.0 on Windows 10",
    ipAddress: "192.168.1.100",
    location: "São Paulo, SP",
    lastActivity: "2025-08-30T14:30:00Z",
    isCurrentSession: false,
    riskLevel: "low",
  },
  {
    id: "session-2",
    userId: "user-456",
    userEmail: "enfermeira@clinica.com",
    deviceInfo: "Safari 17.0 on macOS",
    ipAddress: "10.0.0.50",
    location: "Rio de Janeiro, RJ",
    lastActivity: "2025-08-30T14:25:00Z",
    isCurrentSession: true,
    riskLevel: "medium",
  },
];

describe("ActiveSessionsTable Security Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sessions: mockSessions }),
    });
  });

  describe("Security Vulnerability: confirm() usage", () => {
    it("should NOT use browser confirm() for session termination", async () => {
      // RED: This test should fail initially because confirm() is still used
      const confirmSpy = vi.spyOn(window, "confirm");

      render(<ActiveSessionsTable />);

      // Wait for sessions to load
      await waitFor(() => {
        expect(screen.getByText("medico@hospital.com")).toBeInTheDocument();
      });

      // Find and click terminate button for first session
      const terminateButtons = screen.getAllByText("Encerrar");
      fireEvent.click(terminateButtons[0]);

      // SECURITY REQUIREMENT: Should NOT use browser confirm()
      expect(confirmSpy).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it("should use accessible confirmation dialog instead of confirm()", async () => {
      render(<ActiveSessionsTable />);

      await waitFor(() => {
        expect(screen.getByText("medico@hospital.com")).toBeInTheDocument();
      });

      const terminateButtons = screen.getAllByText("Encerrar");
      fireEvent.click(terminateButtons[0]);

      // Should show proper confirmation dialog with WCAG 2.1 AA+ compliance
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/tem certeza que deseja encerrar/i)).toBeInTheDocument();

      // Should have proper ARIA labels for accessibility
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby");
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-describedby");
    });

    it("should handle confirmation dialog keyboard navigation", async () => {
      render(<ActiveSessionsTable />);

      await waitFor(() => {
        expect(screen.getByText("medico@hospital.com")).toBeInTheDocument();
      });

      const terminateButtons = screen.getAllByText("Encerrar");
      fireEvent.click(terminateButtons[0]);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // Should be able to navigate with keyboard (WCAG 2.1 AA+ requirement)
      const confirmButton = screen.getByText("Confirmar");
      const cancelButton = screen.getByText("Cancelar");

      // Test Tab navigation
      fireEvent.keyDown(dialog, { key: "Tab" });
      expect(confirmButton).toHaveFocus();

      fireEvent.keyDown(dialog, { key: "Tab" });
      expect(cancelButton).toHaveFocus();

      // Test Escape key to close dialog
      fireEvent.keyDown(dialog, { key: "Escape" });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
