# Production image with Node 20
FROM node:20-alpine AS builder

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy configuration files
COPY package.json pnpm-lock.yaml* ./
# Note: If building from subdirectory in monorepo, we might need to handle this differently
# But Railway's Build Context will be the Root Directory if configured so.

COPY . .

# Install dependencies and generate Prisma
RUN pnpm install --no-frozen-lockfile
RUN pnpm db:generate

# Build the application
RUN pnpm build

# Final stage
FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy production files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start command
CMD ["pnpm", "start"]
