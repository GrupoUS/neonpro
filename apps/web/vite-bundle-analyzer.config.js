/**
 * Vite Bundle Analyzer Configuration - Healthcare Platform
 *
 * Provides comprehensive bundle analysis and performance monitoring
 * for the NeonPro healthcare platform frontend.
 *
 * Features:
 * - Bundle size analysis and visualization
 * - Performance budget enforcement
 * - Healthcare-specific optimization recommendations
 * - Tree-shaking efficiency monitoring
 * - Code splitting effectiveness analysis
 */

import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// Healthcare Platform Performance Budgets (in KB)
const PERFORMANCE_BUDGETS = {
  // Critical chunks that must load fast for healthcare UX
  "vendor-react": 150, // React core - essential for all pages
  "vendor-router": 80, // Routing - critical for navigation
  "vendor-database": 120, // Supabase - critical for patient data
  "vendor-ui-base": 100, // Base UI components - essential UX

  // Feature chunks - larger budget for complex healthcare features
  "feature-patients": 200, // Patient management - complex forms
  "feature-appointments": 180, // Scheduling - calendar and forms
  "feature-medical-records": 220, // Medical records - document handling
  "feature-telemedicine": 250, // Video conferencing - largest feature
  "feature-billing": 150, // Billing - financial calculations
  "feature-admin": 180, // Admin dashboard - analytics

  // Route chunks - optimized for progressive loading
  "route-dashboard": 100, // Dashboard - frequently accessed
  "route-patients": 120, // Patient routes - core functionality
  "route-appointments": 110, // Appointment routes - scheduling
  "route-settings": 80, // Settings - less complex

  // Vendor chunks - external libraries
  "vendor-charts": 200, // Charts for medical data visualization
  "vendor-forms": 100, // Form handling for patient data
  "vendor-dates": 60, // Date utilities - medical scheduling
  "vendor-icons": 80, // Icons - UI enhancement
  "vendor-animations": 150, // Animations - UX improvement
  "vendor-healthcare": 300, // FHIR/HL7 libraries - largest vendor chunk

  // Total bundle budget for healthcare platform
  total: 2500, // 2.5MB total for healthcare application
  css: 300, // CSS budget for healthcare UI
  images: 500, // Image budget for medical assets
};

// Performance monitoring plugin
function performanceBudgetPlugin() {
  return {
    name: "performance-budget",
    writeBundle(options, bundle) {
      console.log("\n🏥 Healthcare Platform Bundle Analysis");
      console.log("=====================================");

      const chunks = {};
      const assets = {};
      let totalSize = 0;
      let cssSize = 0;
      let imageSize = 0;

      // Analyze bundle
      Object.entries(bundle).forEach(([fileName, chunk]) => {
        const size = Buffer.byteLength(
          chunk.type === "chunk" ? chunk.code : chunk.source,
          "utf8",
        );

        totalSize += size;

        if (fileName.endsWith(".css")) {
          cssSize += size;
        } else if (fileName.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
          imageSize += size;
        }

        if (chunk.type === "chunk" && chunk.name) {
          chunks[chunk.name] = (chunks[chunk.name] || 0) + size;
        } else {
          assets[fileName] = size;
        }
      });

      // Convert to KB for reporting
      const toKB = (bytes) => Math.round(bytes / 1024);

      console.log(`Total Bundle Size: ${toKB(totalSize)} KB`);
      console.log(`CSS Size: ${toKB(cssSize)} KB`);
      console.log(`Images Size: ${toKB(imageSize)} KB`);
      console.log("");

      // Check performance budgets
      let budgetViolations = 0;

      console.log("📊 Chunk Size Analysis:");
      Object.entries(chunks).forEach(([chunkName, size]) => {
        const sizeKB = toKB(size);
        const budget = PERFORMANCE_BUDGETS[chunkName];
        const status = budget && sizeKB > budget ? "❌ OVER BUDGET" : "✅ OK";

        if (budget && sizeKB > budget) {
          budgetViolations++;
          console.log(
            `  ${chunkName}: ${sizeKB} KB / ${budget} KB ${status} (+${sizeKB - budget} KB)`,
          );
        } else if (budget) {
          console.log(`  ${chunkName}: ${sizeKB} KB / ${budget} KB ${status}`);
        } else {
          console.log(`  ${chunkName}: ${sizeKB} KB (no budget set)`);
        }
      });

      console.log("");

      // Overall budget check
      const totalBudgetStatus =
        toKB(totalSize) > PERFORMANCE_BUDGETS.total
          ? "❌ OVER BUDGET"
          : "✅ OK";
      const cssBudgetStatus =
        toKB(cssSize) > PERFORMANCE_BUDGETS.css ? "❌ OVER BUDGET" : "✅ OK";
      const imageBudgetStatus =
        toKB(imageSize) > PERFORMANCE_BUDGETS.images
          ? "❌ OVER BUDGET"
          : "✅ OK";

      console.log("🎯 Performance Budget Summary:");
      console.log(
        `  Total: ${toKB(totalSize)} KB / ${PERFORMANCE_BUDGETS.total} KB ${totalBudgetStatus}`,
      );
      console.log(
        `  CSS: ${toKB(cssSize)} KB / ${PERFORMANCE_BUDGETS.css} KB ${cssBudgetStatus}`,
      );
      console.log(
        `  Images: ${toKB(imageSize)} KB / ${PERFORMANCE_BUDGETS.images} KB ${imageBudgetStatus}`,
      );

      if (budgetViolations > 0) {
        console.log("");
        console.log("⚠️  Performance Budget Violations Detected!");
        console.log("   Consider optimizing chunks that exceed their budget.");
        console.log(
          "   For healthcare platforms, performance is critical for user experience.",
        );
      }

      // Healthcare-specific recommendations
      console.log("");
      console.log("💡 Healthcare Platform Optimization Tips:");

      if (
        chunks["feature-telemedicine"] &&
        toKB(chunks["feature-telemedicine"]) > 200
      ) {
        console.log(
          "   • Telemedicine chunk is large - consider lazy loading video components",
        );
      }

      if (
        chunks["vendor-healthcare"] &&
        toKB(chunks["vendor-healthcare"]) > 250
      ) {
        console.log(
          "   • Healthcare libraries are large - consider splitting FHIR/HL7 components",
        );
      }

      if (toKB(totalSize) > 2000) {
        console.log(
          "   • Total bundle is large for healthcare - consider more aggressive code splitting",
        );
      }

      if (chunks["vendor-react"] && toKB(chunks["vendor-react"]) > 130) {
        console.log(
          "   • React vendor chunk is large - ensure tree-shaking is working properly",
        );
      }

      console.log("=====================================\n");
    },
  };
}

