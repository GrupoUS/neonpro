# NeonPro Audit System - Production Docker Image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY config/ ./config/
COPY tsconfig.json ./

# Install TypeScript and build
RUN npm install -g typescript tsx
RUN npm run build || tsc

# Production image
FROM node:20-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S audit && \
    adduser -S audit -u 1001

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init

# Create required directories
RUN mkdir -p /var/log/neonpro-audit /var/lib/neonpro-audit/reports && \
    chown -R audit:audit /var/log/neonpro-audit /var/lib/neonpro-audit

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/config ./config
COPY --from=builder /app/package*.json ./

# Switch to non-root user
USER audit

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node src/cli/index.ts --help || exit 1

# Expose port for monitoring
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default command
CMD ["node", "src/cli/index.ts", "--help"]