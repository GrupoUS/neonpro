import { Activity, BarChart3, PieChart, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Analytics
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Track your performance metrics and insights
        </p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Overview */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-grupous-secondary" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Traffic Overview
            </h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <BarChart3 className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p>Traffic chart visualization</p>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-grupous-secondary" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Conversion Funnel
            </h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <TrendingUp className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p>Funnel visualization</p>
            </div>
          </div>
        </div>

        {/* User Demographics */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="h-6 w-6 text-grupous-secondary" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              User Demographics
            </h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <PieChart className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p>Demographics chart</p>
            </div>
          </div>
        </div>

        {/* Real-time Activity */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-6 w-6 text-grupous-secondary" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Real-time Activity
            </h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Activity className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p>Activity stream</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
