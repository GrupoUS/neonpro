"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = void 0;
exports.default = PatientPortalPage;
var react_1 = require("react");
var patient_dashboard_1 = require("@/components/patient-portal/patient-dashboard");
var portal_layout_1 = require("@/components/patient-portal/portal-layout");
var loading_spinner_1 = require("@/components/ui/loading-spinner");
// Disable static generation for this page since it uses client-side auth
exports.dynamic = "force-dynamic";
function PatientPortalPage() {
  return (
    <portal_layout_1.PortalLayout>
      <react_1.Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <loading_spinner_1.LoadingSpinner size="lg" />
            <span className="ml-3 text-muted-foreground">Carregando portal do paciente...</span>
          </div>
        }
      >
        <patient_dashboard_1.PatientDashboard />
      </react_1.Suspense>
    </portal_layout_1.PortalLayout>
  );
}
