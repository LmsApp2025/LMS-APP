# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Copy only package files first
COPY package.json package-lock.json turbo.json ./

# Install ALL dependencies including devDependencies (next, typescript, turbo)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build both apps — now next and tsc are available
RUN npx turbo build --filter=admin --filter=server

# ---- Production Stage ----
FROM node:22-alpine
WORKDIR /app

# Copy standalone Next.js
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

# Copy server build
COPY --from=builder /app/apps/server/build ./apps/server/build

EXPOSE 8000
CMD ["node", "apps/server/build/server.js"]