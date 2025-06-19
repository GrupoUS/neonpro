import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card-server";
import {
  ArrowRight,
  Brain,
  Code2,
  Database,
  Rocket,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { Suspense } from "react";

// Enable Partial Prerendering for this page
export const experimental_ppr = true;

// Static Components with Glass Morphism
function StaticHeroSection() {
  return (
    <header className="relative text-center mb-20 py-16 animate-fade">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#AC9469]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#112031]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle mb-6 animate-scale">
          <Sparkles className="w-4 h-4 text-[#AC9469]" />
          <span className="text-sm font-medium">
            Next Generation SaaS Platform
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6">
          <span className="gradient-text">NEON</span>
          <span className="text-[#AC9469] glow-gold">PRO</span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Powered by Next.js 15 with PPR, Drizzle ORM, and Supabase. Experience
          the future of web development with cutting-edge performance.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button className="btn-primary px-8 py-4 flex items-center gap-2 hover:scale-105 transition-transform">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>

          <button className="btn-secondary px-8 py-4 hover:scale-105 transition-transform">
            View Demo
          </button>
        </div>
      </div>
    </header>
  );
}

function StaticFeatureCards() {
  const features = [
    {
      icon: Zap,
      title: "Partial Prerendering",
      description:
        "Next.js 15 PPR for optimal performance with static + dynamic content.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Database,
      title: "Drizzle ORM",
      description:
        "Type-safe database queries with Drizzle ORM and Supabase Postgres.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Server Actions",
      description:
        "Type-safe server actions for seamless client-server communication.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Rocket,
      title: "Edge Runtime",
      description:
        "Deploy globally with Vercel Edge Functions for ultra-low latency.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Code2,
      title: "TypeScript First",
      description:
        "100% type-safe from database to frontend with end-to-end types.",
      gradient: "from-red-500 to-rose-500",
    },
    {
      icon: Brain,
      title: "AI Integration",
      description: "Built-in AI capabilities with Vercel AI SDK and OpenAI.",
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
      {features.map((feature, index) => {
        const FeatureIcon = feature.icon;
        return (
          <Card
            key={index}
            variant="interactive"
            className={`h-full hover-lift animate-slide-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader>
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}
              >
                <FeatureIcon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Dynamic Components with Glass Effect
async function DynamicStats() {
  // Simulate database fetch
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const stats = [
    { label: "Active Users", value: "10,243", change: "+12.5%" },
    { label: "Total Revenue", value: "$84,254", change: "+23.1%" },
    { label: "Conversion Rate", value: "3.2%", change: "+0.8%" },
    { label: "Response Time", value: "45ms", change: "-15.2%" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="glass-strong rounded-xl p-6 text-center hover-lift animate-scale"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <h3 className="text-3xl font-bold gradient-text mb-2">
            {stat.value}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">{stat.label}</p>
          <span
            className={`text-sm font-medium ${
              stat.change.startsWith("+") ? "text-green-500" : "text-red-500"
            }`}
          >
            {stat.change}
          </span>
        </div>
      ))}
    </div>
  );
}

// Skeleton Components with Glass Effect
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass rounded-xl p-6 animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Static Content - Prerendered */}
          <StaticHeroSection />
          <StaticFeatureCards />

          {/* Dynamic Content - Streamed */}
          <Suspense fallback={<StatsSkeleton />}>
            <DynamicStats />
          </Suspense>

          {/* Call to Action Section */}
          <section className="relative overflow-hidden rounded-3xl glass-strong p-12 text-center mb-20 animate-fade">
            <div className="absolute inset-0 bg-gradient-to-br from-[#AC9469]/20 to-[#112031]/20" />

            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Build Something Amazing?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of developers using NEONPRO to create the next
                generation of web applications.
              </p>
              <button className="btn-primary px-12 py-4 text-lg hover:scale-105 transition-transform">
                Start Building Today
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
