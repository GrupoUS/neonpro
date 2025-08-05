"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preloadOnHover =
  exports.preloadComponents =
  exports.ReportsAnalyticsSkeleton =
  exports.StockDashboardSkeleton =
  exports.PatientManagementSkeleton =
  exports.FinancialDashboardSkeleton =
  exports.AppointmentCalendarSkeleton =
  exports.LazyReportsAnalytics =
  exports.LazyStockDashboard =
  exports.LazyPatientManagement =
  exports.LazyFinancialDashboard =
  exports.LazyAppointmentCalendar =
    void 0;
exports.withLazyLoading = withLazyLoading;
var react_1 = require("react");
var skeleton_1 = require("@/components/ui/skeleton");
var card_1 = require("@/components/ui/card");
// Lazy load heavy dashboard components
exports.LazyAppointmentCalendar = (0, react_1.lazy)(() =>
  Promise.resolve()
    .then(() => require("./appointments/calendar/calendar-view"))
    .then((module) => ({
      default: module.CalendarView,
    })),
);
exports.LazyFinancialDashboard = (0, react_1.lazy)(() =>
  Promise.resolve()
    .then(() => require("./financial/financial-overview"))
    .then((module) => ({
      default: module.FinancialOverview,
    })),
);
exports.LazyPatientManagement = (0, react_1.lazy)(() =>
  Promise.resolve()
    .then(() => require("./patients/patient-management"))
    .then((module) => ({
      default: module.PatientManagement,
    })),
);
exports.LazyStockDashboard = (0, react_1.lazy)(() =>
  Promise.resolve()
    .then(() => require("./stock/stock-dashboard"))
    .then((module) => ({
      default: module.StockDashboard,
    })),
);
exports.LazyReportsAnalytics = (0, react_1.lazy)(() =>
  Promise.resolve()
    .then(() => require("./reports/analytics-dashboard"))
    .then((module) => ({
      default: module.AnalyticsDashboard,
    })),
);
// Loading components with skeleton UI
var AppointmentCalendarSkeleton = () => (
  <card_1.Card className="w-full h-[600px]">
    <card_1.CardHeader>
      <skeleton_1.Skeleton className="h-6 w-48" />
      <skeleton_1.Skeleton className="h-4 w-32" />
    </card_1.CardHeader>
    <card_1.CardContent className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <skeleton_1.Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </card_1.CardContent>
  </card_1.Card>
);
exports.AppointmentCalendarSkeleton = AppointmentCalendarSkeleton;
var FinancialDashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <card_1.Card key={i}>
          <card_1.CardHeader>
            <skeleton_1.Skeleton className="h-4 w-24" />
            <skeleton_1.Skeleton className="h-8 w-32" />
          </card_1.CardHeader>
        </card_1.Card>
      ))}
    </div>
    <card_1.Card>
      <card_1.CardHeader>
        <skeleton_1.Skeleton className="h-6 w-48" />
      </card_1.CardHeader>
      <card_1.CardContent>
        <skeleton_1.Skeleton className="h-64 w-full" />
      </card_1.CardContent>
    </card_1.Card>
  </div>
);
exports.FinancialDashboardSkeleton = FinancialDashboardSkeleton;
var PatientManagementSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <skeleton_1.Skeleton className="h-8 w-48" />
      <skeleton_1.Skeleton className="h-10 w-32" />
    </div>
    <card_1.Card>
      <card_1.CardContent className="p-0">
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4">
              <skeleton_1.Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <skeleton_1.Skeleton className="h-4 w-48" />
                <skeleton_1.Skeleton className="h-3 w-32" />
              </div>
              <skeleton_1.Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </card_1.CardContent>
    </card_1.Card>
  </div>
);
exports.PatientManagementSkeleton = PatientManagementSkeleton;
var StockDashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <card_1.Card key={i}>
          <card_1.CardHeader className="pb-2">
            <skeleton_1.Skeleton className="h-4 w-20" />
            <skeleton_1.Skeleton className="h-6 w-16" />
          </card_1.CardHeader>
        </card_1.Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <card_1.Card key={i}>
          <card_1.CardHeader>
            <skeleton_1.Skeleton className="h-5 w-32" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <skeleton_1.Skeleton className="h-48 w-full" />
          </card_1.CardContent>
        </card_1.Card>
      ))}
    </div>
  </div>
);
exports.StockDashboardSkeleton = StockDashboardSkeleton;
var ReportsAnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <card_1.Card key={i}>
          <card_1.CardHeader>
            <skeleton_1.Skeleton className="h-4 w-24" />
            <skeleton_1.Skeleton className="h-6 w-20" />
          </card_1.CardHeader>
        </card_1.Card>
      ))}
    </div>
    <card_1.Card>
      <card_1.CardHeader>
        <skeleton_1.Skeleton className="h-6 w-40" />
      </card_1.CardHeader>
      <card_1.CardContent>
        <skeleton_1.Skeleton className="h-80 w-full" />
      </card_1.CardContent>
    </card_1.Card>
  </div>
);
exports.ReportsAnalyticsSkeleton = ReportsAnalyticsSkeleton;
// Higher-order component for lazy loading with error boundary
function withLazyLoading(LazyComponent, LoadingSkeleton, componentName) {
  return function LazyWrapper(props) {
    return (
      <react_1.Suspense fallback={<LoadingSkeleton />}>
        <LazyComponent {...props} />
      </react_1.Suspense>
    );
  };
}
// Preload functions for critical routes
exports.preloadComponents = {
  appointments: () =>
    Promise.resolve().then(() => require("./appointments/calendar/calendar-view")),
  financial: () => Promise.resolve().then(() => require("./financial/financial-overview")),
  patients: () => Promise.resolve().then(() => require("./patients/patient-management")),
  stock: () => Promise.resolve().then(() => require("./stock/stock-dashboard")),
  reports: () => Promise.resolve().then(() => require("./reports/analytics-dashboard")),
};
// Preload based on user interaction
var preloadOnHover = (componentKey) => ({
  onMouseEnter: () => exports.preloadComponents[componentKey](),
  onFocus: () => exports.preloadComponents[componentKey](),
});
exports.preloadOnHover = preloadOnHover;
