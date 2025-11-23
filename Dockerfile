# ---- Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps/admin/package.json ./apps/admin/
COPY apps/server/package.json ./apps/server/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/*/package.json ./packages/*/
RUN npm ci

# ---- Build Admin (Next.js Standalone) ----
FROM node:20-alpine AS admin-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx turbo build --filter=admin

# ---- Build Server ----
FROM node:20-alpine AS server-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx turbo build --filter=server

# ---- Final Image ----
FROM node:20-alpine AS production
WORKDIR /app

# Copy only production deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=admin-builder /app/apps/admin/.next/standalone ./
COPY --from=admin-builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=admin-builder /app/apps/admin/public ./apps/admin/public

# Copy server build
COPY --from=server-builder /app/apps/server/build ./apps/server/build
COPY --from=server-builder /app/apps/server/mails ./apps/server/mails

EXPOSE 8000
CMD ["node", "apps/server/build/server.js"]