// Comprehensive bundle analyzer configuration
export default defineConfig({
  plugins: [
    // Rollup bundle visualizer for detailed analysis
    visualizer({
      filename: "dist/bundle-analysis.html",
      open: false, // Don't auto-open in CI
      gzipSize: true,
      brotliSize: true,
      template: "treemap", // Visual treemap of bundle
      title: "NeonPro Healthcare Platform - Bundle Analysis",
      projectRoot: resolve(__dirname, "../.."),
    }),

    // Sunburst visualization for hierarchical view
    visualizer({
      filename: "dist/bundle-sunburst.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: "sunburst",
      title: "NeonPro Healthcare Platform - Dependency Hierarchy",
      projectRoot: resolve(__dirname, "../.."),
    }),

    // Network visualization for chunk relationships
    visualizer({
      filename: "dist/bundle-network.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: "network",
      title: "NeonPro Healthcare Platform - Chunk Network",
      projectRoot: resolve(__dirname, "../.."),
    }),

    // Performance budget enforcement
    performanceBudgetPlugin(),
  ],

  build: {
    // Enable analysis mode
    analyzeBundle: true,
    sourcemap: true,

    // Generate detailed stats
    rollupOptions: {
      output: {
        // Detailed manual chunks for analysis
        manualChunks: {
          // Core framework chunks
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["@tanstack/react-router"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-database": ["@supabase/supabase-js"],

          // UI framework chunks
          "vendor-ui-base": ["@radix-ui/react-dialog", "@radix-ui/react-toast"],
          "vendor-animations": ["framer-motion"],
          "vendor-forms": ["react-hook-form", "@hookform/resolvers"],

          // Utility chunks
          "vendor-dates": ["date-fns"],
          "vendor-icons": ["lucide-react"],
          "vendor-utils": ["lodash", "ramda"],

          // Healthcare-specific chunks
          "vendor-healthcare": ["fhir", "hl7"],
          "vendor-charts": ["recharts", "d3"],
        },
      },
    },

    // Size warnings for healthcare performance
    chunkSizeWarningLimit: 1000, // 1MB warning threshold
    assetsInlineLimit: 4096, // 4KB inline limit for small assets
  },

  // Development server for analysis
  server: {
    port: 8081,
    open: "/bundle-analysis.html",
  },
});

// Export performance budgets for use in other tools
export { PERFORMANCE_BUDGETS };
