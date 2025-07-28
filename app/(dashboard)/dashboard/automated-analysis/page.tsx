// app/(dashboard)/dashboard/automated-analysis/page.tsx
// Dashboard page for Story 10.1: Automated Before/After Analysis

import { AutomatedBeforeAfterAnalysis } from "@/app/components/dashboard/automated-before-after-analysis";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automated Before/After Analysis | NeonPro",
  description:
    "AI-powered photo analysis with ≥95% accuracy and <30s processing time",
};

export default function AutomatedAnalysisPage() {
  return (
    <div className="container mx-auto py-6">
      <AutomatedBeforeAfterAnalysis />
    </div>
  );
}
