
import { Suspense } from "react";

// Enable Partial Prerendering for this page
export const experimental_ppr = true;

// Static Components (Prerendered)
function StaticHeroSection() {
  return (
    <header className="text-center mb-12">
      <h1 className="text-4xl font-bold text-primary mb-4">NEONPRO</h1>
      <p className="text-xl text-text-secondary">
        Powered by Next.js 15 + PPR + Drizzle ORM + Supabase
      </p>
    </header>
  );
}

function StaticFeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      <div className="bg-surface p-6 rounded-lg border border-border shadow-card">
        <h2 className="text-xl font-semibold text-primary mb-3">
          Partial Prerendering
        </h2>
        <p className="text-text-secondary">
          Next.js 15 PPR for optimal performance with static + dynamic content.
        </p>
      </div>

      <div className="bg-surface p-6 rounded-lg border border-border shadow-card">
        <h2 className="text-xl font-semibold text-secondary mb-3">
          Drizzle ORM
        </h2>
        <p className="text-text-secondary">
          Type-safe database queries with Drizzle ORM and Supabase Postgres.
        </p>
      </div>

      <div className="bg-surface p-6 rounded-lg border border-border shadow-card">
        <h2 className="text-xl font-semibold text-info mb-3">Server Actions</h2>
        <p className="text-text-secondary">
          Type-safe server actions for seamless client-server communication.
        </p>
      </div>
    </div>
  );
}

// Dynamic Components (Streamed)
async function DynamicAppointments() {
  // Simulate database fetch
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <div className="bg-gradient-primary text-white p-8 rounded-xl text-center">
      <h2 className="text-2xl font-bold mb-4">
        Architecture Upgrade Complete!
      </h2>
      <p className="text-lg opacity-90">
        NEONPRO now features the latest tech stack from deep research analysis
      </p>
    </div>
  );
}

// Skeleton Components
function AppointmentsSkeleton() {
  return (
    <div className="bg-gray-200 animate-pulse p-8 rounded-xl">
      <div className="h-8 bg-gray-300 rounded mb-4"></div>
      <div className="h-4 bg-gray-300 rounded"></div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Static Content - Prerendered */}
        <StaticHeroSection />
        <StaticFeatureCards />

        {/* Dynamic Content - Streamed */}
        <Suspense fallback={<AppointmentsSkeleton />}>
          <DynamicAppointments />
        </Suspense>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-success/10 border border-success/20 p-4 rounded-lg text-center">
            <div className="text-success font-semibold">Success</div>
            <div className="text-sm text-text-muted">PPR Enabled</div>
          </div>
          <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg text-center">
            <div className="text-warning font-semibold">Database</div>
            <div className="text-sm text-text-muted">Drizzle + Supabase</div>
          </div>
          <div className="bg-error/10 border border-error/20 p-4 rounded-lg text-center">
            <div className="text-error font-semibold">Actions</div>
            <div className="text-sm text-text-muted">Server Actions</div>
          </div>
          <div className="bg-info/10 border border-info/20 p-4 rounded-lg text-center">
            <div className="text-info font-semibold">AI Ready</div>
            <div className="text-sm text-text-muted">OpenAI + Vercel</div>
          </div>
        </div>
      </div>
    </main>
  );
}
