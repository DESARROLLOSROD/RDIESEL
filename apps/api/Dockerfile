# Production image with Node 20 Slim
FROM node:20-slim AS builder

# Install pnpm and openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy configuration files
COPY package.json pnpm-lock.yaml* ./

COPY . .

# Install dependencies and generate Prisma
RUN pnpm install --no-frozen-lockfile
RUN pnpm db:generate

# Build the application
RUN pnpm build

# Final stage
FROM node:20-slim

# Install openssl for Prisma runtime
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy production files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start command
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
