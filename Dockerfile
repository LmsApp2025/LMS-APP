# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json turbo.json ./

# Install ALL dependencies (this installs next, typescript, turbo, everything)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build both admin and server — now next and tsc are guaranteed to exist
RUN npx turbo build --filter=admin --filter=server

# ---- Production Stage ----
FROM node:22-alpine
WORKDIR /app

# Copy standalone Next.js build
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

# Copy server build
COPY --from=builder /app/apps/server/build ./apps/server/build

# Expose port
EXPOSE 8000

# Start the server
CMD ["node", "apps/server/build/server.js"]