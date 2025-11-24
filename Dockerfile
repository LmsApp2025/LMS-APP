# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Install turbo globally + copy lockfiles
COPY package*.json turbo.json ./
RUN npm install -g turbo

# Install ALL dependencies (including devDependencies for tsc)
RUN npm ci

# Copy source code and build
COPY . .
RUN turbo build --filter=admin --filter=server

# ---- Final Stage ----
FROM node:22-alpine
WORKDIR /app

# Copy standalone Next.js + static files + server build
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder /app/apps/server/build ./apps/server/build

# Optional: copy mails folder if you use it
# COPY --from=builder /app/apps/server/mails ./apps/server/mails

EXPOSE 8000
CMD ["node", "apps/server/build/server.js"]