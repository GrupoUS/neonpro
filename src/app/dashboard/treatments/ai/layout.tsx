import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Treatment Recommendations | NEONPRO",
  description: "AI-powered treatment recommendations for aesthetic medicine",
};

export default function AITreatmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
