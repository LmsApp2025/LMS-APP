# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json turbo.json ./
RUN npm install -g turbo
COPY . .
RUN turbo build --filter=admin --filter=server

# ---- Final Stage ----
FROM node:22-alpine
WORKDIR /app

# Copy only what we need
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder /app/apps/server/build ./apps/server/build

EXPOSE 8000
CMD ["node", "apps/server/build/server.js"]