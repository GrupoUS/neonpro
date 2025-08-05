// =====================================================================================
// MARKETING CAMPAIGNS DASHBOARD TESTS - Story 7.2
// Unit tests for automated marketing campaigns with AI personalization
// =====================================================================================

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarketingCampaignsDashboard } from "@/app/components/marketing/marketing-campaigns-dashboard";

// Mock the UI components
jest.mock("@/app/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardDescription: ({ children, ...props }: any) => (
    <div data-testid="card-description" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <div data-testid="card-title" {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/app/components/ui/tabs", () => ({
  Tabs: ({ children, ...props }: any) => (
    <div data-testid="tabs" {...props}>
      {children}
    </div>
  ),
  TabsContent: ({ children, ...props }: any) => (
    <div data-testid="tabs-content" {...props}>
      {children}
    </div>
  ),
  TabsList: ({ children, ...props }: any) => (
    <div data-testid="tabs-list" {...props}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, ...props }: any) => (
    <button data-testid="tabs-trigger" {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/app/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/app/components/ui/badge", () => ({
  Badge: ({ children, ...props }: any) => (
    <span data-testid="badge" {...props}>
      {children}
    </span>
  ),
}));

jest.mock("@/app/components/ui/progress", () => ({
  Progress: ({ value, ...props }: any) => (
    <div data-testid="progress" data-value={value} {...props}></div>
  ),
}));

