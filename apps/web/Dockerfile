# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy configuration files
COPY package.json pnpm-lock.yaml* ./

COPY . .

# Install dependencies and build
RUN pnpm install --no-frozen-lockfile
RUN pnpm build

# Production image with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Use the PORT environment variable provided by Railway
CMD ["/bin/sh", "-c", "sed -i 's/listen 80;/listen '\"${PORT:-80}\"';/g' /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
