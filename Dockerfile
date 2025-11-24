# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Copy lockfiles and install ALL deps (including dev for tsc)
COPY package*.json turbo.json ./
RUN npm ci  # This installs everything — prod + dev

# Copy source and build
COPY . .
RUN turbo build --filter=admin --filter=server

# ---- Final Stage ----
FROM node:22-alpine
WORKDIR /app

# Copy standalone Next.js + static + server build
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder /app/apps/server/build ./apps/server/build

EXPOSE 8000
CMD ["node", "apps/server/build/server.js"]