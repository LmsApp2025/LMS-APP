# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Copy only package files
COPY package.json package-lock.json turbo.json ./

# Install ALL deps including devDependencies
RUN npm ci --include=dev

# Install next & typescript globally in the container so they are ALWAYS found
RUN npm install -g next typescript

# Copy source code
COPY . .

# Build — now next and tsc are guaranteed to exist
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