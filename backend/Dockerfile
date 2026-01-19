# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy dependency files first for better layer caching
COPY package.json package-lock.json ./

# Use npm ci for faster, reproducible builds
RUN npm ci

# Copy source files
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma
COPY scripts ./scripts

# Generate Prisma client and build for production
RUN npx prisma generate && npm run build

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Set production environment
ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application (includes compiled prisma client)
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

CMD ["node", "dist/server.js"]