# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Copy only package files first
COPY package.json package-lock.json turbo.json ./

# Install ALL dependencies (including turbo, typescript, etc.)
RUN npm ci --foreground-scripts

# Copy source code
COPY . .

# Build both apps
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

# Optional: copy mails if you use them
# COPY --from=builder /app/apps/server/mails ./apps/server/mails

EXPOSE 8000
CMD ["node", "apps/server/build/server.js"]