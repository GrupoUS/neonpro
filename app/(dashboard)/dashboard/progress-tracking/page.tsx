// Story 10.2: Progress Tracking through Computer Vision - Dashboard Page
// Next.js page for progress tracking dashboard

import ProgressTrackingDashboard from "@/app/components/dashboard/progress-tracking";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress Tracking | NeonPro",
  description:
    "Computer vision-powered treatment progress monitoring and analytics",
};

export default function ProgressTrackingPage() {
  return (
    <div className="container mx-auto py-6">
      <ProgressTrackingDashboard />
    </div>
  );
}
