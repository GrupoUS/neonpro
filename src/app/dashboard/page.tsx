import ChartCard from "@/components/dashboard/ChartCard";
import MetricCardGroup from "@/components/dashboard/MetricCardGroup";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { createClient } from "@/lib/supabase/server";
import {
  Activity,
  BarChart3,
  CreditCard,
  DollarSign,
  LineChart as LineChartIcon,
  Package,
  PieChart as PieChartIcon,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Enable Partial Prerendering for dashboard
export const experimental_ppr = true;

export const metadata: Metadata = {
  title: "Dashboard | NEONPRO",
  description: "View your dashboard and analytics",
};

// Define MetricCardProps type inline
type MetricCardProps = {
  title: string;
  value: number;
  previousValue?: number;
  change?: number;
  trend?: "up" | "down";
  icon: any;
  color: "green" | "blue" | "purple" | "yellow" | "red" | "gray";
  variant: "detailed" | "compact";
  sparklineData?: Array<{ value: number }>;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

// Generate sample sparkline data
const generateSparklineData = (points: number = 7) => {
  return Array.from({ length: points }, (_, i) => ({
    value: Math.floor(Math.random() * 100) + 50,
  }));
};

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const mainMetrics: MetricCardProps[] = [
    {
      title: "Total Revenue",
      value: 45231.89,
      previousValue: 37654.32,
      change: 20.1,
      trend: "up",
      icon: DollarSign,
      color: "green",
      variant: "detailed",
      sparklineData: generateSparklineData(),
      prefix: "$",
      decimals: 2,
    },
    {
      title: "Active Users",
      value: 2350,
      previousValue: 2041,
      change: 15.3,
      trend: "up",
      icon: Users,
      color: "blue",
      variant: "detailed",
      sparklineData: generateSparklineData(),
    },
    {
      title: "Conversion Rate",
      value: 12.5,
      previousValue: 12.8,
      change: -2.4,
      trend: "down",
      icon: TrendingUp,
      color: "purple",
      variant: "detailed",
      sparklineData: generateSparklineData(),
      suffix: "%",
      decimals: 1,
    },
    {
      title: "Active Sessions",
      value: 1234,
      previousValue: 1175,
      change: 5.1,
      trend: "up",
      icon: Activity,
      color: "yellow",
      variant: "detailed",
      sparklineData: generateSparklineData(),
    },
  ];

  const secondaryMetrics: MetricCardProps[] = [
    {
      title: "Total Orders",
      value: 342,
      change: 12.3,
      trend: "up",
      icon: ShoppingCart,
      color: "green",
      variant: "compact",
    },
    {
      title: "Products Sold",
      value: 1543,
      change: 8.7,
      trend: "up",
      icon: Package,
      color: "blue",
      variant: "compact",
    },
    {
      title: "Pending Payments",
      value: 23,
      change: -15.2,
      trend: "down",
      icon: CreditCard,
      color: "red",
      variant: "compact",
    },
    {
      title: "New Customers",
      value: 89,
      change: 23.1,
      trend: "up",
      icon: UserCheck,
      color: "purple",
      variant: "compact",
    },
  ];

  // Sample chart data
  const revenueData = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 5000 },
    { name: "Apr", revenue: 2780 },
    { name: "May", revenue: 1890 },
    { name: "Jun", revenue: 2390 },
    { name: "Jul", revenue: 3490 },
  ];

  const trafficData = [
    { name: "Mon", visits: 2400 },
    { name: "Tue", visits: 1398 },
    { name: "Wed", visits: 9800 },
    { name: "Thu", visits: 3908 },
    { name: "Fri", visits: 4800 },
    { name: "Sat", visits: 3800 },
    { name: "Sun", visits: 4300 },
  ];

  const categoryData = [
    { name: "Electronics", value: 400 },
    { name: "Clothing", value: 300 },
    { name: "Food", value: 300 },
    { name: "Books", value: 200 },
    { name: "Other", value: 100 },
  ];

  // Sample activities
  const recentActivities = [
    {
      id: "1",
      type: "order" as const,
      title: "New Order #12345",
      description: "Order placed by John Doe for $299.99",
      timestamp: "2 min ago",
      user: "John Doe",
    },
    {
      id: "2",
      type: "user" as const,
      title: "New User Registration",
      description: "Sarah Johnson joined the platform",
      timestamp: "15 min ago",
      user: "Sarah Johnson",
    },
    {
      id: "3",
      type: "payment" as const,
      title: "Payment Received",
      description: "Invoice #INV-2024-001 paid in full",
      timestamp: "1 hour ago",
      user: "Michael Brown",
    },
    {
      id: "4",
      type: "delivery" as const,
      title: "Order Shipped",
      description: "Order #12344 shipped via FedEx",
      timestamp: "2 hours ago",
    },
    {
      id: "5",
      type: "success" as const,
      title: "Goal Achieved",
      description: "Monthly revenue target exceeded by 20%",
      timestamp: "3 hours ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Main Metrics */}
      <MetricCardGroup cards={mainMetrics} columns={4} className="mb-8" />

      {/* Secondary Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Secondary Metrics
        </h2>
        <MetricCardGroup cards={secondaryMetrics} columns={4} />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Revenue Overview
            </h2>
            <select className="glass-input px-3 py-1.5 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            {/* Chart placeholder */}
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chart visualization here</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-grupous-secondary mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    New user registered
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {i} hour{i > 1 ? "s" : ""} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Revenue Overview"
          subtitle="Monthly revenue trends"
          icon={LineChartIcon}
          data={revenueData}
          chartType="area"
          dataKey="revenue"
          color="#AC9469"
          height={350}
        />

        <ChartCard
          title="Traffic Analytics"
          subtitle="Daily website visits"
          icon={BarChart3}
          data={trafficData}
          chartType="bar"
          dataKey="visits"
          color="#112031"
          height={350}
        />
      </div>

      {/* Bottom Section - Activity and More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Sales by Category"
            subtitle="Product category distribution"
            icon={PieChartIcon}
            data={categoryData}
            chartType="pie"
            dataKey="value"
            xKey="name"
            height={400}
            showLegend={true}
          />
        </div>

        <RecentActivity activities={recentActivities} className="h-full" />
      </div>
    </div>
  );
}
