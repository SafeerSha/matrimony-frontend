# ==========================================
# 1. Base Stage
# ==========================================
FROM node:22-alpine AS base

WORKDIR /app

# Install libc6-compat for glibc compatibility on Alpine
RUN apk add --no-cache libc6-compat

# ==========================================
# 2. Dependencies Stage
# ==========================================
FROM base AS deps

# Copy lockfile and package manifest
COPY package.json package-lock.json ./

# Clean installation of dependencies using the existing lockfile
RUN npm ci

# ==========================================
# 3. Builder Stage
# ==========================================
FROM base AS builder

WORKDIR /app

# Copy cached dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Client-side and build-time environment arguments (Coolify Build Args)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ENABLE_FREE_TRIAL
ARG NEXT_PUBLIC_AUTH_METHOD
ARG NEXT_PUBLIC_SOCKET_URL
ARG BACKEND_API_URL

# Expose build args as environment variables for Next.js build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_ENABLE_FREE_TRIAL=$NEXT_PUBLIC_ENABLE_FREE_TRIAL
ENV NEXT_PUBLIC_AUTH_METHOD=$NEXT_PUBLIC_AUTH_METHOD
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV BACKEND_API_URL=$BACKEND_API_URL

# Build the Next.js standalone application
RUN npm run build

# ==========================================
# 4. Production Runner Stage
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create an unprivileged system user and group for non-root execution
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Ensure Next.js prerender cache directory exists with appropriate permissions
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

# Copy public static assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy standalone server and minimal production node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose Next.js application port
EXPOSE 3000

# Start standalone Next.js server
CMD ["node", "server.js"]

