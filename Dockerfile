# Stage 1: Build stage
# Use Node.js 20 LTS Alpine for smaller image size
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
# This layer is cached if package files don't change
COPY package*.json ./

# Install all dependencies (including dev dependencies for potential build steps)
# Using npm ci for faster, reliable, reproducible builds
RUN npm ci

# Copy application source code
COPY . .

# Stage 2: Production stage
# Use the same Node.js version for consistency
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
# This reduces final image size significantly
RUN npm ci --only=production && npm cache clean --force

# Copy application code from builder stage
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.js ./drizzle.config.js

# Create a non-root user for security
# Running as root in containers is a security risk
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the application port
# Default to 3000, but can be overridden via environment variable
EXPOSE 3000

# Set NODE_ENV to production by default
# Can be overridden in docker-compose files
ENV NODE_ENV=production

# Health check to monitor container status
# This helps orchestration tools (Docker Swarm, Kubernetes) detect unhealthy containers
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
# Using the "start" script defined in package.json
CMD ["npm", "start"]

