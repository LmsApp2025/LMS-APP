# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json turbo.json ./

# Install ALL dependencies INCLUDING turbo from your package.json
RUN npm ci

# Copy source code
COPY . .

# NOW turbo exists → build both apps
RUN npx turbo build --filter=admin --filter=server

# ---- Final Stage ----
FROM node:22-alpine
WORKDIR /app

# Copy standalone Next.js + static files + server build
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder /app/apps/server/build ./apps/server/build

EXPOSE 8000
CMD ["node", "apps/server/build/server.js"]