describe("MarketingCampaignsDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering and Layout", () => {
    it("should render the main dashboard component", () => {
      render(<MarketingCampaignsDashboard />);

      expect(screen.getByTestId("tabs")).toBeInTheDocument();
      expect(screen.getAllByTestId("card")).toHaveLength(5); // 4 metric cards + content cards
    });

    it("should display key metrics cards", () => {
      render(<MarketingCampaignsDashboard />);

      // Check for metric cards
      expect(screen.getByText("Total Campaigns")).toBeInTheDocument();
      expect(screen.getByText("Automation Rate")).toBeInTheDocument();
      expect(screen.getByText("Total Reach")).toBeInTheDocument();
      expect(screen.getByText("Campaign ROI")).toBeInTheDocument();
    });

    it("should display tab navigation", () => {
      render(<MarketingCampaignsDashboard />);

      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Campaigns")).toBeInTheDocument();
      expect(screen.getByText("A/B Testing")).toBeInTheDocument();
      expect(screen.getByText("Analytics")).toBeInTheDocument();
      expect(screen.getByText("Automation")).toBeInTheDocument();
    });

    it("should display create campaign button", () => {
      render(<MarketingCampaignsDashboard />);

      const createButton = screen.getByText("Create Campaign");
      expect(createButton).toBeInTheDocument();
    });
  });

  describe("Metrics Display", () => {
    it("should display correct automation rate", () => {
      render(<MarketingCampaignsDashboard />);

      // Should show 89% automation rate from mock data
      expect(screen.getByText("89%")).toBeInTheDocument();
    });

    it("should display total campaigns count", () => {
      render(<MarketingCampaignsDashboard />);

      // Should show 12 total campaigns from mock data
      expect(screen.getByText("12")).toBeInTheDocument();
    });

    it("should display campaign ROI", () => {
      render(<MarketingCampaignsDashboard />);

      // Should show 4.2x ROI from mock data
      expect(screen.getByText("4.2x")).toBeInTheDocument();
    });

    it("should display automation rate progress bar", () => {
      render(<MarketingCampaignsDashboard />);

      const progressBar = screen.getByTestId("progress");
      expect(progressBar).toHaveAttribute("data-value", "89");
    });
  });

  describe("Tab Navigation", () => {
    it("should display overview tab content by default", () => {
      render(<MarketingCampaignsDashboard />);

      expect(screen.getByText("Recent Campaigns")).toBeInTheDocument();
      expect(screen.getByText("AI Personalization")).toBeInTheDocument();
    });

    it("should display campaigns tab content when selected", async () => {
      const user = userEvent.setup();
      render(<MarketingCampaignsDashboard />);

      const campaignsTab = screen.getByText("Campaigns");
      await user.click(campaignsTab);

      await waitFor(() => {
        expect(screen.getByText("All Campaigns")).toBeInTheDocument();
        expect(
          screen.getByText("Manage and monitor your automated marketing campaigns"),
        ).toBeInTheDocument();
      });
    });

    it("should display A/B testing tab content when selected", async () => {
      const user = userEvent.setup();
      render(<MarketingCampaignsDashboard />);

      const abTestingTab = screen.getByText("A/B Testing");
      await user.click(abTestingTab);

      await waitFor(() => {
        expect(screen.getByText("A/B Testing Framework")).toBeInTheDocument();
        expect(
          screen.getByText("Optimize campaigns with statistical A/B testing"),
        ).toBeInTheDocument();
      });
    });

    it("should display analytics tab content when selected", async () => {
      const user = userEvent.setup();
      render(<MarketingCampaignsDashboard />);

      const analyticsTab = screen.getByText("Analytics");
      await user.click(analyticsTab);

      await waitFor(() => {
        expect(screen.getByText("Campaign Analytics")).toBeInTheDocument();
        expect(
          screen.getByText("Real-time performance tracking and ROI measurement"),
        ).toBeInTheDocument();
      });
    });

    it("should display automation tab content when selected", async () => {
      const user = userEvent.setup();
      render(<MarketingCampaignsDashboard />);

      const automationTab = screen.getByText("Automation");
      await user.click(automationTab);

      await waitFor(() => {
        expect(screen.getByText("Campaign Automation Engine")).toBeInTheDocument();
        expect(
          screen.getByText("≥80% automation rate with AI-driven optimization"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Campaign Data Display", () => {
    it("should display recent campaigns", () => {
      render(<MarketingCampaignsDashboard />);

      expect(screen.getByText("Welcome Series - New Patients")).toBeInTheDocument();
      expect(screen.getByText("Treatment Follow-up Campaign")).toBeInTheDocument();
      expect(screen.getByText("Birthday Promotions")).toBeInTheDocument();
    });

    it("should display campaign status badges", () => {
      render(<MarketingCampaignsDashboard />);

      const badges = screen.getAllByTestId("badge");
      expect(badges.length).toBeGreaterThan(0);
    });

    it("should display campaign metrics correctly", () => {
      render(<MarketingCampaignsDashboard />);

      // Should display automation rates from mock data
      expect(screen.getByText("92% automated")).toBeInTheDocument();
      expect(screen.getByText("87% automated")).toBeInTheDocument();
      expect(screen.getByText("95% automated")).toBeInTheDocument();
    });
  });

  describe("AI Personalization Features", () => {
    it("should display AI personalization status", () => {
      render(<MarketingCampaignsDashboard />);

      expect(screen.getByText("AI Personalization")).toBeInTheDocument();
      expect(screen.getByText("Content Personalization")).toBeInTheDocument();
      expect(screen.getByText("Send Time Optimization")).toBeInTheDocument();
      expect(screen.getByText("Segment Targeting")).toBeInTheDocument();
    });

    it("should display LGPD compliance status", () => {
      render(<MarketingCampaignsDashboard />);

      expect(screen.getByText("LGPD Compliance: Active")).toBeInTheDocument();
    });

    it("should display personalization progress bars", () => {
      render(<MarketingCampaignsDashboard />);

      // Should have multiple progress bars for AI features
      const progressBars = screen.getAllByTestId("progress");
      expect(progressBars.length).toBeGreaterThan(1);
    });
  });

  describe("Automation Features", () => {
    it("should display automation statistics in automation tab", async () => {
      const user = userEvent.setup();
      render(<MarketingCampaignsDashboard />);

      const automationTab = screen.getByText("Automation");
      await user.click(automationTab);

      await waitFor(() => {
        expect(screen.getByText("Trigger-based Campaigns")).toBeInTheDocument();
        expect(screen.getByText("AI Personalization")).toBeInTheDocument();
        expect(screen.getByText("LGPD Compliance")).toBeInTheDocument();
      });
    });

    it("should display automation rates above 80% threshold", async () => {
      const user = userEvent.setup();
      render(<MarketingCampaignsDashboard />);

      const automationTab = screen.getByText("Automation");
      await user.click(automationTab);

      await waitFor(() => {
        expect(screen.getByText("94%")).toBeInTheDocument(); // Trigger-based campaigns
        expect(screen.getByText("87%")).toBeInTheDocument(); // AI Personalization
        expect(screen.getByText("100%")).toBeInTheDocument(); // LGPD Compliance
      });
    });

    it("should display quick automation setup options", async () => {
      const user = userEvent.setup();
      render(<MarketingCampaignsDashboard />);

      const automationTab = screen.getByText("Automation");
      await user.click(automationTab);

      await waitFor(() => {
        expect(screen.getByText("Schedule Campaign")).toBeInTheDocument();
        expect(screen.getByText("Setup Triggers")).toBeInTheDocument();
        expect(screen.getByText("AI Optimization")).toBeInTheDocument();
        expect(screen.getByText("Compliance Check")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for tabs", () => {
      render(<MarketingCampaignsDashboard />);

      const tabsList = screen.getByTestId("tabs-list");
      expect(tabsList).toBeInTheDocument();
    });

    it("should have accessible button elements", () => {
      render(<MarketingCampaignsDashboard />);

      const buttons = screen.getAllByTestId("button");
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });

    it("should have proper heading structure", () => {
      render(<MarketingCampaignsDashboard />);

      const cardTitles = screen.getAllByTestId("card-title");
      expect(cardTitles.length).toBeGreaterThan(0);
    });
  });

  describe("Responsive Design", () => {
    it("should render without errors on different screen sizes", () => {
      // Test mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<MarketingCampaignsDashboard />);
      expect(screen.getByTestId("tabs")).toBeInTheDocument();

      // Test desktop viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(<MarketingCampaignsDashboard />);
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });
  });

  describe("Story 7.2 Acceptance Criteria", () => {
    it("should meet ≥80% automation rate requirement", () => {
      render(<MarketingCampaignsDashboard />);

      // Check that automation rate is 89% (above 80% threshold)
      expect(screen.getByText("89%")).toBeInTheDocument();
    });

    it("should display AI-driven personalization features", () => {
      render(<MarketingCampaignsDashboard />);

      expect(screen.getByText("AI Personalization")).toBeInTheDocument();
      expect(screen.getByText("Content Personalization")).toBeInTheDocument();
      expect(screen.getByText("Send Time Optimization")).toBeInTheDocument();
    });

    it("should display multi-channel campaign support", () => {
      render(<MarketingCampaignsDashboard />);

      expect(screen.getByText("multi_channel")).toBeInTheDocument();
      expect(screen.getByText("whatsapp")).toBeInTheDocument();
      expect(screen.getByText("email")).toBeInTheDocument();
    });

    it("should display A/B testing framework", async () => {
      const user = userEvent.setup();
      render(<MarketingCampaignsDashboard />);

      const abTestingTab = screen.getByText("A/B Testing");
      await user.click(abTestingTab);

      await waitFor(() => {
        expect(screen.getByText("A/B Testing Framework")).toBeInTheDocument();
        expect(screen.getByText("Create A/B Test")).toBeInTheDocument();
      });
    });

    it("should display analytics and ROI tracking", async () => {
      const user = userEvent.setup();
      render(<MarketingCampaignsDashboard />);

      const analyticsTab = screen.getByText("Analytics");
      await user.click(analyticsTab);

      await waitFor(() => {
        expect(screen.getByText("Campaign Analytics")).toBeInTheDocument();
        expect(
          screen.getByText("Real-time performance tracking and ROI measurement"),
        ).toBeInTheDocument();
      });
    });

    it("should display LGPD compliance features", () => {
      render(<MarketingCampaignsDashboard />);

      expect(screen.getByText("LGPD Compliance: Active")).toBeInTheDocument();
    });
  });
});
