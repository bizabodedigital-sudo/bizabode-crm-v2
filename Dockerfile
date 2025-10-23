# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    curl \
    dumb-init

# Set working directory
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Set Docker build flag for webpack configuration
ENV DOCKER_BUILD=true

# Initialize environment variables before build
RUN node scripts/init-env.js

# Build the application
RUN corepack enable pnpm && pnpm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
RUN mkdir -p ./public
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create necessary directories
RUN mkdir -p .next && chown nextjs:nodejs .next

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application with environment initialization
CMD ["sh", "-c", "node server.js"]
