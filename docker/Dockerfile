# NEONPRO Production Dockerfile
# GRUPO US VIBECODE SYSTEM V5.0 - Phase 8 Production Monitoring
# 
# Multi-stage Docker build with monitoring integration
# Optimized for production deployment with observability

# Build arguments
ARG NODE_VERSION=20
ARG MONITORING_ENABLED=true
ARG OBSERVABILITY_ENABLED=true

# Stage 1: Dependencies
FROM node:${NODE_VERSION}-alpine AS deps
LABEL stage=deps
LABEL project=neonpro
LABEL system="GRUPO US VIBECODE SYSTEM V5.0"

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Builder
FROM node:${NODE_VERSION}-alpine AS builder
LABEL stage=builder
LABEL project=neonpro

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV MONITORING_ENABLED=${MONITORING_ENABLED}
ENV OBSERVABILITY_ENABLED=${OBSERVABILITY_ENABLED}

# Build application with monitoring integration
RUN echo "Building NEONPRO with monitoring integration..." && \
    npm run build && \
    echo "Build completed successfully"

# Verify monitoring integration
RUN echo "Verifying monitoring integration..." && \
    ls -la .next/static/ && \
    if [ -f "src/lib/observability.ts" ]; then \
        echo "✅ Observability configuration found"; \
    else \
        echo "❌ Observability configuration missing" && exit 1; \
    fi

# Stage 3: Production Runtime
FROM node:${NODE_VERSION}-alpine AS runner
LABEL stage=runner
LABEL project=neonpro
LABEL maintainer="GRUPO US"
LABEL version="1.0.0"
LABEL description="NEONPRO Aesthetic Clinic SaaS with Production Monitoring"

# Install system dependencies for production
RUN apk add --no-cache \
    curl \
    dumb-init \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy monitoring and observability configurations
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/observability.ts ./src/lib/
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/monitoring ./src/lib/monitoring/

# Create necessary directories
RUN mkdir -p /app/logs /app/tmp && \
    chown -R nextjs:nodejs /app/logs /app/tmp

# Health check script
COPY --chown=nextjs:nodejs docker/healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]
