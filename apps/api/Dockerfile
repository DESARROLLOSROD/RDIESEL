# Production image with Node 20
FROM node:20-alpine AS builder

# Install pnpm, dependencies, and libc6-compat for Prisma
RUN apk add --no-cache libc6-compat
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
FROM node:20-alpine

# Install libc6-compat
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy production files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start command (running directly with node is more robust)
CMD ["node", "dist/index.js"]
